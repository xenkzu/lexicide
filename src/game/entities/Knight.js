import StatsBus from '../systems/StatsBus';

export default class Knight {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isAttacking = false;
    this.currentAnim = 'knight_idle';

    // Create the sprite using the loaded spritesheet
    this.sprite = scene.add.sprite(x, y, 'knight_idle')
      .setOrigin(0.5, 1.0)   // origin at feet so it sits on platform correctly
      .setDepth(5)
      .setScale(2.0);         // scale up from 68px to ~136px for visibility

    // Play idle by default
    this.sprite.play('knight_idle');

    // Listen for animation complete to return to correct state
    this.sprite.on('animationcomplete', (anim) => {
      if (anim.key === 'knight_fireball') {
        this.isAttacking = false;
        this.returnToMovementAnim();
      }
    });
  }

  returnToMovementAnim() {
    const wpm = StatsBus.wpm;
    if (wpm > 30) {
      this.playAnim('knight_run');
    } else {
      this.playAnim('knight_idle');
    }
  }

  playAnim(key) {
    if (this.currentAnim !== key) {
      this.currentAnim = key;
      this.sprite.play(key);
    }
  }

  update(delta) {
    // Switch between idle and run based on WPM
    if (!this.isAttacking) {
      this.returnToMovementAnim();
    }

    // Sync sprite position in case x/y changes
    this.sprite.setPosition(this.x, this.y);
  }

  performAttack(enemyList) {
    const alive = enemyList.filter(e => e.isAlive && e.x > this.x - 50);
    if (alive.length === 0) return;

    alive.sort((a, b) => a.x - b.x);

    const multiplier = StatsBus.comboMultiplier;
    const damage = StatsBus.attackPower;

    // Play fireball animation on attack
    this.isAttacking = true;
    this.currentAnim = 'knight_fireball';
    this.sprite.play('knight_fireball');

    // Apply damage based on combo multiplier
    if (multiplier >= 3.0) {
      alive.forEach(e => {
        e.takeDamage(damage);
        this.scene.showDamageNumber(e.x, e.y, damage, multiplier);
      });
    } else if (multiplier >= 2.0) {
      alive.slice(0, 2).forEach(e => {
        e.takeDamage(damage);
        this.scene.showDamageNumber(e.x, e.y, damage, multiplier);
      });
    } else {
      const e = alive[0]; // Fixed a small typo 'e = alive[0]' -> 'const e = alive[0]'
      e.takeDamage(damage);
      this.scene.showDamageNumber(e.x, e.y, damage, multiplier);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
