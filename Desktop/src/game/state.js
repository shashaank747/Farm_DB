import { sound } from '../visuals/audio.js';

class GameState {
  constructor() {
    this.currentLevel = 1;
    this.currentMissionIndex = 0;
    this.season = 1;
    this.day = 1;
    this.hour = 7;
    this.minute = 0;
    this.timeOfDay = 'morning'; // 'morning' | 'day' | 'sunset' | 'night'
    this.isTimePaused = false;
    this.learningPath = 'analytics'; // 'analytics' (Normal/DA) | 'fullstack' (Full Stack)
    this.money = 500;
    this.xp = 0;
    this.badges = [];
    this.completedMissions = [];
    this.droughtInitialized = false;
    this.weather = { type: 'Sunny', temp: '24°C', icon: '☀️' };
    this.listeners = [];
  }

  init() {
    this.loadFromStorage();
  }

  addListener(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this);
      } catch (e) {
        console.error('State listener error:', e);
      }
    });
    this.saveToStorage();
  }

  updateTimeOfDay() {
    const old = this.timeOfDay;
    if (this.hour >= 5 && this.hour < 11) {
      this.timeOfDay = 'morning';
    } else if (this.hour >= 11 && this.hour < 18) {
      this.timeOfDay = 'day';
    } else if (this.hour >= 18 && this.hour < 21) {
      this.timeOfDay = 'sunset';
    } else {
      this.timeOfDay = 'night';
    }
    if (old !== this.timeOfDay) {
      this.prevTimeOfDay = old;
    }
  }

  advanceTime(minutes = 60) {
    this.minute += minutes;
    while (this.minute >= 60) {
      this.minute -= 60;
      this.hour += 1;
    }
    if (this.hour >= 24) {
      this.hour = this.hour % 24;
      this.day += 1;
    }
    this.updateTimeOfDay();
    this.notify();
  }

  cycleTimeOfDay() {
    // Jump directly between the 4 iconic atmospheric phases
    if (this.timeOfDay === 'morning') {
      this.hour = 12;
      this.minute = 0;
    } else if (this.timeOfDay === 'day') {
      this.hour = 18;
      this.minute = 30;
    } else if (this.timeOfDay === 'sunset') {
      this.hour = 21;
      this.minute = 30;
    } else {
      // Night -> Morning of next day!
      this.day += 1;
      this.hour = 7;
      this.minute = 0;
    }
    this.updateTimeOfDay();
    this.notify();
    return this.timeOfDay;
  }

  getTimeString() {
    const h = this.hour % 12 === 0 ? 12 : this.hour % 12;
    const m = this.minute < 10 ? `0${this.minute}` : this.minute;
    const ampm = this.hour >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${ampm}`;
  }

  getTimePhaseInfo() {
    switch (this.timeOfDay) {
      case 'morning':
        return { phase: 'morning', label: 'Morning', icon: '🌅' };
      case 'day':
        return { phase: 'day', label: 'Day', icon: '☀️' };
      case 'sunset':
        return { phase: 'sunset', label: 'Sunset', icon: '🌇' };
      case 'night':
      default:
        return { phase: 'night', label: 'Night', icon: '🌙' };
    }
  }

  advanceDay() {
    this.day += 1;
    this.hour = 7;
    this.minute = 0;
    this.timeOfDay = 'morning';
    // Slight weather fluctuation
    const weathers = [
      { type: 'Sunny', temp: '25°C', icon: '☀️' },
      { type: 'Mild', temp: '23°C', icon: '🌤️' },
      { type: 'Overcast', temp: '21°C', icon: '⛅' },
      { type: 'Breezy', temp: '22°C', icon: '🍃' }
    ];
    this.weather = weathers[Math.floor(Math.random() * weathers.length)];
    this.notify();
    return this.day;
  }

  addMoney(amount) {
    if (amount > 0) {
      this.money += amount;
      try {
        if (sound && typeof sound.playMoneyReceived === 'function') {
          sound.playMoneyReceived();
        }
      } catch (e) { }
      this.notify();
    }
  }

  spendMoney(amount) {
    this.money = Math.max(0, this.money - amount);
    this.notify();
  }

  addXP(amount) {
    this.xp += amount;
    this.notify();
  }

  awardBadge(badge) {
    if (!this.badges.includes(badge)) {
      this.badges.push(badge);
      this.notify();
    }
  }

  completeCurrentMission(rewardMoney = 0, rewardXp = 0) {
    const missionKey = `L${this.currentLevel}_M${this.currentMissionIndex}`;
    const isNew = !this.completedMissions.includes(missionKey);
    if (isNew) {
      this.completedMissions.push(missionKey);
      if (rewardMoney > 0) this.addMoney(rewardMoney);
      if (rewardXp > 0) this.xp += rewardXp;
    }
    this.currentMissionIndex += 1;
    this.notify();
    return isNew;
  }

  setLevel(levelNum) {
    this.currentLevel = levelNum;
    this.currentMissionIndex = 0;
    this.notify();
  }

  setLearningPath(path) {
    this.learningPath = path === 'fullstack' ? 'fullstack' : 'analytics';
    this.notify();
  }

  saveToStorage() {
    try {
      const data = {
        currentLevel: this.currentLevel,
        currentMissionIndex: this.currentMissionIndex,
        learningPath: this.learningPath,
        season: this.season,
        day: this.day,
        hour: this.hour,
        minute: this.minute,
        timeOfDay: this.timeOfDay,
        isTimePaused: this.isTimePaused,
        money: this.money,
        xp: this.xp,
        badges: this.badges,
        completedMissions: this.completedMissions,
        droughtInitialized: this.droughtInitialized
      };
      localStorage.setItem('farmdb_gamestate', JSON.stringify(data));
    } catch (e) {}
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('farmdb_gamestate');
      if (saved) {
        const data = JSON.parse(saved);
        this.currentLevel = data.currentLevel || 1;
        this.currentMissionIndex = data.currentMissionIndex || 0;
        this.learningPath = data.learningPath || 'analytics';
        this.season = data.season || 1;
        this.day = data.day || 1;
        this.hour = data.hour !== undefined ? data.hour : 7;
        this.minute = data.minute !== undefined ? data.minute : 0;
        this.timeOfDay = data.timeOfDay || 'morning';
        this.isTimePaused = !!data.isTimePaused;
        this.money = data.money !== undefined ? data.money : 500;
        this.xp = data.xp || 0;
        this.badges = data.badges || [];
        this.completedMissions = data.completedMissions || [];
        this.droughtInitialized = !!data.droughtInitialized;
      }
    } catch (e) {}
  }

  resetAll() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('farmdb_gamestate');
        localStorage.removeItem('farmdb_terminal_pos');
      }
    } catch (e) {}
    this.currentLevel = 1;
    this.currentMissionIndex = 0;
    this.learningPath = 'analytics';
    this.season = 1;
    this.day = 1;
    this.hour = 7;
    this.minute = 0;
    this.timeOfDay = 'morning';
    this.isTimePaused = false;
    this.money = 500;
    this.xp = 0;
    this.badges = [];
    this.completedMissions = [];
    this.droughtInitialized = false;
    this.notify();
  }
}

export const gameState = new GameState();
gameState.init();
