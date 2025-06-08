
import { Engine } from './Engine'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

const WIDTH = 1000
const HEIGHT = 1000
const CELL_SIZE = 10
const FPS = 120



if (app) {
  const canvas = document.createElement('canvas')

  app.appendChild(canvas)

  const ratio = window.devicePixelRatio

  canvas.width = WIDTH * ratio;
  canvas.height = HEIGHT * ratio;
  canvas.style.width = `${WIDTH}px`
  canvas.style.height = `${HEIGHT}px`


  let x: undefined | number = undefined
  let y: undefined | number = undefined
  let holding = false
  let hasSpawned = false

  canvas.addEventListener('mousedown', () => {
    holding = true
  })

  canvas.addEventListener('mouseup', () => {
    holding = false
    hasSpawned = false
  })

  canvas.addEventListener('mousemove', (event) => {
    x = Math.floor(event.offsetX)
    y = Math.floor(event.offsetY)
  })


  const fpsInterval = 1000 / FPS
  let now = Date.now()
  let then = now
  let elapsed;



  const context = canvas.getContext('2d')
  if (context) {
    context.scale(ratio, ratio)

    const engine = new Engine(WIDTH, HEIGHT, FPS)

    const loop = () => {

      window.requestAnimationFrame(loop)
      // calc elapsed time since last loop

      now = Date.now();
      elapsed = now - then;

      // if enough time has elapsed, draw the next frame

      if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // Put your drawing code here

        engine.update()



        if (holding && !hasSpawned && x !== undefined && y !== undefined) {
          engine.spawnParticles({ x, y, z: 0 }, 200)
          hasSpawned = true
        }


        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = 'black'
        context.fillRect(0, 0, CELL_SIZE * WIDTH, CELL_SIZE * HEIGHT)
        context.restore()
        engine.particles.forEach(particle => {
          context.fillStyle = 'white'
          context.fillRect(particle.position.x, particle.position.y, 1, 1)
          context.restore()
        })
      }

    }

    loop();

  }

}