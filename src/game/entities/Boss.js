import Phaser from 'phaser';
import StatsBus from '../systems/StatsBus.js';

export default class Boss extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_walk');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    
    // Scale boss to be large and menacing (sprite is 80x80)
    this.setScale(3);
    this.setOrigin(0.5, 1.0);
    this.play('boss_walk');
    
    // Hitbox: sprite is 80x80 unscaled, scaled 3x = 240x240 visually.
    // Phaser body sizes are in unscaled units.
    // Origin is (0.5, 1.0) so offset: left by half width, up by full height.
    this.body.setSize(80, 80);
    this.body.setOffset(-40, -80);
    
    this.maxHealth = 300;
    this.health = 300;
    this.currentStage = 0;
    this.isAlive = true;
    this.isAttacking = false;
    this.speed = 30;

    const names = ["The Hollow Specter", "Wraith of the Void", "The Ashen Sovereign"];
    this.name = names[Math.floor(Math.random() * names.length)];
    
    // Stage thresholds: [300, 200, 100]
    this.stageColors = [0xc0c0ff, 0xff6688, 0xff2200];
    this.setTint(this.stageColors[0]);

    // Hit SFX
    this.hitSound = scene.sound.add('boss_hit_sfx', { volume: 0.7 });
  }

  takeDamage(amount) {
    if (!this.isAlive) return;
    
    this.health -= amount;

    // Play hit SFX if not muted
    if (!StatsBus.muted && this.hitSound && !this.hitSound.isPlaying) {
      this.hitSound.play();
    }
    
    // Flash white on hit
    this.scene.tweens.add({
      targets: this,
      tint: { from: 0xffffff, to: this.stageColors[this.currentStage] },
      duration: 100
    });
    
    // Check stage transition: stages correspond to [0-100], [101-200], [201-300]
    let calculatedStage = 0;
    if (this.health <= 100) calculatedStage = 2;
    else if (this.health <= 200) calculatedStage = 1;

    if (calculatedStage > this.currentStage) {
      this.stageTransition(calculatedStage);
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  stageTransition(stage) {
    this.currentStage = stage;
    this.scene.events.emit('bossStageChange', stage);
    
    // Increase speed by 15%
    this.speed *= 1.15;

    // Pulse animation
    this.scene.tweens.add({
      targets: this,
      scale: 3.5,
      duration: 300,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onStart: () => {
        this.setTint(this.stageColors[stage]);
      }
    });
  }

  update(time, delta) {
    if (!this.isAlive || this.isAttacking) return;

    // Move leftward
    this.x -= (this.speed * delta) / 1000;
  }

  attack() {
    if (!this.isAlive || this.isAttacking) return;
    
    this.isAttacking = true;
    this.play('boss_attack');
    
    // Slide back once the attack finishes
    this.once('animationcomplete-boss_attack', () => {
      if (!this.isAlive) return;
      
      this.scene.tweens.add({
        targets: this,
        x: this.x + 150,
        duration: 300,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          if (this.isAlive) {
            this.isAttacking = false;
            this.play('boss_walk');
          }
        }
      });
    });
  }

  die() {
    if (!this.isAlive) return;
    this.isAlive = false;
    
    // Notify scene
    this.scene.events.emit('bossDied');
    
    // Play death animation
    this.clearTint(); // Optional: remove stage tint so death animation colors are visible 
    this.play('boss_death');

    // "after frame 10 start decreasing the opacity so it fades out at last"
    this.on('animationupdate', (anim, frame) => {
      if (anim.key === 'boss_death') {
        const frameIndex = frame.index; // 1 to 20
        if (frameIndex > 10) {
          this.alpha = 1 - ((frameIndex - 10) / 10);
        }
      }
    });

    this.once('animationcomplete-boss_death', () => {
      this.destroy();
    });
  }
}
