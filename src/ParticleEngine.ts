import { Particle } from "./Particle"

export class ParticleEngine {

  public particles: Particle[] = []

  constructor(public width: number, public height: number) {}

  spawnParticles(x: number, y: number, z: number, amount: number) {
    for (let i = 0; i < amount; i++) {
      this.particles.push(new Particle(x, y, z))
    }
  }

  update(deltaTime: number) {
    this.particles = this.particles.filter((particle) => {
      particle.update(deltaTime)
      return particle.isAlive()
    })
  }

  sortParticles() {
    this.particles.sort((a, b) => b.position.z - a.position.z)
  }
}