import Phaser from 'phaser';

export default class Boss extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_texture');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    
    this.setScale(1.2);
    this.maxHealth = 300;
    this.health = 300;
    this.currentStage = 0;
    this.isAlive = true;
    this.speed = 30;

    const names = ["The Hollow Specter", "Wraith of the Void", "The Ashen Sovereign"];
    this.name = names[Math.floor(Math.random() * names.length)];
    
    // Stage thresholds: [300, 200, 100]
    this.stageColors = [0xc0c0ff, 0xff6688, 0xff2200];
    this.setTint(this.stageColors[0]);
  }

  takeDamage(amount) {
    if (!this.isAlive) return;
    
    this.health -= amount;
    
    // Check stage transition: stages correspond to [0-100], [101-200], [201-300]
    // 300hp -> stage 0
    // 200hp -> transition to stage 1
    // 100hp -> transition to stage 2
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
      scale: 1.5,
      duration: 300,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onStart: () => {
        this.setTint(this.stageColors[stage]);
      }
    });
  }

  update(time, delta) {
    if (!this.isAlive) return;

    // Move leftward
    this.x -= (this.speed * delta) / 1000;

    // Pulse/flicker alpha
    this.alpha = 0.875 + (Math.sin(time / 200) * 0.125);

    // Subtle hover
    this.y += Math.sin(time / 600) * 1.5;
  }

  die() {
    this.isAlive = false;
    
    // Notify scene
    this.scene.events.emit('bossDied');

    // Scale down and fade
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 800,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
