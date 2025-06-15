import { Particle } from "./Particle"
import type { IParticle, IParticleEngine } from "./interfaces"

export class ParticleEngine implements IParticleEngine {

  private _particles: IParticle[] = []

  get particles(): IParticle[] {
    return this._particles
  }

  spawnParticles(x: number, y: number, z: number, amount: number): void {
    for (let i = 0; i < amount; i++) {
      this._particles.push(new Particle(x, y, z))
    }
  }

  update(deltaTime: number): void {
    this._particles = this._particles.filter((particle) => {
      particle.update(deltaTime)
      return particle.isAlive()
    })
  }

  sortParticles(): void {
    this._particles.sort((a, b) => b.position.z - a.position.z)
  }
}