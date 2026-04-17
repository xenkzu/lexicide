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

    this.load.spritesheet('boss_walk', 'assets/sprites/final_gork_walking.png', {
      frameWidth: 80,
      frameHeight: 80
    });

    this.load.spritesheet('boss_death', 'assets/sprites/final_gork_death.png', {
      frameWidth: 80,
      frameHeight: 80
    });

    this.load.spritesheet('boss_attack', 'assets/sprites/finalboss_attack.png', {
      frameWidth: 80,
      frameHeight: 80
    });

    // Audio
    this.load.audio('launch_sfx', 'assets/audio/launch.mp3');
    this.load.audio('boss_hit_sfx', 'assets/audio/makabhosda_aag.mp3');
    this.load.audio('gameplay_music', 'assets/audio/gameplay_music.mp3');
    this.load.audio('menu_music', 'assets/audio/loop background.mp3');
    this.load.audio('impact_sfx', 'assets/audio/impact.mp3');
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
      key: 'boss_walk',
      frames: this.anims.generateFrameNumbers('boss_walk', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'boss_death',
      frames: this.anims.generateFrameNumbers('boss_death', { start: 0, end: 19 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'boss_attack',
      frames: this.anims.generateFrameNumbers('boss_attack', { start: 0, end: 11 }),
      frameRate: 16,
      repeat: 0
    });

    // Wait for local 'Press Start 2P' to be ready
    document.fonts.ready.then(() => {
      // Small extra safety buffer for Electron rendering
      this.time.delayedCall(100, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  generateParallaxTextures() {

    // ── bg0: Deep Cosmic Space ────────────────────────────────────────────────
    {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 720;
      const ctx = canvas.getContext('2d');

      // Deep space gradient base
      const base = ctx.createLinearGradient(0, 0, 0, 720);
      base.addColorStop(0,   '#000009');
      base.addColorStop(0.4, '#010118');
      base.addColorStop(0.8, '#020120');
      base.addColorStop(1,   '#030025');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, 512, 720);

      // 5 layered nebula clouds with different hues
      [
        { x:  90, y: 180, rx: 210, ry: 130, r:  80, g:   0, b: 150 },
        { x: 390, y: 150, rx: 160, ry: 110, r:   0, g:  40, b: 130 },
        { x: 256, y: 510, rx: 270, ry:  90, r: 110, g:   0, b:  90 },
        { x: 460, y: 370, rx: 140, ry: 170, r:   0, g:  60, b:  90 },
        { x:  60, y: 560, rx: 180, ry:  80, r:  70, g:   0, b: 110 },
      ].forEach(n => {
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.scale(n.rx / 200, n.ry / 200);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
        g.addColorStop(0,   `rgba(${n.r},${n.g},${n.b},0.24)`);
        g.addColorStop(0.5, `rgba(${n.r},${n.g},${n.b},0.09)`);
        g.addColorStop(1,   `rgba(${n.r},${n.g},${n.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Milky Way diagonal haze band
      const mw = ctx.createLinearGradient(0, 720, 512, 0);
      mw.addColorStop(0,    'rgba(80,60,120,0)');
      mw.addColorStop(0.35, 'rgba(80,60,120,0.07)');
      mw.addColorStop(0.5,  'rgba(110,85,170,0.12)');
      mw.addColorStop(0.65, 'rgba(80,60,120,0.07)');
      mw.addColorStop(1,    'rgba(80,60,120,0)');
      ctx.fillStyle = mw;
      ctx.fillRect(0, 0, 512, 720);

      // 450 stars — varied sizes and tints
      const sCols = ['#ffffff','#ffffd8','#eeeeff','#ffeeff','#ddeeff','#ffd0ff'];
      for (let i = 0; i < 450; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 720;
        const r = Math.random();
        const size = r < 0.70 ? 0.5 : r < 0.93 ? 1 : r < 0.99 ? 1.5 : 2.2;
        ctx.globalAlpha = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = sCols[Math.floor(Math.random() * sCols.length)];
        if (size < 1.5) {
          ctx.fillRect(x, y, size, size);
        } else {
          const sg = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
          sg.addColorStop(0, 'rgba(255,255,255,1)');
          sg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
          ctx.fill();
          // 4-point diffraction spike on brightest stars
          if (size > 2) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y);
            ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6);
            ctx.stroke();
          }
        }
      }

      // 3 star clusters
      for (let cl = 0; cl < 3; cl++) {
        const cx = 60 + Math.random() * 400;
        const cy = 60 + Math.random() * 580;
        for (let s = 0; s < 28; s++) {
          const a = Math.random() * Math.PI * 2;
          const d = Math.random() * 38;
          ctx.globalAlpha = 0.2 + Math.random() * 0.5;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0.8, 0.8);
        }
      }

      // 4 shooting star streaks
      for (let i = 0; i < 4; i++) {
        const sx = Math.random() * 380;
        const sy = Math.random() * 280;
        const len = 28 + Math.random() * 60;
        const sg = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.28);
        sg.addColorStop(0, 'rgba(255,255,255,0)');
        sg.addColorStop(0.5, 'rgba(255,255,255,0.55)');
        sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy + len * 0.28);
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
      this.textures.addCanvas('bg0', canvas);
    }

    // ── bg1: Distant atmospheric mountain ranges ───────────────────────────
    {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 720);

      // 4 mountain range silhouettes from far (light) to near (dark)
      const ranges = [
        { pts: [360,300,380,280,350,330,310,290,370,260,340,310,360,295,370,280,350], col: '#0b0b25', alpha: 0.55 },
        { pts: [400,330,420,310,390,360,350,320,410,295,370,340,400,320,420,310,395], col: '#0d0d28', alpha: 0.70 },
        { pts: [440,360,460,335,430,390,390,350,450,320,410,370,445,350,460,338,440], col: '#10102a', alpha: 0.85 },
        { pts: [490,400,510,370,480,430,440,385,500,355,460,410,490,390,510,372,490], col: '#12122e', alpha: 0.95 },
      ];

      ranges.forEach(range => {
        ctx.globalAlpha = range.alpha;
        ctx.fillStyle = range.col;
        ctx.beginPath();
        const segW = 512 / (range.pts.length - 1);
        ctx.moveTo(0, 720);
        ctx.lineTo(0, 720 - range.pts[0]);
        for (let i = 1; i < range.pts.length; i++) {
          const px = i * segW;
          const py = 720 - range.pts[i];
          const ppx = (i - 1) * segW;
          const ppy = 720 - range.pts[i - 1];
          ctx.quadraticCurveTo(ppx + segW * 0.5, ppy, px, py);
        }
        ctx.lineTo(512, 720);
        ctx.closePath();
        ctx.fill();

        // Snow caps on each peak
        const maxH = Math.max(...range.pts);
        range.pts.forEach((h, i) => {
          if (h >= maxH - 25) {
            const px = i * segW;
            const py = 720 - h;
            ctx.fillStyle = 'rgba(200,200,230,0.12)';
            ctx.beginPath();
            ctx.moveTo(px - 22, py + 22);
            ctx.lineTo(px, py - 2);
            ctx.lineTo(px + 22, py + 22);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = range.col;
          }
        });
      });

      // Ground fog band
      for (let fy = 520; fy < 720; fy += 20) {
        const fa = ((fy - 520) / 200) * 0.18;
        ctx.globalAlpha = fa;
        ctx.fillStyle = '#0e0e24';
        ctx.fillRect(0, fy, 512, 22);
      }

      ctx.globalAlpha = 1.0;
      this.textures.addCanvas('bg1', canvas);
    }

    // ── bg2: Highly detailed Gothic castle skyline ─────────────────────────
    {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 720);

      const drawTower = (tx, tw, th, detail) => {
        const baseY = 720;
        // Main tower body
        ctx.fillStyle = '#10102a';
        ctx.fillRect(tx, baseY - th, tw, th);

        // Stone texture — faint horizontal mortar lines
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let sy = baseY - th + 20; sy < baseY; sy += 28) {
          ctx.beginPath();
          ctx.moveTo(tx + 1, sy);
          ctx.lineTo(tx + tw - 1, sy);
          ctx.stroke();
        }
        // Vertical stone joints (offset per row)
        for (let sy = baseY - th + 6; sy < baseY; sy += 28) {
          const offset = ((sy / 28) % 2 === 0) ? 0 : tw / 3;
          for (let sx = tx + offset; sx < tx + tw; sx += tw / 3) {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx, sy + 22);
            ctx.stroke();
          }
        }

        // Battlements (crenellations) at tower top
        const mw = Math.max(5, Math.floor(tw / 5));
        const mh = 10;
        for (let mx = tx; mx < tx + tw; mx += mw * 2) {
          ctx.fillStyle = '#10102a';
          ctx.fillRect(mx, baseY - th - mh, Math.min(mw, tx + tw - mx), mh);
        }

        if (detail) {
          // Gothic arched windows
          const numW = Math.max(1, Math.floor(th / 80));
          for (let wi = 0; wi < numW; wi++) {
            const wy = baseY - th + 35 + wi * 72;
            const ww = Math.max(7, tw * 0.38);
            const wh = 24;
            const wx = tx + (tw - ww) / 2;
            // Dark window interior
            ctx.fillStyle = '#070714';
            ctx.fillRect(wx, wy + wh * 0.45, ww, wh * 0.55);
            ctx.beginPath();
            ctx.arc(wx + ww / 2, wy + wh * 0.45, ww / 2, Math.PI, 0);
            ctx.fill();
            // Warm glow for some windows
            if (Math.random() < 0.35) {
              ctx.fillStyle = `rgba(255,210,90,${0.07 + Math.random() * 0.13})`;
              ctx.fillRect(wx + 1, wy + wh * 0.45, ww - 2, wh * 0.55);
              ctx.beginPath();
              ctx.arc(wx + ww / 2, wy + wh * 0.45, ww / 2 - 1, Math.PI, 0);
              ctx.fill();
            }
            // Window tracery divider
            ctx.strokeStyle = 'rgba(16,16,42,0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(wx + ww / 2, wy + wh * 0.45);
            ctx.lineTo(wx + ww / 2, wy + wh);
            ctx.stroke();
          }

          // Pointed Gothic spire
          const spireH = tw * 1.9;
          ctx.fillStyle = '#0d0d24';
          ctx.beginPath();
          ctx.moveTo(tx, baseY - th);
          ctx.lineTo(tx + tw / 2, baseY - th - spireH);
          ctx.lineTo(tx + tw, baseY - th);
          ctx.closePath();
          ctx.fill();
          // Spire edge highlight
          ctx.strokeStyle = 'rgba(80,60,160,0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tx, baseY - th);
          ctx.lineTo(tx + tw / 2, baseY - th - spireH);
          ctx.lineTo(tx + tw, baseY - th);
          ctx.stroke();

          // Finial ball + cross at spire tip
          const tipY = baseY - th - spireH;
          ctx.fillStyle = 'rgba(255,255,255,0.09)';
          ctx.beginPath();
          ctx.arc(tx + tw / 2, tipY - 4, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.13)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(tx + tw / 2, tipY - 14);
          ctx.lineTo(tx + tw / 2, tipY - 1);
          ctx.moveTo(tx + tw / 2 - 5, tipY - 9);
          ctx.lineTo(tx + tw / 2 + 5, tipY - 9);
          ctx.stroke();

          // Subtle purple glow at spire tip
          const sg = ctx.createRadialGradient(tx + tw / 2, tipY, 0, tx + tw / 2, tipY, 50);
          sg.addColorStop(0, 'rgba(120,70,240,0.10)');
          sg.addColorStop(1, 'rgba(120,70,240,0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(tx + tw / 2, tipY, 50, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Simple tapered spire for minor towers
          const spireH = tw * 1.4;
          ctx.fillStyle = '#0d0d24';
          ctx.beginPath();
          ctx.moveTo(tx, 720 - th);
          ctx.lineTo(tx + tw / 2, 720 - th - spireH);
          ctx.lineTo(tx + tw, 720 - th);
          ctx.closePath();
          ctx.fill();
        }
      };

      // 11 towers — fixed positions for consistent look
      const towers = [
        { x: -8,  w: 44, h: 370, d: true  },
        { x: 44,  w: 26, h: 240, d: false },
        { x: 80,  w: 54, h: 450, d: true  },
        { x: 144, w: 20, h: 190, d: false },
        { x: 174, w: 38, h: 310, d: true  },
        { x: 224, w: 62, h: 510, d: true  }, // tallest — central
        { x: 298, w: 24, h: 210, d: false },
        { x: 332, w: 46, h: 385, d: true  },
        { x: 388, w: 28, h: 255, d: false },
        { x: 426, w: 50, h: 425, d: true  },
        { x: 488, w: 32, h: 290, d: false },
      ];
      towers.forEach(t => drawTower(t.x, t.w, t.h, t.d));

      // Flying buttresses connecting major tower pairs
      ctx.lineWidth = 5;
      const buttresses = [
        [towers[0], towers[2]],
        [towers[4], towers[5]],
        [towers[7], towers[9]],
      ];
      buttresses.forEach(([a, b]) => {
        const ax = a.x + a.w;
        const ay = 720 - a.h * 0.68;
        const bx = b.x;
        const by = 720 - b.h * 0.62;
        ctx.strokeStyle = '#0e0e28';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo((ax + bx) / 2, Math.min(ay, by) - 28, bx, by);
        ctx.stroke();
        // Inner arch shadow line
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo((ax + bx) / 2, Math.min(ay, by) - 28, bx, by);
        ctx.stroke();
      });

      // Atmospheric glow behind tallest tower
      const tall = towers[5];
      const cg = ctx.createRadialGradient(
        tall.x + tall.w / 2, 720 - tall.h - 30, 10,
        tall.x + tall.w / 2, 720 - tall.h - 30, 130
      );
      cg.addColorStop(0, 'rgba(100,60,220,0.13)');
      cg.addColorStop(1, 'rgba(100,60,220,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(tall.x + tall.w / 2, 720 - tall.h - 30, 130, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas('bg2', canvas);
    }

    // ── bg3: Detailed ground — cobblestones, rocks, rubble, dead grass ─────
    {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 250;
      const ctx = canvas.getContext('2d');

      // Ground gradient base
      const gg = ctx.createLinearGradient(0, 0, 0, 250);
      gg.addColorStop(0,   '#18183e');
      gg.addColorStop(0.3, '#121230');
      gg.addColorStop(1,   '#0a0a1e');
      ctx.fillStyle = gg;
      ctx.fillRect(0, 0, 512, 250);

      // Layered jagged terrain silhouettes
      const drawTerrain = (pts, col, a) => {
        ctx.globalAlpha = a;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(0, 250);
        const segW = 512 / (pts.length - 1);
        ctx.lineTo(0, pts[0]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(i * segW, pts[i]);
        }
        ctx.lineTo(512, 250);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
      };
      const rp = (n, lo, hi) => Array.from({ length: n }, () => lo + Math.random() * (hi - lo));
      drawTerrain(rp(22, 50, 90),  '#14142e', 1.0);
      drawTerrain(rp(22, 58, 98),  '#111128', 0.85);
      drawTerrain(rp(22, 66, 106), '#0e0e22', 0.65);

      // Cobblestone path strip
      ctx.fillStyle = '#1c1c3c';
      ctx.fillRect(0, 96, 512, 44);
      ctx.fillStyle = '#191934';
      for (let cy = 102; cy < 140; cy += 14) {
        ctx.fillRect(0, cy, 512, 2);
      }
      for (let cx = 0; cx < 512; cx += 18) {
        const off = (Math.floor(cx / 18) % 2 === 0) ? 0 : 9;
        ctx.fillStyle = '#141430';
        ctx.fillRect(cx, 96 + off % 14, 1, 14);
      }
      // Edge lip of path
      ctx.fillStyle = '#22224a';
      ctx.fillRect(0, 96, 512, 2);
      ctx.fillStyle = '#0d0d22';
      ctx.fillRect(0, 138, 512, 2);

      // Rocks with radial gradient shading and drop shadows
      const rocks = [
        { x:  45, y:  76, rw: 20, rh: 13 },
        { x: 125, y:  68, rw: 13, rh:  9 },
        { x: 205, y:  82, rw: 28, rh: 16 },
        { x: 310, y:  72, rw: 17, rh: 11 },
        { x: 370, y:  78, rw: 24, rh: 14 },
        { x: 455, y:  70, rw: 15, rh: 10 },
        { x:  88, y:  86, rw:  9, rh:  7 },
        { x: 265, y:  80, rw: 11, rh:  8 },
        { x: 430, y:  86, rw:  8, rh:  6 },
        { x: 170, y:  70, rw: 12, rh:  8 },
        { x: 490, y:  80, rw: 10, rh:  7 },
      ];
      rocks.forEach(r => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(r.x + 3, r.y + r.rh + 3, r.rw / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rock body
        const rg = ctx.createRadialGradient(r.x - r.rw * 0.2, r.y - r.rh * 0.2, 1, r.x, r.y, r.rw * 0.7);
        rg.addColorStop(0, '#272748');
        rg.addColorStop(1, '#0c0c20');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.rw / 2, r.rh / 2, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.ellipse(r.x - r.rw * 0.15, r.y - r.rh * 0.12, r.rw / 5, r.rh / 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dead grass tufts
      for (let gx = 4; gx < 512; gx += 12 + Math.random() * 16) {
        const gy = 58 + Math.random() * 28;
        const blades = 2 + Math.floor(Math.random() * 4);
        for (let b = 0; b < blades; b++) {
          const bx = gx + (Math.random() - 0.5) * 9;
          const len = 7 + Math.random() * 11;
          ctx.strokeStyle = `rgba(32,32,60,${0.5 + Math.random() * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(bx, gy);
          ctx.quadraticCurveTo(
            bx + (Math.random() - 0.5) * 7, gy - len * 0.5,
            bx + (Math.random() - 0.5) * 9, gy - len
          );
          ctx.stroke();
        }
      }

      // Scattered rubble / broken stone chips
      for (let d = 0; d < 24; d++) {
        const dx = Math.random() * 512;
        const dy = 85 + Math.random() * 28;
        const dw = 3 + Math.random() * 9;
        const dh = 2 + Math.random() * 5;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate((Math.random() - 0.5) * 1.2);
        ctx.fillStyle = '#18183a';
        ctx.fillRect(-dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      this.textures.addCanvas('bg3', canvas);
    }

    // ── bg4: Ornate Gothic foreground arch pillars ─────────────────────────
    {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 720);

      const drawArch = (px, pw, alpha) => {
        ctx.globalAlpha = alpha;

        // Pillar body
        ctx.fillStyle = '#060614';
        ctx.fillRect(px, 0, pw, 720);

        // Stone mortar lines
        ctx.strokeStyle = 'rgba(255,255,255,0.025)';
        ctx.lineWidth = 1;
        for (let sy = 30; sy < 720; sy += 28) {
          ctx.beginPath();
          ctx.moveTo(px + 2, sy);
          ctx.lineTo(px + pw - 2, sy);
          ctx.stroke();
        }

        // Edge highlight (pillar has a lit left/right edge)
        const eg = ctx.createLinearGradient(px, 0, px + pw, 0);
        eg.addColorStop(0,    'rgba(255,255,255,0.06)');
        eg.addColorStop(0.12, 'rgba(255,255,255,0.01)');
        eg.addColorStop(0.88, 'rgba(255,255,255,0.01)');
        eg.addColorStop(1,    'rgba(255,255,255,0.06)');
        ctx.fillStyle = eg;
        ctx.fillRect(px, 0, pw, 720);

        // Cut out the pointed arch opening
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1.0;
        const archBaseY = 340;
        const archH     = 310;
        const innerW    = pw - 22;
        const innerX    = px + 11;
        ctx.beginPath();
        ctx.rect(innerX, archBaseY, innerW, 720 - archBaseY);
        ctx.fill();
        // Pointed arch top crown
        ctx.beginPath();
        ctx.moveTo(innerX, archBaseY);
        ctx.quadraticCurveTo(innerX, archBaseY - archH * 0.62, px + pw / 2, archBaseY - archH);
        ctx.quadraticCurveTo(innerX + innerW, archBaseY - archH * 0.62, innerX + innerW, archBaseY);
        ctx.lineTo(innerX, archBaseY);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;

        // Decorative tracery lines inside arch opening (draws over game scene)
        const cx = px + pw / 2;
        const tipY = archBaseY - archH;
        ctx.strokeStyle = `rgba(8,8,28,${alpha * 0.7})`;
        ctx.lineWidth = 1.5;
        // Central stem
        ctx.beginPath();
        ctx.moveTo(cx, archBaseY - 20);
        ctx.lineTo(cx, tipY + 40);
        ctx.stroke();
        // Trefoil circle
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, archBaseY - archH * 0.38, innerW * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        // Two sub-trefoils
        ctx.beginPath();
        ctx.arc(cx - innerW * 0.16, archBaseY - archH * 0.22, innerW * 0.12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + innerW * 0.16, archBaseY - archH * 0.22, innerW * 0.12, 0, Math.PI * 2);
        ctx.stroke();

        // Capital band (decorative) just above arch opening
        ctx.fillStyle = `rgba(6,6,20,${alpha})`;
        ctx.fillRect(px, archBaseY - 12, pw, 12);
        // Keystone block carved detail
        ctx.fillStyle = `rgba(255,255,255,0.03)`;
        ctx.fillRect(cx - 8, archBaseY - 18, 16, 18);

        ctx.globalAlpha = 1.0;
      };

      drawArch( -18, 110, 0.88);
      drawArch( 204,  96, 0.78);
      drawArch( 428, 108, 0.88);

      this.textures.addCanvas('bg4', canvas);
    }

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
