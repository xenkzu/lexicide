export default class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.distanceTraveled = 0;
    this.phase = 1;
    this.bossActive = false;
    this.bossJustDied = false;
    this.bossesDefeated = 0;
  }

  update(delta, scrollSpeed) {
    // Increase distance based on current scroll speed
    this.distanceTraveled += (scrollSpeed * delta) / 1000;

    // Phase scaling
    this.phase = Math.min(5, Math.floor(this.distanceTraveled / 500) + 1);

    // Boss spawning logic
    const BOSS_INTERVAL = 2500;
    const nextBossAt = (this.bossesDefeated + 1) * BOSS_INTERVAL;

    if (this.distanceTraveled >= nextBossAt && !this.bossActive && !this.bossJustDied) {
      this.bossActive = true;
      this.scene.events.emit('bossApproaching'); // triggers warning sequence
      
      this.scene.time.delayedCall(3000, () => {
        this.scene.events.emit('bossSpawn');
      });
    }
  }

  getCurrentPhase() {
    return this.phase;
  }

  getEnemyConfig() {
    const baseHealth = 30;
    const baseSpeed = 60;
    const baseSpawnInterval = 3000;
    const m = this.phase - 1;

    return {
      health: Math.round(baseHealth * Math.pow(1.2, m)),
      speed: Math.round(baseSpeed * Math.pow(1.15, m)),
      spawnInterval: Math.max(800, baseSpawnInterval - (m * 400))
    };
  }

  onBossDied() {
    this.bossActive = false;
    this.bossJustDied = true;
    this.bossesDefeated++;
    
    // Grant bonus
    // This will be handled in GameScene listener to keep it centralized
    
    this.scene.time.delayedCall(3000, () => {
      this.bossJustDied = false;
    });
  }
}
