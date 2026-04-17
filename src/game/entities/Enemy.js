import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    
    this.config = config;
    this.health = config.health;
    this.maxHealth = config.health;
    this.speed = config.speed;
    this.isAlive = true;

    // Use the gork spritesheet
    this.sprite = scene.add.sprite(0, 0, 'enemy_gork').setScale(1.5).setOrigin(0.5, 1.0);
    this.sprite.play('enemy_walk');
    this.add(this.sprite);

    // 5C: Health bars thinner (4px), 18px above, dark border
    this.hpBorder = scene.add.rectangle(0, -115, 42, 6, 0x000000); // Border
    this.hpBg = scene.add.rectangle(0, -115, 40, 4, 0x333333);
    this.hpFill = scene.add.rectangle(-20, -115, 40, 4, 0x22c55e).setOrigin(0, 0.5);
    this.add([this.hpBorder, this.hpBg, this.hpFill]);

    // Store primary visual for damage flashes
    this.rect = this.sprite; 
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setSize(60, 100);
    this.body.setOffset(-30, -100);
  }

  update(delta) {
    if (!this.isAlive) return;

    this.x -= (this.speed * delta) / 1000;

    // Update HP Bar
    this.updateHealthBar();
  }

  updateHealthBar() {
    const pct = Math.max(0, this.health / this.maxHealth);
    this.hpFill.width = 40 * pct;

    if (pct < 0.3) this.hpFill.setFillStyle(0xef4444);
    else if (pct < 0.6) this.hpFill.setFillStyle(0xeab308);
    else this.hpFill.setFillStyle(0x22c55e);
  }

  takeDamage(amount) {
    if (!this.isAlive) return;
    this.health -= amount;
    
    // white flash tween on the rectangle (or sprite in this case)
    this.scene.tweens.add({
      targets: this.rect,
      tint: 0xffffff,
      duration: 60,
      yoyo: true,
      onComplete: () => {
        if (this.rect && this.rect.active) {
          this.rect.clearTint();
        }
      }
    });
    
    // update health bar
    this.updateHealthBar();
    
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    if (!this.isAlive) return;
    this.isAlive = false;
    
    // Stop movement and disable physics
    if (this.body) {
      this.body.enable = false;
    }

    // Hide HP bar
    this.hpBorder.setVisible(false);
    this.hpBg.setVisible(false);
    this.hpFill.setVisible(false);

    // Play death animation
    this.sprite.play('enemy_death');
    
    // 5C: Ember-like particles
    const colors = [0xff4400, 0xff8800];
    for (let i = 0; i < 15; i++) {
      const p = this.scene.add.rectangle(this.x, this.y - 30, 4, 4, colors[Math.floor(Math.random() * 2)]);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 100 + 50;
      
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * dist,
        y: p.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0,
        rotation: 180,
        duration: 800,
        onComplete: () => p.destroy()
      });
    }

    // Destroy after animation or a short delay
    this.sprite.on('animationcomplete', (anim) => {
      if (anim.key === 'enemy_death') {
        this.destroy();
      }
    });

    // Fallback destroy just in case
    this.scene.time.delayedCall(1500, () => {
        if (this.active) this.destroy();
    });
  }
}
