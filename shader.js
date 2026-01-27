// WebGL Stars Parallax Shader
class StarsShader {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        const gl = this.gl;
        
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Fragment shader with parallax stars effect
        const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_time;
            
            // Random function for star distribution
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            // Create stars with parallax layers
            float stars(vec2 uv, float layer) {
                vec2 gridUv = fract(uv * (100.0 + layer * 50.0));
                vec2 gridId = floor(uv * (100.0 + layer * 50.0));
                
                float n = random(gridId);
                
                // Star size and brightness
                float size = 0.002 + n * 0.003 * (1.0 / layer);
                float brightness = smoothstep(0.9, 1.0, n);
                
                // Create star shape
                vec2 starPos = vec2(random(gridId + 0.1), random(gridId + 0.2));
                float dist = length(gridUv - starPos);
                float star = smoothstep(size, 0.0, dist) * brightness;
                
                // Twinkling effect
                float twinkle = sin(u_time * (2.0 + n * 3.0) + n * 10.0) * 0.5 + 0.5;
                star *= 0.7 + twinkle * 0.3;
                
                return star;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec2 parallaxUv = uv;
                
                // Background gradient (dark space)
                vec3 color = vec3(0.01, 0.01, 0.03);
                color += vec3(0.02, 0.02, 0.05) * (1.0 - uv.y);
                
                // Apply parallax effect based on mouse position
                vec2 mouseParallax = (u_mouse / u_resolution - 0.5) * 2.0;
                
                // Layer 1 - Far stars (slow parallax)
                vec2 layer1Uv = parallaxUv - mouseParallax * 0.02;
                layer1Uv.y += u_time * 0.005;
                color += vec3(0.4, 0.5, 0.8) * stars(layer1Uv, 3.0);
                
                // Layer 2 - Mid stars (medium parallax)
                vec2 layer2Uv = parallaxUv - mouseParallax * 0.05;
                layer2Uv.y += u_time * 0.01;
                color += vec3(0.6, 0.7, 1.0) * stars(layer2Uv, 2.0);
                
                // Layer 3 - Near stars (fast parallax)
                vec2 layer3Uv = parallaxUv - mouseParallax * 0.08;
                layer3Uv.y += u_time * 0.015;
                color += vec3(0.8, 0.9, 1.0) * stars(layer3Uv, 1.0);
                
                // Add some color variation to distant stars
                color += vec3(0.8, 0.6, 0.4) * stars(layer1Uv + vec2(100.0), 3.5) * 0.3;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // Compile shaders
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Program link failed:', gl.getProgramInfoLog(this.program));
            return;
        }
        
        // Get attribute and uniform locations
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
        this.mouseLocation = gl.getUniformLocation(this.program, 'u_mouse');
        this.timeLocation = gl.getUniformLocation(this.program, 'u_time');
        
        // Create buffer for fullscreen quad
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ]);
        
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        this.resize();
    }
    
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = window.innerHeight - e.clientY;
        });
    }
    
    animate() {
        const gl = this.gl;
        
        this.time += 0.016; // Approximate 60fps
        
        // Clear and render
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        
        // Set uniforms
        gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.mouseLocation, this.mouseX, this.mouseY);
        gl.uniform1f(this.timeLocation, this.time);
        
        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize shader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stars-canvas');
    new StarsShader(canvas);
});
