const StatsBus = {
  wpm: 0,
  accuracy: 100,
  combo: 0,
  comboMultiplier: 1.0,
  attackPower: 10,
  moveSpeed: 180,
  isComboActive: false,
  currentWord: '',
  inputText: '',
  errorFlash: false,
  isBossActive: false,
  bossHealth: 100,
  bossMaxHealth: 100,
  bossName: '',
  deathCount: parseInt(localStorage.getItem('lexicide_deaths') || '0'),
  musicVol: parseFloat(localStorage.getItem('lexicide_music_vol') || '0.7'),
  sfxVol: parseFloat(localStorage.getItem('lexicide_sfx_vol') || '0.7'),
  listeners: {},

  set(key, value) {
    if (this[key] === value) return;
    this[key] = value;
    if (key === 'deathCount') {
      localStorage.setItem('lexicide_deaths', value.toString());
    }
    if (key === 'musicVol') {
      localStorage.setItem('lexicide_music_vol', value.toString());
    }
    if (key === 'sfxVol') {
      localStorage.setItem('lexicide_sfx_vol', value.toString());
    }
    if (this.listeners[key]) {
      this.listeners[key].forEach(fn => fn(value));
    }
  },

  on(key, fn) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(fn);
  },

  off(key, fn) {
    if (!this.listeners[key]) return;
    this.listeners[key] = this.listeners[key].filter(listener => listener !== fn);
  }
};

export default StatsBus;
