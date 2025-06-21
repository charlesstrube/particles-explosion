import { CircleShader } from './CircleShader';
import type { Shader } from './Shader';
import { TurbulenceShader } from './TurbulenceShader';
export class ShaderManager {
  private shaders: Map<string, Shader> = new Map();
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;

    // Initialiser le shader de cercle
    const circleShader = new CircleShader(this.gl);
    this.shaders.set('circle', circleShader);

    // Initialiser le shader de turbulence
    const turbulenceShader = new TurbulenceShader(this.gl);
    this.shaders.set('turbulence', turbulenceShader);
  }

  getShader(name: string): Shader {
    const shader = this.shaders.get(name);
    if (!shader) {
      throw new Error(`Shader '${name}' non trouvé`);
    }
    return shader;
  }

  useShader(name: string): Shader {
    const shader = this.getShader(name);
    shader.use();
    return shader;
  }

  cleanup(): void {
    for (const shader of this.shaders.values()) {
      if (shader.cleanup) {
        shader.cleanup();
      }
    }
    this.shaders.clear();
  }
} 