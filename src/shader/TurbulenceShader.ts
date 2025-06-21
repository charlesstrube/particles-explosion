import { Shader } from './Shader';

export class TurbulenceShader extends Shader {
  private positionLocation: number = -1;
  private colorLocation: number = -1;
  private sizeLocation: number = -1;
  private directionLocation: number = -1;
  private radiusLocation: number = -1;
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
    this.directionLocation = this.getAttributeLocation('a_direction');
    this.radiusLocation = this.getAttributeLocation('a_radius');
    this.resolutionLocation = this.getUniformLocation('u_resolution');
  }

  protected getVertexShaderSource(): string {
    return `
      attribute vec2 a_position;
      attribute vec3 a_color;
      attribute float a_size;
      attribute vec2 a_direction;
      attribute float a_radius;
      
      uniform vec2 u_resolution;
      
      varying vec3 v_color;
      varying vec2 v_position;
      varying vec2 v_direction;
      varying float v_radius;
      varying float v_size;
      
      void main() {
        // Convertir les coordonnées du canvas en coordonnées clip
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        clipSpace.y = -clipSpace.y; // Inverser l'axe Y
        
        gl_Position = vec4(clipSpace, 0.0, 1.0);
        gl_PointSize = a_size;
        
        v_color = a_color;
        v_position = a_position;
        v_direction = a_direction;
        v_radius = a_radius;
        v_size = a_size;
      }
    `;
  }

  protected getFragmentShaderSource(): string {
    return `
      precision mediump float;
      
      varying vec3 v_color;
      varying vec2 v_position;
      varying vec2 v_direction;
      varying float v_radius;
      varying float v_size;
      
      void main() {
        // Coordonnées relatives au centre du point
        vec2 center = gl_PointCoord - 0.5;
        float distance = length(center);
        
        // Dessiner le point central
        float pointAlpha = 1.0 - smoothstep(0.4, 0.9, distance);
        
        // Dessiner le cercle d'influence (plus grand, transparent)
        float influenceRadius = v_radius / v_size;
        float influenceAlpha = 0.1 * (1.0 - smoothstep(0.0, influenceRadius, distance));
        
        // Dessiner la flèche directionnelle
        float arrowAlpha = 0.0;
        if (length(v_direction) > 0.1) {
          vec2 normalizedDir = normalize(v_direction);
          float arrowLength = 0.7; // Longueur plus grande
          
          // Corps de la flèche
          vec2 arrowStart = vec2(0.0, 0.0);
          vec2 arrowEnd = normalizedDir * arrowLength;
          vec2 arrowVector = arrowEnd - arrowStart;
          
          // Distance du point à la ligne de la flèche
          vec2 pointToStart = center - arrowStart;
          float projection = dot(pointToStart, arrowVector) / dot(arrowVector, arrowVector);
          projection = clamp(projection, 0.0, 1.0);
          
          vec2 closestPoint = arrowStart + projection * arrowVector;
          float distanceToArrow = length(center - closestPoint);
          
          // Largeur de la flèche (plus épaisse)
          float arrowWidth = 0.15; // Plus épaisse
          if (projection > 0.0 && projection < 1.0 && distanceToArrow < arrowWidth) {
            arrowAlpha = 1.0;
          }
          
          // Pointe de la flèche (cercle plus grand)
          float arrowHeadSize = 0.2; // Plus grand
          vec2 arrowHead = arrowEnd;
          float distanceToHead = length(center - arrowHead);
          
          if (distanceToHead < arrowHeadSize) {
            arrowAlpha = 1.0;
          }
        }
        
        // Priorité: flèche > point > influence
        float finalAlpha = 0.0;
        if (arrowAlpha > 0.0) {
          finalAlpha = arrowAlpha;
        } else if (pointAlpha > 0.0) {
          finalAlpha = pointAlpha;
        } else {
          finalAlpha = influenceAlpha;
        }
        
        // Couleur: rouge pour les flèches, couleur normale pour le reste
        vec3 finalColor = arrowAlpha > 0.0 ? vec3(1.0, 0.0, 0.0) : v_color;
        
        gl_FragColor = vec4(finalColor, finalAlpha);
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
    // Pour la compatibilité avec l'interface Shader, retourner -1 car nous n'utilisons pas d'alpha séparé
    return -1;
  }

  getDirectionLocation(): number {
    return this.directionLocation;
  }

  getRadiusLocation(): number {
    return this.radiusLocation;
  }
} 