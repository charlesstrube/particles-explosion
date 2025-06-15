import { ParticleEngine } from './ParticleEngine'
import { RenderEngine } from './RenderEngine'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const FPS = 30
const AMOUNT = 100
const PERSPECTIVE = 400

let x = 0
let y = 0
let willSpawn = false

if (app) {
  const canvas = document.createElement('canvas')

  app.appendChild(canvas)

  const Particular = new ParticleEngine(WIDTH, HEIGHT)

  const Render = new RenderEngine(
    canvas,
    WIDTH, 
    HEIGHT, 
    FPS,
    PERSPECTIVE
  )

  Render.onMouseUp = (xCoord, yCoord) => {
    x = xCoord
    y = yCoord
    willSpawn = true
  }


  Render.onRender = (elapsed) => {
    Particular.update(elapsed)
    if (willSpawn) {
      Particular.spawnParticles(x, y, 0, AMOUNT)
      willSpawn = false
    }
    Particular.sortParticles()
    return Particular.particles
  }

}