import StatsBus from './StatsBus';

const WORDS = [
  'shadow', 'hollow', 'knight', 'void', 'soul', 'dark', 'crimson', 
  'specter', 'ruin', 'abyss', 'silence', 'grave', 'ember', 'fate', 'blood',
  'storm', 'wrath', 'curse', 'veil', 'ash', 'bone', 'dread', 'shroud', 
  'plague', 'thorn', 'sorrow', 'decay', 'phantom', 'crypt', 'blade',
  'ghost', 'mist', 'night', 'flame', 'iron', 'steel', 'cold', 'fear',
  'crown', 'throne', 'king', 'queen', 'path', 'gate', 'wall', 'darkness',
  'light', 'shine', 'glow', 'fire'
];

const BOSS_WORDS = [
  'exterminate', 'obliterate', 'annihilate', 'malediction', 'catastrophe',
  'devastation', 'apocalypse', 'purgatory', 'sacrifice', 'benediction',
  'ravenous', 'abyssal', 'eternity', 'vengeance', 'corruption', 'valediction'
];

class TypingEngine {
  constructor() {
    this.mode = 'normal';
    this.currentWord = '';
    this.inputText = '';
    this.wordsCompleted = 0;
    this.startTime = Date.now();
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.streak = 0;
    this.errorFlash = false;
    
    // Boss specific
    this.bossWordsRemaining = [];
    this.scene = null; // Set by GameScene
    this.lastActivityTime = 0;
  }

  handleKeyDownBound = null;

  init(scene) {
    this.scene = scene;
    this.startTime = Date.now();
    this.wordsCompleted = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.streak = 0;
    
    this.nextWord();

    // Clean up old listener if exists
    if (this.handleKeyDownBound) {
      window.removeEventListener('keydown', this.handleKeyDownBound);
    }

    this.handleKeyDownBound = (e) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.handleKeyDownBound);
  }

  destroy() {
    if (this.handleKeyDownBound) {
      window.removeEventListener('keydown', this.handleKeyDownBound);
    }
  }

  enterBossMode() {
    this.mode = 'boss';
    // Use the boss word pool
    this.bossWordsRemaining = [...BOSS_WORDS].sort(() => Math.random() - 0.5);
    this.loadNextBossPhrase();
  }

  loadNextBossPhrase() {
    if (this.bossWordsRemaining.length === 0) {
      // Refresh pool if we somehow run out
      this.bossWordsRemaining = [...BOSS_WORDS].sort(() => Math.random() - 0.5);
    }
    this.currentWord = this.bossWordsRemaining.shift();
    this.inputText = '';
    this.errorFlash = false;
    StatsBus.set('currentWord', this.currentWord);
    StatsBus.set('inputText', this.inputText);
  }

  exitBossMode() {
    this.mode = 'normal';
    this.nextWord();
  }

  nextWord() {
    if (this.mode === 'boss') return;
    this.currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    this.inputText = '';
    this.errorFlash = false;
    StatsBus.set('currentWord', this.currentWord);
    StatsBus.set('inputText', this.inputText);
  }

  handleKeyDown(e) {
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;
    if (e.key.length !== 1 && e.key !== ' ') return; // Allow space

    this.totalKeystrokes++;
    this.lastActivityTime = Date.now();
    StatsBus.set('isUserTyping', true);

    const expectedChar = this.currentWord[this.inputText.length];

    if (e.key === expectedChar) {
      this.inputText += e.key;
      this.correctKeystrokes++;
      this.streak++;
      this.errorFlash = false;
      
      StatsBus.set('inputText', this.inputText);

      if (this.inputText === this.currentWord) {
        if (this.mode === 'boss') {
          // Launch a high-damage plasma ball for every word
          this.scene.events.emit('bossWordComplete');
          this.loadNextBossPhrase();
        } else {
          this.wordsCompleted++;
          this.calculateCombo();
          this.scene.events.emit('wordComplete');
          this.nextWord();
        }
      }
    } else {
      // Mistake
      this.streak = 0;
      this.errorFlash = true;
      this.calculateCombo();
      StatsBus.set('errorFlash', true);
      
      if (this.mode === 'boss') {
        this.scene.cameras.main.shake(300, 0.015);
        this.scene.events.emit('bossTypingError');
      }
    }

    this.calculateStats();
  }

  calculateCombo() {
    const combo = Math.floor(this.streak / 5);
    const multiplier = Math.min(1.0 + (combo * 0.2), 3.0);
    StatsBus.set('combo', combo);
    StatsBus.set('comboMultiplier', multiplier);
    StatsBus.set('isComboActive', combo > 0);
  }

  calculateStats() {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const wpm = elapsedMinutes > 0 ? this.wordsCompleted / elapsedMinutes : 0;
    const accuracy = this.totalKeystrokes > 0 ? (this.correctKeystrokes / this.totalKeystrokes) * 100 : 100;

    StatsBus.set('wpm', Math.round(wpm * 5)); 
    StatsBus.set('accuracy', Math.round(accuracy));

    // Dynamic Move Speed
    let targetSpeed = 160 + (StatsBus.wpm * 2);
    targetSpeed = Math.max(120, Math.min(400, targetSpeed));
    
    // Boss mode speed damping is handled in GameScene's update speed override
    StatsBus.set('moveSpeed', targetSpeed);

    const attackPower = Math.max(10, Math.floor(10 * StatsBus.comboMultiplier));
    StatsBus.set('attackPower', attackPower);
  }

  update(delta) {
    this.calculateStats();
    
    // Check for typing idleness (Idle after 1.5s of no keypress)
    if (Date.now() - this.lastActivityTime > 1500) {
      StatsBus.set('isUserTyping', false);
    }
  }
}

export default new TypingEngine();
