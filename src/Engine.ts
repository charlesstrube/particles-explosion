import { Particle } from "./Particle"
import type { Position } from "./types"

export class Engine {

  readonly particles: Particle[] = []

  constructor(public width: number, public height: number, private fps: number) {}

  spawnParticles(position: Position, amount: number) {
    for (let i = 0; i < amount; i++) {
      this.particles.push(new Particle(position))
    }
  }

  update() {
    this.particles.forEach(particle => {
      particle.update(1 / this.fps)
      if (!particle.isAlive()) {
        this.particles.splice(this.particles.indexOf(particle), 1);
      }
    })
  }
}