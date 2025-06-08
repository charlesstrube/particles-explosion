import { Particle } from "./Particle"
import type { Position } from "./types"

export class Engine {

  public particles: Particle[] = []

  constructor(public width: number, public height: number) {}

  spawnParticles(position: Position, amount: number) {
    for (let i = 0; i < amount; i++) {
      this.particles.push(new Particle(position))
    }
  }

  update(deltaTime: number) {
    this.particles.forEach((particle, index) => {
      particle.update(deltaTime)
      if (!particle.isAlive()) {
        this.particles.splice(index, 1)
      }
    })
  }
}