import puppeteer from 'puppeteer-core';
import fs from 'fs';

const POSSIBLE_CHROME_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

function findBrowserPath() {
  for (const p of POSSIBLE_CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

async function runAudioTests() {
  console.log('🎵 =========================================================================');
  console.log('🎵 STARTING FARMDB FINAL AUDIO INTEGRATION BROWSER E2E TESTS');
  console.log('🎵 =========================================================================\n');

  const executablePath = findBrowserPath();
  if (!executablePath) {
    console.error('❌ Browser executable not found on system.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  const testResults = [];
  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name} ${details}`);
      testResults.push({ name, status: 'PASS', details });
    } else {
      console.error(`  ❌ FAIL: ${name} ${details}`);
      testResults.push({ name, status: 'FAIL', details });
    }
  }

  try {
    // 1. Navigate to Application
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 2500));
    assert('Page Load', true, 'Application loaded successfully at http://localhost:5173/');

    // 2. Test Audio Files Exist and can be loaded
    const audioFiles = [
      'cow moo 1.mp3',
      'cow moo 2.mp3',
      'Dog barking.mp3',
      'Dog Whining.mp3',
      'farm hen.mp3',
      'harsh wind.mp3',
      'level up.mp3',
      'money received.mp3',
      'moving water.mp3',
      'rooster.mp3',
      'tractor.mp3',
      'tree wind.mp3',
      'wind.mp3'
    ];

    const audioLoadResults = await page.evaluate(async (files) => {
      const results = {};
      for (const file of files) {
        try {
          const res = await fetch(`/audio/${encodeURIComponent(file)}`);
          results[file] = res.ok && res.status === 200;
        } catch (e) {
          results[file] = false;
        }
      }
      return results;
    }, audioFiles);

    for (const [file, ok] of Object.entries(audioLoadResults)) {
      assert(`Audio Asset Status [${file}]`, ok, ok ? '200 OK' : 'Failed to fetch');
    }

    // 3. Test SoundController Object & Methods
    const controllerTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      return {
        hasSound: !!sound,
        methods: [
          typeof sound.playCowMoo === 'function',
          typeof sound.playDogSound === 'function',
          typeof sound.playDogBark === 'function',
          typeof sound.playDogWhine === 'function',
          typeof sound.playHenSound === 'function',
          typeof sound.startNormalWind === 'function',
          typeof sound.stopNormalWind === 'function',
          typeof sound.startHarshWind === 'function',
          typeof sound.stopHarshWind === 'function',
          typeof sound.playRooster === 'function',
          typeof sound.playLevelUp === 'function',
          typeof sound.playMoneyReceived === 'function',
          typeof sound.startMovingWater === 'function',
          typeof sound.stopMovingWater === 'function',
          typeof sound.startTractor === 'function',
          typeof sound.stopTractor === 'function',
          typeof sound.mute === 'function',
          typeof sound.unmute === 'function',
          typeof sound.toggleMute === 'function'
        ].every(Boolean)
      };
    });

    assert('SoundController API Completeness', controllerTest.hasSound && controllerTest.methods, 'All audio methods present');

    // 4. Test Cow Sound Alternation & Cooldown
    const cowTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.unmute();
      const firstIdx = sound.cowIndex;
      sound.playCowMoo();
      const secondIdx = sound.cowIndex;
      // Immediate next play should be blocked by cooldown
      sound.playCowMoo();
      const thirdIdx = sound.cowIndex;
      return { firstIdx, secondIdx, thirdIdx };
    });

    assert('Cow Sound Alternation & Cooldown', cowTest.secondIdx === cowTest.firstIdx + 1 && cowTest.thirdIdx === cowTest.secondIdx,
      `index progression: ${cowTest.firstIdx} -> ${cowTest.secondIdx} -> ${cowTest.thirdIdx} (cooldown blocked immediate 2nd trigger)`);

    // 5. Test Shared 5-Minute Real-Life Dog Cooldown (300,000ms)
    const dogTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.unmute();

      // Reset to expired cooldown
      sound.lastDogTime = Date.now() - 300005;
      
      // 1st play: should succeed
      const play1 = sound.playDogSound();
      const time1 = sound.lastDogTime;
      const storedTime1 = localStorage.getItem('farmdb_last_dog_time');

      // 2nd play immediately: must fail (blocked by 300,000ms cooldown)
      const play2 = sound.playDogSound();
      const playBark = sound.playDogBark();
      const playWhine = sound.playDogWhine();

      // Test simulated UI update / day advance does not reset cooldown
      window.gameState.advanceDay();
      const playAfterDayAdvance = sound.playDogSound();

      // Test expiration after 300,000ms
      sound.lastDogTime = Date.now() - 300005;
      const playAfterCooldown = sound.playDogSound();

      return {
        cooldownMs: sound.DOG_COOLDOWN_MS,
        play1,
        play2,
        playBark,
        playWhine,
        playAfterDayAdvance,
        playAfterCooldown,
        storedMatches: String(time1) === storedTime1
      };
    });

    assert('Dog 5-Minute Cooldown Config', dogTest.cooldownMs === 300000, 'DOG_COOLDOWN_MS is exactly 300,000ms (5 minutes)');
    assert('Dog Shared Cooldown Enforced', dogTest.play1 === true && dogTest.play2 === false && dogTest.playBark === false && dogTest.playWhine === false,
      'First play succeeds; subsequent bark/whine calls within 5 minutes are rejected');
    assert('Dog Cooldown Immune to Day Advance', dogTest.playAfterDayAdvance === false, 'In-game day change does not reset real-life timer');
    assert('Dog Plays After 5-Minute Expiry', dogTest.playAfterCooldown === true, 'Can play again after 300,000ms expires');
    assert('Dog Timer LocalStorage Persistence', dogTest.storedMatches, 'lastDogTime persisted to localStorage');

    // 6. Test Wind System (Normal vs Harsh + Tree Wind)
    const windTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.startNormalWind();
      const normalActive = sound.windAudio && !sound.windAudio.paused;
      
      sound.startHarshWind();
      const normalPausedAfterHarsh = sound.windAudio ? sound.windAudio.paused : true;
      const harshActive = sound.harshWindAudio && !sound.harshWindAudio.paused;
      const treeWindActive = sound.treeWindAudio && !sound.treeWindAudio.paused;

      sound.stopHarshWind();
      const harshStopped = sound.harshWindAudio ? sound.harshWindAudio.paused : true;
      const treeWindStopped = sound.treeWindAudio ? sound.treeWindAudio.paused : true;

      return {
        normalActive,
        normalPausedAfterHarsh,
        harshActive,
        treeWindActive,
        harshStopped,
        treeWindStopped
      };
    });

    assert('Normal Wind Solo Play', windTest.normalActive, 'Normal wind active without harsh/tree wind');
    assert('Harsh Wind Activates Tree Wind & Pauses Normal Wind', windTest.normalPausedAfterHarsh && windTest.harshActive && windTest.treeWindActive, 'Harsh + Tree wind paired and normal wind silenced');
    assert('Harsh Wind Stops Cleanly', windTest.harshStopped && windTest.treeWindStopped, 'Both winds stopped');

    // 7. Test Rooster Crow Idempotency per Morning
    const roosterTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.lastRoosterDay = -1;
      sound.playRooster(1);
      const day1First = sound.lastRoosterDay;
      sound.playRooster(1); // Same day, must not replay
      const day1Second = sound.lastRoosterDay;
      sound.playRooster(2); // Next morning, should play
      const day2 = sound.lastRoosterDay;
      return { day1First, day1Second, day2 };
    });

    assert('Rooster Morning Day Idempotency', roosterTest.day1First === 1 && roosterTest.day1Second === 1 && roosterTest.day2 === 2,
      'Rooster only crows once per morning cycle and does not repeat within same day');

    // 8. Test Moving Water Start & Stop
    const waterTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.startMovingWater();
      const flowing = sound.isWaterFlowing && sound.waterAudio && !sound.waterAudio.paused;
      sound.stopMovingWater();
      const stopped = !sound.isWaterFlowing && (sound.waterAudio ? sound.waterAudio.paused : true);
      return { flowing, stopped };
    });

    assert('Moving Water Flow Loop & Stop', waterTest.flowing && waterTest.stopped, 'Water audio starts when flowing and stops when complete');

    // 9. Test Tractor Start & Stop
    const tractorTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.startTractor();
      const moving = sound.isTractorMoving && sound.tractorAudio && !sound.tractorAudio.paused;
      sound.stopTractor();
      const stopped = !sound.isTractorMoving && (sound.tractorAudio ? sound.tractorAudio.paused : true);
      return { moving, stopped };
    });

    assert('Tractor Movement Sound & Termination', tractorTest.moving && tractorTest.stopped, 'Tractor audio only active when moving and terminates on stop');

    // 10. Test Level Up Sound
    const levelUpTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      let playedLevelUp = false;
      const origPlayFile = sound.playFile.bind(sound);
      sound.playFile = (filename, volume) => {
        if (filename === 'level up.mp3') playedLevelUp = true;
        return origPlayFile(filename, volume);
      };
      sound.playLevelUp();
      sound.playFile = origPlayFile;
      return { playedLevelUp };
    });

    assert('Level Up Audio Trigger', levelUpTest.playedLevelUp, 'level up.mp3 triggered on level completion');

    // 11. Test Money Received on Real AddMoney & No-op on Duplicate
    const moneySoundTest = await page.evaluate(async () => {
      const gs = window.gameState;
      const snd = window.sound;
      snd.unmute();
      
      let playCount = 0;
      const origPlayFile = snd.playFile.bind(snd);
      snd.playFile = (filename, volume) => {
        if (filename === 'money received.mp3') playCount++;
        return origPlayFile(filename, volume);
      };

      const startMoney = gs.money;
      gs.addMoney(100);
      const countAfterValidAdd = playCount;

      gs.addMoney(0); // 0 amount should not play
      const countAfterZeroAdd = playCount;

      // Duplicate mission test
      const missionKey = `L1_M0`;
      if (!gs.completedMissions.includes(missionKey)) {
        gs.completedMissions.push(missionKey);
      }
      gs.completeCurrentMission(500, 50); // Duplicate mission should not award or play
      const countAfterDuplicate = playCount;

      snd.playFile = origPlayFile; // restore
      return {
        startMoney,
        finalMoney: gs.money,
        countAfterValidAdd,
        countAfterZeroAdd,
        countAfterDuplicate
      };
    });

    assert('Money Received Audio on Valid Transaction', moneySoundTest.countAfterValidAdd === 1, 'Played 1 time for valid +₹100 revenue');
    assert('No Money Sound on 0 or Duplicate Transaction', moneySoundTest.countAfterZeroAdd === 1 && moneySoundTest.countAfterDuplicate === 1, 'No duplicate money audio triggers');

    // 12. Test Sound Toggle & Persistence across reload
    const muteTest = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.mute();
      return {
        isMuted: sound.muted,
        storageVal: localStorage.getItem('farmdb_audio_muted')
      };
    });

    assert('Sound Mute and LocalStorage Persistence', muteTest.isMuted === true && muteTest.storageVal === 'true', 'Muted in state and persisted to localStorage');

    // Reload page and check restored state
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    const restoredMute = await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      return {
        isMuted: sound.muted,
        storageVal: localStorage.getItem('farmdb_audio_muted')
      };
    });

    assert('Mute State Preserved After Reload', restoredMute.isMuted === true && restoredMute.storageVal === 'true', 'Restored seamlessly from localStorage');

    // Clean up mute for user
    await page.evaluate(async () => {
      const { sound } = await import('/src/visuals/audio.js');
      sound.unmute();
    });

    // 13. Verify Zero Browser Console Errors
    const filteredErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('WebGL'));
    assert('Browser Console Clean', filteredErrors.length === 0, `${filteredErrors.length} errors found: ${filteredErrors.join(', ')}`);

  } catch (err) {
    console.error('Test run encountered unexpected error:', err);
    assert('Test Suite Execution', false, err.message);
  } finally {
    await browser.close();
  }

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  console.log(`\n==================================================`);
  console.log(`FARMDB AUDIO INTEGRATION TEST RESULTS:`);
  console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudioTests();
