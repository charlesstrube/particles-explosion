export abstract class Shader {
  protected gl: WebGLRenderingContext;
  protected program: WebGLProgram | null = null;
  protected vertexShader: WebGLShader | null = null;
  protected fragmentShader: WebGLShader | null = null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  protected abstract getVertexShaderSource(): string;
  protected abstract getFragmentShaderSource(): string;


  compile(): boolean {
    // Créer et compiler le vertex shader
    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!this.vertexShader) {
      console.error('Impossible de créer le vertex shader');
      return false;
    }

    this.gl.shaderSource(this.vertexShader, this.getVertexShaderSource());
    this.gl.compileShader(this.vertexShader);

    if (!this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS)) {
      console.error('Erreur de compilation du vertex shader:', this.gl.getShaderInfoLog(this.vertexShader));
      this.gl.deleteShader(this.vertexShader);
      return false;
    }

    // Créer et compiler le fragment shader
    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!this.fragmentShader) {
      console.error('Impossible de créer le fragment shader');
      return false;
    }

    this.gl.shaderSource(this.fragmentShader, this.getFragmentShaderSource());
    this.gl.compileShader(this.fragmentShader);

    if (!this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS)) {
      console.error('Erreur de compilation du fragment shader:', this.gl.getShaderInfoLog(this.fragmentShader));
      this.gl.deleteShader(this.fragmentShader);
      return false;
    }

    // Créer et lier le programme
    this.program = this.gl.createProgram();
    if (!this.program) {
      console.error('Impossible de créer le programme shader');
      return false;
    }

    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Erreur de liaison du programme:', this.gl.getProgramInfoLog(this.program));
      this.gl.deleteProgram(this.program);
      return false;
    }

    return true;
  }

  use(): void {
    if (this.program) {
      this.gl.useProgram(this.program);
    }
  }

  getAttributeLocation(name: string): number {
    if (!this.program) {
      throw new Error('Programme shader non compilé');
    }
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    if (!this.program) {
      throw new Error('Programme shader non compilé');
    }
    return this.gl.getUniformLocation(this.program, name);
  }

  cleanup(): void {
    if (this.vertexShader) {
      this.gl.deleteShader(this.vertexShader);
    }
    if (this.fragmentShader) {
      this.gl.deleteShader(this.fragmentShader);
    }
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
} 