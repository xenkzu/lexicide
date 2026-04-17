import Phaser from 'phaser';

export default class Fireball extends Phaser.GameObjects.Container {
  constructor(scene, x, y, target, damage, multiplier) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.target = target;
    this.damage = damage;
    this.multiplier = multiplier;
    this.speed = 1000;
    this.isHit = false;

    this.setDepth(20);

    // --- Procedural Plasma Visuals ---
    
    // 1. Core Glow (Central bright circle)
    this.core = scene.add.circle(0, 0, 8, 0xffffff, 1);
    this.add(this.core);

    // 2. Plasma Pulse (Outer glowing ring)
    this.pulse = scene.add.circle(0, 0, 10, 0x00ffff, 0.4);
    this.add(this.pulse);

    // 3. Lightning Arcs & Flares (Random graphics lines)
    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    // 4. Trail Effect (Particles)
    this.particles = scene.add.particles(0, 0, 'enemy_tex', {
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.6, end: 0 },
        tint: 0x00ffff,
        speed: 50,
        blendMode: 'ADD',
        lifespan: 300,
        frequency: 20
    });
    this.add(this.particles);

    // Animation Tweens for procedural effect
    scene.tweens.add({
      targets: this.pulse,
      scale: 1.5,
      alpha: 0.2,
      duration: 150,
      yoyo: true,
      repeat: -1
    });

    scene.tweens.add({
        targets: this.core,
        scale: 1.2,
        duration: 80,
        yoyo: true,
        repeat: -1
    });

    // Physics configuration
    this.body.setAllowGravity(false);
    this.body.setVelocityX(this.speed);
    this.body.setSize(40, 40);
    this.body.setOffset(-20, -20);
  }

  update(delta) {
    if (this.isHit) return;

    // Draw random lightning arcs & flares every frame
    this.graphics.clear();
    
    // Lightning Arcs (Smaller)
    this.graphics.lineStyle(2, 0x00ffff, 0.8);
    for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = 12 + Math.random() * 8;
        this.graphics.beginPath();
        this.graphics.moveTo(0, 0);
        
        // Midpoint for jagged look
        const midX = Math.cos(angle) * (length/2) + (Math.random() * 6 - 3);
        const midY = Math.sin(angle) * (length/2) + (Math.random() * 6 - 3);
        
        this.graphics.lineTo(midX, midY);
        this.graphics.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        this.graphics.strokePath();
    }

    // Electric Flares (Thicker, brighter, but SMALLER bursts)
    this.graphics.lineStyle(3, 0xffffff, 0.9);
    for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = 6 + Math.random() * 6;
        this.graphics.beginPath();
        this.graphics.moveTo(Math.cos(angle) * 4, Math.sin(angle) * 4);
        this.graphics.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        this.graphics.strokePath();
    }

    // Out of bounds
    if (this.x > 1400) {
      this.destroy();
    }
  }

  handleHit(newTarget = null) {
    if (this.isHit) return;
    this.isHit = true;

    const actualTarget = newTarget || this.target;

    // Blast Visual Effect
    this.graphics.clear();
    this.graphics.lineStyle(4, 0xffffff, 1);
    this.graphics.strokeCircle(0, 0, 30);

    const flash = this.scene.add.circle(this.x, this.y, 30, 0x00ffff, 0.6).setDepth(30);
    this.scene.tweens.add({
        targets: flash,
        scale: 1.5,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy()
    });

    if (actualTarget && actualTarget.active && actualTarget.isAlive) {
        actualTarget.takeDamage(this.damage);
        this.scene.showDamageNumber(actualTarget.x, actualTarget.y, this.damage, this.multiplier);
    }
    
    this.destroy();
  }

  destroy() {
    if (this.particles) this.particles.destroy();
    super.destroy();
  }
}
