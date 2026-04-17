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
    this.buildSettingsOverlay();
    this.buildVersion();
    this.buildScanlines();
    this.setupKeyboard();
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

    // Drop shadow layer
    this.add.text(643, 203, 'LEXICIDE', {
      fontFamily,
      fontSize: '72px',
      color: '#4b0082'
    }).setOrigin(0.5).setDepth(9);

    // Bloom glow layers
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
      }).setOrigin(0.5).setDepth(9).setAlpha(alpha).setScale(scale);
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
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: titleText,
      y: { from: 200, to: 194 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Tagline
    const subtitle = this.add.text(640, 285, 'TYPE TO SURVIVE', {
      fontFamily,
      fontSize: '13px',
      color: '#9b7dff'
    }).setOrigin(0.5).setDepth(10).setAlpha(0.9);

    this.tweens.add({
      targets: subtitle,
      alpha: { from: 0.9, to: 0.2 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Stepped'
    });
  }

  // ─── Buttons ───────────────────────────────────────────────────────────────

  buildButtons() {
    this._buildPlayButton();      // center x=640
    this._buildSettingsButton();  // right  x=860
    this._buildMuteButton();      // left   x=420
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
    const x = 640, y = 390, w = 220, h = 58;
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
    const x = 860, y = 390, w = 180, h = 58;
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
    const x = 420, y = 390, w = 140, h = 58;
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
      // Propagate mute state if needed
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

    const volLabel = this.add.text(-160, -80, 'VOLUME', {
      fontFamily: "'Press Start 2P'",
      fontSize: '11px',
      color: '#9b7dff'
    });

    const volValue = this.add.text(-160, -52, '100%', {
      fontFamily: "'Press Start 2P'",
      fontSize: '11px',
      color: '#ffffff'
    });

    const resLabel = this.add.text(-160, 10, 'RESOLUTION', {
      fontFamily: "'Press Start 2P'",
      fontSize: '11px',
      color: '#9b7dff'
    });

    const resValue = this.add.text(-160, 38, '1280 x 720', {
      fontFamily: "'Press Start 2P'",
      fontSize: '11px',
      color: '#ffffff'
    });

    const qualLabel = this.add.text(-160, 80, 'PIXEL ART MODE', {
      fontFamily: "'Press Start 2P'",
      fontSize: '11px',
      color: '#9b7dff'
    });

    const qualValue = this.add.text(-160, 108, 'ON', {
      fontFamily: "'Press Start 2P'",
      fontSize: '11px',
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
      volLabel, volValue,
      resLabel, resValue,
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
    this.add.text(20, 705, 'v0.1.0', {
      fontFamily: "'Press Start 2P'",
      fontSize: '9px',
      color: '#443366'
    }).setOrigin(0, 1).setDepth(10).setAlpha(0.7);

    this.add.text(1260, 705, 'MADE WITH CLAUDE + CURSOR', {
      fontFamily: "'Press Start 2P'",
      fontSize: '9px',
      color: '#443366'
    }).setOrigin(1, 1).setDepth(10).setAlpha(0.7);
  }

  // ─── Keyboard ──────────────────────────────────────────────────────────────

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

  // ─── Scroll ────────────────────────────────────────────────────────────────

  scrollBackground(delta) {
    this.bgLayer0.tilePositionX += 20 * 0.005 * (delta / 1000);
    this.bgLayer1.tilePositionX += 20 * 0.02  * (delta / 1000);
    this.bgLayer2.tilePositionX += 20 * 0.08  * (delta / 1000);
    this.bgLayer3.tilePositionX += 20 * 0.18  * (delta / 1000);
  }

  // ─── Start Game ────────────────────────────────────────────────────────────

  startGame() {
    // Brief flash transition
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
