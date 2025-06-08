import type { Position, Velocity, Turbulence } from "./types";

export class Particle {

  private lifetime: number = 0;
  private maxLifetime: number = 3000;
  private velocity: Velocity;
  readonly position: Position;
  private turbulence: Turbulence;
  private turbulenceStrength: number;
  private turbulenceFrequency: number;
  private turbulencePhase: number;

  constructor(
    x: number,
    y: number,
    z: number,
  ) {
    this.position = { x, y, z };
    const force = 100;

    this.velocity = this.normalizeVelocity(force);
    this.turbulence = { x: 0, y: 0, z: 0 };
    
    // Paramètres de turbulence aléatoires pour chaque particule
    this.turbulenceStrength = 5 + Math.random() * 10; // Entre 5 et 15
    this.turbulenceFrequency = 0.5 + Math.random() * 1.5; // Entre 0.5 et 2
    this.turbulencePhase = Math.random() * Math.PI * 2; // Phase aléatoire entre 0 et 2π
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

  private updateTurbulence() {
    // Utiliser le temps comme seed pour la turbulence, avec une phase aléatoire
    const time = (this.lifetime * this.turbulenceFrequency) + this.turbulencePhase;
    
    // Générer des valeurs de turbulence avec une fonction de bruit
    this.turbulence = {
      x: (Math.sin(time) + Math.sin(time * 1.7)) * this.turbulenceStrength,
      y: (Math.sin(time * 1.3) + Math.sin(time * 2.1)) * this.turbulenceStrength,
      z: (Math.sin(time * 1.1) + Math.sin(time * 1.9)) * this.turbulenceStrength
    };
  }

  // Method to update position based on velocity
  update(deltaTime: number) {
    this.updateTurbulence();
    
    // Appliquer la turbulence à la vélocité
    this.velocity.x += this.turbulence.x;
    this.velocity.y += this.turbulence.y;
    this.velocity.z += this.turbulence.z;

    // Mettre à jour la position
    this.position.x += this.velocity.x * (deltaTime / 1000);
    this.position.y += this.velocity.y * (deltaTime / 1000);
    this.position.z += this.velocity.z * (deltaTime / 1000);
    
    this.lifetime += deltaTime;
  }

  isAlive() {
    return this.lifetime < this.maxLifetime;
  }

  lifeTimePercentage() {
    return this.lifetime / this.maxLifetime;
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