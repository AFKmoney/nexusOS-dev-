import React, { useEffect, useRef } from 'react';
import { useParallax3DS } from '../hooks/useParallax3DS';
import { useOS } from '../store/osStore';

interface GyroscopicImage3DProps {
  url: string;
}

export default function GyroscopicImage3D({ url }: GyroscopicImage3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionStrength = useOS(state => state.wallpaperMotionStrength) ?? 0.6;
  const { tiltX, tiltY, impulse } = useParallax3DS();

  const stateRef = useRef({ tiltX: 0, tiltY: 0, impulse: 0, motionStrength: 0.6 });
  stateRef.current = { tiltX, tiltY, impulse, motionStrength };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let isDisposed = false;

    // Try WebGL for true hardware-accelerated 3D parallax depth mapping
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: true, depth: false });
    } catch {
      gl = null;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    if (gl) {
      const vsSource = `
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main() {
          vUv = aPosition * 0.5 + 0.5;
          vUv.y = 1.0 - vUv.y;
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `;

      // Fragment shader with true gyroscopic depth map & specular holographic sheen
      const fsSource = `
        precision mediump float;
        uniform sampler2D uTexture;
        uniform vec2 uTilt;
        uniform float uImpulse;
        uniform float uStrength;
        varying vec2 vUv;

        void main() {
          // Centered normalized coordinates [-1, 1]
          vec2 p = (vUv - 0.5) * 2.0;

          // Parallax depth field: center convex dome + edge recession
          float depth = 1.0 - length(p) * 0.42;
          depth = clamp(depth, 0.3, 1.0);

          // Tap impulse pushes center forward (dolly zoom)
          float dolly = 1.0 + uImpulse * 0.08 * depth;

          // Gyroscopic parallax displacement
          vec2 offset = uTilt * (depth - 0.5) * uStrength * 0.045;

          // Scaled and shifted UV with overscan to prevent border clipping
          vec2 uv = (vUv - 0.5) / 1.08 / dolly + 0.5 + offset;
          uv = clamp(uv, 0.005, 0.995);

          vec4 color = texture2D(uTexture, uv);

          // Holographic specular glint that responds to device tilt
          vec2 lightPos = vec2(0.5 + uTilt.x * 0.35, 0.5 - uTilt.y * 0.35);
          float distToLight = length(vUv - lightPos);
          float sheen = pow(max(0.0, 1.0 - distToLight * 1.2), 3.0) * 0.12 * uStrength;

          // Add subtle deep vignette
          float vignette = 1.0 - length(p) * 0.18;

          gl_FragColor = vec4(color.rgb * vignette + vec3(sheen), 1.0);
        }
      `;

      const createShader = (type: number, src: string) => {
        if (!gl) return null;
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

      if (vs && fs) {
        program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);
          gl.useProgram(program);

          // Quad vertices
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
          );

          const aPos = gl.getAttribLocation(program, 'aPosition');
          gl.enableVertexAttribArray(aPos);
          gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

          texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

          // Placeholder 1x1 dark pixel until image loads
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([8, 8, 14, 255])
          );
        }
      }

      img.onload = () => {
        if (isDisposed || !gl || !texture) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      };

      const uTiltLoc = program ? gl.getUniformLocation(program, 'uTilt') : null;
      const uImpulseLoc = program ? gl.getUniformLocation(program, 'uImpulse') : null;
      const uStrengthLoc = program ? gl.getUniformLocation(program, 'uStrength') : null;

      const renderGL = () => {
        if (isDisposed || !gl || !program) return;
        const { tiltX, tiltY, impulse, motionStrength } = stateRef.current;

        gl.uniform2f(uTiltLoc, tiltX, tiltY);
        gl.uniform1f(uImpulseLoc, impulse);
        gl.uniform1f(uStrengthLoc, motionStrength);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animId = requestAnimationFrame(renderGL);
      };

      animId = requestAnimationFrame(renderGL);
    } else {
      // 2D Canvas Fallback
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const render2D = () => {
          if (isDisposed) return;
          const { tiltX, tiltY, impulse, motionStrength } = stateRef.current;
          const w = canvas.width;
          const h = canvas.height;
          const str = motionStrength;

          ctx.fillStyle = '#06060c';
          ctx.fillRect(0, 0, w, h);

          if (img.complete && img.naturalWidth > 0) {
            const shiftX = tiltX * 28 * str;
            const shiftY = tiltY * 28 * str;
            const scale = 1.08 + impulse * 0.04;

            ctx.save();
            ctx.translate(w / 2 + shiftX, h / 2 + shiftY);
            ctx.scale(scale, scale);
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
          }

          animId = requestAnimationFrame(render2D);
        };
        animId = requestAnimationFrame(render2D);
      }
    }

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (gl && texture) gl.deleteTexture(texture);
      if (gl && program) gl.deleteProgram(program);
    };
  }, [url]);

  const { tiltX: tx, tiltY: ty, impulse: imp } = stateRef.current;
  const str = motionStrength;
  const rotX = (ty * 5.5 + imp * 1.5) * str;
  const rotY = (-tx * 5.5) * str;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      <div
        className="w-full h-full relative"
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`,
          transformOrigin: 'center center',
          transition: 'transform 0.04s linear',
          willChange: 'transform',
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>
    </div>
  );
}
