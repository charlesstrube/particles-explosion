import { Shader } from './Shader';

export class CircleShader extends Shader {
  private positionLocation: number = -1;
  private colorLocation: number = -1;
  private sizeLocation: number = -1;
  private alphaLocation: number = -1;
  private resolutionLocation: WebGLUniformLocation | null = null;

  constructor(gl: WebGLRenderingContext) {
    super(gl);
    this.compile();
    this.setupLocations();
  }

  private setupLocations(): void {
    this.positionLocation = this.getAttributeLocation('a_position');
    this.colorLocation = this.getAttributeLocation('a_color');
    this.sizeLocation = this.getAttributeLocation('a_size');
    this.alphaLocation = this.getAttributeLocation('a_alpha');
    this.resolutionLocation = this.getUniformLocation('u_resolution');
  }

  protected getVertexShaderSource(): string {
    return `
      attribute vec2 a_position;
      attribute vec3 a_color;
      attribute float a_size;
      attribute float a_alpha;
      
      uniform vec2 u_resolution;
      
      varying vec3 v_color;
      varying float v_alpha;
      varying vec2 v_position;
      
      void main() {
        // Convertir les coordonnées du canvas en coordonnées clip
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        clipSpace.y = -clipSpace.y; // Inverser l'axe Y
        
        gl_Position = vec4(clipSpace, 0.0, 1.0);
        gl_PointSize = a_size;
        
        v_color = a_color;
        v_alpha = a_alpha;
        v_position = a_position;
      }
    `;
  }

  protected getFragmentShaderSource(): string {
    return `
      precision mediump float;
      
      varying vec3 v_color;
      varying float v_alpha;
      varying vec2 v_position;
      
      void main() {
        // Calculer la distance du centre du point
        vec2 center = gl_PointCoord - 0.5;
        float distance = length(center);
        
        // Créer un cercle avec des bords lisses
        float circleAlpha = 1.0 - smoothstep(0.4, 0.9, distance);
        
        // Appliquer la couleur avec l'alpha combiné
        gl_FragColor = vec4(v_color, circleAlpha * v_alpha);
      }
    `;
  }

  setResolution(width: number, height: number): void {
    if (this.resolutionLocation) {
      this.gl.uniform2f(this.resolutionLocation, width, height);
    }
  }

  getPositionLocation(): number {
    return this.positionLocation;
  }

  getColorLocation(): number {
    return this.colorLocation;
  }

  getSizeLocation(): number {
    return this.sizeLocation;
  }

  getAlphaLocation(): number {
    return this.alphaLocation;
  }
} 