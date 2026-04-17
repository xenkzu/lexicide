import Phaser from 'phaser';
import StatsBus from '../systems/StatsBus.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.isMuted = false;
    this.selectedButton = 0; // 0 = play, keyboard nav support
  }

  create() {
    this.stars = [];
    this.starSpeeds = [];
    this.starTimer = 0;

    this.buildBackground();
    this.buildCosmicOverlay();
    this.buildStarfield();
    this.buildTitle();
    this.buildButtons();
    this.buildHighscore();
    this.buildInfoButton();
    this.buildSocialLinks();
    this.buildBorderFlourishes();
    this.buildSettingsOverlay();
    this.buildVersion();
    this.buildScanlines();
    this.setupKeyboard();

    if (!StatsBus.muted && !StatsBus.introPlayed) {
      this.sound.play('launch_sfx', { volume: StatsBus.sfxVol });
      this.menuMusic = this.sound.add('menu_music', { loop: true, volume: 0 });
      this.menuMusic.play();
      this.tweens.add({
        targets: this.menuMusic,
        volume: StatsBus.musicVol,
        duration: 3000
      });
    } else if (!StatsBus.muted) {
       // Just start music normally if no intro
       this.menuMusic = this.sound.add('menu_music', { loop: true, volume: StatsBus.musicVol });
       this.menuMusic.play();
    }
  }

  update(time, delta) {
    this.scrollBackground(delta);
    this.twinkleStars(delta);
  }

  // ─── Background ────────────────────────────────────────────────────────────

  buildBackground() {
    this.bgLayer0 = this.add.tileSprite(640, 360, 1280, 720, 'bg0').setDepth(-10).setScrollFactor(0);
    this.bgLayer1 = this.add.tileSprite(640, 360, 1280, 720, 'bg1').setDepth(0).setScrollFactor(0);
    this.bgLayer2 = this.add.tileSprite(640, 360, 1280, 720, 'bg2').setDepth(1).setScrollFactor(0);
    this.bgLayer3 = this.add.tileSprite(640, 600, 1280, 250, 'bg3').setDepth(2).setScrollFactor(0);
  }

  // ─── Cosmic Overlay ────────────────────────────────────────────────────────

  buildCosmicOverlay() {
    // Primary dark overlay
    this.add.rectangle(640, 360, 1280, 720, 0x000011, 0.55).setDepth(3);

    // Gradient simulation — top half
    this.add.rectangle(640, 180, 1280, 360, 0x0a0020, 0.3).setDepth(3);
    // Gradient simulation — bottom half
    this.add.rectangle(640, 540, 1280, 360, 0x000011, 0.4).setDepth(3);

    // Nebula blobs
    const blob1 = this.add.ellipse(200, 180, 500, 300, 0x4b0082, 0.08).setDepth(3);
    const blob2 = this.add.ellipse(900, 400, 400, 250, 0x00008b, 0.10).setDepth(3);
    const blob3 = this.add.ellipse(640, 550, 600, 200, 0x800080, 0.07).setDepth(3);

    [blob1, blob2, blob3].forEach((blob, i) => {
      this.tweens.add({
        targets: blob,
        alpha: { from: 0.06, to: 0.12 },
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 700
      });
    });
  }

  // ─── Starfield ─────────────────────────────────────────────────────────────

  buildStarfield() {
    const colors = [0xffffff, 0xffffaa, 0xaaaaff, 0xffaaff, 0xaaffff];

    for (let i = 0; i < 180; i++) {
      const size = Math.random() < 0.5 ? 1 : 2;
      const x = Math.random() * 1280;
      const y = Math.random() * 720;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const alpha = 0.3 + Math.random() * 0.7;

      const star = this.add.rectangle(x, y, size, size, color, alpha).setDepth(4);
      this.stars.push(star);
      this.starSpeeds.push(0.4 + Math.random() * 1.2); // radians per second multiplier
    }
  }

  twinkleStars(delta) {
    this.starTimer = (this.starTimer || 0) + delta;
    this.stars.forEach((star, i) => {
      star.alpha = 0.4 + 0.6 * Math.abs(Math.sin((this.starTimer * this.starSpeeds[i]) / 1000));
    });
  }

  // ─── Title ─────────────────────────────────────────────────────────────────

  buildTitle() {
    const fontFamily = "'Press Start 2P'";

    const taglines = [
      "Type faster genius the game is judging you",
      "Congratulations your typing speed is still disappointing",
      "Wow such skill much survive",
      "Keep typing maybe one day you'll be average",
      "The keyboard is free but your dignity isn't",
      "Impressive you managed to type that wrong too",
      "Only virgins type slow",
      "Real chads type 100+ wpm",
      "Skill issue detected keep coping",
      "Touch keyboard you casual",
      "Beta males can't survive this",
      "Git gud or uninstall",
      "Type faster the government is watching",
      "Leftists can't type under pressure",
      "This game is rigged against conservatives",
      "Type to own the libs",
      "Survive the deep state with your keyboard",
      "Big Tech is slowing your typing right now",
      "Type or humanity goes extinct tonight",
      "The final keystroke decides your fate",
      "One mistake and the world burns",
      "Your fingers are the last hope of mankind",
      "Type like the apocalypse is at your door",
      "Every letter you miss brings eternal darkness",
      "Your ancestors are ashamed of your wpm",
      "Even your mom types faster than you",
      "The void is calling your name",
      "Death by autocorrect incoming",
      "Type before your crush sees your speed"
    ];

    const lastTagline = localStorage.getItem('lexicide_last_tagline');
    let availableTaglines = taglines.filter(t => t !== lastTagline);
    if (availableTaglines.length === 0) availableTaglines = taglines;
    
    const pickedTagline = Phaser.Utils.Array.GetRandom(availableTaglines);
    localStorage.setItem('lexicide_last_tagline', pickedTagline);
    const finalTaglineTxt = pickedTagline.toUpperCase();

    const playIntro = !StatsBus.introPlayed;
    const initialScale = playIntro ? 0 : 1;

    // Drop shadow layer
    const shadow = this.add.text(643, 203, 'LEXICIDE', {
      fontFamily,
      fontSize: '72px',
      color: '#4b0082'
    }).setOrigin(0.5).setDepth(9).setScale(initialScale);

    // Bloom glow layers
    const blooms = [];
    const bloomConfigs = [
      { scale: 1.06, alpha: 0.05 },
      { scale: 1.04, alpha: 0.10 },
      { scale: 1.02, alpha: 0.15 }
    ];
    bloomConfigs.forEach(({ scale, alpha }) => {
      const bloom = this.add.text(640, 200, 'LEXICIDE', {
        fontFamily,
        fontSize: '72px',
        color: '#e0d0ff'
      }).setOrigin(0.5).setDepth(9).setAlpha(alpha).setScale(initialScale === 0 ? 0 : scale);
      
      blooms.push({ obj: bloom, targetScale: scale });

      this.tweens.add({
        targets: bloom,
        y: { from: 200, to: 194 },
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Main title
    const titleText = this.add.text(640, 200, 'LEXICIDE', {
      fontFamily,
      fontSize: '72px',
      color: '#e0d0ff'
    }).setOrigin(0.5).setDepth(10).setScale(initialScale);

    if (playIntro) {
      // 1. Final Main Title Entry (Now First)
      const allTitleObjs = [shadow, titleText, ...blooms.map(b => b.obj)];
      this.tweens.add({
        targets: allTitleObjs,
        scale: 1,
        duration: 800,
        delay: 400,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          blooms.forEach(b => b.obj.setScale(b.targetScale));
          this.tweens.add({
            targets: titleText,
            y: { from: 200, to: 194 },
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      });

      // 2. Cinematic Ghost Trails (Follow after main title)
      const numTrails = 5;
      for (let i = 0; i < numTrails; i++) {
        const trail = this.add.text(640, 200, 'LEXICIDE', {
          fontFamily, fontSize: '72px', color: '#e0d0ff'
        }).setOrigin(0.5).setDepth(8).setScale(0).setAlpha(0.6 - (i * 0.12));

        this.tweens.add({
          targets: trail,
          scale: 1,
          duration: 800,
          delay: 400 + ((i + 1) * 250),
          ease: 'Cubic.easeOut',
          onComplete: () => {
            this.tweens.add({ targets: trail, alpha: 0, duration: 400, onComplete: () => trail.destroy() });
          }
        });
      }

      StatsBus.introPlayed = true;
    } else {
      // Skip Intro Logic
      this.tweens.add({
        targets: titleText,
        y: { from: 200, to: 194 },
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Tagline - Randomized
    const subtitle = this.add.text(640, 285, finalTaglineTxt, {
      fontFamily,
      fontSize: '16px',
      color: '#9b7dff'
    }).setOrigin(0.5).setDepth(10).setAlpha(playIntro ? 0 : 1).setScale(playIntro ? 0.8 : 1);

    const taglineDelay = playIntro ? (400 + (5 * 250) + 1000) : 0;
    
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      scale: 1,
      delay: taglineDelay,
      duration: playIntro ? 400 : 1,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: subtitle,
          alpha: { from: 1.0, to: 0.3 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Stepped'
        });
      }
    });
  }

  // ─── Buttons ───────────────────────────────────────────────────────────────

  buildButtons() {
    this._buildPlayButton();      // center x=640
    this._buildSettingsButton();  // right  x=920
    this._buildMuteButton();      // left   x=360
  }

  _makeButtonGraphics(x, y, w, h, fillColor, strokeColor, strokeWidth) {
    const g = this.add.graphics();
    g.lineStyle(strokeWidth, strokeColor, 1);
    g.fillStyle(fillColor, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    // Pixel shine line
    g.lineStyle(2, 0xcc99ff, 0.4);
    g.lineBetween(-w / 2 + 6, -h / 2 + 3, w / 2 - 6, -h / 2 + 3);
    return g;
  }

  _buildPlayButton() {
    const x = 640, y = 390, w = 240, h = 60;
    const FILL_NORMAL = 0x1a0044;
    const FILL_HOVER  = 0x2d0066;
    const FILL_DOWN   = 0x0d0022;
    const STROKE_NORMAL = 0x9b7dff;
    const STROKE_HOVER  = 0xcc99ff;

    const container = this.add.container(x, y).setDepth(10);

    const bg = this.add.graphics();
    const drawBg = (fill, stroke, sw) => {
      bg.clear();
      bg.lineStyle(sw, stroke, 1);
      bg.fillStyle(fill, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, 0xcc99ff, 0.4);
      bg.lineBetween(-w / 2 + 6, -h / 2 + 3, w / 2 - 6, -h / 2 + 3);
    };
    drawBg(FILL_NORMAL, STROKE_NORMAL, 2);

    const label = this.add.text(0, 0, '\u25b6  PLAY', {
      fontFamily: "'Press Start 2P'",
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, label]);

    // Hit zone
    const hitZone = this.add.rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerover', () => {
      drawBg(FILL_HOVER, STROKE_HOVER, 3);
      container.setScale(1.04);
    });
    hitZone.on('pointerout', () => {
      drawBg(FILL_NORMAL, STROKE_NORMAL, 2);
      container.setScale(1);
    });
    hitZone.on('pointerdown', () => {
      drawBg(FILL_DOWN, STROKE_HOVER, 3);
    });
    hitZone.on('pointerup', () => {
      this.time.delayedCall(100, () => this.startGame());
    });

    // Pulse tween on stroke color — recreate full bg periodically
    let pulseTick = 0;
    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        pulseTick++;
        const s = pulseTick % 2 === 0 ? STROKE_NORMAL : 0xcc44ff;
        drawBg(FILL_NORMAL, s, 2);
      }
    });

    this.playButton = container;
  }

  _buildSettingsButton() {
    const x = 920, y = 390, w = 200, h = 60;
    const FILL_NORMAL   = 0x0a001a;
    const STROKE_NORMAL = 0x554488;
    const STROKE_HOVER  = 0x9b7dff;

    const container = this.add.container(x, y).setDepth(10);

    const bg = this.add.graphics();
    const drawBg = (fill, stroke, sw, txtColor) => {
      bg.clear();
      bg.lineStyle(sw, stroke, 1);
      bg.fillStyle(fill, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, 0x886699, 0.3);
      bg.lineBetween(-w / 2 + 6, -h / 2 + 3, w / 2 - 6, -h / 2 + 3);
      label.setColor(txtColor);
    };

    const label = this.add.text(0, 0, '\u2699 SET', {
      fontFamily: "'Press Start 2P'",
      fontSize: '13px',
      color: '#9988bb'
    }).setOrigin(0.5);

    drawBg(FILL_NORMAL, STROKE_NORMAL, 2, '#9988bb');
    container.add([bg, label]);

    const hitZone = this.add.rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerover', () => {
      drawBg(FILL_NORMAL, STROKE_HOVER, 3, '#ffffff');
      container.setScale(1.03);
    });
    hitZone.on('pointerout', () => {
      drawBg(FILL_NORMAL, STROKE_NORMAL, 2, '#9988bb');
      container.setScale(1);
    });
    hitZone.on('pointerdown', () => {
      bg.clear();
      bg.lineStyle(3, STROKE_HOVER, 1);
      bg.fillStyle(0x120030, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    hitZone.on('pointerup', () => {
      drawBg(FILL_NORMAL, STROKE_NORMAL, 2, '#9988bb');
      container.setScale(1);
      this.settingsPanel.setVisible(true);
    });
  }

  _buildMuteButton() {
    const x = 360, y = 390, w = 200, h = 60;
    const FILL_NORMAL     = 0x0a001a;
    const STROKE_UNMUTED  = 0x554488;
    const STROKE_MUTED    = 0x880000;

    const container = this.add.container(x, y).setDepth(10);

    const bg = this.add.graphics();
    const drawBg = (fill, stroke, sw) => {
      bg.clear();
      bg.lineStyle(sw, stroke, 1);
      bg.fillStyle(fill, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, 0x886699, 0.3);
      bg.lineBetween(-w / 2 + 6, -h / 2 + 3, w / 2 - 6, -h / 2 + 3);
    };

    const label = this.add.text(0, 0, '\u266a SFX', {
      fontFamily: "'Press Start 2P'",
      fontSize: '13px',
      color: '#9988bb'
    }).setOrigin(0.5);

    drawBg(FILL_NORMAL, STROKE_UNMUTED, 2);
    container.add([bg, label]);

    const hitZone = this.add.rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerover', () => {
      const s = this.isMuted ? STROKE_MUTED : STROKE_UNMUTED;
      drawBg(FILL_NORMAL, s, 3);
      container.setScale(1.03);
    });
    hitZone.on('pointerout', () => {
      const s = this.isMuted ? STROKE_MUTED : STROKE_UNMUTED;
      drawBg(FILL_NORMAL, s, 2);
      container.setScale(1);
    });
    hitZone.on('pointerdown', () => {});
    hitZone.on('pointerup', () => {
      this.isMuted = !this.isMuted;
      const s = this.isMuted ? STROKE_MUTED : STROKE_UNMUTED;
      label.setText(this.isMuted ? '\u2715 SFX' : '\u266a SFX');
      drawBg(FILL_NORMAL, s, 2);
      container.setScale(1);
      
      // Global Mute
      this.sound.mute = this.isMuted;
      StatsBus.set('muted', this.isMuted);
    });

    this.muteLabel = label;
    this._drawMuteBg = drawBg;
    this._muteFill = FILL_NORMAL;
    this._strokeUnmuted = STROKE_UNMUTED;
    this._strokeMuted = STROKE_MUTED;
  }

  // ─── Settings Overlay ──────────────────────────────────────────────────────

  buildSettingsOverlay() {
    this.settingsPanel = this.add.container(640, 360).setDepth(50).setVisible(false);

    const backdrop = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.85);

    const panel = this.add.graphics();
    panel.lineStyle(2, 0x9b7dff, 1);
    panel.fillStyle(0x0d0022, 0.97);
    panel.fillRoundedRect(-200, -180, 400, 360, 8);
    panel.strokeRoundedRect(-200, -180, 400, 360, 8);

    const title = this.add.text(0, -140, 'SETTINGS', {
      fontFamily: "'Press Start 2P'",
      fontSize: '18px',
      color: '#e0d0ff'
    }).setOrigin(0.5);

    // Divider
    const divider = this.add.graphics();
    divider.lineStyle(1, 0x9b7dff, 0.3);
    divider.lineBetween(-180, -110, 180, -110);

    // --- MUSIC VOL SLIDER ---
    const musicLabel = this.add.text(-170, -85, 'MUSIC', {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#9b7dff'
    });

    const mTrack = this.add.rectangle(-40, -78, 140, 4, 0x443366).setOrigin(0, 0.5);
    const mHandle = this.add.circle(-40 + (StatsBus.musicVol * 140), -78, 8, 0x9b7dff).setInteractive({ draggable: true, useHandCursor: true });
    const mValue = this.add.text(115, -85, `${Math.round(StatsBus.musicVol * 100)}%`, {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#ffffff'
    });

    mHandle.on('drag', (pointer, dragX) => {
      const x = Phaser.Math.Clamp(dragX, -40, 100);
      mHandle.x = x;
      const vol = (x + 40) / 140;
      StatsBus.set('musicVol', vol);
      mValue.setText(`${Math.round(vol * 100)}%`);
      if (this.menuMusic) this.menuMusic.setVolume(vol);
    });

    // --- SFX VOL SLIDER ---
    const sfxLabel = this.add.text(-170, -35, 'SFX', {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#9b7dff'
    });

    const sTrack = this.add.rectangle(-40, -28, 140, 4, 0x443366).setOrigin(0, 0.5);
    const sHandle = this.add.circle(-40 + (StatsBus.sfxVol * 140), -28, 8, 0x9b7dff).setInteractive({ draggable: true, useHandCursor: true });
    const sValue = this.add.text(115, -35, `${Math.round(StatsBus.sfxVol * 100)}%`, {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#ffffff'
    });

    sHandle.on('drag', (pointer, dragX) => {
      const x = Phaser.Math.Clamp(dragX, -40, 100);
      sHandle.x = x;
      const vol = (x + 40) / 140;
      StatsBus.set('sfxVol', vol);
      sValue.setText(`${Math.round(vol * 100)}%`);
    });

    const fsLabel = this.add.text(-170, 15, 'FULLSCREEN', {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#9b7dff'
    });

    const fsValue = this.add.text(40, 15, this.scale.isFullscreen ? '[ ON ]' : '[ OFF ]', {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    fsValue.on('pointerup', async () => {
       const isNowFullscreen = await window.electronAPI?.toggleFullscreen();
       if (fsValue && fsValue.active) {
         fsValue.setText(isNowFullscreen ? '[ ON ]' : '[ OFF ]');
       }
    });

    const qualLabel = this.add.text(-170, 85, 'PIXEL ART MODE', {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#9b7dff'
    });

    const qualValue = this.add.text(-170, 110, 'ON', {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#ffffff'
    });

    const closeBtn = this.add.text(0, 145, '[ CLOSE ]', {
      fontFamily: "'Press Start 2P'",
      fontSize: '13px',
      color: '#cc99ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerup', () => this.settingsPanel.setVisible(false));
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#cc99ff'));

    this.settingsPanel.add([
      backdrop, panel, title, divider,
      musicLabel, mTrack, mHandle, mValue,
      sfxLabel, sTrack, sHandle, sValue,
      fsLabel, fsValue,
      qualLabel, qualValue,
      closeBtn
    ]);
  }

  // ─── Scanlines ─────────────────────────────────────────────────────────────

  buildScanlines() {
    const g = this.add.graphics().setDepth(20);
    g.lineStyle(1, 0x000000, 0.06);
    for (let y = 0; y < 720; y += 4) {
      g.lineBetween(0, y, 1280, y);
    }
  }

  // ─── Version Text ──────────────────────────────────────────────────────────

  buildVersion() {
    this.add.text(80, 685, 'v0.69.0', {
      fontFamily: "'Press Start 2P'",
      fontSize: '9px',
      color: '#443366'
    }).setOrigin(0, 1).setDepth(10).setAlpha(0.8);

    this.add.text(1200, 685, 'Made by xenkzu,saksham,hershit', {
      fontFamily: "'Press Start 2P'",
      fontSize: '9px',
      color: '#443366'
    }).setOrigin(1, 1).setDepth(10).setAlpha(0.8);
  }

  // ─── Extra Home Screen Elements ───────────────────────────────────────────

  buildBorderFlourishes() {
    const corners = [
      { x: 30, y: 30, rot: 0 },
      { x: 1250, y: 30, rot: 90 },
      { x: 1250, y: 690, rot: 180 },
      { x: 30, y: 690, rot: 270 }
    ];

    corners.forEach(c => {
      const g = this.add.graphics({ x: c.x, y: c.y }).setDepth(15).setAlpha(0.4);
      g.setAngle(c.rot);
      g.lineStyle(2, 0x9b7dff, 1);
      g.beginPath();
      g.moveTo(0, 20);
      g.lineTo(0, 0);
      g.lineTo(20, 0);
      g.strokePath();

      this.tweens.add({
        targets: g,
        alpha: { from: 0.2, to: 0.6 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  buildInfoButton() {
    const btnX = 1240, btnY = 40;
    const container = this.add.container(btnX, btnY).setDepth(100);

    const bg = this.add.circle(0, 0, 18, 0x1a0044).setStrokeStyle(2, 0x9b7dff);
    const label = this.add.text(0, 0, 'i', {
      fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, label]);
    bg.setInteractive({ useHandCursor: true });

    // Tooltip / Panel
    const infoPanel = this.add.container(-250, 40).setVisible(false);
    const pBg = this.add.rectangle(0, 0, 260, 150, 0x000000, 0.9).setOrigin(0, 0).setStrokeStyle(1, 0x9b7dff);
    const pTitle = this.add.text(130, 25, 'HOW TO SURVIVE', {
      fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#cc99ff'
    }).setOrigin(0.5);
    const pText = this.add.text(15, 50, [
      '• TYPE words to fire',
      '• COMBO for multi-shot',
      '• KILL to summon BOSS',
      '• DON\'T LET THEM TOUCH'
    ].join('\n\n'), {
      fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#9ca3af', lineHeight: 18
    });
    infoPanel.add([pBg, pTitle, pText]);
    container.add(infoPanel);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x2d0066);
      infoPanel.setVisible(true);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x1a0044);
      infoPanel.setVisible(false);
    });
  }

  buildHighscore() {
    const bestScore = localStorage.getItem('lexicide_best_score_v2') || '0';
    const totalDeaths = localStorage.getItem('lexicide_deaths') || '0';

    this.add.text(640, 470, `HIGHEST SCORE: ${bestScore} PTS`, {
      fontFamily: "'Press Start 2P'", fontSize: '11px', color: '#4ade80'
    }).setOrigin(0.5).setDepth(10);

    this.add.text(640, 495, `TOTAL DEATHS: ${totalDeaths}`, {
      fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#9ca3af'
    }).setOrigin(0.5).setDepth(10);
  }

  buildSocialLinks() {
    const container = this.add.container(640, 640).setDepth(10);

    const links = [
      { text: 'GITHUB', color: '#ffffff' },
      { text: 'DISCORD', color: '#7289da' },
      { text: 'WIKI', color: '#ffcc00' }
    ];

    links.forEach((link, i) => {
      const x = (i - 1) * 160;
      const t = this.add.text(x, 0, `[ ${link.text} ]`, {
        fontFamily: "'Press Start 2P'", fontSize: '10px', color: link.color
      }).setOrigin(0.5).setAlpha(0.6).setInteractive({ useHandCursor: true });

      t.on('pointerover', () => t.setAlpha(1).setScale(1.1));
      t.on('pointerout', () => t.setAlpha(0.6).setScale(1));
    });
  }

  setupKeyboard() {
    this.input.keyboard.on('keydown-ENTER', () => {
      this.startGame();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.settingsPanel.visible) {
        this.settingsPanel.setVisible(false);
      }
    });
  }

  scrollBackground(delta) {
    this.bgLayer0.tilePositionX += 20 * 0.005 * (delta / 1000);
    this.bgLayer1.tilePositionX += 20 * 0.02  * (delta / 1000);
    this.bgLayer2.tilePositionX += 20 * 0.08  * (delta / 1000);
    this.bgLayer3.tilePositionX += 20 * 0.18  * (delta / 1000);
  }

  startGame() {
    if (this.menuMusic) {
      this.tweens.add({
        targets: this.menuMusic,
        volume: 0,
        duration: 1000,
        onComplete: () => this.menuMusic.stop()
      });
    }

    const flash = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0).setDepth(100);
    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 350,
      ease: 'Sine.easeIn',
      onComplete: () => this.scene.start('GameScene')
    });
  }
}
