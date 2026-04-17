import StatsBus from '../systems/StatsBus';
import Fireball from './Fireball';

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

    this.maxHealth = 100;
    this.health = 100;
    this.isDead = false;

    // Create a health bar for the Knight
    this.hpBorder = scene.add.rectangle(x, y - 160, 42, 6, 0x000000).setDepth(15);
    this.hpBg = scene.add.rectangle(x, y - 160, 40, 4, 0x333333).setDepth(15);
    this.hpFill = scene.add.rectangle(x - 20, y - 160, 40, 4, 0x22c55e).setOrigin(0, 0.5).setDepth(15);
  }

  returnToMovementAnim() {
    const isTyping = StatsBus.isUserTyping;
    if (isTyping) {
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
    if (this.isDead) return;

    // Switch between idle and run based on WPM
    if (!this.isAttacking) {
      this.returnToMovementAnim();
    }

    // Sync sprite position in case x/y changes
    this.sprite.setPosition(this.x, this.y);
    this.hpBorder.setPosition(this.x, this.y - 160);
    this.hpBg.setPosition(this.x, this.y - 160);
    this.hpFill.setPosition(this.x - 20, this.y - 160);
  }

  updateHealthBar() {
    const pct = Math.max(0, this.health / this.maxHealth);
    this.hpFill.width = 40 * pct;
    
    if (pct < 0.3) this.hpFill.setFillStyle(0xef4444);
    else if (pct < 0.6) this.hpFill.setFillStyle(0xeab308);
    else this.hpFill.setFillStyle(0x22c55e);
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.health -= amount;
    this.updateHealthBar();

    // Play damage sound
    this.scene.sound.play('knight_damage', { volume: StatsBus.sfxVol });

    // Flash red
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        if (this.sprite && this.sprite.active) {
          this.sprite.clearTint();
        }
      }
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;

    // Play death animation
    this.sprite.play('knight_death');

    // Knockback effect (move back a little during the animation)
    this.scene.tweens.add({
      targets: this,
      x: this.x - 120,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
          // Sync remaining visuals while tweening
          this.sprite.setX(this.x);
      }
    });

    // Remove health bar
    this.hpBorder.destroy();
    this.hpBg.destroy();
    this.hpFill.destroy();

    this.scene.cameras.main.shake(500, 0.05);

    // Stop gameplay by emitting an event
    this.scene.events.emit('gameover');
  }

  performAttack(enemyList, bonusDamage = null) {
    const alive = enemyList.filter(e => e.isAlive && e.x > this.x - 50);
    if (!this.scene.bossEncounterActive && alive.length === 0) return;

    alive.sort((a, b) => a.x - b.x);

    const multiplier = StatsBus.comboMultiplier;
    const damage = bonusDamage || (StatsBus.attackPower * multiplier);

    // Play fireball animation on attack
    this.isAttacking = true;
    this.currentAnim = 'knight_fireball';
    this.sprite.play('knight_fireball');

    const spawnFireball = (target) => {
        const fb = new Fireball(this.scene, this.x - 20, this.y - 70, target, damage, multiplier);
        this.scene.projectiles.add(fb);
    };

    // If boss is active, fireball always hits boss
    if (this.scene.bossEncounterActive && this.scene.activeBoss) {
        spawnFireball(this.scene.activeBoss);
        return;
    }

    // Apply damage to enemies based on combo multiplier
    if (multiplier >= 3.0) {
      alive.forEach(e => spawnFireball(e));
    } else if (multiplier >= 2.0) {
      alive.slice(0, 2).forEach(e => spawnFireball(e));
    } else {
      spawnFireball(alive[0]);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
