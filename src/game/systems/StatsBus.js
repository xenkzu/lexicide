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
  listeners: {},

  set(key, value) {
    if (this[key] === value) return;
    this[key] = value;
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
