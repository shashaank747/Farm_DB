/**
 * FARMDB Living 3D Farm Environment
 * Powered by Three.js (WebGL)
 * Features true 3D spatial coordinates (X, Y, Z), raised soil beds, 3D procedural crops,
 * red timber barn, animated cattle, live translucent water reservoir, 3D tractor,
 * dynamic sunlight & shadows, and 360-degree OrbitControls.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
import { sqlEngine } from '../sql/engine.js';
import { gameState } from '../game/state.js';
import { simulation } from '../game/simulation.js';
import { sound } from './audio.js';

class Farm3DWorld {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 3D Scene Components
    this.sunLight = null;
    this.ambientLight = null;
    this.hemisphereLight = null;
    this.moonLight = null;
    this.plotMeshes = new Map(); // plot_id -> { group, bedMesh, cropGroup, signMesh, status }
    this.cowMeshes = [];
    this.waterMesh = null;
    this.waterSurfaceMesh = null;
    this.waterBuoy = null;
    this.waterGaugeMesh = null;
    this.waterReservoirGroup = null;
    this.waterBaseY = 5.2;
    this.waterMaxHeight = 6.2;
    this.troughWater = null;
    this.hoveredReservoir = false;
    this.tractorGroup = null;
    this.windmillGroup = null;
    this.windmillRotor = null;
    this.windmillSpinBoost = 1.0;
    this.turbineGroup = null;
    this.turbineRotor = null;
    this.barnGroup = null;
    this.farmerGroup = null;
    this.isFarmerAnimating = false;
    this.deliveryTruckGroup = null;
    this.deliverySack = null;
    this.isTruckAnimating = false;
    this.isAnimalAnimating = false;
    this.groundMat = null;
    this.grassBladeMat = null;
    this.grassMeshes = [];
    this.treeMeshes = [];
    this.clickableEntities = []; // for raycaster clicks on barn, cows, truck, farmer
    this.fireflies = [];
    this.smokeParticles = [];
    this.dynamicClouds = [];
    this.staticClouds = [];
    this.cloudMaterial = null;

    this.activeViewPreset = 'isometric';
    this.isHarvestingAnim = false;
    this.hoveredPlot = null;
    this.lampPosts = [];
    this.hoveredLampPost = null;
    this.lastTimeOfDay = null;

    // Bird Flock & Lone Visitor Bird
    this.flockGroup = null;
    this.flockBirds = [];
    this.flockActive = false;
    this.flockProgress = 0;
    this.flockStart = new THREE.Vector3();
    this.flockEnd = new THREE.Vector3();
    this.perchingBirdGroup = null;
    this.perchState = 'IDLE_WAIT';
    this.perchTimer = 8.0;
    this.perchProgress = 0;
    this.currentPerchTarget = new THREE.Vector3();
    this.currentPerchRotY = 0;
    this.perchStartPos = new THREE.Vector3();
    this.perchedElapsed = 0;
    this.birdChirpedThisPerch = false;
    this.countrysideGroup = null;

    this.startTime = performance.now();
    this.isInitialized = false;
  }

  init(containerEl) {
    if (this.isInitialized || !containerEl) return;
    this.container = containerEl;

    // Create 3D Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'farm-3d-webgl-canvas';
    this.canvas.className = 'farm-3d-webgl-canvas';
    this.container.appendChild(this.canvas);
    window.OBJLoader = OBJLoader;
    window.THREE = THREE;

    // Create Preset UI Overlay
    this.createControlsOverlay();

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#78B6E8');
    this.scene.fog = new THREE.FogExp2('#78B6E8', 0.0016); // Expansive visibility for distant mountains & valleys

    // 2. Camera Setup (Isometric Angle by Default)
    const aspect = this.container.clientWidth / (this.container.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.5, 1400); // 1400m view distance to see mountain ridges & horizons
    this.setCameraPreset('isometric', false);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2.05; // Don't go below ground
    this.controls.minDistance = 8;
    this.controls.maxDistance = 340; // Zoom out to enjoy expansive countryside view
    this.controls.target.set(0, 2, 0);

    // 5. Build 3D World
    this.setupLighting();
    this.buildTerrain();
    this.buildInfiniteCountryside();
    this.buildFencesAndPaths();
    this.buildPlots();
    this.buildBarnAndPasture();
    this.buildWaterReservoir();
    this.buildEquipmentYard();
    this.buildWindpump();
    this.buildWindTurbine();
    this.buildFarmer();
    this.buildDeliveryTruck();
    this.buildGrassAndWildflowers();
    this.buildFireflies();
    this.buildEnvironmentProps();
    this.buildLampPosts();
    this.buildBirdFlock();
    this.buildPerchingBird();
    this.buildClouds();

    // 6. Event Listeners
    this.setupInteractivity();

    // 7. Subscribe to DB & GameState Updates
    sqlEngine.addChangeListener(() => this.syncFromDatabase());
    gameState.addListener((state) => {
      this.syncLightingAndTime();
      this.syncFromDatabase();
      this.updateWindTurbineVisibility(state ? state.currentLevel : undefined);
    });

    // 8. Initial Sync & Start Loop
    this.syncLightingAndTime();
    this.syncFromDatabase();
    this.updateWindTurbineVisibility();
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
    this.isInitialized = true;
    console.log('🎮 FARMDB 3D WebGL World Initialized.');
  }

  createControlsOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'farm-3d-controls-overlay';
    overlay.innerHTML = `
      <div class="farm-3d-presets-pill">
        <button class="cam-preset-btn active" data-preset="isometric" title="Tactical Isometric Overview">
          <span>🎥 Isometric</span>
        </button>
        <button class="cam-preset-btn" data-preset="reservoir" title="Focus 3D Water Reservoir Tower">
          <span>💧 Reservoir</span>
        </button>
        <button class="cam-preset-btn" data-preset="windmill" title="Focus 3D Operational Windpump">
          <span>💨 Windpump</span>
        </button>
        <button class="cam-preset-btn" data-preset="ground" title="Farmer Ground Perspective">
          <span>🚜 Ground</span>
        </button>
        <button class="cam-preset-btn" data-preset="top" title="Bird's-Eye Top Down View">
          <span>🚁 Top-Down</span>
        </button>
        <button class="cam-preset-btn" data-preset="focus" title="Focus Active Task Plot">
          <span>🔍 Focus Plot</span>
        </button>
      </div>

      <div class="farm-3d-hint-tag">
        <span>Left Click: Rotate • Right Click: Pan • Scroll: Zoom</span>
      </div>
    `;

    this.container.appendChild(overlay);

    overlay.querySelectorAll('.cam-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = btn.dataset.preset;
        overlay.querySelectorAll('.cam-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCameraPreset(preset, true);
      });
    });
  }

  setCameraPreset(preset, animate = true) {
    this.activeViewPreset = preset;
    let targetPos = new THREE.Vector3(38, 32, 42);
    let targetLook = new THREE.Vector3(0, 2, 0);

    if (preset === 'ground' || preset === 'farmer') {
      targetPos.set(-18, 5, 26);
      targetLook.set(0, 3, -5);
    } else if (preset === 'top' || preset === 'topdown') {
      targetPos.set(0, 68, 0.1);
      targetLook.set(0, 0, 0);
    } else if (preset === 'focus' || preset === 'plot') {
      targetPos.set(-14, 10, 14);
      targetLook.set(-14, 1, 0);
    } else if (preset === 'reservoir' || preset === 'water') {
      const rx = this.waterReservoirGroup ? this.waterReservoirGroup.position.x : -15;
      const rz = this.waterReservoirGroup ? this.waterReservoirGroup.position.z : -25;
      targetPos.set(rx + 1, 10.5, rz + 16);
      targetLook.set(rx, 6.0, rz);
    } else if (preset === 'windmill' || preset === 'windpump') {
      const wx = this.windmillGroup ? this.windmillGroup.position.x : 24;
      const wz = this.windmillGroup ? this.windmillGroup.position.z : -18;
      targetPos.set(wx - 11, 7.5, wz + 13);
      targetLook.set(wx, 7.5, wz);
    }

    if (!animate || !this.camera) {
      if (this.camera) {
        this.camera.position.copy(targetPos);
        if (this.controls) this.controls.target.copy(targetLook);
      }
      return;
    }

    // Smooth glide animation
    const startPos = this.camera.position.clone();
    const startLook = this.controls.target.clone();
    let progress = 0;

    const glide = () => {
      progress += 0.05;
      this.camera.position.lerpVectors(startPos, targetPos, progress);
      this.controls.target.lerpVectors(startLook, targetLook, progress);
      if (progress < 1) {
        requestAnimationFrame(glide);
      }
    };
    glide();
  }

  // ==========================================================
  // LIGHTING & ATMOSPHERE
  // ==========================================================
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0x78B6E8, 0x4B6E32, 0.45);
    this.scene.add(this.hemisphereLight);

    // Directional Sun
    this.sunLight = new THREE.DirectionalLight(0xFFF3D0, 1.4);
    this.sunLight.position.set(30, 45, 25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 160;
    this.sunLight.shadow.camera.left = -50;
    this.sunLight.shadow.camera.right = 50;
    this.sunLight.shadow.camera.top = 50;
    this.sunLight.shadow.camera.bottom = -50;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Directional Moon (for night)
    this.moonLight = new THREE.DirectionalLight(0x90B0FF, 0.4);
    this.moonLight.position.set(-25, 35, -20);
    this.moonLight.castShadow = false;
    this.scene.add(this.moonLight);
  }

  syncLightingAndTime() {
    const timeOfDay = gameState.timeOfDay || 'morning';

    if (timeOfDay === 'morning') {
      this.scene.background.set('#F4C38E');
      this.scene.fog.color.set('#F4C38E');
      this.sunLight.color.set('#FFA756');
      this.sunLight.intensity = 1.3;
      this.sunLight.position.set(-35, 25, 20);
      this.ambientLight.color.set('#FFE8D0');
      this.ambientLight.intensity = 0.55;
      this.moonLight.intensity = 0;
      if (this.cloudMaterial) {
        this.cloudMaterial.color.set('#FFF1DE');
        this.cloudMaterial.opacity = 0.94;
      }
      if (this.fireflies) {
        this.fireflies.forEach(f => f.visible = false);
      }
    } else if (timeOfDay === 'day') {
      this.scene.background.set('#78B6E8');
      this.scene.fog.color.set('#78B6E8');
      this.sunLight.color.set('#FFF8E0');
      this.sunLight.intensity = 1.6;
      this.sunLight.position.set(10, 50, 20);
      this.ambientLight.color.set('#FFFFFF');
      this.ambientLight.intensity = 0.65;
      this.moonLight.intensity = 0;
      if (this.cloudMaterial) {
        this.cloudMaterial.color.set('#FFFFFF');
        this.cloudMaterial.opacity = 0.96;
      }
      if (this.fireflies) {
        this.fireflies.forEach(f => f.visible = false);
      }
    } else if (timeOfDay === 'sunset' || timeOfDay === 'evening') {
      this.scene.background.set('#8C4E68');
      this.scene.fog.color.set('#8C4E68');
      this.sunLight.color.set('#FF7043');
      this.sunLight.intensity = 1.2;
      this.sunLight.position.set(38, 16, 20);
      this.ambientLight.color.set('#FFA07A');
      this.ambientLight.intensity = 0.45;
      this.moonLight.intensity = 0.1;
      if (this.cloudMaterial) {
        this.cloudMaterial.color.set('#FFD2C2');
        this.cloudMaterial.opacity = 0.91;
      }
      if (this.fireflies) {
        this.fireflies.forEach(f => f.visible = false);
      }
    } else {
      // Night
      this.scene.background.set('#0A1128');
      this.scene.fog.color.set('#0A1128');
      this.sunLight.intensity = 0;
      this.ambientLight.color.set('#1C2841');
      this.ambientLight.intensity = 0.35;
      this.moonLight.intensity = 0.75;
      if (this.cloudMaterial) {
        this.cloudMaterial.color.set('#2D3748');
        this.cloudMaterial.opacity = 0.85;
      }
      if (this.fireflies) {
        this.fireflies.forEach(f => f.visible = true); // Fireflies active at night
      }
    }

    const isNight = (timeOfDay === 'night');
    // Transition into night resets manual lamp overrides so street lamps default to ON automatically
    if (isNight && this.lastTimeOfDay !== 'night') {
      if (this.lampPosts) {
        this.lampPosts.forEach(lamp => {
          if (lamp.userData) lamp.userData.userOverride = null;
        });
      }
    }
    this.lastTimeOfDay = timeOfDay;
    this.updateLampPostLighting(isNight);
  }

  // ==========================================================
  // TERRAIN & ENVIRONMENT
  // ==========================================================
  buildTerrain() {
    // Main Farm Soil & Grass Platform
    const groundGeo = new THREE.BoxGeometry(90, 2, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x567D46,
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Dirt Roads & Cobblestone Path
    const roadGeo = new THREE.PlaneGeometry(8, 70);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x8D6E63,
      roughness: 0.95
    });
    const mainRoad = new THREE.Mesh(roadGeo, roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(-6, 0.02, 0);
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // East-West Connecting Path
    const crossPathGeo = new THREE.PlaneGeometry(55, 6);
    const crossPath = new THREE.Mesh(crossPathGeo, roadMat);
    crossPath.rotation.x = -Math.PI / 2;
    crossPath.position.set(12, 0.02, 0);
    crossPath.receiveShadow = true;
    this.scene.add(crossPath);
  }

  // ==========================================================
  // EXPANSIVE INFINITE COUNTRYSIDE (Mountains, Foothills, Pines & River)
  // ==========================================================
  buildInfiniteCountryside() {
    this.countrysideGroup = new THREE.Group();
    this.scene.add(this.countrysideGroup);

    // 1. Vast Rolling Countryside Valley Mesh (radius ~450m)
    const groundGeo = new THREE.PlaneGeometry(850, 850, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);

    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Keep central farm plateau (x: [-46, 46], z: [-42, 42]) level at Y = 0
      const distFromFarmEdge = Math.max(0, Math.max(Math.abs(x) - 45, Math.abs(z) - 41));

      if (distFromFarmEdge === 0) {
        posAttr.setY(i, 0);
      } else {
        const blend = Math.min(1.0, distFromFarmEdge / 35.0);
        const wave = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 4.5
                   + Math.sin(x * 0.035 + 0.8) * 2.0
                   + Math.sin(z * 0.028) * 2.2;
        posAttr.setY(i, wave * blend - 0.08);
      }
    }
    groundGeo.computeVertexNormals();

    const valleyMat = new THREE.MeshStandardMaterial({
      color: 0x4D7A3E, // Lush countryside green matching farm soil grass
      roughness: 0.9,
      metalness: 0.03
    });
    const valleyMesh = new THREE.Mesh(groundGeo, valleyMat);
    valleyMesh.receiveShadow = true;
    this.countrysideGroup.add(valleyMesh);

    // 2. Layered Distant Mountain Ridges (Low-Poly Alpine Horizons)
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x3A5243, // Atmospheric slate-green mountain rock
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });

    const createMountainRidge = (width, depth, lengthSegs, widthSegs, posX, posZ, rotY, maxHeight) => {
      const ridgeGeo = new THREE.PlaneGeometry(width, depth, lengthSegs, widthSegs);
      ridgeGeo.rotateX(-Math.PI / 2);
      const rPos = ridgeGeo.attributes.position;

      for (let i = 0; i < rPos.count; i++) {
        const lx = rPos.getX(i);
        const lz = rPos.getZ(i);
        const depthFactor = 1.0 - Math.min(1.0, Math.abs(lz) / (depth * 0.5));
        const peakHarmonics = Math.abs(Math.sin(lx * 0.012) * 0.6 + Math.sin(lx * 0.028 + 1.1) * 0.3 + Math.sin(lx * 0.06) * 0.1);
        const h = peakHarmonics * maxHeight * Math.pow(depthFactor, 1.4);
        rPos.setY(i, h);
      }
      ridgeGeo.computeVertexNormals();

      const ridgeMesh = new THREE.Mesh(ridgeGeo, mountainMat);
      ridgeMesh.position.set(posX, 0, posZ);
      ridgeMesh.rotation.y = rotY;
      ridgeMesh.receiveShadow = true;
      this.countrysideGroup.add(ridgeMesh);
      return ridgeMesh;
    };

    // North Mountain Range (behind the barn & wind turbine horizon)
    createMountainRidge(800, 220, 50, 20, 0, -280, 0, 95);
    createMountainRidge(650, 160, 40, 16, -60, -200, 0.08, 55);

    // South Horizon Mountains (framing countryside road entrance)
    createMountainRidge(800, 200, 50, 18, 0, 280, Math.PI, 75);
    createMountainRidge(600, 140, 40, 14, 40, 210, Math.PI - 0.06, 45);

    // East Horizon Mountains (behind windmill & river valley)
    createMountainRidge(750, 200, 48, 18, 300, 0, -Math.PI / 2, 85);

    // West Horizon Mountains (pasture & countryside grove flank)
    createMountainRidge(750, 200, 48, 18, -300, 0, Math.PI / 2, 80);

    // 3. Mountain Conifer & Pine Forests
    this.buildMountainPineForests();

    // 4. Meandering Countryside River
    this.buildCountrysideRiver();
  }

  buildMountainPineForests() {
    const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.9 });
    const pineFoliageMat1 = new THREE.MeshStandardMaterial({ color: 0x1E4620, roughness: 0.85, flatShading: true });
    const pineFoliageMat2 = new THREE.MeshStandardMaterial({ color: 0x245427, roughness: 0.85, flatShading: true });

    const clusterCenters = [
      // North Foothills
      { x: -140, z: -150, count: 18, radius: 45, baseY: 6 },
      { x: -60, z: -160, count: 22, radius: 50, baseY: 8 },
      { x: 30, z: -155, count: 20, radius: 45, baseY: 7 },
      { x: 120, z: -170, count: 24, radius: 55, baseY: 12 },
      { x: -180, z: -210, count: 25, radius: 60, baseY: 22 },
      { x: 80, z: -220, count: 25, radius: 65, baseY: 26 },

      // East Ridges & River Flank
      { x: 140, z: -60, count: 18, radius: 40, baseY: 5 },
      { x: 170, z: 20, count: 20, radius: 45, baseY: 8 },
      { x: 190, z: 90, count: 22, radius: 50, baseY: 12 },
      { x: 230, z: -10, count: 25, radius: 60, baseY: 20 },

      // West Rolling Hills
      { x: -130, z: -40, count: 16, radius: 35, baseY: 4 },
      { x: -160, z: 40, count: 20, radius: 45, baseY: 7 },
      { x: -190, z: 120, count: 22, radius: 50, baseY: 14 },
      { x: -240, z: -20, count: 25, radius: 55, baseY: 22 },

      // South Mountain Shoulders
      { x: -110, z: 170, count: 18, radius: 45, baseY: 9 },
      { x: 40, z: 180, count: 20, radius: 48, baseY: 10 },
      { x: 130, z: 190, count: 22, radius: 50, baseY: 15 }
    ];

    const pineForestGroup = new THREE.Group();

    clusterCenters.forEach(cluster => {
      for (let i = 0; i < cluster.count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * cluster.radius;
        const px = cluster.x + Math.cos(ang) * dist;
        const pz = cluster.z + Math.sin(ang) * dist;
        const py = cluster.baseY + (Math.sin(px * 0.02) + Math.cos(pz * 0.02)) * 3.5;

        const treeGroup = new THREE.Group();
        treeGroup.position.set(px, Math.max(0.1, py), pz);

        const treeScale = 0.8 + Math.random() * 0.7;
        treeGroup.scale.set(treeScale, treeScale, treeScale);

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.0, 5), pineTrunkMat);
        trunk.position.y = 1.0;
        treeGroup.add(trunk);

        const folMat = Math.random() > 0.5 ? pineFoliageMat1 : pineFoliageMat2;
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.0, 5), folMat);
        c1.position.y = 2.8;
        treeGroup.add(c1);

        const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 5), folMat);
        c2.position.y = 4.3;
        treeGroup.add(c2);

        const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.0, 5), folMat);
        c3.position.y = 5.6;
        treeGroup.add(c3);

        treeGroup.rotation.y = Math.random() * Math.PI * 2;
        pineForestGroup.add(treeGroup);
      }
    });

    this.countrysideGroup.add(pineForestGroup);
  }

  buildCountrysideRiver() {
    const curvePoints = [
      new THREE.Vector3(120, 0.08, -320),
      new THREE.Vector3(95, 0.08, -210),
      new THREE.Vector3(82, 0.08, -120),
      new THREE.Vector3(68, 0.08, -35),
      new THREE.Vector3(56, 0.08, 45),
      new THREE.Vector3(78, 0.08, 140),
      new THREE.Vector3(110, 0.08, 230),
      new THREE.Vector3(135, 0.08, 330)
    ];

    const riverCurve = new THREE.CatmullRomCurve3(curvePoints);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 64, 5.8, 4, false);
    riverGeo.scale(1.0, 0.02, 1.0);

    this.riverMat = new THREE.MeshStandardMaterial({
      color: 0x3289A8,
      roughness: 0.12,
      metalness: 0.28,
      transparent: true,
      opacity: 0.88
    });

    const riverMesh = new THREE.Mesh(riverGeo, this.riverMat);
    riverMesh.position.y = 0.05;
    riverMesh.receiveShadow = true;
    this.countrysideGroup.add(riverMesh);

    // Riverbank sand & pebble borders
    const bankGeo = new THREE.TubeGeometry(riverCurve, 64, 7.2, 4, false);
    bankGeo.scale(1.0, 0.015, 1.0);
    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x827768,
      roughness: 0.95
    });
    const bankMesh = new THREE.Mesh(bankGeo, bankMat);
    bankMesh.position.y = 0.02;
    bankMesh.receiveShadow = true;
    this.countrysideGroup.add(bankMesh);
  }

  buildFencesAndPaths() {
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x6D4C41, roughness: 0.9 });

    // Perimeter Wooden Fence Posts & Rails along north & south
    const buildFenceRow = (startX, z, count) => {
      const group = new THREE.Group();
      for (let i = 0; i < count; i++) {
        // Post
        const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 6);
        const post = new THREE.Mesh(postGeo, fenceMat);
        post.position.set(startX + i * 4, 1.1, z);
        post.castShadow = true;
        group.appendChild ? group.appendChild(post) : group.add(post);

        // Rail
        if (i < count - 1) {
          const railGeo = new THREE.BoxGeometry(4, 0.15, 0.12);
          const rail1 = new THREE.Mesh(railGeo, fenceMat);
          rail1.position.set(startX + i * 4 + 2, 1.5, z);
          rail1.castShadow = true;
          group.add(rail1);

          const rail2 = new THREE.Mesh(railGeo, fenceMat);
          rail2.position.set(startX + i * 4 + 2, 0.8, z);
          rail2.castShadow = true;
          group.add(rail2);
        }
      }
      this.scene.add(group);
    };

    buildFenceRow(-40, -32, 20);
    buildFenceRow(-40, 32, 20);
  }

  // ==========================================================
  // CULTIVATION PLOTS (A1 - A5, North & South Beds)
  // ==========================================================
  buildPlots() {
    const cols = ['A1', 'A2', 'A3', 'A4', 'A5'];
    const colXPositions = [-20, -10, 0, 10, 20];
    const subZPositions = [-10, 10]; // North Bed (Z: -10), South Bed (Z: +10)

    cols.forEach((col, colIdx) => {
      const x = colXPositions[colIdx];

      subZPositions.forEach((z, subIdx) => {
        const plotId = `${col}.${subIdx + 1}`;
        const unlockLevel = colIdx === 0 ? 1 : colIdx + 2;

        const plotGroup = new THREE.Group();
        plotGroup.position.set(x, 0, z);

        // 1. Raised Tilled Soil Bed (0.3m elevation)
        const bedGeo = new THREE.BoxGeometry(7.5, 0.5, 9.5);
        const bedMat = new THREE.MeshStandardMaterial({
          color: 0x3E2723, // Rich dark loam
          roughness: 0.95
        });
        const bedMesh = new THREE.Mesh(bedGeo, bedMat);
        bedMesh.position.y = 0.25;
        bedMesh.receiveShadow = true;
        bedMesh.castShadow = true;
        bedMesh.userData = { plotId, unlockLevel };
        plotGroup.add(bedMesh);

        // 2. Timber Border
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        const borderGeo = new THREE.BoxGeometry(8, 0.35, 0.25);
        const b1 = new THREE.Mesh(borderGeo, borderMat);
        b1.position.set(0, 0.3, -4.8);
        plotGroup.add(b1);
        const b2 = b1.clone();
        b2.position.set(0, 0.3, 4.8);
        plotGroup.add(b2);

        // 3. 3D Plot Label Marker Sign
        const signPostGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.8, 6);
        const signPost = new THREE.Mesh(signPostGeo, borderMat);
        signPost.position.set(-3.5, 0.9, -4.5);
        plotGroup.add(signPost);

        const signBoardGeo = new THREE.BoxGeometry(1.6, 0.8, 0.1);
        const signBoardMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.6 });
        const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
        signBoard.position.set(-3.5, 1.6, -4.5);
        plotGroup.add(signBoard);

        // 4. Crop Group container
        const cropGroup = new THREE.Group();
        cropGroup.position.y = 0.5;
        plotGroup.add(cropGroup);

        // 5. Locked Barricade (displayed when locked)
        const lockGroup = new THREE.Group();
        const lockPlank1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 0.15), borderMat);
        lockPlank1.position.set(0, 1.0, 0);
        lockPlank1.rotation.z = 0.35;
        lockGroup.add(lockPlank1);
        const lockPlank2 = lockPlank1.clone();
        lockPlank2.rotation.z = -0.35;
        lockGroup.add(lockPlank2);
        plotGroup.add(lockGroup);

        this.scene.add(plotGroup);

        this.plotMeshes.set(plotId, {
          group: plotGroup,
          bedMesh: bedMesh,
          cropGroup: cropGroup,
          lockGroup: lockGroup,
          unlockLevel: unlockLevel,
          status: 'available'
        });
      });
    });
  }

  // ==========================================================
  // 3D CROPS GENERATION (5 Growth Stages)
  // ==========================================================
  updatePlotCropVisual(plotId, cropData) {
    const plot = this.plotMeshes.get(plotId);
    if (!plot) return;

    plot.cropGroup.clear();

    if (!cropData || cropData.status !== 'growing') {
      return;
    }

    const cropName = (cropData.crop_id || '').toLowerCase();
    const growth = cropData.growth_percent || 0;

    // Rows and columns of plants in the 0.5 acre bed
    const rows = 3;
    const cols = 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xOffset = (c - 0.5) * 3.2;
        const zOffset = (r - 1) * 2.8;

        const plantMesh = this.createPlantModel(cropName, growth);
        plantMesh.position.set(xOffset, 0, zOffset);
        plot.cropGroup.add(plantMesh);
      }
    }
  }

  createPlantModel(cropName, growth) {
    const group = new THREE.Group();
    const isWheat = cropName.includes('wheat');
    const isRice = cropName.includes('rice');
    const isCorn = cropName.includes('corn');

    // Stage 1: Sprout (0 - 30%)
    if (growth <= 30) {
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x4ADE80, roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.2;
      group.add(stem);

      const leafGeo = new THREE.SphereGeometry(0.12, 6, 6);
      leafGeo.scale(1.5, 0.3, 0.8);
      const leaf1 = new THREE.Mesh(leafGeo, stemMat);
      leaf1.position.set(0.12, 0.35, 0);
      leaf1.rotation.z = -0.4;
      group.add(leaf1);
      return group;
    }

    // Stage 2 & 3: Vegetative Growth (31% - 89%)
    if (growth < 90) {
      const scale = growth / 90;
      const stemGeo = new THREE.CylinderGeometry(0.06, 0.09, 1.2 * scale, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.7 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = (1.2 * scale) / 2;
      group.add(stem);

      // Leaves
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x22C55E });
      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.35 * scale, 0.8 * scale, 5), leafMat);
        leaf.position.set(0, 0.4 * scale + i * 0.25 * scale, 0);
        leaf.rotation.x = 0.5 * (i % 2 === 0 ? 1 : -1);
        leaf.rotation.z = 0.5 * (i > 1 ? 1 : -1);
        group.add(leaf);
      }
      return group;
    }

    // Stage 4 & 5: Mature & Ripe Harvest (90% - 100%)
    if (isWheat) {
      // Golden Wheat Stalks
      const wheatMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.6 });
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.8, 6), wheatMat);
      stalk.position.y = 0.9;
      stalk.rotation.z = (Math.random() - 0.5) * 0.15;
      group.add(stalk);

      // Golden Grain Head
      const headGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.7, 8);
      const head = new THREE.Mesh(headGeo, wheatMat);
      head.position.set(0, 1.8, 0);
      group.add(head);
    } else if (isRice) {
      // Emerald Rice Paddies
      const riceMat = new THREE.MeshStandardMaterial({ color: 0x84CC16, roughness: 0.7 });
      for (let i = 0; i < 5; i++) {
        const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1.6, 5), riceMat);
        blade.position.set((i - 2) * 0.08, 0.8, 0);
        blade.rotation.z = (i - 2) * 0.12;
        group.add(blade);
      }
    } else if (isCorn) {
      // Tall Corn with Yellow Cobs
      const cornMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.6 });
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.4, 6), cornMat);
      stalk.position.y = 1.2;
      group.add(stalk);

      // Yellow Corn Cob
      const cobMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.5 });
      const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.6, 8), cobMat);
      cob.position.set(0.2, 1.4, 0);
      cob.rotation.z = 0.4;
      group.add(cob);
    } else {
      // Lush Tomato Vine with Bright Red Tomatoes
      const vineMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), vineMat);
      bush.position.y = 0.9;
      bush.scale.set(1.2, 1.0, 1.1);
      group.add(bush);

      // Bright Red Ripe Tomatoes
      const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.2, metalness: 0.1 });
      const posOffsets = [
        [0.45, 0.9, 0.35],
        [-0.45, 0.8, 0.4],
        [0.2, 1.2, -0.4],
        [-0.3, 1.0, -0.35],
        [0.5, 0.6, -0.2]
      ];
      posOffsets.forEach(pos => {
        const tom = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), tomatoMat);
        tom.position.set(pos[0], pos[1], pos[2]);
        group.add(tom);
      });
    }

    return group;
  }

  // ==========================================================
  // BARN & CATTLE PASTURE
  // ==========================================================
  buildBarnAndPasture() {
    this.barnGroup = new THREE.Group();
    this.barnGroup.position.set(-32, 0, -18);
    this.barnGroup.userData = { type: 'barn' };
    this.scene.add(this.barnGroup);
    this.clickableEntities.push(this.barnGroup);

    // Load 3D Barn Model (Barn.obj)
    const objLoader = new OBJLoader();
    objLoader.load(
      '/models/barn/Barn.obj',
      (barnModel) => {
        const box = new THREE.Box3().setFromObject(barnModel);

        // Container group that applies scaling and ground alignment
        const baseContainer = new THREE.Group();
        baseContainer.add(barnModel);

        // Scale factor: raw width 2.78, height 2.46, depth 4.37.
        // Scale of 4.7 gives ~13.0m wide, 11.5m tall, 20.5m deep.
        const scale = 4.7;
        baseContainer.scale.set(scale, scale, scale);

        // Align front entrance (max.z) to local Z = 7.0 so it matches the pasture & road line
        const zOffset = (7.0 / scale) - box.max.z;
        barnModel.position.set(0, -box.min.y, zOffset);

        // Enhance PBR materials for Barn structure, Roof, and Weather Vane
        const wallMat = new THREE.MeshStandardMaterial({
          color: 0xB91C1C, // Heritage rustic barn red
          roughness: 0.72,
          metalness: 0.08,
          side: THREE.DoubleSide
        });
        const roofMat = new THREE.MeshStandardMaterial({
          color: 0x334155, // Weathered dark slate / charcoal shingle
          roughness: 0.65,
          metalness: 0.15,
          side: THREE.DoubleSide
        });
        const vaneMat = new THREE.MeshStandardMaterial({
          color: 0xF59E0B, // Polished antique brass / gold
          roughness: 0.28,
          metalness: 0.82,
          side: THREE.DoubleSide
        });

        barnModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const name = child.name ? child.name.toLowerCase() : '';
            if (name.includes('roof')) {
              child.material = roofMat;
            } else if (name.includes('vane')) {
              child.material = vaneMat;
            } else {
              child.material = wallMat;
            }
          }
        });

        this.barnGroup.add(baseContainer);
        console.log('🏚️ Successfully deployed realistic 3D Barn from Barn.obj.');
      },
      undefined,
      (err) => {
        console.warn('Could not load Barn.obj, using procedural fallback:', err);
        this.buildProceduralBarn();
      }
    );

    // Pasture Pen with Cows (dynamically synced with SQLite animals table)
    const cow1 = this.createCowModel('Daisy');
    cow1.position.set(-30, 0, 5);
    cow1.visible = false;
    this.scene.add(cow1);
    this.cowMeshes.push(cow1);
    this.clickableEntities.push(cow1);

    const cow2 = this.createCowModel('Bella');
    cow2.position.set(-34, 0, 12);
    cow2.rotation.y = 0.8;
    cow2.visible = false;
    this.scene.add(cow2);
    this.cowMeshes.push(cow2);
    this.clickableEntities.push(cow2);

    this.syncAnimalsFromDatabase();
  }

  buildProceduralBarn() {
    // Barn Main Building
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.7 });
    const barnBody = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 14), wallMat);
    barnBody.position.y = 4;
    barnBody.castShadow = true;
    barnBody.receiveShadow = true;
    this.barnGroup.add(barnBody);

    // Barn Pitched Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.8 });
    const roofGeo = new THREE.ConeGeometry(10.5, 4.5, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 10;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, 1.4);
    roof.castShadow = true;
    this.barnGroup.add(roof);

    // White Cross-Trim Doors
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC });
    const door = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.2), doorMat);
    door.position.set(0, 2.5, 7.05);
    this.barnGroup.add(door);

    // Signboard above barn door
    const signMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });
    const barnSign = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.9, 0.25), signMat);
    barnSign.position.set(0, 5.8, 7.15);
    this.barnGroup.add(barnSign);
  }

  createCowModel(name) {
    const group = new THREE.Group();
    group.userData = { name, type: 'cow', homePos: null };

    const hideMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.8 });
    const spotMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.8 });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 3.8), hideMat);
    body.position.y = 1.7;
    body.castShadow = true;
    group.add(body);

    // Dark spots on body
    const spot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 1.2), spotMat);
    spot.position.set(0.85, 1.8, 0.2);
    group.add(spot);

    const spot2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.0), spotMat);
    spot2.position.set(-0.85, 1.7, -0.6);
    group.add(spot2);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.2, 2.0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 1.2), hideMat);
    head.castShadow = true;
    headGroup.add(head);

    // Snout
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xFBCFE8 }));
    muzzle.position.set(0, -0.25, 0.8);
    headGroup.add(muzzle);

    // Horns
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.5 });
    [-0.42, 0.42].forEach(hx => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 6), hornMat);
      horn.position.set(hx, 0.65, -0.05);
      horn.rotation.z = (hx > 0 ? -1 : 1) * 0.4;
      headGroup.add(horn);
    });

    // Ears
    const earMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.8 });
    [-0.55, 0.55].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.1), earMat);
      ear.position.set(ex, 0.45, -0.2);
      ear.rotation.z = (ex > 0 ? -1 : 1) * 0.3;
      headGroup.add(ear);
    });

    group.add(headGroup);
    group.userData.head = headGroup;

    // Articulated 4 Legs (top pivot so they swing naturally)
    const legPositions = [
      { id: 'fl', x: -0.8, y: 1.2, z: 1.3 },
      { id: 'fr', x: 0.8, y: 1.2, z: 1.3 },
      { id: 'bl', x: -0.8, y: 1.2, z: -1.3 },
      { id: 'br', x: 0.8, y: 1.2, z: -1.3 }
    ];
    const legs = {};
    const hoofMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.9 });

    legPositions.forEach(p => {
      const legPivot = new THREE.Group();
      legPivot.position.set(p.x, p.y, p.z);

      const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.2, 0.38), spotMat);
      legMesh.position.y = -0.6;
      legMesh.castShadow = true;
      legPivot.add(legMesh);

      const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.4), hoofMat);
      hoof.position.y = -1.15;
      legPivot.add(hoof);

      group.add(legPivot);
      legs[p.id] = legPivot;
    });
    group.userData.legs = legs;

    // Swishing Tail
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 2.2, -1.9);
    const tailBone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.1, 6), spotMat);
    tailBone.position.y = -0.55;
    tailPivot.add(tailBone);
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 6), spotMat);
    tuft.position.y = -1.1;
    tuft.rotation.x = Math.PI;
    tailPivot.add(tuft);
    group.add(tailPivot);
    group.userData.tail = tailPivot;

    // Heart Emote Billboard
    const emoteGroup = new THREE.Group();
    emoteGroup.position.set(0, 3.6, 0);
    emoteGroup.scale.set(0.001, 0.001, 0.001);
    const heartMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xDC2626, emissiveIntensity: 0.8 });
    const heartMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 1), heartMat);
    emoteGroup.add(heartMesh);
    group.add(emoteGroup);
    group.userData.emote = emoteGroup;

    return group;
  }

  // ==========================================================
  // WATER RESERVOIR TOWER
  // ==========================================================
  buildWaterReservoir() {
    this.waterReservoirGroup = new THREE.Group();
    // Positioned prominently on the West side of Plot A1, right alongside the main farm path
    this.waterReservoirGroup.position.set(-15, 0, -25);
    this.waterReservoirGroup.userData = { type: 'water_reservoir' };

    // 1. Stone Foundation Ring
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.9 });
    const foundation = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 0.8, 16), stoneMat);
    foundation.position.y = 0.4;
    foundation.receiveShadow = true;
    foundation.castShadow = true;
    this.waterReservoirGroup.add(foundation);

    // 2. Heavy Timber/Steel Lattice Trestle Legs (Elevated 4.8m)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.3 });
    const woodDeckMat = new THREE.MeshStandardMaterial({ color: 0x854D0E, roughness: 0.85 });

    const legRadius = 3.4;
    const legHeight = 4.8;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const lx = Math.cos(angle) * legRadius;
      const lz = Math.sin(angle) * legRadius;

      // Leg column
      const legGeo = new THREE.CylinderGeometry(0.24, 0.28, legHeight, 8);
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, legHeight / 2 + 0.4, lz);
      leg.castShadow = true;
      this.waterReservoirGroup.add(leg);

      // Diagonal cross-brace
      const nextAngle = ((i + 1) * Math.PI) / 2 + Math.PI / 4;
      const nlx = Math.cos(nextAngle) * legRadius;
      const nlz = Math.sin(nextAngle) * legRadius;

      const braceGeo = new THREE.BoxGeometry(0.12, 0.12, legRadius * 1.4);
      const brace1 = new THREE.Mesh(braceGeo, legMat);
      brace1.position.set((lx + nlx) / 2, legHeight / 2 + 0.4, (lz + nlz) / 2);
      brace1.lookAt(new THREE.Vector3(nlx, legHeight, nlz));
      this.waterReservoirGroup.add(brace1);
    }

    // 3. Elevated Wooden Support Platform
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.4, 16), woodDeckMat);
    platform.position.y = 5.0;
    platform.receiveShadow = true;
    platform.castShadow = true;
    this.waterReservoirGroup.add(platform);

    // Platform Safety Railing
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4 });
    const railing = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.08, 6, 24), railMat);
    railing.position.y = 5.8;
    railing.rotation.x = Math.PI / 2;
    this.waterReservoirGroup.add(railing);

    // 4. Access Ladder
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.5 });
    for (let r = 0; r < 9; r++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.08), ladderMat);
      rung.position.set(0, 0.8 + r * 0.48, 3.6);
      this.waterReservoirGroup.add(rung);
    }

    // 5. Transparent Glass Reservoir Cylinder
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xBAE6FD,
      transparent: true,
      opacity: 0.28,
      roughness: 0.05,
      metalness: 0.1,
      depthWrite: false
    });
    const tankHeight = 6.6;
    const tankRadius = 3.5;
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 24, 1, true), glassMat);
    tank.position.y = 5.2 + tankHeight / 2;
    this.waterReservoirGroup.add(tank);

    // Metal Reinforcement Hoops with Rivets (Bottom, Middle, Top)
    const hoopGeo = new THREE.TorusGeometry(tankRadius + 0.04, 0.1, 6, 24);
    const hoopMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 });
    [5.3, 8.5, 11.7].forEach(y => {
      const hoop = new THREE.Mesh(hoopGeo, hoopMat);
      hoop.position.y = y;
      hoop.rotation.x = Math.PI / 2;
      this.waterReservoirGroup.add(hoop);
    });

    // 6. VIBRANT, GLOWING 3D WATER CYLINDER
    this.waterMaxHeight = tankHeight - 0.4; // 6.2m
    this.waterBaseY = 5.2;

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0088FF,
      emissive: 0x0044AA,
      emissiveIntensity: 0.45,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88
    });

    // Main Water Body Mesh (Pivot at bottom)
    const waterGeo = new THREE.CylinderGeometry(tankRadius - 0.12, tankRadius - 0.12, this.waterMaxHeight, 24);
    waterGeo.translate(0, this.waterMaxHeight / 2, 0);
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = this.waterBaseY;
    this.waterReservoirGroup.add(this.waterMesh);

    // 7. Shimmering Top Water Surface Disk
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x0284C7,
      emissiveIntensity: 0.6,
      roughness: 0.05,
      metalness: 0.2
    });
    this.waterSurfaceMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tankRadius - 0.14, tankRadius - 0.14, 0.15, 24),
      surfaceMat
    );
    this.waterSurfaceMesh.position.y = this.waterBaseY + this.waterMaxHeight * 0.72;
    this.waterReservoirGroup.add(this.waterSurfaceMesh);

    // 8. Bobbing Red & White Level Float Buoy
    const buoyGroup = new THREE.Group();
    const buoyTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.4 })
    );
    const buoyBottom = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 })
    );
    const buoyFlag = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xF59E0B })
    );
    buoyFlag.position.y = 0.4;
    buoyGroup.add(buoyTop);
    buoyGroup.add(buoyBottom);
    buoyGroup.add(buoyFlag);
    buoyGroup.position.set(1.4, this.waterSurfaceMesh.position.y + 0.2, 0);
    this.waterBuoy = buoyGroup;
    this.waterReservoirGroup.add(this.waterBuoy);

    // 9. External Vertical Water Level Gauge Tube facing the camera
    const gaugeBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, tankHeight, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x1E293B })
    );
    gaugeBack.position.set(0, 5.2 + tankHeight / 2, tankRadius + 0.15);
    this.waterReservoirGroup.add(gaugeBack);

    // Gauge Tick Marks
    for (let t = 0; t <= 4; t++) {
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xFDE047 })
      );
      tick.position.set(0, 5.6 + (t * (tankHeight - 1)) / 4, tankRadius + 0.24);
      this.waterReservoirGroup.add(tick);
    }

    // Glowing Gauge Indicator Tube
    const gaugeGeo = new THREE.CylinderGeometry(0.1, 0.1, tankHeight - 0.8, 8);
    gaugeGeo.translate(0, (tankHeight - 0.8) / 2, 0);
    this.waterGaugeMesh = new THREE.Mesh(
      gaugeGeo,
      new THREE.MeshStandardMaterial({ color: 0x38BDF8, emissive: 0x0284C7, emissiveIntensity: 0.8 })
    );
    this.waterGaugeMesh.position.set(0, 5.6, tankRadius + 0.26);
    this.waterReservoirGroup.add(this.waterGaugeMesh);

    // 10. Outflow Pipe & Ground Irrigation Basin with Water
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const downPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.8, 8), pipeMat);
    downPipe.position.set(3.2, 2.6, 1.2);
    this.waterReservoirGroup.add(downPipe);

    // Brass Valve Wheel
    const valve = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 6, 12), new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.8 }));
    valve.position.set(3.4, 2.2, 1.2);
    valve.rotation.y = Math.PI / 2;
    this.waterReservoirGroup.add(valve);

    // Ground Stone Water Basin
    const basin = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 2.4), stoneMat);
    basin.position.set(3.2, 0.4, 1.2);
    basin.castShadow = true;
    basin.receiveShadow = true;
    this.waterReservoirGroup.add(basin);

    // Water in ground basin
    this.troughWater = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.15, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x0284C7, emissive: 0x0369A1, emissiveIntensity: 0.4, roughness: 0.1 })
    );
    this.troughWater.position.set(3.2, 0.65, 1.2);
    this.waterReservoirGroup.add(this.troughWater);

    // 11. Wooden Signboard on the front of the platform
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.9, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 })
    );
    signBoard.position.set(0, 4.4, 4.3);
    this.waterReservoirGroup.add(signBoard);

    // Signboard Label Plaque (Water Reservoir)
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.5 })
    );
    plaque.position.set(0, 4.4, 4.4);
    this.waterReservoirGroup.add(plaque);

    // Ornate Conical Roof (with open eaves so water inside is visible!)
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.6 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.3, 2.2, 16), roofMat);
    roof.position.y = 12.8;
    roof.castShadow = true;
    this.waterReservoirGroup.add(roof);

    // Roof Weathervane Finial
    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4), new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.8 }));
    finial.position.y = 14.5;
    this.waterReservoirGroup.add(finial);

    this.scene.add(this.waterReservoirGroup);
  }

  // ==========================================================
  // EQUIPMENT YARD & TRACTOR ("Old Red")
  // ==========================================================
  buildEquipmentYard() {
    this.tractorGroup = new THREE.Group();
    this.tractorGroup.position.set(-15, 0, 18);
    this.tractorGroup.rotation.y = -Math.PI / 3;
    this.tractorGroup.userData = { type: 'tractor' };
    this.scene.add(this.tractorGroup);
    this.clickableEntities.push(this.tractorGroup);

    // Setup loading manager with TGALoader for any raytrace textures
    const manager = new THREE.LoadingManager();
    manager.addHandler(/\.tga$/i, new TGALoader());

    const mtlLoader = new MTLLoader(manager);
    mtlLoader.setPath('/models/tractor/');
    mtlLoader.load(
      'Tractor.mtl',
      (materials) => {
        materials.preload();

        const objLoader = new OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/tractor/');
        objLoader.load(
          'Tractor.obj',
          (tractorModel) => {
            // Compute bounding box and center pivot at ground level
            const box = new THREE.Box3().setFromObject(tractorModel);
            const centerZ = (box.min.z + box.max.z) / 2;

            // Center tractor at pivot: X=0, ground Y=0, Z centered
            tractorModel.position.set(0, -box.min.y, -centerZ);

            // Container group that applies the scaling in world units
            const baseContainer = new THREE.Group();
            baseContainer.add(tractorModel);

            // Scale factor: model height is ~50.8 units; scale of 0.068 gives realistic ~3.45 units height
            const scale = 0.068;
            baseContainer.scale.set(scale, scale, scale);

            // Enhance materials for PBR lighting & shadows
            tractorModel.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((m) => {
                  if (!m) return;
                  m.side = THREE.DoubleSide;
                  if (m.name === 'body' || m.name === 'traktor_eu_red') {
                    m.color.setHex(0xDC2626); // Rich classic Old Red
                    m.roughness = 0.35;
                    m.metalness = 0.18;
                  } else if (m.name === 'traktor_eu_chrome' || m.name === 'metal') {
                    m.roughness = 0.22;
                    m.metalness = 0.82;
                  } else if (m.name === 'tyre' || m.name === 'Material__25') {
                    m.roughness = 0.88;
                    m.metalness = 0.05;
                  }
                });
              }
            });

            this.tractorGroup.add(baseContainer);
            console.log('🚜 Successfully deployed realistic 3D Tractor from Tractor.obj.');
          },
          undefined,
          (err) => {
            console.warn('Could not load Tractor.obj, using procedural fallback:', err);
            this.buildProceduralTractor();
          }
        );
      },
      undefined,
      (err) => {
        console.warn('Could not load Tractor.mtl, using procedural fallback:', err);
        this.buildProceduralTractor();
      }
    );
  }

  buildProceduralTractor() {
    const redMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.5, metalness: 0.2 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.8, roughness: 0.2 });

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 2.8), redMat);
    hood.position.set(0, 1.4, 0.4);
    hood.castShadow = true;
    this.tractorGroup.add(hood);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.2), redMat);
    cab.position.set(0, 1.2, -1.4);
    this.tractorGroup.add(cab);

    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), chromeMat);
    exhaust.position.set(0.6, 2.6, 1.2);
    exhaust.castShadow = true;
    this.tractorGroup.add(exhaust);

    const bigWheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.7, 16);
    bigWheelGeo.rotateZ(Math.PI / 2);
    const rearL = new THREE.Mesh(bigWheelGeo, ironMat);
    rearL.position.set(-1.2, 1.2, -1.2);
    rearL.castShadow = true;
    this.tractorGroup.add(rearL);

    const rearR = rearL.clone();
    rearR.position.set(1.2, 1.2, -1.2);
    this.tractorGroup.add(rearR);

    const smWheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.4, 16);
    smWheelGeo.rotateZ(Math.PI / 2);
    const frontL = new THREE.Mesh(smWheelGeo, ironMat);
    frontL.position.set(-1.0, 0.65, 1.4);
    frontL.castShadow = true;
    this.tractorGroup.add(frontL);

    const frontR = frontL.clone();
    frontR.position.set(1.0, 0.65, 1.4);
    this.tractorGroup.add(frontR);
  }

  // ==========================================================
  // OPERATIONAL FARM WINDPUMP & WATER STATION
  // ==========================================================
  buildWindpump() {
    this.windmillGroup = new THREE.Group();
    // Positioned on the North-East meadow overlooking the fields
    this.windmillGroup.position.set(24, 0, -18);
    this.windmillGroup.userData = { type: 'windmill' };
    this.scene.add(this.windmillGroup);
    this.clickableEntities.push(this.windmillGroup);

    const loader = new OBJLoader();
    loader.load(
      '/models/windmill/windmill.obj',
      (wmModel) => {
        const baseContainer = new THREE.Group();
        baseContainer.add(wmModel);

        // Scale factor: raw height is ~815; scale 0.018 gives ~14.7m realistic windpump height
        const scale = 0.018;
        baseContainer.scale.set(scale, scale, scale);

        // PBR Materials
        const steelMat = new THREE.MeshStandardMaterial({
          color: 0x94A3B8,
          metalness: 0.78,
          roughness: 0.32,
          side: THREE.DoubleSide
        });
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0xE2E8F0,
          metalness: 0.84,
          roughness: 0.22,
          side: THREE.DoubleSide
        });
        const vaneMat = new THREE.MeshStandardMaterial({
          color: 0xDC2626, // Classic Red Rudder Accent
          metalness: 0.25,
          roughness: 0.55,
          side: THREE.DoubleSide
        });
        const shaftMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.82,
          roughness: 0.28,
          side: THREE.DoubleSide
        });
        const tankMat = new THREE.MeshStandardMaterial({
          color: 0x475569,
          metalness: 0.45,
          roughness: 0.52,
          side: THREE.DoubleSide
        });

        wmModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const name = child.name ? child.name.toLowerCase() : '';
            if (name.includes('ventilateur')) {
              child.material = bladeMat;

              // Center geometry on its local hub axis so rotation spins smoothly
              const fanBox = new THREE.Box3().setFromObject(child);
              const hubCenter = fanBox.getCenter(new THREE.Vector3());
              child.geometry.center();
              child.position.copy(hubCenter);
              this.windmillRotor = child;
            } else if (name.includes('girouette')) {
              child.material = vaneMat;
            } else if (name.includes('shaft')) {
              child.material = shaftMat;
            } else if (name.includes('reservoir')) {
              child.material = tankMat;
            } else {
              child.material = steelMat;
            }
          }
        });

        this.windmillGroup.add(baseContainer);
        console.log('💨 Successfully deployed Operational 3D Farm Windpump.');
      },
      undefined,
      (err) => {
        console.warn('Could not load windmill.obj, using procedural fallback:', err);
        this.buildProceduralWindmill();
      }
    );
  }

  buildProceduralWindmill() {
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8, roughness: 0.3 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.85, roughness: 0.2 });

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 2.2, 14, 4), towerMat);
    tower.position.y = 7;
    tower.castShadow = true;
    this.windmillGroup.add(tower);

    const rotor = new THREE.Group();
    rotor.position.set(0, 14, 0.6);
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 0.05), bladeMat);
      blade.position.y = 1.8;
      blade.rotation.z = (i * Math.PI) / 4;
      rotor.add(blade);
    }
    this.windmillGroup.add(rotor);
    this.windmillRotor = rotor;
  }

  // ==========================================================
  // GREEN ENERGY HORIZON WIND TURBINE (EolicOBJ.obj)
  // Unlocked on Level 4+; hidden until Level 4!
  // ==========================================================
  buildWindTurbine() {
    this.turbineGroup = new THREE.Group();
    // Positioned gracefully on the distant Northern horizon behind the farm
    this.turbineGroup.position.set(-6, 0, -56);
    this.turbineGroup.userData = { type: 'wind_turbine' };
    this.scene.add(this.turbineGroup);
    this.clickableEntities.push(this.turbineGroup);

    // Initial check: hidden until Level 4
    this.updateWindTurbineVisibility();

    const loader = new OBJLoader();
    loader.load(
      '/models/whitewindmill/EolicOBJ.obj',
      (turbineModel) => {
        const baseContainer = new THREE.Group();

        // Scale factor: model mast is ~28 units, total ~55.8 units; scale 0.65 gives ~18.2m mast and ~36m total height
        const scale = 0.65;
        baseContainer.scale.set(scale, scale, scale);

        const turbineMat = new THREE.MeshStandardMaterial({
          color: 0xF8FAFC, // Aerodynamic turbine white
          roughness: 0.32,
          metalness: 0.18,
          side: THREE.DoubleSide
        });
        const hubMat = new THREE.MeshStandardMaterial({
          color: 0xE2E8F0,
          roughness: 0.25,
          metalness: 0.28
        });
        const knollMat = new THREE.MeshStandardMaterial({
          color: 0x3F6212, // Countryside grass mound
          roughness: 0.85
        });
        const stoneMat = new THREE.MeshStandardMaterial({
          color: 0x64748B,
          roughness: 0.8
        });

        // Collect the 3 turbine blades and the spinner nosecone for rotating group
        const bladeMeshes = [];
        const staticMeshes = [];

        turbineModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const name = child.name || '';
            if (name.includes('Roundcube.001')) {
              child.material = knollMat;
              staticMeshes.push(child);
            } else if (name.startsWith('Plane')) {
              child.material = stoneMat;
              staticMeshes.push(child);
            } else if (name.includes('Cube')) {
              child.material = hubMat; // Nacelle housing on top of mast
              staticMeshes.push(child);
            } else if (name === 'Cylinder.003') {
              child.material = turbineMat; // Mast tower
              staticMeshes.push(child);
            } else if (name === 'Roundcube') {
              child.material = hubMat; // Nosecone spinner
              bladeMeshes.push(child);
            } else {
              // 3 aerodynamic blades (Cylinder, Cylinder.001, Cylinder.002)
              child.material = turbineMat;
              bladeMeshes.push(child);
            }
          }
        });

        // Add static parts to base container
        staticMeshes.forEach(m => baseContainer.add(m));

        // Create rotor group pivoted exactly at hub center (Y: 27.85, Z: 1.62)
        const rotorGroup = new THREE.Group();
        rotorGroup.position.set(0, 27.85, 1.62);

        bladeMeshes.forEach(blade => {
          blade.position.set(0, -27.85, -1.62);
          rotorGroup.add(blade);
        });

        baseContainer.add(rotorGroup);
        this.turbineRotor = rotorGroup;
        this.turbineGroup.add(baseContainer);
        this.updateWindTurbineVisibility();
        console.log('⚡ Successfully deployed Horizon Wind Turbine from EolicOBJ.obj.');
      },
      undefined,
      (err) => {
        console.warn('Could not load EolicOBJ.obj, using fallback:', err);
      }
    );
  }

  updateWindTurbineVisibility(level = (gameState ? gameState.currentLevel : 1)) {
    const isUnlocked = level >= 4;
    if (this.turbineGroup) {
      const wasHidden = !this.turbineGroup.visible;
      this.turbineGroup.visible = isUnlocked;
      if (wasHidden && isUnlocked && this.isInitialized) {
        if (window.farmdb && window.farmdb.showToast) {
          window.farmdb.showToast('🎉 Level 4 Unlocked: Distant Clean Energy Wind Turbine is now operational!', 'success');
        }
      }
    }
  }

  // ==========================================================
  // FARMER CHARACTER ("Uncle Somu")
  // ==========================================================
  buildFarmer() {
    this.farmerGroup = new THREE.Group();
    // Staged on the rustic wooden barn porch right outside the barn door
    this.farmerHomePos = new THREE.Vector3(-26, 0, -11);
    this.farmerGroup.position.copy(this.farmerHomePos);
    this.farmerGroup.rotation.y = Math.PI / 2; // Facing the farm fields
    this.farmerGroup.userData = { type: 'farmer' };

    // 1. Straw Hat
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.8 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 14), hatMat);
    brim.position.y = 2.45;
    brim.castShadow = true;
    this.farmerGroup.add(brim);

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.46, 0.45, 14), hatMat);
    crown.position.y = 2.68;
    crown.castShadow = true;
    this.farmerGroup.add(crown);

    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.08, 14), new THREE.MeshStandardMaterial({ color: 0xDC2626 }));
    hatBand.position.y = 2.52;
    this.farmerGroup.add(hatBand);

    // 2. Head & Mustache
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xFDBA74, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
    head.position.y = 2.12;
    head.castShadow = true;
    this.farmerGroup.add(head);

    // Mustache
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.9 });
    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.12), hairMat);
    mustache.position.set(0, 2.02, 0.3);
    this.farmerGroup.add(mustache);

    // 3. Torso (Flannel Shirt & Denim Dungarees)
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.7 }); // Plaid Red
    const denimMat = new THREE.MeshStandardMaterial({ color: 0x1D4ED8, roughness: 0.8 }); // Denim Blue
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.6 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.55), shirtMat);
    torso.position.y = 1.45;
    torso.castShadow = true;
    this.farmerGroup.add(torso);

    // Overalls Bib & Straps
    const bib = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.7, 0.58), denimMat);
    bib.position.y = 1.35;
    this.farmerGroup.add(bib);

    [-0.24, 0.24].forEach(bx => {
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), brassMat);
      buckle.position.set(bx, 1.62, 0.3);
      this.farmerGroup.add(buckle);
    });

    // 4. Arms (Pivoted at shoulders)
    // Left Arm (holding burlap seed pouch at hip)
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.55, 1.8, 0);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.24), shirtMat);
    armL.position.y = -0.35;
    armLGroup.add(armL);
    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), skinMat);
    handL.position.y = -0.78;
    armLGroup.add(handL);

    // Burlap Seed Pouch
    const pouchMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.9 });
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.35), pouchMat);
    pouch.position.set(-0.15, -0.65, 0.15);
    pouch.castShadow = true;
    armLGroup.add(pouch);

    this.farmerGroup.add(armLGroup);
    this.farmerGroup.userData.armL = armLGroup;

    // Right Arm (free to sow & wave)
    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.55, 1.8, 0);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.24), shirtMat);
    armR.position.y = -0.35;
    armRGroup.add(armR);
    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), skinMat);
    handR.position.y = -0.78;
    armRGroup.add(handR);

    this.farmerGroup.add(armRGroup);
    this.farmerGroup.userData.armR = armRGroup;

    // 5. Legs & Boots (Pivoted at hips)
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.8 });

    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.25, 0.95, 0);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.36), denimMat);
    legL.position.y = -0.35;
    legL.castShadow = true;
    legLGroup.add(legL);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.52), bootMat);
    bootL.position.set(0, -0.8, 0.08);
    bootL.castShadow = true;
    legLGroup.add(bootL);
    this.farmerGroup.add(legLGroup);
    this.farmerGroup.userData.legL = legLGroup;

    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.25, 0.95, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.36), denimMat);
    legR.position.y = -0.35;
    legR.castShadow = true;
    legRGroup.add(legR);
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.52), bootMat);
    bootR.position.set(0, -0.8, 0.08);
    bootR.castShadow = true;
    legRGroup.add(bootR);
    this.farmerGroup.add(legRGroup);
    this.farmerGroup.userData.legR = legRGroup;

    // 6. Floating Seed Particles (scattered during planting)
    this.farmerSeeds = new THREE.Group();
    const seedGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, emissive: 0xF59E0B, emissiveIntensity: 0.5 });
    for (let i = 0; i < 18; i++) {
      const s = new THREE.Mesh(seedGeo, seedMat);
      s.visible = false;
      this.farmerSeeds.add(s);
    }
    this.scene.add(this.farmerSeeds);

    this.scene.add(this.farmerGroup);
    this.clickableEntities.push(this.farmerGroup);
  }

  playFarmerPlantAnimation(targetPlotId = 'A1.1') {
    if (!this.farmerGroup || this.isFarmerAnimating) return;
    this.isFarmerAnimating = true;

    // Determine target location: Plot bed
    let targetX = -20;
    let targetZ = -10;
    if (this.plotMeshes.has(targetPlotId)) {
      const p = this.plotMeshes.get(targetPlotId);
      targetX = p.group.position.x;
      targetZ = p.group.position.z;
    } else if (targetPlotId && targetPlotId.startsWith('A')) {
      const col = targetPlotId.split('.')[0];
      const mapCols = { 'A1': -20, 'A2': -10, 'A3': 0, 'A4': 10, 'A5': 20 };
      if (mapCols[col] !== undefined) targetX = mapCols[col];
      targetZ = targetPlotId.includes('.2') ? 10 : -10;
    }

    const standPos = new THREE.Vector3(targetX + 4.2, 0, targetZ);
    const startPos = this.farmerHomePos.clone();
    const armR = this.farmerGroup.userData.armR;
    const armL = this.farmerGroup.userData.armL;
    const legR = this.farmerGroup.userData.legR;
    const legL = this.farmerGroup.userData.legL;

    let phase = 'walk_out'; // walk_out -> sow -> wave -> walk_back -> idle
    let progress = 0;

    const resetLimbs = () => {
      if (armR) armR.rotation.set(0, 0, 0);
      if (armL) armL.rotation.set(0, 0, 0);
      if (legR) legR.rotation.set(0, 0, 0);
      if (legL) legL.rotation.set(0, 0, 0);
    };

    const animStep = () => {
      if (phase === 'walk_out') {
        progress += 0.015;
        this.farmerGroup.position.lerpVectors(startPos, standPos, progress);
        // Face moving direction
        const dir = standPos.clone().sub(startPos).normalize();
        this.farmerGroup.rotation.y = Math.atan2(dir.x, dir.z);

        // Walk cycle
        const walkCycle = progress * 35;
        if (legL) legL.rotation.x = Math.sin(walkCycle) * 0.45;
        if (legR) legR.rotation.x = -Math.sin(walkCycle) * 0.45;
        if (armR) armR.rotation.x = -Math.sin(walkCycle) * 0.35;
        this.farmerGroup.position.y = Math.abs(Math.sin(walkCycle)) * 0.12;

        if (progress >= 1) {
          progress = 0;
          phase = 'sow';
          resetLimbs();
          this.farmerGroup.position.y = 0;
          // Face the bed
          this.farmerGroup.rotation.y = Math.atan2(targetX - standPos.x, targetZ - standPos.z);
          // Audio
          try {
            if (sound && typeof sound.playSeedScatter === 'function') sound.playSeedScatter();
          } catch (e) { }

          // Scatter seeds
          if (this.farmerSeeds) {
            this.farmerSeeds.children.forEach((s, idx) => {
              s.visible = true;
              s.position.set(standPos.x, 1.4, standPos.z);
              s.userData = {
                target: new THREE.Vector3(targetX + (Math.random() - 0.5) * 4, 0.35, targetZ + (Math.random() - 0.5) * 6),
                t: 0,
                delay: idx * 0.03
              };
            });
          }

          if (window.farmdb && window.farmdb.showToast) {
            window.farmdb.showToast(`👨‍🌾 Farmer sowed fresh seeds into Plot ${targetPlotId || 'A1'}! Ready to cultivate.`, 'info');
          }
        }
        requestAnimationFrame(animStep);

      } else if (phase === 'sow') {
        progress += 0.02;
        // Arm swinging arc
        if (armR) {
          armR.rotation.x = -Math.sin(progress * Math.PI) * 1.2;
          armR.rotation.z = -Math.sin(progress * Math.PI) * 0.4;
        }
        this.farmerGroup.rotation.x = Math.sin(progress * Math.PI) * 0.18;

        // Move seed particles
        if (this.farmerSeeds) {
          this.farmerSeeds.children.forEach(s => {
            if (!s.visible) return;
            s.userData.t += 0.04;
            if (s.userData.t >= s.userData.delay) {
              const p = Math.min(1.0, (s.userData.t - s.userData.delay) * 2.2);
              s.position.lerp(s.userData.target, 0.18);
              s.position.y = Math.max(0.35, 1.4 * (1 - p) + Math.sin(p * Math.PI) * 0.8);
            }
          });
        }

        if (progress >= 1) {
          progress = 0;
          phase = 'wave';
          resetLimbs();
          this.farmerGroup.rotation.x = 0;
          setTimeout(() => {
            if (this.farmerSeeds) this.farmerSeeds.children.forEach(s => s.visible = false);
          }, 1000);
        }
        requestAnimationFrame(animStep);

      } else if (phase === 'wave') {
        progress += 0.03;
        if (armR) armR.rotation.z = -2.2 + Math.sin(progress * 15) * 0.35;

        if (progress >= 1) {
          progress = 0;
          phase = 'walk_back';
          resetLimbs();
        }
        requestAnimationFrame(animStep);

      } else if (phase === 'walk_back') {
        progress += 0.015;
        this.farmerGroup.position.lerpVectors(standPos, startPos, progress);
        // Face moving direction
        const dir = startPos.clone().sub(standPos).normalize();
        this.farmerGroup.rotation.y = Math.atan2(dir.x, dir.z);

        // Walk cycle
        const walkCycle = progress * 35;
        if (legL) legL.rotation.x = Math.sin(walkCycle) * 0.45;
        if (legR) legR.rotation.x = -Math.sin(walkCycle) * 0.45;
        if (armR) armR.rotation.x = -Math.sin(walkCycle) * 0.35;
        this.farmerGroup.position.y = Math.abs(Math.sin(walkCycle)) * 0.12;

        if (progress >= 1) {
          this.farmerGroup.position.copy(startPos);
          this.farmerGroup.rotation.set(0, Math.PI / 2, 0);
          resetLimbs();
          this.isFarmerAnimating = false;
        } else {
          requestAnimationFrame(animStep);
        }
      }
    };
    animStep();
  }

  // ==========================================================
  // VINTAGE DELIVERY TRUCK & WAREHOUSE UNLOADING
  // ==========================================================
  buildDeliveryTruck() {
    this.deliveryTruckGroup = new THREE.Group();
    this.truckHomePos = new THREE.Vector3(-46, 0, -8);
    this.deliveryTruckGroup.position.copy(this.truckHomePos);
    this.deliveryTruckGroup.rotation.y = Math.PI / 2; // Facing East towards barn
    this.deliveryTruckGroup.userData = { type: 'truck' };

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1E3A8A, roughness: 0.5, metalness: 0.2 }); // Deep Navy
    const woodBedMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.8, roughness: 0.2 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.95 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xBAE6FD, roughness: 0.1, transparent: true, opacity: 0.7 });

    // 1. Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 5.8), new THREE.MeshStandardMaterial({ color: 0x0F172A }));
    chassis.position.y = 0.65;
    chassis.castShadow = true;
    this.deliveryTruckGroup.add(chassis);

    // 2. Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 2.0), bodyMat);
    cab.position.set(0, 1.6, 0.4);
    cab.castShadow = true;
    this.deliveryTruckGroup.add(cab);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 0.08), glassMat);
    windshield.position.set(0, 1.7, 1.42);
    this.deliveryTruckGroup.add(windshield);

    // Hood & Chrome Grille
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.85, 1.6), bodyMat);
    hood.position.set(0, 1.25, 2.2);
    hood.castShadow = true;
    this.deliveryTruckGroup.add(hood);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 0.1), chromeMat);
    grille.position.set(0, 1.2, 3.02);
    this.deliveryTruckGroup.add(grille);

    // Headlights
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xFEF08A, emissive: 0xFDE047, emissiveIntensity: 0.8 });
    [-0.85, 0.85].forEach(hx => {
      const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), lightMat);
      hl.rotation.x = Math.PI / 2;
      hl.position.set(hx, 1.25, 3.02);
      this.deliveryTruckGroup.add(hl);
    });

    // 3. Wooden Truck Bed
    const truckBed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 2.8), woodBedMat);
    truckBed.position.set(0, 1.25, -1.8);
    truckBed.castShadow = true;
    this.deliveryTruckGroup.add(truckBed);

    // Burlap cargo sacks in the truck bed
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.9 });
    [-0.55, 0.55].forEach((sx, idx) => {
      const sack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), sackMat);
      sack.scale.set(1.1, 0.85, 1.2);
      sack.position.set(sx, 1.6, -1.8 + idx * 0.4);
      sack.castShadow = true;
      this.deliveryTruckGroup.add(sack);
    });

    // Active Flying Delivery Sack
    this.deliverySack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), new THREE.MeshStandardMaterial({
      color: 0xD97706,
      emissive: 0x92400E,
      emissiveIntensity: 0.3
    }));
    this.deliverySack.scale.set(1.1, 0.9, 1.2);
    this.deliverySack.position.set(0, 1.7, -1.4);
    this.deliverySack.castShadow = true;
    this.deliveryTruckGroup.add(this.deliverySack);

    // 4. Wheels
    const wheelPositions = [
      [-1.15, 0.55, 1.7],
      [1.15, 0.55, 1.7],
      [-1.15, 0.55, -1.7],
      [1.15, 0.55, -1.7]
    ];
    wheelPositions.forEach(p => {
      const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.36, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(p[0], p[1], p[2]);
      wheel.castShadow = true;
      this.deliveryTruckGroup.add(wheel);

      // Hubcap
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.38, 12), chromeMat);
      hub.position.set(p[0], p[1], p[2]);
      hub.rotation.z = Math.PI / 2;
      this.deliveryTruckGroup.add(hub);
    });

    this.scene.add(this.deliveryTruckGroup);
    this.clickableEntities.push(this.deliveryTruckGroup);
  }

  playTruckDeliveryAnimation(itemName = 'Supplies') {
    if (!this.deliveryTruckGroup || this.isTruckAnimating) return;
    this.isTruckAnimating = true;

    try {
      if (sound && typeof sound.playTractorMotor === 'function') sound.playTractorMotor(2.2);
    } catch (e) { }

    const startPos = this.truckHomePos.clone();
    const barnDropPos = new THREE.Vector3(-25, 0, -8);
    const barnDoorPos = new THREE.Vector3(-32, 2.5, -11);

    let phase = 'drive_to_barn'; // drive_to_barn -> unload_sack -> honk -> drive_back
    let progress = 0;

    const truckAnim = () => {
      if (phase === 'drive_to_barn') {
        progress += 0.02;
        this.deliveryTruckGroup.position.lerpVectors(startPos, barnDropPos, progress);
        this.deliveryTruckGroup.position.y = Math.sin(progress * 30) * 0.05;

        if (progress >= 1) {
          progress = 0;
          phase = 'unload_sack';
          this.deliveryTruckGroup.position.copy(barnDropPos);
          this.deliverySack.visible = true;
        }
        requestAnimationFrame(truckAnim);

      } else if (phase === 'unload_sack') {
        progress += 0.025;
        // Float sack towards barn door
        const currentSackPos = new THREE.Vector3().lerpVectors(
          barnDropPos.clone().add(new THREE.Vector3(0, 1.7, -1.4)),
          barnDoorPos,
          progress
        );
        currentSackPos.y += Math.sin(progress * Math.PI) * 1.6; // Arc height

        this.deliverySack.position.copy(this.deliveryTruckGroup.worldToLocal(currentSackPos));
        this.deliverySack.rotation.x += 0.08;
        this.deliverySack.rotation.y += 0.08;

        if (progress >= 1) {
          progress = 0;
          phase = 'honk';
          this.deliverySack.visible = false;
          this.deliverySack.position.set(0, 1.7, -1.4);
          this.deliverySack.rotation.set(0, 0, 0);

          try {
            if (sound && typeof sound.playChime === 'function') sound.playChime();
            if (sound && typeof sound.playTruckHorn === 'function') sound.playTruckHorn();
          } catch (e) { }

          if (window.farmdb && window.farmdb.showToast) {
            window.farmdb.showToast(`🚚 Delivery truck arrived! 1x Bag of ${itemName} stored in the Barn.`, 'success');
          }
        }
        requestAnimationFrame(truckAnim);

      } else if (phase === 'honk') {
        progress += 0.03;
        if (progress >= 1) {
          progress = 0;
          phase = 'drive_back';
        }
        requestAnimationFrame(truckAnim);

      } else if (phase === 'drive_back') {
        progress += 0.02;
        this.deliveryTruckGroup.position.lerpVectors(barnDropPos, startPos, progress);
        this.deliveryTruckGroup.position.y = Math.sin(progress * 30) * 0.05;

        if (progress >= 1) {
          this.deliveryTruckGroup.position.copy(startPos);
          this.deliverySack.visible = true;
          this.isTruckAnimating = false;
        } else {
          requestAnimationFrame(truckAnim);
        }
      }
    };
    truckAnim();
  }

  // ==========================================================
  // LIVESTOCK ACTIVE TROT & MOO REACTION
  // ==========================================================
  playAnimalReactionAnimation(cowName = null) {
    const activeCows = this.cowMeshes.filter(c => c.visible);
    if (activeCows.length === 0 || this.isAnimalAnimating) return;
    this.isAnimalAnimating = true;

    try {
      if (sound && typeof sound.playCowMoo === 'function') sound.playCowMoo();
    } catch (e) { }

    const namesText = cowName || activeCows.map(c => c.userData.name || 'Cow').join(' & ');
    if (window.farmdb && window.farmdb.showToast) {
      window.farmdb.showToast(`🐄 ${namesText} mooed happily! Cattle fed & roaming the pasture.`, 'info');
    }

    const cow1 = activeCows[0];
    const cow2 = activeCows.length > 1 ? activeCows[1] : null;
    const origPos1 = cow1.position.clone();
    const origPos2 = cow2 ? cow2.position.clone() : null;

    let progress = 0;
    const animDuration = 180; // ~3 seconds at 60fps

    const cowLoop = () => {
      progress++;
      const t = progress / animDuration;
      const trotCycle = progress * 0.25;

      activeCows.forEach((cow, i) => {
        const legs = cow.userData.legs;
        if (legs) {
          // 4-Leg Trot Cycle
          legs.fl.rotation.x = Math.sin(trotCycle + i) * 0.45;
          legs.br.rotation.x = Math.sin(trotCycle + i) * 0.45;
          legs.fr.rotation.x = -Math.sin(trotCycle + i) * 0.45;
          legs.bl.rotation.x = -Math.sin(trotCycle + i) * 0.45;
        }

        if (cow.userData.tail) {
          cow.userData.tail.rotation.z = Math.sin(trotCycle * 2) * 0.5;
        }

        if (cow.userData.head) {
          cow.userData.head.rotation.x = Math.sin(trotCycle * 1.5) * 0.18;
          cow.userData.head.rotation.y = Math.sin(trotCycle * 0.8) * 0.12;
        }

        // Heart emote popup
        if (cow.userData.emote) {
          const emoteScale = Math.sin(t * Math.PI) * 1.2;
          cow.userData.emote.scale.set(emoteScale, emoteScale, emoteScale);
          cow.userData.emote.position.y = 3.6 + Math.sin(t * Math.PI) * 0.8;
          cow.userData.emote.rotation.y = progress * 0.05;
        }
      });

      // Joyful wander in pasture
      cow1.position.z = origPos1.z + Math.sin(t * Math.PI * 2) * 3.0;
      cow1.position.x = origPos1.x + Math.sin(t * Math.PI) * 1.5;
      cow1.position.y = Math.abs(Math.sin(trotCycle * 2)) * 0.12;

      if (cow2 && origPos2) {
        cow2.position.z = origPos2.z - Math.sin(t * Math.PI * 2) * 2.2;
        cow2.position.x = origPos2.x - Math.sin(t * Math.PI) * 1.2;
        cow2.position.y = Math.abs(Math.sin(trotCycle * 2)) * 0.12;
      }

      if (progress < animDuration) {
        requestAnimationFrame(cowLoop);
      } else {
        cow1.position.copy(origPos1);
        if (cow2 && origPos2) cow2.position.copy(origPos2);
        activeCows.forEach(cow => {
          const legs = cow.userData.legs;
          if (legs) {
            legs.fl.rotation.set(0, 0, 0);
            legs.fr.rotation.set(0, 0, 0);
            legs.bl.rotation.set(0, 0, 0);
            legs.br.rotation.set(0, 0, 0);
          }
          if (cow.userData.emote) cow.userData.emote.scale.set(0.001, 0.001, 0.001);
          cow.position.y = 0;
        });
        this.isAnimalAnimating = false;
      }
    };
    cowLoop();
  }

  // ==========================================================
  // LUSH 3D GRASS TUFTS & WILDFLOWERS ENVIRONMENT (ORIGINAL STYLIZED)
  // ==========================================================
  buildGrassAndWildflowers() {
    this.grassMeshes = [];

    // Helper to test if coordinates are in an open green meadow zone
    const isMeadowZone = (x, z) => {
      // Main north-south dirt road
      if (x >= -10 && x <= -2 && z >= -35 && z <= 35) return false;
      // Cross path
      if (z >= -3.5 && z <= 3.5 && x >= -15 && x <= 40) return false;
      // Cultivated Plot beds
      if (x >= -24 && x <= 24 && z >= -15 && z <= -5) return false;
      if (x >= -24 && x <= 24 && z >= 5 && z <= 15) return false;
      // Barn
      if (x >= -38 && x <= -26 && z >= -25 && z <= -11) return false;
      // Tractor yard
      if (x >= -19 && x <= -11 && z >= 14 && z <= 22) return false;
      // Water reservoir
      const rx = this.waterReservoirGroup ? this.waterReservoirGroup.position.x : -15;
      const rz = this.waterReservoirGroup ? this.waterReservoirGroup.position.z : -25;
      if (Math.hypot(x - rx, z - rz) < 4.2) return false;
      // Windpump
      const wx = this.windmillGroup ? this.windmillGroup.position.x : 24;
      const wz = this.windmillGroup ? this.windmillGroup.position.z : -18;
      if (Math.hypot(x - wx, z - wz) < 5.5) return false;
      // Platform boundaries
      if (Math.abs(x) > 42 || Math.abs(z) > 37) return false;
      return true;
    };

    // Diverse color palette for grass
    const grassColors = [0x22C55E, 0x16A34A, 0x15803D, 0x65A30D, 0x84CC16];
    const grassMaterials = grassColors.map(c => new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.85,
      side: THREE.DoubleSide
    }));

    // Flower petal materials
    const flowerMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.6 }), // Poppy Red
      new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.5 }), // Dandelion Yellow
      new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.7 }), // Daisy White
      new THREE.MeshStandardMaterial({ color: 0x818CF8, roughness: 0.6 })  // Lavender
    ];
    const flowerCenterMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.4 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534 });

    // Seeded random cluster distribution across key areas
    const candidateZones = [
      // Along North and South Perimeter Fences
      { xMin: -40, xMax: 40, zMin: -34, zMax: -30, count: 40 },
      { xMin: -40, xMax: 40, zMin: 30, zMax: 34, count: 40 },
      // East Boundary Field
      { xMin: 28, xMax: 42, zMin: -30, zMax: 30, count: 35 },
      // Roadside grass fringes
      { xMin: -11.5, xMax: -10.2, zMin: -30, zMax: 30, count: 25 },
      { xMin: -1.8, xMax: -0.5, zMin: -30, zMax: 30, count: 25 },
      // Pasture meadow & cow pen edges
      { xMin: -42, xMax: -26, zMin: 0, zMax: 20, count: 30 },
      // Water reservoir surrounds
      { xMin: -22, xMax: -8, zMin: -32, zMax: -18, count: 20 }
    ];

    let totalSpawned = 0;
    candidateZones.forEach(zone => {
      for (let i = 0; i < zone.count; i++) {
        const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin);
        const z = zone.zMin + Math.random() * (zone.zMax - zone.zMin);
        if (!isMeadowZone(x, z)) continue;

        const tuft = new THREE.Group();
        tuft.position.set(x, 0, z);

        const bladeCount = 3 + Math.floor(Math.random() * 3);
        const mat = grassMaterials[Math.floor(Math.random() * grassMaterials.length)];
        const tuftHeight = 0.5 + Math.random() * 0.4;

        for (let b = 0; b < bladeCount; b++) {
          const bladeGeo = new THREE.ConeGeometry(0.06, tuftHeight * (0.8 + Math.random() * 0.4), 4);
          bladeGeo.translate(0, (tuftHeight * 0.9) / 2, 0); // pivot at base
          const blade = new THREE.Mesh(bladeGeo, mat);

          const angle = (b / bladeCount) * Math.PI * 2 + Math.random() * 0.4;
          blade.position.set(Math.cos(angle) * 0.08, 0, Math.sin(angle) * 0.08);
          blade.rotation.y = angle;
          blade.rotation.z = (Math.random() - 0.5) * 0.25;
          blade.rotation.x = (Math.random() - 0.5) * 0.25;
          tuft.add(blade);
        }

        // Add occasional wildflower (approx 20% of tufts)
        if (Math.random() < 0.22) {
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, tuftHeight * 1.1, 4), stemMat);
          stem.position.y = (tuftHeight * 1.1) / 2;
          tuft.add(stem);

          const fMat = flowerMaterials[Math.floor(Math.random() * flowerMaterials.length)];
          const flowerHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), fMat);
          flowerHead.position.y = tuftHeight * 1.1;
          flowerHead.scale.set(1.2, 0.7, 1.2);
          tuft.add(flowerHead);

          const center = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), flowerCenterMat);
          center.position.y = tuftHeight * 1.1 + 0.05;
          tuft.add(center);
        }

        tuft.userData = {
          phaseX: Math.random() * Math.PI * 2,
          phaseZ: Math.random() * Math.PI * 2
        };

        this.scene.add(tuft);
        this.grassMeshes.push(tuft);
        totalSpawned++;
      }
    });
  }

  // ==========================================================
  // NOCTURNAL FIREFLIES (Active During Night Atmosphere)
  // ==========================================================
  buildFireflies() {
    this.fireflies = [];
    const fireflyGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const fireflyMat = new THREE.MeshBasicMaterial({
      color: 0xADFF2F, // Green-yellow bioluminescence
      transparent: true,
      opacity: 0.88
    });

    for (let i = 0; i < 45; i++) {
      const mesh = new THREE.Mesh(fireflyGeo, fireflyMat);
      const x = (Math.random() - 0.5) * 75;
      const z = (Math.random() - 0.5) * 65;
      const y = 0.5 + Math.random() * 2.2;
      mesh.position.set(x, y, z);
      mesh.userData = {
        baseX: x,
        baseZ: z,
        baseY: y,
        speed: 0.7 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2
      };
      mesh.visible = false;
      this.scene.add(mesh);
      this.fireflies.push(mesh);
    }
  }

  buildEnvironmentProps() {
    // Strategic tree placements along boundary fence line and countryside groves
    const treePositions = [
      [36, -26], [38, -12], [35, 14], [37, 28], [36, 42],
      [-36, -30], [-24, -33], [-10, -32], [14, -32], [28, -30],
      [-20, 36], [-2, 34], [18, 34], [32, 32],
      [-38, -12], [-36, 16], [-38, 26]
    ];

    const loader = new TDSLoader();
    loader.setResourcePath('/models/trees/');

    // Invert the leaf alpha mask and disable mipmap erosion
    const createInvertedAlpha = (src) => {
      const canvas = document.createElement('canvas');
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const inv = 255 - d[i];
          d[i] = inv;
          d[i + 1] = inv;
          d[i + 2] = inv;
          d[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        texture.needsUpdate = true;
      };
      img.src = src;
      return texture;
    };

    const leafAlpha = createInvertedAlpha('/models/trees/blatt1_a.jpg');

    loader.load(
      '/models/trees/Tree1.3ds',
      (treeObj) => {
        // 3DS coordinates use Z-up; rotate to Three.js Y-up
        treeObj.rotation.x = -Math.PI / 2;

        const baseGroup = new THREE.Group();
        baseGroup.add(treeObj);

        // Align base of tree directly onto ground level (Y = 0)
        const box = new THREE.Box3().setFromObject(baseGroup);
        treeObj.position.y = -box.min.y;

        // Process materials: Convert 3DS phong specular to matte MeshStandardMaterial with deep lush green foliage
        baseGroup.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const updateMat = (mat) => {
              if (!mat) return mat;
              const isLeaf = mat.name && (mat.name.toLowerCase().includes('leaf') || mat.name.toLowerCase().includes('blatt'));
              if (isLeaf) {
                const leafMat = new THREE.MeshStandardMaterial({
                  name: mat.name || 'TreeLeafMat',
                  color: 0x3E7D30, // Deep lush foliage green - never appears white at distance!
                  map: mat.map || null,
                  alphaMap: leafAlpha,
                  transparent: false, // Pure alpha cutout: prevents depth sorting haze and distance bleaching
                  alphaTest: 0.44,
                  roughness: 0.96, // completely matte - kills the white specular sun glare that made trees white!
                  metalness: 0.0,
                  side: THREE.DoubleSide,
                  depthWrite: true
                });
                if (leafMat.map) leafMat.map.colorSpace = THREE.SRGBColorSpace;
                return leafMat;
              } else {
                const barkMat = new THREE.MeshStandardMaterial({
                  name: mat.name || 'TreeBarkMat',
                  color: 0x5D4037,
                  map: mat.map || null,
                  roughness: 0.9,
                  metalness: 0.05
                });
                if (barkMat.map) barkMat.map.colorSpace = THREE.SRGBColorSpace;
                return barkMat;
              }
            };

            if (Array.isArray(child.material)) {
              child.material = child.material.map(updateMat);
            } else {
              child.material = updateMat(child.material);
            }
          }
        });

        // Deploy realistic 3D tree instances around the farm
        treePositions.forEach((pos, idx) => {
          const treeInstance = baseGroup.clone(true);
          // Scale: Tree1 height is ~15.8 units; scale 0.50 - 0.68 yields realistic ~7.8 - 10.5 units height
          const scale = 0.50 + ((idx * 41) % 15) * 0.012;
          treeInstance.scale.set(scale, scale, scale);
          treeInstance.position.set(pos[0], 0, pos[1]);
          treeInstance.rotation.y = ((idx * 83) % 360) * (Math.PI / 180);

          this.scene.add(treeInstance);
          this.treeMeshes.push(treeInstance);
        });

        console.log(`🌲 Deployed ${this.treeMeshes.length} realistic 3D trees from Tree1.3ds.`);
      },
      undefined,
      (err) => {
        console.warn('Could not load Tree1.3ds, falling back to procedural trees:', err);
        this.buildProceduralTrees(treePositions);
      }
    );
  }

  buildProceduralTrees(treePositions) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x1E3A1E, roughness: 0.8 });

    treePositions.forEach(p => {
      const tree = new THREE.Group();
      tree.position.set(p[0], 0, p[1]);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3, 6), trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      for (let i = 0; i < 3; i++) {
        const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.4 - i * 0.5, 2.8, 6), pineMat);
        foliage.position.y = 3.2 + i * 1.6;
        foliage.castShadow = true;
        tree.add(foliage);
      }
      this.scene.add(tree);
      this.treeMeshes.push(tree);
    });
  }

  // ==========================================================
  // CLOUDS IN UPPER SKY (HIGH ALTITUDE & CLEAN HORIZONS)
  // ==========================================================
  buildClouds() {
    this.cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.05,
      flatShading: true,
      transparent: true,
      opacity: 0.94
    });

    const createCloudCluster = (scale = 1.0) => {
      const group = new THREE.Group();
      const puffSpecs = [
        { r: 4.2 * scale, x: 0, y: 0, z: 0 },
        { r: 3.2 * scale, x: -3.6 * scale, y: -0.3 * scale, z: 0.8 * scale },
        { r: 3.4 * scale, x: 3.5 * scale, y: -0.3 * scale, z: -0.5 * scale },
        { r: 2.8 * scale, x: 1.0 * scale, y: -0.4 * scale, z: 2.5 * scale },
        { r: 2.9 * scale, x: -1.2 * scale, y: -0.4 * scale, z: -2.4 * scale },
        { r: 3.3 * scale, x: 0.4 * scale, y: 2.0 * scale, z: 0.3 * scale }
      ];

      puffSpecs.forEach(spec => {
        const geo = new THREE.IcosahedronGeometry(spec.r, 1);
        const mesh = new THREE.Mesh(geo, this.cloudMaterial);
        mesh.position.set(spec.x, spec.y, spec.z);
        mesh.scale.set(1.0, 0.68, 1.0);
        mesh.castShadow = true;
        group.add(mesh);
      });
      return group;
    };

    // 6 graceful high-altitude clouds floating high in the sky (Y = 58 to 74)
    const highConfigs = [
      { x: -160, y: 62, z: -100, scale: 2.4, speed: 0.022 },
      { x: -50, y: 72, z: -150, scale: 2.8, speed: 0.018 },
      { x: 90, y: 64, z: -90, scale: 2.5, speed: 0.024 },
      { x: 180, y: 74, z: 60, scale: 2.6, speed: 0.019 },
      { x: -100, y: 62, z: 140, scale: 2.3, speed: 0.023 },
      { x: 60, y: 68, z: 150, scale: 2.6, speed: 0.021 }
    ];

    this.dynamicClouds = [];
    this.staticClouds = [];
    highConfigs.forEach((cfg, idx) => {
      const cloud = createCloudCluster(cfg.scale);
      cloud.position.set(cfg.x, cfg.y, cfg.z);
      cloud.userData = {
        speed: cfg.speed * 2.0,
        baseY: cfg.y,
        bobPhase: idx * 1.2,
        scale: cfg.scale
      };
      this.scene.add(cloud);
      this.dynamicClouds.push(cloud);
    });
  }

  // ==========================================================
  // BIRDS (V-FORMATION FLOCK & LONE PERCHING VISITOR)
  // ==========================================================
  createLowPolyBird(color = 0x2A3439) {
    const bird = new THREE.Group();
    const birdMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.5 });

    // Torso / Body (facing -Z)
    const bodyGeo = new THREE.ConeGeometry(0.3, 1.3, 5);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, birdMat);
    bird.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 6, 6);
    const head = new THREE.Mesh(headGeo, birdMat);
    head.position.set(0, 0.14, -0.7);
    bird.add(head);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.08, 0.3, 4);
    beakGeo.rotateX(-Math.PI / 2);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.position.set(0, 0.12, -0.95);
    bird.add(beak);

    // Left Wing (pivot at shoulder)
    const wingLGroup = new THREE.Group();
    wingLGroup.position.set(-0.25, 0.12, -0.1);
    const wingLGeo = new THREE.BoxGeometry(1.05, 0.03, 0.38);
    wingLGeo.translate(-0.52, 0, 0);
    const wingL = new THREE.Mesh(wingLGeo, birdMat);
    wingLGroup.add(wingL);
    bird.add(wingLGroup);

    // Right Wing
    const wingRGroup = new THREE.Group();
    wingRGroup.position.set(0.25, 0.12, -0.1);
    const wingRGeo = new THREE.BoxGeometry(1.05, 0.03, 0.38);
    wingRGeo.translate(0.52, 0, 0);
    const wingR = new THREE.Mesh(wingRGeo, birdMat);
    wingRGroup.add(wingR);
    bird.add(wingRGroup);

    // Tail
    const tailGeo = new THREE.BoxGeometry(0.4, 0.03, 0.5);
    const tail = new THREE.Mesh(tailGeo, birdMat);
    tail.position.set(0, 0.06, 0.75);
    bird.add(tail);

    bird.userData = { wingL: wingLGroup, wingR: wingRGroup, head, body };
    return bird;
  }

  buildBirdFlock() {
    this.flockGroup = new THREE.Group();
    this.flockGroup.visible = false;
    this.scene.add(this.flockGroup);

    // Classic V-formation (Apex lead bird + 3 on left wing + 3 on right wing = 7 birds)
    const vPositions = [
      { x: 0, y: 0, z: 0 },          // Apex leader
      { x: -4.2, y: 0.3, z: 4.6 },   // Left 1
      { x: 4.2, y: -0.2, z: 4.6 },   // Right 1
      { x: -8.4, y: -0.3, z: 9.2 },  // Left 2
      { x: 8.4, y: 0.2, z: 9.2 },    // Right 2
      { x: -12.6, y: 0.1, z: 13.8 }, // Left 3
      { x: 12.6, y: -0.1, z: 13.8 }  // Right 3
    ];

    this.flockBirds = [];
    vPositions.forEach((pos, idx) => {
      const bird = this.createLowPolyBird(0x283238);
      bird.position.set(pos.x, pos.y, pos.z);
      bird.scale.set(0.95, 0.95, 0.95);
      bird.userData.wingPhase = idx * 0.5;
      this.flockGroup.add(bird);
      this.flockBirds.push(bird);
    });

    // Launch flock every 2 minutes (120 seconds) per user requirement
    setInterval(() => {
      this.launchBirdFlock();
    }, 120000);

    // Initial flock launch 6 seconds after loading
    setTimeout(() => {
      this.launchBirdFlock();
    }, 6000);
  }

  launchBirdFlock() {
    if (this.flockActive || !this.flockGroup) return;

    // Random flight heading across the countryside
    const angle = Math.random() * Math.PI * 2;
    const spawnRadius = 260;
    const startX = Math.cos(angle) * spawnRadius;
    const startZ = Math.sin(angle) * spawnRadius;
    const endX = -startX;
    const endZ = -startZ;

    const altitude = 44 + Math.random() * 16;
    this.flockStart.set(startX, altitude, startZ);
    this.flockEnd.set(endX, altitude + (Math.random() * 6 - 3), endZ);

    this.flockGroup.position.copy(this.flockStart);
    this.flockGroup.lookAt(this.flockEnd);
    this.flockGroup.visible = true;
    this.flockActive = true;
    this.flockProgress = 0;

    try {
      if (sound && typeof sound.playBirdChirp === 'function') {
        setTimeout(() => sound.playBirdChirp(), 4200);
      }
    } catch (e) { }
  }

  buildPerchingBird() {
    this.perchingBirdGroup = this.createLowPolyBird(0x4A3728); // Chestnut brown songbird
    this.perchingBirdGroup.scale.set(0.65, 0.65, 0.65);
    this.perchingBirdGroup.visible = false;
    this.scene.add(this.perchingBirdGroup);

    // Warm breast accent
    const breastMat = new THREE.MeshStandardMaterial({ color: 0xD9534F, roughness: 0.7 });
    const breast = new THREE.Mesh(new THREE.SphereGeometry(0.18, 5, 5), breastMat);
    breast.position.set(0, 0.02, -0.4);
    this.perchingBirdGroup.add(breast);

    this.perchOptions = [
      { name: 'Tractor Roof', pos: new THREE.Vector3(-15, 3.4, 18), rotY: Math.PI / 4 },
      { name: 'North Lamp Post', pos: new THREE.Vector3(-10.5, 6.2, -20), rotY: 0 },
      { name: 'South Lamp Post', pos: new THREE.Vector3(-10.5, 6.2, 20), rotY: 0 },
      { name: 'Barn Roof Ridge', pos: new THREE.Vector3(-32, 9.6, -18), rotY: -Math.PI / 3 },
      { name: 'Pasture Fence Post', pos: new THREE.Vector3(-14, 2.3, -32), rotY: Math.PI / 2 }
    ];

    this.perchState = 'IDLE_WAIT';
    this.perchTimer = 8.0; // Spawns first visit ~8 seconds after loading!
    this.perchProgress = 0;
    this.perchedElapsed = 0;
  }

  // ==========================================================
  // STREET LAMP POSTS (Country Road Illumination & Interaction)
  // ==========================================================
  buildLampPosts() {
    // 7 Strategic lamp posts along the main farm road and cross paths
    this.lampConfigs = [
      { id: 'lamp_nw', x: -10.5, y: 0, z: -20, rotY: 0, label: 'North-West Main Road Lamp' },
      { id: 'lamp_ne', x: -1.5, y: 0, z: -20, rotY: Math.PI, label: 'North-East Main Road Lamp' },
      { id: 'lamp_sw', x: -10.5, y: 0, z: 20, rotY: 0, label: 'South-West Main Road Lamp' },
      { id: 'lamp_se', x: -1.5, y: 0, z: 20, rotY: Math.PI, label: 'South-East Main Road Lamp' },
      { id: 'lamp_path_w', x: -15, y: 0, z: -3.2, rotY: -Math.PI / 2, label: 'Pasture Walkway Lamp' },
      { id: 'lamp_path_c', x: 5, y: 0, z: -3.2, rotY: -Math.PI / 2, label: 'Central Plot Walkway Lamp' },
      { id: 'lamp_path_e', x: 15, y: 0, z: -3.2, rotY: -Math.PI / 2, label: 'East Meadow Walkway Lamp' }
    ];

    const manager = new THREE.LoadingManager();
    const mtlLoader = new MTLLoader(manager);
    mtlLoader.setPath('/models/lamppost/');
    mtlLoader.load(
      'rv_lamp_post_4.mtl',
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/lamppost/');
        objLoader.load(
          'rv_lamp_post_4.obj',
          (lampObj) => {
            this.setupLampPosts(lampObj, this.lampConfigs);
          },
          undefined,
          (err) => {
            console.warn('Could not load lamp post OBJ, using procedural fallback:', err);
            this.setupProceduralLampPosts(this.lampConfigs);
          }
        );
      },
      undefined,
      (err) => {
        console.warn('Could not load lamp post MTL, loading OBJ directly or fallback:', err);
        const objLoader = new OBJLoader(manager);
        objLoader.setPath('/models/lamppost/');
        objLoader.load(
          'rv_lamp_post_4.obj',
          (lampObj) => {
            this.setupLampPosts(lampObj, this.lampConfigs);
          },
          undefined,
          () => this.setupProceduralLampPosts(this.lampConfigs)
        );
      }
    );
  }

  setupLampPosts(baseModel, configs) {
    if (this.lampPosts && this.lampPosts.length > 0) {
      this.lampPosts.forEach(lamp => {
        this.scene.remove(lamp);
        const idx = this.clickableEntities.indexOf(lamp);
        if (idx !== -1) this.clickableEntities.splice(idx, 1);
      });
      this.lampPosts = [];
    }

    const scale = 0.25; // Gives ~6.1m realistic street lamp height
    const localBulbPos = new THREE.Vector3(1.225, 4.315, 0);

    configs.forEach((cfg) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(cfg.x, cfg.y, cfg.z);
      lampGroup.rotation.y = cfg.rotY;

      const modelClone = baseModel.clone(true);
      modelClone.scale.set(scale, scale, scale);

      let dedicatedBulbMat = null;

      // Ensure distinct materials per lamp so that switching a lamp only affects that specific unit
      modelClone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat) => {
              const matName = mat ? (mat.name || '') : '';
              if (matName.includes('glow') || matName === 'Lamppost_glow1SG') {
                const bulbMat = new THREE.MeshStandardMaterial({
                  name: 'Lamppost_glow1SG',
                  color: 0x3A3A3A,
                  emissive: 0x000000,
                  emissiveIntensity: 0,
                  roughness: 0.25,
                  metalness: 0.1
                });
                dedicatedBulbMat = bulbMat;
                return bulbMat;
              } else if (matName.includes('blinn') || matName === 'blinn2SG') {
                return new THREE.MeshStandardMaterial({
                  name: 'blinn2SG',
                  color: 0xE8F4F8,
                  transparent: true,
                  opacity: 0.45,
                  roughness: 0.15,
                  metalness: 0.1
                });
              } else if (matName.includes('mat3') || matName === 'Lamp_post_metal_mat3SG') {
                return new THREE.MeshStandardMaterial({
                  name: 'Lamp_post_metal_mat3SG',
                  color: 0xC6A052,
                  roughness: 0.4,
                  metalness: 0.8
                });
              } else {
                return new THREE.MeshStandardMaterial({
                  name: 'Lamp_post_metal_mat1SG',
                  color: 0x1C2228,
                  roughness: 0.6,
                  metalness: 0.7
                });
              }
            });
          } else if (child.material) {
            const matName = child.material.name || '';
            if (matName.includes('glow') || matName === 'Lamppost_glow1SG') {
              const bulbMat = new THREE.MeshStandardMaterial({
                name: 'Lamppost_glow1SG',
                color: 0x3A3A3A,
                emissive: 0x000000,
                emissiveIntensity: 0,
                roughness: 0.25,
                metalness: 0.1
              });
              dedicatedBulbMat = bulbMat;
              child.material = bulbMat;
            } else {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x1C2228,
                roughness: 0.6,
                metalness: 0.7
              });
            }
          }
        }
      });

      lampGroup.add(modelClone);

      // Warm street lamp light source to enlighten the countryside road
      const pointLight = new THREE.PointLight(0xFFB74D, 0, 18, 1.8);
      pointLight.position.copy(localBulbPos);
      pointLight.visible = false;
      lampGroup.add(pointLight);

      // Soft glow halo
      const haloGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xFFAA22,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(localBulbPos);
      haloMesh.visible = false;
      lampGroup.add(haloMesh);

      // Raycast hit target cylinder (provides easy mouse clicking & mobile tapping)
      const hitGeo = new THREE.CylinderGeometry(0.9, 0.9, 6.2, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(0.6, 3.1, 0);
      lampGroup.add(hitMesh);

      lampGroup.userData = {
        type: 'lamppost',
        id: cfg.id,
        label: cfg.label,
        bulbMat: dedicatedBulbMat,
        pointLight: pointLight,
        haloMesh: haloMesh,
        isOn: false,
        userOverride: null
      };

      this.scene.add(lampGroup);
      this.lampPosts.push(lampGroup);
      this.clickableEntities.push(lampGroup);
    });

    const isNight = (gameState && gameState.timeOfDay === 'night');
    this.updateLampPostLighting(isNight);
  }

  setupProceduralLampPosts(configs) {
    if (this.lampPosts && this.lampPosts.length > 0) return;

    const postMat = new THREE.MeshStandardMaterial({ color: 0x1C2228, roughness: 0.6, metalness: 0.7 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xC6A052, roughness: 0.4, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xE8F4F8, transparent: true, opacity: 0.45, roughness: 0.15 });

    configs.forEach((cfg) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(cfg.x, cfg.y, cfg.z);
      lampGroup.rotation.y = cfg.rotY;

      // Base
      const baseGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.4, 8);
      const baseMesh = new THREE.Mesh(baseGeo, postMat);
      baseMesh.position.y = 0.2;
      lampGroup.add(baseMesh);

      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 4.2, 8);
      const poleMesh = new THREE.Mesh(poleGeo, postMat);
      poleMesh.position.y = 2.3;
      lampGroup.add(poleMesh);

      // Collar
      const collarGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8);
      const collarMesh = new THREE.Mesh(collarGeo, brassMat);
      collarMesh.position.y = 4.4;
      lampGroup.add(collarMesh);

      // Overhanging Arm
      const armGeo = new THREE.BoxGeometry(1.2, 0.1, 0.1);
      const armMesh = new THREE.Mesh(armGeo, postMat);
      armMesh.position.set(0.6, 4.6, 0);
      lampGroup.add(armMesh);

      // Lantern Hood
      const hoodGeo = new THREE.ConeGeometry(0.4, 0.3, 6);
      const hoodMesh = new THREE.Mesh(hoodGeo, postMat);
      hoodMesh.position.set(1.2, 4.5, 0);
      lampGroup.add(hoodMesh);

      // Lantern Glass Body
      const glassGeo = new THREE.CylinderGeometry(0.25, 0.18, 0.5, 6);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(1.2, 4.15, 0);
      lampGroup.add(glassMesh);

      // Dedicated Bulb
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0x3A3A3A,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.25
      });
      const bulbGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
      bulbMesh.position.set(1.2, 4.15, 0);
      lampGroup.add(bulbMesh);

      const localBulbPos = new THREE.Vector3(1.2, 4.15, 0);

      // PointLight
      const pointLight = new THREE.PointLight(0xFFB74D, 0, 18, 1.8);
      pointLight.position.copy(localBulbPos);
      pointLight.visible = false;
      lampGroup.add(pointLight);

      // Halo
      const haloGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xFFAA22,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(localBulbPos);
      haloMesh.visible = false;
      lampGroup.add(haloMesh);

      // Hit area
      const hitGeo = new THREE.CylinderGeometry(0.9, 0.9, 6.2, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(0.6, 3.1, 0);
      lampGroup.add(hitMesh);

      lampGroup.userData = {
        type: 'lamppost',
        id: cfg.id,
        label: cfg.label,
        bulbMat: bulbMat,
        pointLight: pointLight,
        haloMesh: haloMesh,
        isOn: false,
        userOverride: null
      };

      this.scene.add(lampGroup);
      this.lampPosts.push(lampGroup);
      this.clickableEntities.push(lampGroup);
    });

    const isNight = (gameState && gameState.timeOfDay === 'night');
    this.updateLampPostLighting(isNight);
  }

  setLampState(lamp, turnOn) {
    if (!lamp || !lamp.userData) return;
    lamp.userData.isOn = turnOn;

    if (lamp.userData.pointLight) {
      lamp.userData.pointLight.visible = turnOn;
      lamp.userData.pointLight.intensity = turnOn ? 2.6 : 0;
    }

    if (lamp.userData.haloMesh) {
      lamp.userData.haloMesh.visible = turnOn;
    }

    if (lamp.userData.bulbMat) {
      if (turnOn) {
        lamp.userData.bulbMat.color.setHex(0xFFF3D0);
        lamp.userData.bulbMat.emissive.setHex(0xFFA000);
        lamp.userData.bulbMat.emissiveIntensity = 2.8;
      } else {
        lamp.userData.bulbMat.color.setHex(0x3A3A3A);
        lamp.userData.bulbMat.emissive.setHex(0x000000);
        lamp.userData.bulbMat.emissiveIntensity = 0;
      }
    }
  }

  updateLampPostLighting(isNight = false) {
    if (!this.lampPosts || this.lampPosts.length === 0) return;
    this.lampPosts.forEach(lamp => {
      if (!isNight) {
        // Street lamps stay off during the day
        this.setLampState(lamp, false);
      } else {
        // At night, street lamps turn on by default unless the user switched that specific lamp off
        const override = lamp.userData ? lamp.userData.userOverride : null;
        const shouldBeOn = (override !== null) ? override : true;
        this.setLampState(lamp, shouldBeOn);
      }
    });
  }

  findClickedLampPost() {
    if (this.hoveredLampPost) return this.hoveredLampPost;
    if (!this.lampPosts || this.lampPosts.length === 0) return null;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    for (const lamp of this.lampPosts) {
      const hits = this.raycaster.intersectObjects(lamp.children, true);
      if (hits.length > 0) {
        return lamp;
      }
    }
    return null;
  }

  toggleLampPost(lamp) {
    if (!lamp || !lamp.userData) return;
    const isNight = (gameState && gameState.timeOfDay === 'night');
    const currentState = lamp.userData.isOn;
    const nextState = !currentState;
    lamp.userData.userOverride = nextState;
    this.setLampState(lamp, nextState);

    try {
      if (sound && typeof sound.playSwitchClick === 'function') {
        sound.playSwitchClick(true);
      } else if (sound && typeof sound.playChime === 'function') {
        sound.playChime();
      }
    } catch (e) { }

    const statusText = nextState ? 'Turned ON 💡' : 'Turned OFF 🌙';
    const label = lamp.userData.label || 'Street lamp';
    const note = (!isNight && nextState) ? ' (Street lamps illuminate automatically at night)' : '';
    if (window.farmdb && window.farmdb.showToast) {
      window.farmdb.showToast(`🏮 ${label}: ${statusText}${note}`, 'info');
    }
  }

  // ==========================================================
  // RAYCASTING & INTERACTION
  // ==========================================================
  setupInteractivity() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkHover();
    });

    this.canvas.addEventListener('click', () => {
      this.handleClick();
    });
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const bedMeshes = Array.from(this.plotMeshes.values()).map(p => p.bedMesh);

    // 1. Check Water Reservoir Hover
    let hitReservoir = false;
    if (this.waterReservoirGroup) {
      const resIntersects = this.raycaster.intersectObjects(this.waterReservoirGroup.children, true);
      if (resIntersects.length > 0) {
        hitReservoir = true;
      }
    }

    if (hitReservoir) {
      this.hoveredReservoir = true;
      this.hoveredEntity = null;
      this.canvas.style.cursor = 'pointer';
      if (this.hoveredPlot) {
        const prevPlot = this.plotMeshes.get(this.hoveredPlot);
        if (prevPlot) prevPlot.bedMesh.material.color.set(0x3E2723);
        this.hoveredPlot = null;
      }
      return;
    } else {
      this.hoveredReservoir = false;
    }

    // 2. Check Clickable Entities (Cows, Barn, Truck, Farmer, Street Lamps)
    let hitEntity = null;
    let hitLamp = null;
    if (this.clickableEntities && this.clickableEntities.length > 0) {
      for (const ent of this.clickableEntities) {
        if (ent.visible === false) continue;
        const hits = this.raycaster.intersectObjects(ent.children, true);
        if (hits.length > 0) {
          hitEntity = ent.userData.type;
          if (ent.userData.type === 'lamppost') {
            hitLamp = ent;
          }
          break;
        }
      }
    }

    if (hitEntity) {
      this.hoveredEntity = hitEntity;
      this.hoveredLampPost = hitLamp;
      this.canvas.style.cursor = 'pointer';
      if (this.hoveredPlot) {
        const prevPlot = this.plotMeshes.get(this.hoveredPlot);
        if (prevPlot) prevPlot.bedMesh.material.color.set(0x3E2723);
        this.hoveredPlot = null;
      }
      return;
    } else {
      this.hoveredEntity = null;
      this.hoveredLampPost = null;
    }

    // 3. Check Cultivation Plot Beds
    const intersects = this.raycaster.intersectObjects(bedMeshes);
    if (intersects.length > 0) {
      const hitBed = intersects[0].object;
      const plotId = hitBed.userData.plotId;
      if (this.hoveredPlot !== plotId) {
        this.hoveredPlot = plotId;
        this.canvas.style.cursor = 'pointer';
        hitBed.material.color.set(0x5D4037); // Highlight
      }
    } else {
      if (this.hoveredPlot) {
        const prevPlot = this.plotMeshes.get(this.hoveredPlot);
        if (prevPlot) prevPlot.bedMesh.material.color.set(0x3E2723);
        this.hoveredPlot = null;
        this.canvas.style.cursor = 'default';
      } else if (!this.hoveredReservoir && !this.hoveredEntity) {
        this.canvas.style.cursor = 'default';
      }
    }
  }

  handleClick() {
    // 0. Street Lamp Post Interaction (Toggle On/Off on user tap/click)
    if (this.hoveredEntity === 'lamppost' || this.hoveredLampPost) {
      const lamp = this.hoveredLampPost || this.findClickedLampPost();
      if (lamp) {
        this.toggleLampPost(lamp);
        return;
      }
    }

    const clickedLamp = this.findClickedLampPost();
    if (clickedLamp) {
      this.toggleLampPost(clickedLamp);
      return;
    }

    if (this.hoveredReservoir) {
      try {
        if (sound && typeof sound.playWaterSplash === 'function') {
          sound.playWaterSplash();
        } else {
          sound.playChime();
        }
      } catch (e) { }

      const water = simulation.getWaterLevel();
      const pct = Math.round((water.current / water.capacity) * 100);
      if (window.farmdb && window.farmdb.showToast) {
        window.farmdb.showToast(`💧 Water Reservoir Tower: ${water.current.toLocaleString()} L / ${water.capacity.toLocaleString()} L (${pct}% Full reserves)!`, 'info');
      }
      return;
    }

    if (this.hoveredEntity) {
      if (this.hoveredEntity === 'cow') {
        const activeCows = this.cowMeshes.filter(c => c.visible);
        const name = activeCows.length > 0 ? activeCows[0].userData.name : null;
        this.playAnimalReactionAnimation(name);
      } else if (this.hoveredEntity === 'barn') {
        const animals = (sqlEngine && sqlEngine.isReady) ? (sqlEngine.getTableData('animals') || []) : [];
        if (animals.length === 0) {
          try {
            if (sound && typeof sound.playCowMoo === 'function') sound.playCowMoo();
          } catch (e) {}
          if (window.farmdb && window.farmdb.showToast) {
            window.farmdb.showToast('🏡 Uncle Somu: "Hear that gentle moo? Daisy & Bella are resting inside the barn! Complete Level 1 Task 4 in SQL Studio to register them and let them out into the pasture!"', 'info');
          }
        } else {
          this.playTruckDeliveryAnimation('Farm Supplies');
        }
      } else if (this.hoveredEntity === 'truck') {
        this.playTruckDeliveryAnimation('Seed Sacks');
      } else if (this.hoveredEntity === 'tractor') {
        try {
          if (sound && typeof sound.playTractorRev === 'function') {
            sound.playTractorRev();
          } else if (sound && typeof sound.playTractorMotor === 'function') {
            sound.playTractorMotor(2.0);
          }
        } catch (e) { }
        if (window.farmdb && window.farmdb.showToast) {
          window.farmdb.showToast("🚜 Old Red: Engine purrs with classic diesel power! Ready for field work.", 'info');
        }
      } else if (this.hoveredEntity === 'windmill') {
        try {
          if (sound && typeof sound.playWaterSplash === 'function') {
            sound.playWaterSplash();
          } else if (sound && typeof sound.playChime === 'function') {
            sound.playChime();
          }
        } catch (e) { }
        this.windmillSpinBoost = 3.5; // Accelerate blade spin on click!
        if (window.farmdb && window.farmdb.showToast) {
          window.farmdb.showToast('💨 Prairie Windpump: Spinning steadily, drawing crisp aquifer water for the fields!', 'info');
        }
      } else if (this.hoveredEntity === 'wind_turbine') {
        try {
          if (sound && typeof sound.playSuccess === 'function') sound.playSuccess();
          else if (sound && typeof sound.playChime === 'function') sound.playChime();
        } catch (e) { }
        if (window.farmdb && window.farmdb.showToast) {
          window.farmdb.showToast('⚡ Horizon Wind Turbine: Generating 2.4 MW clean renewable power for the regional agribusiness grid!', 'success');
        }
      } else if (this.hoveredEntity === 'farmer') {
        try {
          if (sound && typeof sound.playBirdChirp === 'function') sound.playBirdChirp();
        } catch (e) { }
        if (window.farmdb && window.farmdb.showToast) {
          window.farmdb.showToast("👨‍🌾 Uncle Somu: 'The soil is rich and ready for your SQL queries!'", 'info');
        }
        if (!this.isFarmerAnimating && this.farmerGroup && this.farmerGroup.userData.armR) {
          const armR = this.farmerGroup.userData.armR;
          armR.rotation.z = -2.2;
          setTimeout(() => { armR.rotation.z = 0; }, 1200);
        }
      }
      return;
    }

    if (!this.hoveredPlot) return;
    const plotId = this.hoveredPlot;
    const plot = this.plotMeshes.get(plotId);
    if (!plot) return;

    if (plot.status === 'locked') {
      sound.playBirdChirp();
      if (window.farmdb && window.farmdb.showToast) {
        window.farmdb.showToast(`🔒 Plot ${plotId} is locked! Reach Level ${plot.unlockLevel} to unlock this land.`, 'warning');
      }
      return;
    }

    sound.playChime();

    // Inspect plot via standard inspector modal
    const plots = sqlEngine.getTableData('plots') || [];
    const farming = sqlEngine.getTableData('farming') || [];
    const plotRecord = plots.find(p => p.plot_id === plotId) || { plot_id: plotId, status: 'available' };
    const activeCrop = farming.find(f => f.plot_id === plotId && f.status === 'growing');

    if (window.farmdb && window.farmdb.farmRenderer) {
      window.farmdb.farmRenderer.openPlotInspector(plotRecord, activeCrop);
    }
  }

  // ==========================================================
  // DATABASE SYNCHRONIZATION
  // ==========================================================
  syncFromDatabase() {
    if (!sqlEngine.isReady) return;

    try {
      const plotsData = sqlEngine.getTableData('plots') || [];
      const farmingData = sqlEngine.getTableData('farming') || [];
      const waterData = sqlEngine.getTableData('water_reservoir') || [];

      // 1. Sync Plots & Crops
      this.plotMeshes.forEach((plot, plotId) => {
        const isUnlocked = plot.unlockLevel <= gameState.currentLevel;
        plot.status = isUnlocked ? 'available' : 'locked';

        plot.lockGroup.visible = !isUnlocked;
        plot.bedMesh.material.opacity = isUnlocked ? 1.0 : 0.6;

        const cropRecord = farmingData.find(f => (f.plot_id === plotId || f.plot_id === plotId.split('.')[0]) && f.status === 'growing');
        this.updatePlotCropVisual(plotId, cropRecord);
      });

      // 2. Sync Water Reservoir Volume
      if (waterData.length > 0 && this.waterMesh) {
        const current = waterData[0].current_liters;
        const cap = waterData[0].capacity_liters || 100000;
        const pct = Math.max(0.05, Math.min(1.0, current / cap));

        // Scale main water cylinder height from bottom pivot
        this.waterMesh.scale.set(1, pct, 1);

        // Position top water surface disk right on top of the water cylinder
        const surfaceY = this.waterBaseY + this.waterMaxHeight * pct;
        if (this.waterSurfaceMesh) {
          this.waterSurfaceMesh.position.y = surfaceY;
        }

        // Position float buoy on top of the surface
        if (this.waterBuoy) {
          this.waterBuoy.position.y = surfaceY + 0.2;
        }

        // Scale external vertical gauge tube
        if (this.waterGaugeMesh) {
          this.waterGaugeMesh.scale.set(1, pct, 1);
        }
      }

      // 3. Sync Livestock & Animals with Database
      this.syncAnimalsFromDatabase();
    } catch (e) {
      console.error('Error syncing 3D farm with database:', e);
    }
  }

  /**
   * Synchronize 3D pasture cows with SQLite 'animals' table
   * When table has 0 rows (Level 1 start), cows rest inside the barn and are not roaming outside.
   * When table has rows (after Level 1 Task 4), cows graze happily in the pasture pen.
   */
  syncAnimalsFromDatabase() {
    if (!sqlEngine || !sqlEngine.isReady) return;

    try {
      const animals = sqlEngine.getTableData('animals') || [];
      const cowRecords = animals.filter(a => (a.animal_type || 'cow').toLowerCase() === 'cow' || !a.animal_type);

      // If no cattle registered in database, hide cows from the pasture (they are inside the barn)
      if (cowRecords.length === 0) {
        this.cowMeshes.forEach(cow => {
          cow.visible = false;
        });
        return;
      }

      // Ensure we have enough 3D cow meshes to represent the registered animals
      while (this.cowMeshes.length < cowRecords.length) {
        const idx = this.cowMeshes.length;
        const name = cowRecords[idx]?.name || `Cow ${idx + 1}`;
        const newCow = this.createCowModel(name);
        const posX = -30 - (idx % 3) * 3;
        const posZ = 5 + Math.floor(idx / 3) * 5 + (idx % 2) * 2;
        newCow.position.set(posX, 0, posZ);
        newCow.rotation.y = (idx % 2 === 0 ? 0.3 : 1.2);
        this.scene.add(newCow);
        this.cowMeshes.push(newCow);
        this.clickableEntities.push(newCow);
      }

      // Update visibility and metadata for each cow
      this.cowMeshes.forEach((cow, i) => {
        if (i < cowRecords.length) {
          cow.visible = true;
          const data = cowRecords[i];
          cow.userData.name = data.name || (i === 0 ? 'Daisy' : 'Bella');
          cow.userData.health = data.health || 'Healthy';
          cow.userData.age = data.age || 3;
        } else {
          cow.visible = false;
        }
      });
    } catch (e) {
      console.warn('Error syncing 3D animals with database:', e);
    }
  }

  // ==========================================================
  // HARVEST SCRIPTED TRACTOR ANIMATION
  // ==========================================================
  playHarvestAnimation() {
    if (!this.tractorGroup || this.isHarvestingAnim) return;
    this.isHarvestingAnim = true;

    try {
      if (sound && typeof sound.playTractorRev === 'function') {
        sound.playTractorRev();
      }
    } catch (e) { }
    const originalPos = this.tractorGroup.position.clone();
    let driveProgress = 0;

    const driveLoop = () => {
      driveProgress += 0.02;
      this.tractorGroup.position.z -= 0.6;
      this.tractorGroup.position.y = Math.sin(driveProgress * 15) * 0.08;

      if (driveProgress < 1.4) {
        requestAnimationFrame(driveLoop);
      } else {
        setTimeout(() => {
          this.tractorGroup.position.copy(originalPos);
          this.isHarvestingAnim = false;
        }, 500);
      }
    };
    driveLoop();
  }

  // ==========================================================
  // MAIN ANIMATION RENDER LOOP
  // ==========================================================
  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = (performance.now() - this.startTime) * 0.001;

    // 1. Controls update
    if (this.controls) this.controls.update();

    // 2. Animate Cows (head bob & tail swish when idle)
    if (!this.isAnimalAnimating) {
      this.cowMeshes.forEach((cow, i) => {
        if (!cow.visible) return;
        if (cow.userData.head) {
          cow.userData.head.rotation.x = Math.sin(elapsed * 1.5 + i) * 0.08;
        }
        if (cow.userData.tail) {
          cow.userData.tail.rotation.z = Math.sin(elapsed * 2.2 + i * 1.5) * 0.18;
        }
      });
    }

    // 3. Animate 3D Grass Tufts & Wildflowers Swaying in Country Wind
    if (this.grassMeshes && this.grassMeshes.length > 0) {
      const windTime = elapsed * 2.2;
      for (let i = 0; i < this.grassMeshes.length; i++) {
        const g = this.grassMeshes[i];
        g.rotation.z = Math.sin(windTime + g.userData.phaseX) * 0.12;
        g.rotation.x = Math.cos(windTime * 0.8 + g.userData.phaseZ) * 0.08;
      }
    }

    // 4. Animate Farmer Idle Breathing & Porch Resting
    if (this.farmerGroup && !this.isFarmerAnimating) {
      this.farmerGroup.position.y = Math.sin(elapsed * 1.8) * 0.03;
      if (this.farmerGroup.userData.armR) {
        this.farmerGroup.userData.armR.rotation.z = Math.sin(elapsed * 1.2) * 0.04;
      }
    }

    // 5. Animate 3D Water Surface Shimmer & Buoy Bobbing
    if (this.waterSurfaceMesh && this.waterMesh) {
      const bob = Math.sin(elapsed * 2.5) * 0.04;
      this.waterSurfaceMesh.position.y += bob * 0.08;
      if (this.waterBuoy) {
        this.waterBuoy.position.y += bob * 0.12;
        this.waterBuoy.rotation.y = elapsed * 0.4;
      }
    }
    if (this.troughWater) {
      this.troughWater.position.y = 0.65 + Math.sin(elapsed * 2.0) * 0.015;
    }

    // 6. Animate Dynamic Clouds Drifting Across the High Sky
    if (this.dynamicClouds && this.dynamicClouds.length > 0) {
      for (let i = 0; i < this.dynamicClouds.length; i++) {
        const cloud = this.dynamicClouds[i];
        cloud.position.x += cloud.userData.speed;
        cloud.position.y = cloud.userData.baseY + Math.sin(elapsed * 0.5 + cloud.userData.bobPhase) * 0.55;
        if (cloud.position.x > 260) {
          cloud.position.x = -260;
          cloud.position.z = ((Math.sin(elapsed + i) * 0.5 + 0.5) * 320) - 160;
        }
      }
    }

    // 7. Animate V-Formation Bird Flock Flying Overhead
    if (this.flockActive && this.flockGroup) {
      this.flockProgress += 0.0016; // Smooth graceful flight across the entire sky (~12 seconds)
      this.flockGroup.position.lerpVectors(this.flockStart, this.flockEnd, this.flockProgress);
      // Gentle atmospheric glide wave
      this.flockGroup.position.y += Math.sin(this.flockProgress * Math.PI * 4) * 0.08;

      this.flockBirds.forEach(bird => {
        const flap = Math.sin(elapsed * 9.5 + bird.userData.wingPhase) * 0.65;
        bird.userData.wingL.rotation.z = flap;
        bird.userData.wingR.rotation.z = -flap;
      });

      if (this.flockProgress >= 1.0) {
        this.flockActive = false;
        this.flockGroup.visible = false;
      }
    }

    // 8. Animate Lone Exploring & Perching Bird
    if (this.perchingBirdGroup) {
      if (this.perchState === 'IDLE_WAIT') {
        this.perchTimer -= 0.016;
        if (this.perchTimer <= 0) {
          const option = this.perchOptions[Math.floor(Math.random() * this.perchOptions.length)];
          this.currentPerchTarget = option.pos.clone();
          this.currentPerchRotY = option.rotY;

          const spawnAng = Math.random() * Math.PI * 2;
          this.perchStartPos = new THREE.Vector3(
            this.currentPerchTarget.x + Math.cos(spawnAng) * 60,
            this.currentPerchTarget.y + 26,
            this.currentPerchTarget.z + Math.sin(spawnAng) * 60
          );

          this.perchingBirdGroup.position.copy(this.perchStartPos);
          this.perchingBirdGroup.lookAt(this.currentPerchTarget);
          this.perchingBirdGroup.visible = true;
          this.perchState = 'FLYING_IN';
          this.perchProgress = 0;
        }
      } else if (this.perchState === 'FLYING_IN') {
        this.perchProgress += 0.014;
        const p = this.perchProgress;
        this.perchingBirdGroup.position.lerpVectors(this.perchStartPos, this.currentPerchTarget, p);
        this.perchingBirdGroup.position.y += Math.sin(p * Math.PI) * 4.2;

        const flap = Math.sin(elapsed * 13.0) * 0.8;
        this.perchingBirdGroup.userData.wingL.rotation.z = flap;
        this.perchingBirdGroup.userData.wingR.rotation.z = -flap;

        if (this.perchProgress >= 1.0) {
          this.perchingBirdGroup.position.copy(this.currentPerchTarget);
          this.perchingBirdGroup.rotation.set(0, this.currentPerchRotY, 0);
          this.perchingBirdGroup.userData.wingL.rotation.set(0.2, 0.2, 0.08);
          this.perchingBirdGroup.userData.wingR.rotation.set(0.2, -0.2, -0.08);
          this.perchState = 'PERCHED';
          this.perchedElapsed = 0;
        }
      } else if (this.perchState === 'PERCHED') {
        this.perchedElapsed += 0.016;
        const t = this.perchedElapsed;
        const head = this.perchingBirdGroup.userData.head;

        // Stage 1: Sits and looks forward (0 to 1.8s)
        if (t < 1.8) {
          head.rotation.set(0, 0, 0);
        }
        // Stage 2: Turn head left and inspect surroundings (1.8 to 3.6s)
        else if (t < 3.6) {
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0.85, 0.08);
        }
        // Stage 3: Bob head & peck surface, happy chirp! (3.6 to 5.0s)
        else if (t < 5.0) {
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.1);
          head.rotation.x = Math.sin(t * 12.0) * 0.35;
          if (t > 4.2 && !this.birdChirpedThisPerch) {
            this.birdChirpedThisPerch = true;
            try {
              if (sound && typeof sound.playBirdChirp === 'function') sound.playBirdChirp();
            } catch (e) {}
          }
        }
        // Stage 4: Turn head right and look around (5.0 to 7.0s)
        else if (t < 7.0) {
          head.rotation.x = 0;
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, -0.85, 0.08);
        }
        // Stage 5: Return to center and prepare for takeoff (7.0 to 8.2s)
        else if (t < 8.2) {
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.1);
        }
        // Takeoff into random direction!
        else {
          this.birdChirpedThisPerch = false;
          const departAngle = Math.random() * Math.PI * 2;
          this.perchDepartStart = this.currentPerchTarget.clone();
          this.perchDepartTarget = new THREE.Vector3(
            this.currentPerchTarget.x + Math.cos(departAngle) * 180,
            this.currentPerchTarget.y + 45,
            this.currentPerchTarget.z + Math.sin(departAngle) * 180
          );
          this.perchingBirdGroup.lookAt(this.perchDepartTarget);
          this.perchState = 'FLYING_OUT';
          this.perchProgress = 0;
        }
      } else if (this.perchState === 'FLYING_OUT') {
        this.perchProgress += 0.012;
        const p = this.perchProgress;
        this.perchingBirdGroup.position.lerpVectors(this.perchDepartStart, this.perchDepartTarget, p);

        const flap = Math.sin(elapsed * 14.0) * 0.85;
        this.perchingBirdGroup.userData.wingL.rotation.z = flap;
        this.perchingBirdGroup.userData.wingR.rotation.z = -flap;

        if (this.perchProgress >= 1.0) {
          this.perchingBirdGroup.visible = false;
          this.perchState = 'IDLE_WAIT';
          this.perchTimer = 50.0 + Math.random() * 25.0; // Next visit in ~50-75s
        }
      }
    }

    // 9. Animate River Water Surface Shimmer
    if (this.riverMat) {
      this.riverMat.roughness = 0.12 + Math.sin(elapsed * 1.5) * 0.03;
    }

    // 10. Animate Windpump Blades Spinning in the Breeze
    if (this.windmillRotor) {
      const boost = this.windmillSpinBoost || 1.0;
      this.windmillRotor.rotation.z -= 0.022 * boost;
      if (this.windmillSpinBoost && this.windmillSpinBoost > 1.0) {
        this.windmillSpinBoost = Math.max(1.0, this.windmillSpinBoost - 0.012);
      }
    }

    // 11. Animate Horizon Wind Turbine Blades Spinning in Country Breeze
    if (this.turbineRotor && this.turbineGroup && this.turbineGroup.visible) {
      this.turbineRotor.rotation.z -= 0.012;
    }

    // 12. Animate Nocturnal Fireflies Drifting Over Meadows
    if (this.fireflies && this.fireflies.length > 0 && gameState.timeOfDay === 'night') {
      for (let i = 0; i < this.fireflies.length; i++) {
        const f = this.fireflies[i];
        f.position.y = f.userData.baseY + Math.sin(elapsed * f.userData.speed + f.userData.phase) * 0.35;
        f.position.x = f.userData.baseX + Math.cos(elapsed * 0.6 + f.userData.phase) * 0.45;
        f.position.z = f.userData.baseZ + Math.sin(elapsed * 0.5 + f.userData.phase) * 0.45;
      }
    }

    // 13. Subtle breathing shimmer for lit street lamp lanterns
    if (this.lampPosts && this.lampPosts.length > 0) {
      this.lampPosts.forEach((lamp, idx) => {
        if (lamp.userData && lamp.userData.isOn && lamp.userData.pointLight) {
          const shimmer = 1.0 + Math.sin(elapsed * 3.6 + idx * 1.4) * 0.035;
          lamp.userData.pointLight.intensity = 2.6 * shimmer;
        }
      });
    }

    // 11. Render
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

export const farm3D = new Farm3DWorld();
if (typeof window !== 'undefined') {
  window.farm3D = farm3D;
}
