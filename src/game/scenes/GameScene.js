import Phaser from 'phaser';
import TypingEngine from '../systems/TypingEngine';
import StatsBus from '../systems/StatsBus';
import Knight from '../entities/Knight';
import Enemy from '../entities/Enemy';
import Boss from '../entities/Boss';
import Fireball from '../entities/Fireball';
import LevelManager from '../systems/LevelManager';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.levelManager = new LevelManager(this);
    TypingEngine.init(this);

    // Persistence Visuals
    this.setupAtmosphere();
    this.setupParallaxLayers();
    this.setupHUD();

    // Groups
    this.enemies = this.add.group();
    this.bossGroup = this.add.group();
    this.projectiles = this.add.group();

    // Main Character
    this.knight = new Knight(this, 200, 640);
    this.knight.sprite.setDepth(15);
    this.knightShadow = this.add.ellipse(200, 640, 80, 16, 0x000000, 0.4)
      .setDepth(11);

    // Spawner
    this.spawnTimer = this.time.addEvent({
      delay: this.levelManager.getEnemyConfig().spawnInterval,
      callback: () => this.spawnEnemy(),
      loop: true
    });

    // Boss Event Listeners
    this.setupBossEventListeners();

    // State
    this.bossEncounterActive = false;
    this.speedOverride = 1.0;
    this.bossHitsReceived = 0;
    this.isGameOver = false;

    this.setupGameOverUI();
  }

  setupGameOverUI() {
    this.gameOverGroup = this.add.group();
    
    const bg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7)
      .setDepth(1000).setScrollFactor(0).setVisible(false);
    
    const title = this.add.text(640, 320, 'GAME OVER', { 
      fontFamily: "'Press Start 2P'", fontSize: '48px', color: '#ff3333', fontStyle: 'bold' 
    }).setOrigin(0.5).setDepth(1001).setScrollFactor(0).setVisible(false);

    this.playAgainBtn = this.add.text(640 - 160, 480, 'PLAY AGAIN', { 
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#ffffff' 
    }).setOrigin(0.5).setDepth(1001).setScrollFactor(0).setVisible(false).setInteractive({ useHandCursor: true });

    this.returnBtn = this.add.text(640 + 160, 480, 'RETURN', { 
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#9ca3af' 
    }).setOrigin(0.5).setDepth(1001).setScrollFactor(0).setVisible(false).setInteractive({ useHandCursor: true });

    this.playAgainBtn.on('pointerover', () => this.playAgainBtn.setColor('#4ade80').setScale(1.1));
    this.playAgainBtn.on('pointerout', () => this.playAgainBtn.setColor('#ffffff').setScale(1));
    this.playAgainBtn.on('pointerdown', () => window.location.reload());

    this.returnBtn.on('pointerover', () => this.returnBtn.setColor('#ffffff').setScale(1.1));
    this.returnBtn.on('pointerout', () => this.returnBtn.setColor('#9ca3af').setScale(1));
    this.returnBtn.on('pointerdown', () => {
      TypingEngine.destroy();
      this.scene.start('MenuScene');
    });

    this.deathMsgText = this.add.text(640, 370, '', { 
      fontFamily: "'Press Start 2P'", fontSize: '24px', color: '#ffcc00', align: 'center', wordWrap: { width: 900 } 
    }).setOrigin(0.5).setDepth(1001).setScrollFactor(0).setVisible(false);

    this.deathCounterText = this.add.text(1250, 30, '', { 
      fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ef4444' 
    }).setOrigin(1, 0.5).setDepth(1001).setScrollFactor(0).setVisible(false);

    this.gameOverGroup.addMultiple([bg, title, this.playAgainBtn, this.returnBtn, this.deathMsgText, this.deathCounterText]);
  }

  setupAtmosphere() {
    // 5E: Persistent Vignette / Combo Overlay
    this.comboOverlay = this.add.rectangle(640, 360, 1280, 720, 0x1a0000, 0).setDepth(2).setScrollFactor(0);

    this.vignetteOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0)
      .setDepth(100).setScrollFactor(0).setAlpha(0); // Subtle darker tint

    // Persistent atmospheric dust (5E)
    this.dustParticles = this.add.particles(0, 0, 'enemy_tex', {
      x: { min: 0, max: 1280 },
      y: { min: 0, max: 720 },
      alpha: { min: 0.05, max: 0.15 },
      scale: { min: 0.1, max: 0.2 },
      speedY: { min: -10, max: -30 },
      active: true,
      quantity: 1,
      lifespan: 10000,
      frequency: 500
    }).setDepth(5).setAlpha(0.3);

    // 5F: Dynamic Speed Lines (Visible at high speed)
    this.speedLines = this.add.particles(0, 0, 'enemy_tex', {
      x: 1280,
      y: { min: 0, max: 720 },
      alpha: { start: 0.4, end: 0 },
      scaleX: { min: 4, max: 8 },
      scaleY: { min: 0.05, max: 0.1 },
      speedX: { min: -1000, max: -2000 },
      lifespan: 800,
      quantity: 0,
      active: true
    }).setDepth(21);
  }

  setupParallaxLayers() {
    this.bgLayer0 = this.add.tileSprite(640, 360, 1280, 720, 'bg0').setDepth(-10).setScrollFactor(0);
    this.bgLayer1 = this.add.tileSprite(640, 360, 1280, 720, 'bg1').setDepth(-5).setScrollFactor(0);
    this.bgLayer2 = this.add.tileSprite(640, 360, 1280, 720, 'bg2').setDepth(0).setScrollFactor(0);
    this.bgLayer3 = this.add.tileSprite(640, 600, 1280, 250, 'bg3').setDepth(1).setScrollFactor(0);
    this.bgLayer4 = this.add.tileSprite(640, 360, 1280, 720, 'bg4').setDepth(4).setScrollFactor(0).setAlpha(0.4);

    // Ground line - more subtle
    this.add.rectangle(640, 620, 1280, 2, 0x333333, 0.5).setOrigin(0.5).setDepth(1);
  }

  setupHUD() {
    // Dynamic Word Watermark in Background
    this.bgWordWatermark = this.add.text(640, 480, '', {
      fontFamily: "'Press Start 2P'",
      fontSize: '90px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setAlpha(0.04).setDepth(1).setScrollFactor(0);

    // 5D: WPM Gothic Label
    this.wpmLabel = this.add.text(60, 40, 'WPM', { fontFamily: "'Press Start 2P'", fontSize: '11px', color: '#e8d5a3' }).setOrigin(0.5).setDepth(110);
    this.wpmText = this.add.text(60, 80, '0', { fontFamily: "'Press Start 2P'", fontSize: '32px', color: '#e8d5a3' }).setOrigin(0.5).setDepth(110);
    this.accHud = this.add.text(60, 125, '100%', { fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#22c55e' }).setOrigin(0.5).setDepth(110);

    // 5D: Combo Top Right
    this.comboDisplay = this.add.text(1220, 60, '×0', { fontFamily: "'Press Start 2P'", fontSize: '32px', color: '#ffffff' }).setOrigin(1, 0.5).setDepth(110);

    // 5D: Distance Bar (Bottom)
    this.add.rectangle(640, 715, 1280, 10, 0x000000).setOrigin(0.5).setDepth(110);
    this.distBarFill = this.add.rectangle(0, 715, 0, 10, 0x6b21a8).setOrigin(0, 0.5).setDepth(110);

    // Word prompt (Central) - Fix 6: More prominent word display
    this.wordBgPanel = this.add.rectangle(640, 665, 1280, 90, 0x000000, 0.6).setDepth(15);
    this.wordPrompt = this.add.text(640, 660, '', { fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#9ca3af' }).setOrigin(0.5).setDepth(16);
    this.wordInput = this.add.text(0, 660, '', { fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#4ade80' }).setOrigin(0, 0.5).setDepth(17);

    // Fix 6: Pulsing current character
    this.currentLetterText = this.add.text(0, 660, '', {
      fontFamily: "'Press Start 2P'",
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(18);

    this.tweens.add({
      targets: this.currentLetterText,
      scale: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    // Boss HUD Elements (Grouped for cleanup)
    this.bossHudGroup = this.add.group();
    this.bossWarningText = this.add.text(640, 250, '! BOSS APPROACHING !', { fontFamily: "'Press Start 2P'", fontSize: '22px', color: '#ff3333' }).setOrigin(0.5).setAlpha(0).setDepth(110);
  }

  setupBossEventListeners() {
    // relay enemy kills to level manager for boss-spawn counter
    this.events.on('enemyKilled', () => {
      this.levelManager.onEnemyKilled();
    });

    this.events.on('wordComplete', () => {
      this.knight.performAttack(this.enemies.getChildren());
    });

    this.events.on('gameover', () => {
      this.isGameOver = true;
      this.speedOverride = 0;
      
      const newDeathCount = StatsBus.deathCount + 1;
      StatsBus.set('deathCount', newDeathCount);

      // Best WPM highscore
      const currentBest = parseInt(localStorage.getItem('lexicide_best_wpm') || '0');
      if (StatsBus.wpm > currentBest) {
        localStorage.setItem('lexicide_best_wpm', StatsBus.wpm.toString());
      }

      const deathMessages = [
        "“It’s okay… happens once.”",
        "“Already? Bold.”",
        "“Third time’s the charm… right?”",
        "“Not even trying now?”",
        "“Tutorial was optional, bro.”",
        "“Skill issue. Reinstall hands.”",
        "“Enemies feel bad for you.”",
        "“8 more = Participation Trophy.”",
        "“Speedrunning failure.”",
        "“TEN. Final boss of sucking.”"
      ];

      let msg = "";
      if (newDeathCount <= 10) {
        msg = deathMessages[newDeathCount - 1];
      } else {
        msg = "“Still here?”";
      }

      this.deathMsgText.setText(msg);
      this.deathCounterText.setText(`Death #${newDeathCount}`);

      this.gameOverGroup.getChildren().forEach(c => c.setVisible(true));
      
      this.tweens.add({
        targets: this.gameOverGroup.getChildren(),
        alpha: { from: 0, to: 1 },
        duration: 500
      });
    });

    this.events.on('bossApproaching', () => {
      // cinematic warning
      this.speedOverride = 0.3;
      this.bossEncounterActive = true;

      this.tweens.add({
        targets: this.bossWarningText,
        alpha: { from: 0, to: 1 },
        duration: 200,
        yoyo: true,
        repeat: 14,
        onComplete: () => this.bossWarningText.destroy()
      });

      // --- Intense effects WITHOUT red overlay ---

      // 1. Rapid triple camera pulse shake
      this.cameras.main.shake(300, 0.01);
      this.time.delayedCall(400, () => this.cameras.main.shake(400, 0.015));
      this.time.delayedCall(900, () => this.cameras.main.shake(600, 0.022));

      // 2. Chromatic split flicker — cyan/magenta ghost frames
      const chrR = this.add.rectangle(640, 360, 1280, 720, 0xff00ff, 0).setDepth(90).setBlendMode('ADD');
      const chrC = this.add.rectangle(640, 360, 1280, 720, 0x00ffff, 0).setDepth(90).setBlendMode('ADD');
      this.tweens.add({
        targets: [chrR, chrC],
        alpha: { from: 0.06, to: 0 },
        duration: 80,
        yoyo: true,
        repeat: 8,
        onComplete: () => { chrR.destroy(); chrC.destroy(); }
      });

      // 3. Electric border arcs — persistent during boss fight
      this.bossArcGraphics = this.add.graphics().setDepth(95);
      this.bossArcTimer = this.time.addEvent({
        delay: 80,
        loop: true,
        callback: () => {
          if (!this.bossArcGraphics || !this.bossArcGraphics.active) return;
          this.bossArcGraphics.clear();
          // Draw 4-8 jagged arcs along screen edges
          const edgeColors = [0xaa44ff, 0xcc88ff, 0xffffff, 0x8800ff];
          for (let i = 0; i < 5; i++) {
            const col = edgeColors[Math.floor(Math.random() * edgeColors.length)];
            this.bossArcGraphics.lineStyle(1.5, col, 0.6 + Math.random() * 0.4);
            // Pick a random edge (0=top,1=right,2=bottom,3=left)
            const edge = Math.floor(Math.random() * 4);
            const len = 60 + Math.random() * 120;
            let sx, sy, ex, ey;
            if (edge === 0) { sx = Math.random()*1280; sy = 0;   ex = sx + (Math.random()-0.5)*60; ey = len; }
            else if (edge === 1) { sx = 1280; sy = Math.random()*720; ex = 1280-len; ey = sy + (Math.random()-0.5)*60; }
            else if (edge === 2) { sx = Math.random()*1280; sy = 720;  ex = sx + (Math.random()-0.5)*60; ey = 720-len; }
            else { sx = 0; sy = Math.random()*720; ex = len; ey = sy + (Math.random()-0.5)*60; }
            // Jagged midpoint
            const mx = (sx+ex)/2 + (Math.random()-0.5)*40;
            const my = (sy+ey)/2 + (Math.random()-0.5)*40;
            this.bossArcGraphics.beginPath();
            this.bossArcGraphics.moveTo(sx, sy);
            this.bossArcGraphics.lineTo(mx, my);
            this.bossArcGraphics.lineTo(ex, ey);
            this.bossArcGraphics.strokePath();
          }
        }
      });
    });

    this.events.on('bossSpawn', () => {
    this.activeBoss = new Boss(this, 1420, 480);
    this.activeBoss.setDepth(20);
    this.bossGroup.add(this.activeBoss);
    this.activeBoss.setTint(0xffffff); // Ensure it's bright initially

      // Create Boss HUD
      const barBg = this.add.rectangle(640, 25, 600, 24, 0x222222).setScrollFactor(0);
      this.bossBarFillHUD = this.add.rectangle(340, 25, 600, 24, 0xc0c0ff).setOrigin(0, 0.5).setScrollFactor(0);
      const bossNameLabel = this.add.text(640, 55, this.activeBoss.name, { fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0);
      this.bossHudGroup.add(barBg);
      this.bossHudGroup.add(this.bossBarFillHUD);
      this.bossHudGroup.add(bossNameLabel);

      TypingEngine.enterBossMode();
    });

    this.events.on('bossStageChange', (stage) => {
      // 3C: Flash and Shake
      const flash = this.add.rectangle(640, 360, 1280, 720, this.activeBoss.stageColors[stage], 0).setDepth(200);
      this.tweens.add({
        targets: flash,
        alpha: 0.4,
        duration: 75,
        yoyo: true,
        onComplete: () => flash.destroy()
      });
      this.cameras.main.shake(400, 0.025);
      this.bossBarFillHUD.setFillStyle(this.activeBoss.stageColors[stage]);
    });

    this.events.on('bossWordComplete', () => {
      // Every boss word deals 30 damage
      this.knight.performAttack([], 30);
    });

    this.events.on('bossTypingError', () => {
      // Red flash on word prompt
      this.wordPrompt.setColor('#ff3333');
      this.tweens.add({
        targets: this.wordPrompt,
        x: '+=10',
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.wordPrompt.setColor('#ffffff');
          this.wordPrompt.setX(640);
        }
      });
    });

    this.events.on('bossDied', () => {
      // 3D: High intensity shake and ring particles
      this.cameras.main.shake(1200, 0.04);

      // Particle ring
      for (let i = 0; i < 80; i++) {
        const rad = (i / 80) * Math.PI * 2;
        const speed = 250 + Math.random() * 150;
        const p = this.add.circle(this.activeBoss.x, this.activeBoss.y, 4, 0xffffff);
        this.tweens.add({
          targets: p,
          x: p.x + Math.cos(rad) * speed,
          y: p.y + Math.sin(rad) * speed,
          scale: 0,
          alpha: 0,
          duration: 1800,
          onComplete: () => p.destroy()
        });
      }

      this.time.delayedCall(600, () => {
        const vText = this.add.text(640, 360, '* VANQUISHED *', { fontFamily: "'Press Start 2P'", fontSize: '36px', color: '#ffd700' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({
          targets: vText,
          alpha: 1,
          scale: { from: 0.5, to: 1.0 },
          duration: 500,
          ease: 'Back.out',
          onComplete: () => {
            this.tweens.add({ targets: vText, alpha: 0, y: '-=100', delay: 1500, duration: 1000, onComplete: () => vText.destroy() });
          }
        });
      });

      this.time.delayedCall(2500, () => {
        this.bossHudGroup.clear(true, true);
        this.speedOverride = 1.0;
        this.speedRestoreTween = this.tweens.add({
          targets: this,
          speedOverride: 1.0,
          duration: 1000
        });
        this.bossEncounterActive = false;
        this.levelManager.onBossDied();
        TypingEngine.exitBossMode();

        // Grant +50 streak bonus
        StatsBus.set('streak', StatsBus.streak + 50);

        // Clean up boss arc effects
        if (this.bossArcTimer) { this.bossArcTimer.remove(); this.bossArcTimer = null; }
        if (this.bossArcGraphics) { this.bossArcGraphics.destroy(); this.bossArcGraphics = null; }
      });
    });
  }

  spawnEnemy(force = false) {
    if (this.bossEncounterActive && !force) return;
    // Don't exceed the round's kill-quota unless forced (boss mid-fight spawn)
    if (!force && !this.levelManager.canSpawnEnemy()) return;

    const config = this.levelManager.getEnemyConfig();
    const enemy = new Enemy(this, 1400, 640, config);
    enemy.setDepth(12);
    this.enemies.add(enemy);
    this.spawnTimer.delay = config.spawnInterval;

    if (!force) this.levelManager.onEnemySpawned();
  }


  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    const moveSpeed = StatsBus.moveSpeed * this.speedOverride;
    TypingEngine.update(delta);

    // 1. Parallax Update (Dynamic Speed scaling) linked to Knight movement
    const isKnightIdle = this.knight.currentAnim === 'knight_idle';
    const effectiveMoveSpeed = isKnightIdle ? 0 : moveSpeed;

    const speedRatio = Math.max(1.0, effectiveMoveSpeed / 160); // 160 is base speed
    const dynamicMultiplier = 1.0 + (speedRatio - 1.0) * 0.5; // Scale intensity with speed
    
    this.bgLayer0.tilePositionX += effectiveMoveSpeed * 0.005 * dynamicMultiplier * (delta / 1000);
    this.bgLayer1.tilePositionX += effectiveMoveSpeed * 0.02 * dynamicMultiplier * (delta / 1000);
    this.bgLayer2.tilePositionX += effectiveMoveSpeed * 0.08 * dynamicMultiplier * (delta / 1000);
    this.bgLayer3.tilePositionX += effectiveMoveSpeed * 0.22 * dynamicMultiplier * (delta / 1000);
    this.bgLayer4.tilePositionX += effectiveMoveSpeed * 1.2 * dynamicMultiplier * (delta / 1000);

    // Speed Lines Intensity (Only while not idle)
    const linesIntensity = !isKnightIdle ? Math.max(0, (moveSpeed - 220) / 180) : 0;
    this.speedLines.setParticleAlpha({ start: linesIntensity * 0.5, end: 0 });
    this.speedLines.setQuantity(Math.floor(linesIntensity * 3));

    // 2. Systems
    this.levelManager.update(delta, moveSpeed);
    this.knight.update(delta);

    // Combat
    if (this.activeBoss && this.activeBoss.isAlive) {
      this.activeBoss.update(time, delta);
      
      // Boss collision with knight
      if (!this.knight.isDead && Math.abs(this.activeBoss.x - this.knight.x) < 80) {
        this.knight.takeDamage(34); // Deal damage
        this.activeBoss.x += 150; // Knockback boss to prevent continuous damage
        StatsBus.set('combo', 0);
        StatsBus.set('comboMultiplier', 1.0);
        StatsBus.set('errorFlash', true);
      }
    }

    this.enemies.getChildren().forEach(e => {
      e.update(delta);
      
      // Normal enemy collision with knight
      if (e.isAlive && !this.knight.isDead && Math.abs(e.x - this.knight.x) < 50) {
        this.knight.takeDamage(20);
        e.die(); // Destroy enemy on hit
        StatsBus.set('combo', 0);
        StatsBus.set('comboMultiplier', 1.0);
        StatsBus.set('errorFlash', true);
      }

      if (e.x < -100) e.destroy();
    });

    this.projectiles.getChildren().forEach(p => {
        p.update(delta);
        
        // Check collision with enemies (Using physics body for the custom hitbox)
        this.enemies.getChildren().forEach(e => {
            if (e.isAlive && this.physics.overlap(p, e)) {
                p.handleHit(e);
            }
        });

        // Check collision with boss
        if (this.activeBoss && this.activeBoss.isAlive && this.physics.overlap(p, this.activeBoss)) {
            p.handleHit(this.activeBoss);
            
            // Increment boss specific hit counter
            this.bossHitsReceived++;

            // Smooth Knockback Tween
            this.tweens.add({
                targets: this.activeBoss,
                x: this.activeBoss.x + 80,
                duration: 200,
                ease: 'Cubic.easeOut'
            });

            // Every 3 hits, spawn an internal enemy (Groq) for chaos
            if (this.bossHitsReceived % 3 === 0) {
                this.spawnEnemy(true); 
            }
        }
    });

    this.updateComboEffects();
    this.updateHUD(time);

    // Sync Shadow
    if (this.knightShadow) {
      this.knightShadow.setPosition(this.knight.x, 624);
    }
  }

  updateHUD(time) {
    // Stats
    this.wpmText.setText(StatsBus.wpm);
    
    const word = StatsBus.currentWord || '';
    this.bgWordWatermark.setText(word.toUpperCase()); // Background Word Update

    this.accHud.setText(`${StatsBus.accuracy}%`);
    this.accHud.setColor(StatsBus.accuracy > 90 ? '#22c55e' : (StatsBus.accuracy > 75 ? '#f59e0b' : '#ff3333'));

    this.comboDisplay.setText(`×${StatsBus.combo}`);
    if (StatsBus.combo >= 5) {
      this.comboDisplay.setScale(1.0 + Math.sin(time / 200) * 0.1);
      this.comboDisplay.setTint(0xffd700);
    } else {
      this.comboDisplay.setScale(1).clearTint();
    }

    // Distance Bar
    const progress = (this.levelManager.distanceTraveled % 2500) / 2500;
    this.distBarFill.width = progress * 1280;

    // Word prompt (Fix 6: Dynamic visual feedback)
    const input = StatsBus.inputText || '';

    this.wordPrompt.setText(word);
    this.wordInput.setText(input);

    // Pulse current character logic (Fix 6)
    const promptWidth = this.wordPrompt.width;
    const startX = 640 - (promptWidth / 2);
    this.wordInput.setX(startX);

    if (word && input.length < word.length) {
      const currentLetter = word[input.length];
      this.currentLetterText.setText(currentLetter);

      // Optimize: use wordInput's width to find the current position
      this.currentLetterText.setX(startX + this.wordInput.width);
      this.currentLetterText.setVisible(true);
    } else {
      this.currentLetterText.setVisible(false);
    }

    // Word completion flash
    if (this._lastWord !== word) {
      if (this._lastWord) {
        // Flash yellow on completion
        const flashColor = this.wordPrompt.style.color;
        this.wordPrompt.setColor('#fbbf24');
        this.time.delayedCall(150, () => this.wordPrompt.setColor('#9ca3af'));
      }
      this._lastWord = word;
    }

    // Boss Bar HUD
    if (this.activeBoss && this.activeBoss.isAlive) {
      this.bossBarFillHUD.width = (this.activeBoss.health / this.activeBoss.maxHealth) * 600;
    }

    // Error Feedback (Fix 6: Bright red flash)
    if (StatsBus.errorFlash) {
      this.wordPrompt.setColor('#ef4444');
      this.time.delayedCall(200, () => this.wordPrompt.setColor('#9ca3af'));
      StatsBus.set('errorFlash', false);
    }
  }

  updateComboEffects() {
    let targetAlpha = 0;
    const multiplier = StatsBus.comboMultiplier;

    if (multiplier >= 3.0) targetAlpha = 0.09;
    else if (multiplier >= 2.0) targetAlpha = 0.06;
    else if (multiplier >= 1.4) targetAlpha = 0.04;

    if (this.comboOverlay.alpha !== targetAlpha) {
      this.tweens.add({
        targets: this.comboOverlay,
        alpha: targetAlpha,
        duration: 400,
        ease: 'Sine.easeInOut'
      });
    }
  }

  showDamageNumber(x, y, amount, multiplier) {
    const color = multiplier >= 3 ? '#ef4444' : multiplier >= 2 ? '#f97316' : '#ffffff';
    const txt = this.add.text(x, y - 20, Math.floor(amount), {
      fontFamily: "'Press Start 2P'",
      fontSize: '11px',
      color,
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(20).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 80,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }
}
