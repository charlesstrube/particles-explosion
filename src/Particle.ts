import type { Position, Velocity } from "./types";

export class Particle {

  private lifetime: number = 0;
  private maxLifetime: number = 1000;

  constructor(
    public position: Position,
    private velocity: Velocity = { 
      x: (Math.random() - 0.5) * 10, 
      y: (Math.random() - 0.5) * 10, 
      z: (Math.random() - 0.5) * 10
    }
  ) {
    console.log('velocity', velocity)
    this.position = position;
    this.velocity = velocity;
  }

  // Method to update position based on velocity
  update(deltaTime: number) {
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;
    this.position.z += this.velocity.z * deltaTime / 1000;
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