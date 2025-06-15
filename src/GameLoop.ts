import type { IGameLoop } from "./interfaces";

export class GameLoop implements IGameLoop {
  private isRunning: boolean = false;
  private fpsInterval: number = 0;
  private lastFrameTime: number = 0;

  constructor(
    private _fps: number,
    private onUpdate: (elapsed: number) => void
  ) {
    this.fps = _fps;
  }

  start() {
    this.isRunning = true;
    this.lastFrameTime = Date.now();
    this.loop();
  }

  private loop() {
    if (!this.isRunning) return;

    window.requestAnimationFrame(() => this.loop());

    const now = Date.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed > this.fpsInterval) {
      this.lastFrameTime = now - (elapsed % this.fpsInterval);
      this.onUpdate(elapsed);
    }
  }

  stop() {
    this.isRunning = false;
  }

  set fps(fps: number) {
    this._fps = fps;
    this.fpsInterval = 1000 / fps;
  }
} 