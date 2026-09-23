import { sqlEngine } from './Desktop/src/sql/engine.js';
import { MISSIONS_DATA } from './Desktop/src/game/missions.js';

async function testLevel1() {
  console.log('Testing Level 1 Mission Flow...\n');
  await sqlEngine.init();

  const level1 = MISSIONS_DATA[1];
  console.log(`Level Title: ${level1.title}`);
  console.log(`Role: ${level1.role}`);
  console.log(`Concept: ${level1.concept}`);
  console.log(`Total Missions: ${level1.missions.length}\n`);

  for (let i = 0; i < level1.missions.length; i++) {
    const mission = level1.missions[i];
    console.log(`[Testing ${mission.id}] ${mission.title}`);
    console.log(`Solution query: \n${mission.solution}`);
    
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
    console.log(`✅ ${mission.id} Passed!\n`);
  }

  console.log('🎉 ALL LEVEL 1 MISSIONS PASSED SUCCESSFULLY!');
}

testLevel1().catch(err => {
  console.error(err);
  process.exit(1);
});
