import type { ParticleSchema, ParticleFactorySchema } from "./interfaces";
import { Particle } from "./Particle";

export class DefaultParticleFactory implements ParticleFactorySchema {
  createParticle(x: number, y: number, z: number): ParticleSchema {
    return new Particle(x, y, z);
  }
}

// Exemple d'une autre factory pour des particules différentes
export class FireParticleFactory implements ParticleFactorySchema {
  createParticle(x: number, y: number, z: number): ParticleSchema {
    const particle = new Particle(x, y, z);
    // Personnalisation pour des particules de feu
    particle.setVelocity(0, -200, 0); // Mouvement vers le haut
    return particle;
  }
}

// Exemple d'une factory pour des particules d'eau
export class WaterParticleFactory implements ParticleFactorySchema {
  createParticle(x: number, y: number, z: number): ParticleSchema {
    const particle = new Particle(x, y, z);
    // Personnalisation pour des particules d'eau
    particle.setVelocity(0, 200, 0); // Mouvement vers le bas
    return particle;
  }
} 