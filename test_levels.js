import { sqlEngine } from './Desktop/src/sql/engine.js';
import { MISSIONS_DATA } from './Desktop/src/game/missions.js';

async function testLevels() {
  console.log('🌾 Initializing SQL Engine...\n');
  await sqlEngine.init();

  // Test Level 1
  console.log('=== TESTING LEVEL 1: THE FARM WITHOUT A MEMORY ===');
  const level1 = MISSIONS_DATA[1];
  console.log(`Title: ${level1.title} | Role: ${level1.role}`);
  for (let i = 0; i < level1.missions.length; i++) {
    const mission = level1.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 1 100% PASSED!\n');

  // Test Level 2
  console.log('=== TESTING LEVEL 2: THE WAREHOUSE HAS A PROBLEM ===');
  const level2 = MISSIONS_DATA[2];
  console.log(`Title: ${level2.title} | Role: ${level2.role}`);
  for (let i = 0; i < level2.missions.length; i++) {
    const mission = level2.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 2 100% PASSED!\n');

  // Test Level 3
  console.log('=== TESTING LEVEL 3: FIND WHAT YOU NEED ===');
  const level3 = MISSIONS_DATA[3];
  console.log(`Title: ${level3.title} | Role: ${level3.role}`);
  for (let i = 0; i < level3.missions.length; i++) {
    const mission = level3.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 3 100% PASSED!\n');

  // Test Level 4
  console.log('=== TESTING LEVEL 4: FIRST PLANTING ===');
  const level4 = MISSIONS_DATA[4];
  console.log(`Title: ${level4.title} | Role: ${level4.role}`);
  for (let i = 0; i < level4.missions.length; i++) {
    const mission = level4.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 4 100% PASSED!\n');

  // Test Level 5
  console.log('=== TESTING LEVEL 5: THE HARVEST & MARKET ===');
  const level5 = MISSIONS_DATA[5];
  console.log(`Title: ${level5.title} | Role: ${level5.role}`);
  for (let i = 0; i < level5.missions.length; i++) {
    const mission = level5.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 5 100% PASSED!\n');

  // Test Level 6
  console.log('=== TESTING LEVEL 6: FARM ANALYTICS & AGGREGATIONS ===');
  const level6 = MISSIONS_DATA[6];
  console.log(`Title: ${level6.title} | Role: ${level6.role}`);
  for (let i = 0; i < level6.missions.length; i++) {
    const mission = level6.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 6 100% PASSED!\n');

  // Test Level 7
  console.log('=== TESTING LEVEL 7: IMPORTANT CROPS ===');
  const level7 = MISSIONS_DATA[7];
  console.log(`Title: ${level7.title} | Role: ${level7.role}`);
  for (let i = 0; i < level7.missions.length; i++) {
    const mission = level7.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 7 100% PASSED!\n');

  // Test Level 8
  console.log('=== TESTING LEVEL 8: SMART FILTERING ===');
  const level8 = MISSIONS_DATA[8];
  console.log(`Title: ${level8.title} | Role: ${level8.role}`);
  for (let i = 0; i < level8.missions.length; i++) {
    const mission = level8.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 8 100% PASSED!\n');

  // Test Level 9
  console.log('=== TESTING LEVEL 9: THE SUPPLY PROBLEM ===');
  const level9 = MISSIONS_DATA[9];
  console.log(`Title: ${level9.title} | Role: ${level9.role}`);
  for (let i = 0; i < level9.missions.length; i++) {
    const mission = level9.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 9 100% PASSED!\n');

  // Test Level 10
  console.log('=== TESTING LEVEL 10: MARKET & REVENUE ===');
  const level10 = MISSIONS_DATA[10];
  console.log(`Title: ${level10.title} | Role: ${level10.role}`);
  for (let i = 0; i < level10.missions.length; i++) {
    const mission = level10.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 10 100% PASSED!\n');

  // Test Level 11
  console.log('=== TESTING LEVEL 11: THE FARM MANAGER ===');
  const level11 = MISSIONS_DATA[11];
  console.log(`Title: ${level11.title} | Role: ${level11.role}`);
  for (let i = 0; i < level11.missions.length; i++) {
    const mission = level11.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 11 100% PASSED!\n');

  // Test Level 12
  console.log('=== TESTING LEVEL 12: THE MISSING RECORDS ===');
  const level12 = MISSIONS_DATA[12];
  console.log(`Title: ${level12.title} | Role: ${level12.role}`);
  for (let i = 0; i < level12.missions.length; i++) {
    const mission = level12.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 12 100% PASSED!\n');

  // Test Level 13
  console.log('=== TESTING LEVEL 13: ABOVE AVERAGE ===');
  const level13 = MISSIONS_DATA[13];
  console.log(`Title: ${level13.title} | Role: ${level13.role}`);
  for (let i = 0; i < level13.missions.length; i++) {
    const mission = level13.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 13 100% PASSED!\n');

  // Test Level 14
  console.log('=== TESTING LEVEL 14: FARM INTELLIGENCE ===');
  const level14 = MISSIONS_DATA[14];
  console.log(`Title: ${level14.title} | Role: ${level14.role}`);
  for (let i = 0; i < level14.missions.length; i++) {
    const mission = level14.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 14 100% PASSED!\n');

  // Test Level 15
  console.log('=== TESTING LEVEL 15: THE FARM DATABASE REBUILD ===');
  const level15 = MISSIONS_DATA[15];
  console.log(`Title: ${level15.title} | Role: ${level15.role}`);
  for (let i = 0; i < level15.missions.length; i++) {
    const mission = level15.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 15 100% PASSED!\n');

  // Test Level 16
  console.log('=== TESTING LEVEL 16: THE BLUEPRINT OF THE FARM ===');
  const level16 = MISSIONS_DATA[16];
  console.log(`Title: ${level16.title} | Role: ${level16.role}`);
  for (let i = 0; i < level16.missions.length; i++) {
    const mission = level16.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 16 100% PASSED!\n');

  // Test Level 17
  console.log('=== TESTING LEVEL 17: DA FINAL — CAN YOU SAVE THE FARM? ===');
  const level17 = MISSIONS_DATA[17];
  console.log(`Title: ${level17.title} | Role: ${level17.role}`);
  for (let i = 0; i < level17.missions.length; i++) {
    const mission = level17.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 17 100% PASSED!\n');

  // Test Level 18
  console.log('=== TESTING LEVEL 18: THE FARM\'S NEW VIEW ===');
  const level18 = MISSIONS_DATA[18];
  console.log(`Title: ${level18.title} | Role: ${level18.role}`);
  for (let i = 0; i < level18.missions.length; i++) {
    const mission = level18.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 18 100% PASSED!\n');

  // Test Level 19
  console.log('=== TESTING LEVEL 19: THE SAFE TRANSACTION ===');
  const level19 = MISSIONS_DATA[19];
  console.log(`Title: ${level19.title} | Role: ${level19.role}`);
  for (let i = 0; i < level19.missions.length; i++) {
    const mission = level19.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 19 100% PASSED!\n');

  // Test Level 20
  console.log('=== TESTING LEVEL 20: THE FARM\'S AUTOMATIC DEFENSE ===');
  const level20 = MISSIONS_DATA[20];
  console.log(`Title: ${level20.title} | Role: ${level20.role}`);
  for (let i = 0; i < level20.missions.length; i++) {
    const mission = level20.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 20 100% PASSED!\n');

  // Test Level 21
  console.log('=== TESTING LEVEL 21: THE FARM\'S AUTOMATION OFFICE ===');
  const level21 = MISSIONS_DATA[21];
  console.log(`Title: ${level21.title} | Role: ${level21.role}`);
  for (let i = 0; i < level21.missions.length; i++) {
    const mission = level21.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 21 100% PASSED!\n');

  // Test Level 22
  console.log('=== TESTING LEVEL 22: THE FARM\'S SECURITY GATE ===');
  const level22 = MISSIONS_DATA[22];
  console.log(`Title: ${level22.title} | Role: ${level22.role}`);
  for (let i = 0; i < level22.missions.length; i++) {
    const mission = level22.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 22 100% PASSED!\n');

  // Test Level 23
  console.log('=== TESTING LEVEL 23: FARM INTELLIGENCE & CRISIS AUTOMATION ===');
  const level23 = MISSIONS_DATA[23];
  console.log(`Title: ${level23.title} | Role: ${level23.role}`);
  for (let i = 0; i < level23.missions.length; i++) {
    const mission = level23.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 23 100% PASSED!\n');

  // Test Level 24
  console.log('=== TESTING LEVEL 24: THE FINAL HARVEST ===');
  const level24 = MISSIONS_DATA[24];
  console.log(`Title: ${level24.title} | Role: ${level24.role}`);
  for (let i = 0; i < level24.missions.length; i++) {
    const mission = level24.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    const result = sqlEngine.execute(mission.solution);
    if (!result.success) {
      console.error(`❌ Execution failed for ${mission.id}:`, result.error);
      process.exit(1);
    }
    const isValid = mission.validate(sqlEngine, result);
    if (!isValid) {
      console.error(`❌ Validation failed for ${mission.id}!`);
      process.exit(1);
    }
    console.log(`✅ ${mission.id} Passed!`);
  }
  console.log('🎉 LEVEL 24 100% PASSED!\n');

  let totalMissions = 0;
  for (let l = 1; l <= 24; l++) {
    totalMissions += MISSIONS_DATA[l].missions.length;
  }
  console.log(`🏆 ALL 24 LEVELS (${totalMissions}/${totalMissions} MISSIONS) TESTED AND PASSED WITH ZERO ERRORS!`);
}

testLevels().catch(err => {
  console.error(err);
  process.exit(1);
});



