import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.spritesheet('knight_idle', 'assets/sprites/knight_idle.png', {
      frameWidth: 68,
      frameHeight: 68
    });

    this.load.spritesheet('knight_run', 'assets/sprites/knight_run.png', {
      frameWidth: 68,
      frameHeight: 68
    });

    this.load.spritesheet('knight_fireball', 'assets/sprites/knight_fireball.png', {
      frameWidth: 68,
      frameHeight: 68
    });

    this.load.spritesheet('enemy_gork', 'assets/sprites/gork_walking.png', {
      frameWidth: 68,
      frameHeight: 68
    });

    this.load.spritesheet('enemy_death', 'assets/sprites/Grok_death.png', {
      frameWidth: 68,
      frameHeight: 68
    });
  }

  create() {
    this.generateParallaxTextures();
    this.generateEnemyTexture();
    this.generateBossTexture();

    // Register Animations
    this.anims.create({
      key: 'knight_idle',
      frames: this.anims.generateFrameNumbers('knight_idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'knight_run',
      frames: this.anims.generateFrameNumbers('knight_run', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'knight_fireball',
      frames: this.anims.generateFrameNumbers('knight_fireball', { start: 0, end: 5 }),
      frameRate: 14,
      repeat: 0
    });

    this.anims.create({
      key: 'enemy_walk',
      frames: this.anims.generateFrameNumbers('enemy_gork', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy_death',
      frames: this.anims.generateFrameNumbers('enemy_death', { start: 0, end: 8 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'enemy_death',
      frames: this.anims.generateFrameNumbers('enemy_death', { start: 0, end: 8 }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.start('GameScene');
  }

  generateParallaxTextures() {
    // bg0: Deep starfield / distant nebula (Very Far, Static-ish)
    const bg0 = document.createElement('canvas');
    bg0.width = 512; bg0.height = 720;
    const ctx0 = bg0.getContext('2d');
    ctx0.fillStyle = '#010105';
    ctx0.fillRect(0, 0, 512, 720);
    // Nebula glow
    const grad = ctx0.createRadialGradient(256, 300, 50, 256, 300, 300);
    grad.addColorStop(0, '#0a0022');
    grad.addColorStop(1, '#010105');
    ctx0.fillStyle = grad;
    ctx0.fillRect(0, 0, 512, 720);
    // Stars
    ctx0.fillStyle = '#ffffff';
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 720;
      const size = Math.random() * 1.5;
      ctx0.globalAlpha = Math.random() * 0.8;
      ctx0.fillRect(x, y, size, size);
    }
    ctx0.globalAlpha = 1.0;
    this.textures.addCanvas('bg0', bg0);

    // bg1: Far background - distant peaks
    const bg1 = document.createElement('canvas');
    bg1.width = 512; bg1.height = 720;
    const ctx1 = bg1.getContext('2d');
    ctx1.clearRect(0, 0, 512, 720);
    ctx1.fillStyle = '#08081a';
    for (let i = 0; i < 3; i++) {
        let x = i * 200 - 50;
        ctx1.beginPath();
        ctx1.moveTo(x, 720);
        ctx1.lineTo(x + 150, 400);
        ctx1.lineTo(x + 300, 720);
        ctx1.fill();
    }
    this.textures.addCanvas('bg1', bg1);

    // bg2: Mid - gothic distant towers (More detailed)
    const bg2 = document.createElement('canvas');
    bg2.width = 512; bg2.height = 720;
    const ctx2 = bg2.getContext('2d');
    ctx2.clearRect(0, 0, 512, 720);
    ctx2.fillStyle = '#10102a';
    for (let i = 0; i < 6; i++) {
      const tx = Math.random() * 450;
      const tw = 30 + Math.random() * 30;
      const th = 250 + Math.random() * 250;
      const ty = 720 - th;
      
      // Main tower body
      ctx2.fillRect(tx, ty, tw, th);
      
      // Tower details - windows
      ctx2.fillStyle = '#1a1a3a';
      for(let j=0; j<3; j++) {
        ctx2.fillRect(tx + tw/4, ty + 50 + j*60, tw/2, 20);
      }
      ctx2.fillStyle = '#10102a';

      // Spire
      ctx2.beginPath();
      ctx2.moveTo(tx, ty);
      ctx2.lineTo(tx + tw / 2, ty - 60);
      ctx2.lineTo(tx + tw, ty);
      ctx2.fill();
      
      // Spire tip
      ctx2.strokeStyle = '#10102a';
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.moveTo(tx + tw/2, ty - 60);
      ctx2.lineTo(tx + tw/2, ty - 90);
      ctx2.stroke();
    }
    this.textures.addCanvas('bg2', bg2);

    // bg3: Near - detailed ground and rocks
    const bg3 = document.createElement('canvas');
    bg3.width = 512; bg3.height = 250;
    const ctx3 = bg3.getContext('2d');
    ctx3.fillStyle = '#111128';
    ctx3.fillRect(0, 50, 512, 200);
    
    // Jagged surface
    ctx3.fillStyle = '#14142e';
    ctx3.beginPath();
    ctx3.moveTo(0, 250);
    let curX = 0;
    let curY = 60;
    ctx3.lineTo(0, curY);
    while(curX < 512) {
        curX += 20 + Math.random() * 30;
        curY = 50 + Math.random() * 40;
        ctx3.lineTo(curX, curY);
    }
    ctx3.lineTo(512, 250);
    ctx3.fill();

    // Add some rocks
    ctx3.fillStyle = '#0a0a1a';
    for(let i=0; i<4; i++) {
        ctx3.fillRect(Math.random()*480, 150 + Math.random()*50, 10+Math.random()*20, 10+Math.random()*10);
    }
    this.textures.addCanvas('bg3', bg3);

    // bg4: Foreground - Blurred pillars (Very Near)
    const bg4 = document.createElement('canvas');
    bg4.width = 512; bg4.height = 720;
    const ctx4 = bg4.getContext('2d');
    ctx4.clearRect(0, 0, 512, 720);
    ctx4.fillStyle = '#050510';
    for (let i = 0; i < 2; i++) {
      const px = Math.random() * 400;
      const pw = 80 + Math.random() * 80;
      ctx4.globalAlpha = 0.8;
      ctx4.fillRect(px, 0, pw, 720);
      // Gothic arch detail - Clear a hole
      ctx4.globalAlpha = 1.0;
      ctx4.globalCompositeOperation = 'destination-out';
      ctx4.beginPath();
      ctx4.moveTo(px + 15, 600);
      ctx4.lineTo(px + 15, 150);
      ctx4.arc(px + pw/2, 150, (pw-30)/2, Math.PI, 0);
      ctx4.lineTo(px + pw - 15, 600);
      ctx4.fill();
      ctx4.globalCompositeOperation = 'source-over';
    }
    this.textures.addCanvas('bg4', bg4);
  }

  generateEnemyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 40; canvas.height = 60;
    const ctx = canvas.getContext('2d');
    ctx.shadowBlur = 10; ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(0, 0, 40, 60);
    this.textures.addCanvas('enemy_tex', canvas);
  }

  generateBossTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 192; canvas.height = 192;
    const ctx = canvas.getContext('2d');
    
    // Spectral Glow
    ctx.fillStyle = '#9966ff';
    [0.05, 0.1, 0.15].forEach(alpha => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.ellipse(96, 96, 85, 85, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1.0;
    // Cloak
    ctx.fillStyle = '#1a0a2e';
    ctx.beginPath();
    ctx.moveTo(96, 40);
    ctx.lineTo(164, 180);
    // Jagged bottom
    for (let x = 164; x >= 28; x -= 12) {
      ctx.lineTo(x, 180 + (Math.random() * 12 - 6));
    }
    ctx.lineTo(28, 180);
    ctx.closePath();
    ctx.fill();
    
    // Head oval
    ctx.beginPath();
    ctx.ellipse(96, 50, 24, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Glowing eyes
    ctx.shadowBlur = 15; ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(86, 48, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(106, 48, 5, 4, 0, 0, Math.PI * 2); ctx.fill();

    this.textures.addCanvas('boss_texture', canvas);
  }
}
