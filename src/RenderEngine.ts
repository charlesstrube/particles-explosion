import { Particle } from "./Particle";

export class RenderEngine {


  private _ratio: number = window.devicePixelRatio;
  private _holding: boolean = false;
  private _x: number = 0;
  private _y: number = 0;
  public onRender: ((elapsed: number) => Particle[]) | undefined;
  public onMouseUp: ((x: number, y: number) => void) | undefined;
  public onMouseDown: ((x: number, y: number) => void) | undefined;
  public onMouseHold: ((x: number, y: number) => void) | undefined;
  private _context: CanvasRenderingContext2D;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected _width: number,
    protected _height: number,
    protected _fps: number = 60,
    protected _perspective: number = 1000
  ) {
    this.width = _width
    this.height = _height
    const context = this.canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get canvas context')
    }
    this._context = context
    this.setup()
  }

  set width(width: number) {
    this._width = width;
    this.canvas.width = width * this._ratio;
    this.canvas.style.width = `${width}px`
  }

  get width() {
    return this._width;
  }

  set height(height: number) {
    this._height = height;
    this.canvas.height = height * this._ratio;
    this.canvas.style.height = `${height}px`
  }

  get height() {
    return this._height;
  }

  registerMouseEvents() {
    this.canvas.addEventListener('mousedown', (event) => {
      this._x = Math.floor(event.offsetX)
      this._y = Math.floor(event.offsetY)
      this._holding = true
      this.onMouseDown?.(this._x, this._y)
    })

    this.canvas.addEventListener('mouseup', (event) => {
      this._x = Math.floor(event.offsetX)
      this._y = Math.floor(event.offsetY)
      this._holding = false
      this.onMouseUp?.(this._x, this._y)
    })

    this.canvas.addEventListener('mousemove', (event) => {
      this._x = Math.floor(event.offsetX)
      this._y = Math.floor(event.offsetY)
    })
  }

  setup() {
    const fpsInterval = 1000 / this._fps
    let now = Date.now()
    let then = now
    let elapsed;

    this._context.scale(this._ratio, this._ratio)

    this.registerMouseEvents()


    const loop = () => {

      window.requestAnimationFrame(loop)

      if (this._holding) {
        this.onMouseHold?.(this._x, this._y)
      }

      // calc elapsed time since last loop

      now = Date.now();
      elapsed = now - then;

      // if enough time has elapsed, draw the next frame

      if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // Put your drawing code here

        const particles = this.onRender?.(elapsed)

        if (!particles) {
          return
        }

        this.clear()
        particles.forEach(this.drawParticle.bind(this))
      }
    }
    loop();
  }

  projectParticle(particle: Particle) {
    const scale = this._perspective / (this._perspective + particle.position.z);

    // Calculer la position projetée
    const projectedX = (particle.position.x - this._width / 2) * scale + this._width / 2;
    const projectedY = (particle.position.y - this._height / 2) * scale + this._height / 2;

    // Taille de la particule qui varie avec la profondeur
    const zFactor = Math.max(0, -particle.position.z / this._perspective);
    const size = particle.size * (1 + zFactor * 0.2) * scale;

    return {
      size,
      projectedX,
      projectedY,
      zFactor
    }
  }

  drawCloseParticle(particle: Particle) {
    const { projectedX, projectedY, size, zFactor } = this.projectParticle(particle)

    // Dessiner un hexagone pour les particules proches de la caméra
    this._context.beginPath();
    const sides = 6;
    const angle = (Math.PI * 2) / sides;

    for (let i = 0; i < sides; i++) {
      const x = projectedX + size * Math.cos(angle * i);
      const y = projectedY + size * Math.sin(angle * i);
      if (i === 0) {
        this._context.moveTo(x, y);
      } else {
        this._context.lineTo(x, y);
      }
    }
    this._context.closePath();

    // Ajuster l'alpha en fonction de la profondeur pour les particules proches
    const depthAlpha = Math.max(0.2, 0.8 - zFactor * 0.6);
    const finalAlpha = particle.alpha * depthAlpha;
    this._context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${finalAlpha})`;
    this._context.fill();
    this._context.restore();
  }

  drawFarParticle(particle: Particle) {
    const { projectedX, projectedY, size } = this.projectParticle(particle)
    this._context.beginPath();
      this._context.arc(projectedX, projectedY, size, 0, Math.PI * 2);
      this._context.closePath();
      this._context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
    this._context.fill();
    this._context.restore();
  }

  drawParticle(particle: Particle) {
    if (particle.position.z < 0) {
      // Dessiner un hexagone pour les particules proches de la caméra
      this.drawCloseParticle(particle)
      return
    }
    this.drawFarParticle(particle)
  }

  clear() {
    this._context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._context.fillStyle = 'black'
    this._context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this._context.restore()
  }
}