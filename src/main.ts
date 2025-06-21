import { RenderEngine } from './core/RenderEngine'
import { ParticleEngine } from './particles/ParticleEngine';
import { DefaultParticleFactory, FireParticleFactory, WaterParticleFactory } from './particles/ParticleFactory'
import './style.css'

import { GUI } from 'dat.gui';

const app = document.querySelector<HTMLDivElement>('#app')

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const FPS = 60
const AMOUNT = 2000
const PERSPECTIVE = 400
const params = {
  amount: AMOUNT,
  fps: FPS,
  perspective: PERSPECTIVE,
}

let x = 0
let y = 0
let willSpawn = false

if (app) {
  const canvas = document.createElement('canvas')
  app.appendChild(canvas)



  const Particular = new ParticleEngine()
  const Render = new RenderEngine(
    canvas,
    'gl',
    WIDTH,
    HEIGHT,
    FPS,
    PERSPECTIVE
  )




  // Création des boutons pour changer le type de particules
  const createButton = (text: string, factory: any) => {
    const button = document.createElement('button')
    button.textContent = text
    button.style.margin = '5px'
    button.addEventListener('click', () => {
      Particular.particleFactory = factory
    })
    return button
  }

  const buttonContainer = document.createElement('div')
  buttonContainer.style.position = 'fixed'
  buttonContainer.style.top = '10px'
  buttonContainer.style.left = '10px'
  buttonContainer.style.zIndex = '1000'

  buttonContainer.appendChild(createButton('Default', new DefaultParticleFactory()))
  buttonContainer.appendChild(createButton('Fire', new FireParticleFactory()))
  buttonContainer.appendChild(createButton('Water', new WaterParticleFactory()))

  app.appendChild(buttonContainer)

  Render.onMouseUp = (xCoord, yCoord) => {
    x = xCoord
    y = yCoord
    willSpawn = true
  }

  Render.onRender = (elapsed) => {
    Particular.update(elapsed)
    if (willSpawn) {
      Particular.spawnParticles(x, y, 0, params.amount)
      willSpawn = false
    }
    return Particular.particles
  }

  const gui = new GUI({
    name: 'Particular Explosion',
  })
  gui.add(params, 'amount', 1, 100000)
  gui.add(params, 'fps', 1, 120).onChange((value) => {
    Render.fps = value
  })
  gui.add(params, 'perspective', 100, 1000).onChange((value) => {
    Render.perspective = value
  })
}