export default class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.distanceTraveled = 0;
    this.phase = 1;
    this.bossActive = false;
    this.bossJustDied = false;
    this.bossesDefeated = 0;

    // Kill-count boss trigger
    // First 5 rounds need 5 kills each; after that 3 kills each round
    this.killCount = 0;
    this._bossQueued = false;

    // Spawn cap — only spawn as many enemies as needed to trigger boss
    this.spawnedThisRound = 0;
    this.totalKills = 0;
  }

  /** Returns the kill threshold for the current round */
  _threshold() {
    return this.bossesDefeated < 5 ? 5 : 3;
  }

  /** Returns true if the spawner is allowed to create another enemy */
  canSpawnEnemy() {
    if (this.bossActive || this.bossJustDied || this._bossQueued) return false;
    return this.spawnedThisRound < this._threshold();
  }

  /** Call this every time a new enemy is actually spawned */
  onEnemySpawned() {
    this.spawnedThisRound++;
  }

  /** Called by GameScene whenever a normal enemy dies */
  onEnemyKilled() {
    this.totalKills++;
    if (this.bossActive || this.bossJustDied || this._bossQueued) return;

    this.killCount++;

    if (this.killCount >= this._threshold()) {
      this.killCount = 0;
      this._bossQueued = true;
      this.bossActive = true;
      this.scene.events.emit('bossApproaching');

      this.scene.time.delayedCall(3000, () => {
        this.scene.events.emit('bossSpawn');
        this._bossQueued = false;
      });
    }
  }

  update(delta, scrollSpeed) {
    this.distanceTraveled += (scrollSpeed * delta) / 1000;
    // Phase still scales by distance for enemy stat purposes
    this.phase = Math.min(5, Math.floor(this.distanceTraveled / 500) + 1);
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
    this.killCount = 0;         // reset kill counter
    this.spawnedThisRound = 0;  // allow fresh enemies next round

    this.scene.time.delayedCall(3000, () => {
      this.bossJustDied = false;
    });
  }
}
