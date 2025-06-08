import type { Position, Velocity } from "./types";

export class Particle {

  private lifetime: number = 0;
  private maxLifetime: number = 1000;
  private velocity: Velocity;
  readonly position: Position;

  constructor(
    x: number,
    y: number,
    z: number,
  ) {
    this.position = { x, y, z };
    const force = 100;

    this.velocity = this.normalizeVelocity(force);
  }

  private normalizeVelocity(force: number) {
    const x = (Math.random() - 0.5) * 2
    const y = (Math.random() - 0.5) * 2
    const z = (Math.random() - 0.5) * 2
    const magnitude = Math.sqrt(
      Math.pow(x, 2) +
      Math.pow(y, 2) +
      Math.pow(z, 2)
    );

    if (magnitude !== 0) {
      return {
        x: (x / magnitude) * force,
        y: (y / magnitude) * force,
        z: (z / magnitude) * force
      }
    }

    
    return {
      x: 0,
      y: 0,
      z: 0
    }
  }

  getPosition() {
    return this.position;
  }

  // Method to update position based on velocity
  update(deltaTime: number) {
    this.position.x += this.velocity.x * (deltaTime / 1000);
    this.position.y += this.velocity.y * (deltaTime / 1000);
    this.position.z += this.velocity.z * (deltaTime / 1000);
    this.lifetime += deltaTime;
  }

  isAlive() {
    return this.lifetime < this.maxLifetime;
  }

  // Method to set velocity
  setVelocity(x: number, y: number, z: number) {
    this.velocity.x = x;
    this.velocity.y = y;
    this.velocity.z = z;
  }

  // Method to add force to velocity
  addForce(x: number, y: number, z: number) {
    this.velocity.x += x;
    this.velocity.y += y;
    this.velocity.z += z;
  }
}