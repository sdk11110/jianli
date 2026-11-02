/**
 * Two render paths, one WaterRenderer.
 *
 * Fluid (WebGL2): Stam-style stable fluids on the GPU, a scene framebuffer for
 * image plates + rasterized type, then one post pass that warps everything
 * along the same dye/velocity field. Pointer, scroll and hover all write into
 * that field, so they feel like one body of water.
 *
 * Field (WebGL1 fallback): CPU WaterField packed as a texture, used only to
 * refract image plates. DOM glyphs still ride that field from app.js.
 */
(function (global) {
  'use strict';

  const OPTS = { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true };

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile failed: ${log}`);
    }
    return shader;
  }

  function link(gl, vsSource, fsSource) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
    }
    return program;
  }

  function makeTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
  }

  /* ------------------------------------------------------------------ fluid */

  const FLUID_VERT = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aPos;
    out vec2 vUv;
    out vec2 vL;
    out vec2 vR;
    out vec2 vT;
    out vec2 vB;
    uniform vec2 uTexel;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      vL = vUv - vec2(uTexel.x, 0.0);
      vR = vUv + vec2(uTexel.x, 0.0);
      vT = vUv + vec2(0.0, uTexel.y);
      vB = vUv - vec2(0.0, uTexel.y);
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const SPLAT_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uInput;
    uniform vec2 uPoint;
    uniform vec3 uValue;
    uniform float uRadius;
    uniform float uAspect;
    void main() {
      vec2 p = vUv - uPoint;
      p.x *= uAspect;
      float falloff = exp(-dot(p, p) / max(uRadius * uRadius, 1.0e-8));
      vec3 base = texture(uInput, vUv).xyz;
      fragColor = vec4(base + uValue * falloff, 1.0);
    }
  `;

  const DIVERGENCE_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture(uVelocity, vL).x;
      float R = texture(uVelocity, vR).x;
      float T = texture(uVelocity, vT).y;
      float B = texture(uVelocity, vB).y;
      float div = 0.5 * (R - L + T - B);
      fragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;

  const PRESSURE_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main() {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;
      float div = texture(uDivergence, vUv).x;
      fragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
    }
  `;

  const GRADIENT_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;
      vec2 velocity = texture(uVelocity, vUv).xy;
      velocity.x -= 0.5 * (R - L);
      velocity.y -= 0.5 * (T - B);
      fragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  const ADVECT_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uInput;
    uniform float uDt;
    uniform float uDissipation;
    void main() {
      vec2 velocity = texture(uVelocity, vUv).xy;
      vec2 coord = clamp(vUv - velocity * uDt, 0.0, 1.0);
      fragColor = vec4(texture(uInput, coord).xyz * uDissipation, 1.0);
    }
  `;

  const CLEAR_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uInput;
    uniform float uValue;
    void main() {
      fragColor = texture(uInput, vUv) * uValue;
    }
  `;

  const SCENE_VERT = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aPos;
    uniform vec4 uQuad;
    out vec2 vUv;
    void main() {
      vec2 p = uQuad.xy + aPos * uQuad.zw;
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(p, 0.0, 1.0);
    }
  `;

  const SCENE_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTex;
    uniform vec2 uCoverScale;
    uniform vec2 uCoverOffset;
    uniform vec2 uAspect;
    uniform float uAlpha;
    uniform float uBlob;
    uniform float uFeather;
    uniform float uDesat;
    uniform float uBright;
    uniform float uHighlight;
    uniform float uTime;
    uniform vec3 uTint;

    void main() {
      vec2 uv = clamp(vUv * uCoverScale + uCoverOffset, 0.0, 1.0);
      vec4 sampled = texture(uTex, uv);
      vec3 colour = sampled.rgb;
      float luma = dot(colour, vec3(0.299, 0.587, 0.114));
      colour = mix(colour, vec3(luma), uDesat) * uBright * uTint;
      colour += vec3(0.96, 0.97, 1.0) * uHighlight * 0.04;

      vec2 centred = (vUv - 0.5) * 2.0 * uAspect;
      float radius = length(centred);
      radius += (sin(vUv.x * 7.3 + uTime * 0.55) + sin(vUv.y * 5.9 - uTime * 0.43)) * 0.05 * uBlob;
      float blob = smoothstep(1.0, 1.0 - uFeather, radius);
      float edge = min(
        smoothstep(0.0, max(uFeather, 0.001) * 0.6, min(vUv.x, 1.0 - vUv.x)),
        smoothstep(0.0, max(uFeather, 0.001) * 0.6, min(vUv.y, 1.0 - vUv.y))
      );
      float mask = mix(edge, blob, uBlob);
      float alpha = clamp(uAlpha * mask * sampled.a, 0.0, 1.0);
      fragColor = vec4(colour * alpha, alpha);
    }
  `;

  const COMPOSITE_FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uScene;
    uniform sampler2D uVelocity;
    uniform sampler2D uDye;
    uniform sampler2D uPreview;
    uniform float uPower;
    uniform float uPreviewAlpha;
    uniform vec4 uPreviewQuad;
    uniform vec2 uPreviewCoverScale;
    uniform vec2 uPreviewCoverOffset;
    uniform vec2 uPreviewAspect;
    uniform float uPreviewFeather;
    uniform float uTime;
    uniform vec2 uTexel;
    uniform vec2 uPointer;
    uniform float uReach;
    uniform float uScreenAspect;

    void main() {
      float dye = texture(uDye, vUv).r;
      vec2 velocity = texture(uVelocity, vUv).xy;
      float speed = length(velocity);
      vec2 flowDir = speed > 1.0e-6 ? velocity / speed : vec2(0.0);
      vec2 dyeGrad = vec2(
        texture(uDye, vUv + vec2(uTexel.x, 0.0)).r - texture(uDye, vUv - vec2(uTexel.x, 0.0)).r,
        texture(uDye, vUv + vec2(0.0, uTexel.y)).r - texture(uDye, vUv - vec2(0.0, uTexel.y)).r
      );
      float gradLen = length(dyeGrad);
      vec2 lensDir = gradLen > 1.0e-6 ? dyeGrad / gradLen : vec2(0.0);
      vec2 dir = mix(lensDir, flowDir, smoothstep(0.0, 0.028, speed));
      // Incompressible flow leaks across the domain; keep the visible lens
      // on a small disc around the pointer, and ignore faint leftover dye.
      vec2 fromPointer = vec2((vUv.x - uPointer.x) * uScreenAspect, vUv.y - uPointer.y);
      float reachMask = smoothstep(uReach, uReach * 0.22, length(fromPointer));
      float mass = smoothstep(0.012, 0.055, dye);
      float offset = dye * uPower * reachMask * mass;
      vec2 warp = vUv - dir * offset;
      warp -= dir * texture(uDye, clamp(warp, 0.0, 1.0)).r * uPower * reachMask * mass;

      vec4 sceneR = texture(uScene, warp - dir * offset * 0.0);
      vec4 sceneG = texture(uScene, warp);
      vec4 sceneB = texture(uScene, warp + dir * offset * 0.0);
      vec3 colour = vec3(sceneR.r, sceneG.g, sceneB.b);
      float alpha = sceneG.a;

      if (uPreviewAlpha > 0.004 && uPreviewQuad.z > 0.0) {
        vec2 local = (warp - uPreviewQuad.xy) / max(uPreviewQuad.zw, vec2(1.0e-5));
        vec2 centred = (local - 0.5) * 2.0 * uPreviewAspect;
        float radius = length(centred);
        radius += (sin(local.x * 6.4 + uTime * 0.5) + sin(local.y * 5.1 - uTime * 0.4)) * 0.045;
        float blob = smoothstep(1.0, 1.0 - uPreviewFeather, radius);
        vec2 pUv = clamp(local * uPreviewCoverScale + uPreviewCoverOffset, 0.0, 1.0);
        vec3 preview = texture(uPreview, pUv).rgb;
        float luma = dot(preview, vec3(0.299, 0.587, 0.114));
        preview = mix(preview, vec3(luma), 0.42) * vec3(1.0, 1.0, 1.0);
        float window = blob * uPreviewAlpha * mix(0.28, 1.0, smoothstep(0.01, 0.16, dye)) * reachMask;
        colour = mix(colour, preview, window);
        alpha = max(alpha, window);
      }

      float glass = smoothstep(0.03, 0.28, dye) * reachMask * mass;
      float rim = glass * (1.0 - smoothstep(0.1, 0.4, dye));
      float windowMask = 0.0;
      if (uPreviewAlpha > 0.004 && uPreviewQuad.z > 0.0) {
        vec2 local = (warp - uPreviewQuad.xy) / max(uPreviewQuad.zw, vec2(1.0e-5));
        vec2 centred = (local - 0.5) * 2.0 * uPreviewAspect;
        windowMask = smoothstep(1.0, 0.45, length(centred)) * uPreviewAlpha;
      }
      vec3 sheen = vec3(0.96, 0.97, 1.0) * (dye * 0.015 + rim * 0.07) * (1.0 - windowMask * 0.75);
      colour += sheen;
      alpha = max(alpha, glass * mix(0.11, 0.035, windowMask));

      fragColor = vec4(colour * alpha, alpha);
    }
  `;

  function createFloatFBO(gl, width, height, format, type) {
    const texture = makeTexture(gl);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, gl.RGBA, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!ok) {
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(texture);
      return null;
    }
    return { texture, fbo, width, height };
  }

  function createDoubleFBO(gl, width, height, format, type) {
    const a = createFloatFBO(gl, width, height, format, type);
    const b = createFloatFBO(gl, width, height, format, type);
    if (!a || !b) return null;
    return {
      width,
      height,
      texelX: 1 / width,
      texelY: 1 / height,
      read: a,
      write: b,
      swap() {
        const tmp = this.read;
        this.read = this.write;
        this.write = tmp;
      }
    };
  }

  function createByteFBO(gl, width, height) {
    const texture = makeTexture(gl);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const internal = gl.RGBA8 || gl.RGBA;
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { texture, fbo, width, height };
  }

  class FluidSim {
    constructor(gl, width, height) {
      this.gl = gl;
      this.paused = false;
      this.pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, active: false };
      this.aspect = 1;
      this.pressureIters = 8;
      this.queued = [];
      this.programs = {
        splat: this.#program(SPLAT_FRAG),
        divergence: this.#program(DIVERGENCE_FRAG),
        pressure: this.#program(PRESSURE_FRAG),
        gradient: this.#program(GRADIENT_FRAG),
        advect: this.#program(ADVECT_FRAG),
        clear: this.#program(CLEAR_FRAG)
      };
      this.#alloc(width, height);
    }

    #program(frag) {
      const { gl } = this;
      const program = link(gl, FLUID_VERT, frag);
      const loc = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i += 1) {
        const info = gl.getActiveUniform(program, i);
        loc[info.name] = gl.getUniformLocation(program, info.name);
      }
      return { program, loc };
    }

    #alloc(width, height) {
      const { gl } = this;
      const ext = gl.getExtension('EXT_color_buffer_float');
      gl.getExtension('OES_texture_float_linear');
      if (!ext) throw new Error('No float color buffers');

      const candidates = [
        [gl.RGBA16F, gl.HALF_FLOAT],
        [gl.RGBA32F, gl.FLOAT]
      ];
      let pair = null;
      for (let i = 0; i < candidates.length; i += 1) {
        const probe = createFloatFBO(gl, 4, 4, candidates[i][0], candidates[i][1]);
        if (probe) {
          gl.deleteFramebuffer(probe.fbo);
          gl.deleteTexture(probe.texture);
          pair = candidates[i];
          break;
        }
      }
      if (!pair) throw new Error('Float FBO unavailable');

      this.velocity = createDoubleFBO(gl, width, height, pair[0], pair[1]);
      this.dye = createDoubleFBO(gl, width, height, pair[0], pair[1]);
      this.pressure = createDoubleFBO(gl, width, height, pair[0], pair[1]);
      this.divergence = createFloatFBO(gl, width, height, pair[0], pair[1]);
      if (!this.velocity || !this.dye || !this.pressure || !this.divergence) {
        throw new Error('Fluid FBO alloc failed');
      }
      this.width = width;
      this.height = height;
      this.aspect = width / Math.max(1, height);
      this.texel = [1 / width, 1 / height];
    }

    resize(width, height) {
      if (width === this.width && height === this.height) return;
      this.#deleteTargets();
      this.#alloc(width, height);
    }

    #deleteTargets() {
      const { gl } = this;
      const drop = (target) => {
        if (!target) return;
        if (target.fbo) {
          gl.deleteFramebuffer(target.fbo);
          gl.deleteTexture(target.texture);
          return;
        }
        drop(target.read);
        drop(target.write);
      };
      drop(this.velocity);
      drop(this.dye);
      drop(this.pressure);
      drop(this.divergence);
    }

    #blit(target) {
      const { gl } = this;
      if (this.quad) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
      if (target) gl.viewport(0, 0, target.width, target.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    #setTexel(loc) {
      if (loc.uTexel) this.gl.uniform2f(loc.uTexel, this.texel[0], this.texel[1]);
    }

    splat(nx, ny, vx, vy, radius, dye) {
      this.queued.push({ nx, ny, vx, vy, radius, dye });
    }

    #splatNow(nx, ny, vx, vy, radius, dye) {
      const { gl } = this;
      const uvX = nx;
      const uvY = 1 - ny;
      const r = Math.min(0.055, radius || 0.022);

      gl.disable(gl.BLEND);
      let p = this.programs.splat;
      gl.useProgram(p.program);
      this.#setTexel(p.loc);
      gl.uniform2f(p.loc.uPoint, uvX, uvY);
      gl.uniform1f(p.loc.uRadius, r);
      gl.uniform1f(p.loc.uAspect, this.aspect);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(p.loc.uInput, 0);

      gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
      gl.uniform3f(p.loc.uValue, vx, -vy, 0);
      this.#blit(this.velocity.write);
      this.velocity.swap();

      gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
      gl.uniform3f(p.loc.uValue, dye, 0, 0);
      this.#blit(this.dye.write);
      this.dye.swap();
    }

    movePointer(nx, ny) {
      const p = this.pointer;
      const x = Math.min(1, Math.max(0, nx));
      const y = Math.min(1, Math.max(0, ny));
      if (!p.active) {
        p.px = x;
        p.py = y;
        p.active = true;
      }
      p.x = x;
      p.y = y;
    }

    releasePointer() {
      this.pointer.active = false;
    }

    current(nx, ny, vy) {
      if (Math.abs(vy) < 0.0002) return;
      this.splat(nx, ny, 0, vy * 0.45, 0.028, Math.min(0.07, Math.abs(vy) * 0.7));
    }

    step(dt) {
      if (this.paused) return;
      const { gl } = this;
      while (this.queued.length) {
        const item = this.queued.shift();
        this.#splatNow(item.nx, item.ny, item.vx, item.vy, item.radius, item.dye);
      }
      const p = this.pointer;
      if (p.active) {
        const dx = p.x - p.px;
        const dy = p.y - p.py;
        const speed = Math.hypot(dx, dy);
        if (speed > 0.00045) {
          const steps = Math.min(3, Math.max(1, Math.ceil(speed / 0.02)));
          const force = Math.min(1.05, speed * 10);
          const dye = Math.min(0.28, 0.08 + speed * 2.4);
          const radius = 0.028 + Math.min(0.022, speed * 0.28);
          const dyeStep = dye / Math.sqrt(steps);
          for (let s = 1; s <= steps; s += 1) {
            const t = s / steps;
            this.#splatNow(
              p.px + dx * t,
              p.py + dy * t,
              (dx / steps) * force,
              (dy / steps) * force,
              radius,
              dyeStep
            );
          }
        }
        p.px = p.x;
        p.py = p.y;
      }

      gl.disable(gl.BLEND);
      const scale = Math.min(2.0, Math.max(0.5, dt / (1 / 60)));
      const advDt = 0.0167 * scale;

      let prog = this.programs.divergence;
      gl.useProgram(prog.program);
      this.#setTexel(prog.loc);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
      gl.uniform1i(prog.loc.uVelocity, 0);
      this.#blit(this.divergence);

      prog = this.programs.clear;
      gl.useProgram(prog.program);
      gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
      gl.uniform1i(prog.loc.uInput, 0);
      gl.uniform1f(prog.loc.uValue, 0.8);
      this.#blit(this.pressure.write);
      this.pressure.swap();

      prog = this.programs.pressure;
      gl.useProgram(prog.program);
      this.#setTexel(prog.loc);
      gl.uniform1i(prog.loc.uPressure, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.divergence.texture);
      gl.uniform1i(prog.loc.uDivergence, 1);
      gl.activeTexture(gl.TEXTURE0);
      for (let i = 0; i < this.pressureIters; i += 1) {
        gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
        this.#blit(this.pressure.write);
        this.pressure.swap();
      }

      prog = this.programs.gradient;
      gl.useProgram(prog.program);
      this.#setTexel(prog.loc);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
      gl.uniform1i(prog.loc.uPressure, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
      gl.uniform1i(prog.loc.uVelocity, 1);
      this.#blit(this.velocity.write);
      this.velocity.swap();

      prog = this.programs.advect;
      gl.useProgram(prog.program);
      gl.uniform1i(prog.loc.uVelocity, 0);
      gl.uniform1i(prog.loc.uInput, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
      gl.uniform1f(prog.loc.uDt, advDt);
      gl.uniform1f(prog.loc.uDissipation, Math.pow(0.93, scale));
      this.#blit(this.velocity.write);
      this.velocity.swap();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
      gl.uniform1f(prog.loc.uDt, advDt * 2.2);
      gl.uniform1f(prog.loc.uDissipation, Math.pow(0.955, scale));
      this.#blit(this.dye.write);
      this.dye.swap();
    }
  }

  /* ----------------------------------------------------------------- legacy */

  const LEGACY_VS = `
    attribute vec2 aPos;
    uniform vec4 uQuad;
    varying vec2 vUv;
    varying vec2 vScreen;
    void main() {
      vec2 p = uQuad.xy + aPos * uQuad.zw;
      vUv = aPos * 0.5 + 0.5;
      vScreen = p * 0.5 + 0.5;
      gl_Position = vec4(p, 0.0, 1.0);
    }
  `;

  const LEGACY_FS = `
    precision highp float;
    varying vec2 vUv;
    varying vec2 vScreen;
    uniform sampler2D uTex;
    uniform sampler2D uField;
    uniform vec2 uGrid;
    uniform vec2 uCoverScale;
    uniform vec2 uCoverOffset;
    uniform vec2 uAspect;
    uniform float uAlpha;
    uniform float uStrength;
    uniform float uBlob;
    uniform float uFeather;
    uniform float uDesat;
    uniform float uBright;
    uniform float uHighlight;
    uniform float uTime;
    uniform vec3 uTint;

    vec4 fieldAt(vec2 uv) {
      vec2 t = uv * uGrid - 0.5;
      vec2 i = floor(t);
      vec2 f = fract(t);
      f = f * f * (3.0 - 2.0 * f);
      return texture2D(uField, (i + 0.5 + f) / uGrid);
    }

    void main() {
      vec4 packed = fieldAt(vScreen);
      vec2 disp = packed.rg * 2.0 - 1.0;
      float height = packed.b * 2.0 - 1.0;
      float energy = packed.a;
      vec2 offset = disp * uStrength;
      vec2 base = vUv * uCoverScale + uCoverOffset;
      float spread = 0.055 * uStrength * (0.35 + energy);
      vec3 colour;
      colour.r = texture2D(uTex, clamp(base + offset + disp * spread, 0.0, 1.0)).r;
      colour.g = texture2D(uTex, clamp(base + offset, 0.0, 1.0)).g;
      colour.b = texture2D(uTex, clamp(base + offset - disp * spread, 0.0, 1.0)).b;
      float luma = dot(colour, vec3(0.299, 0.587, 0.114));
      colour = mix(colour, vec3(luma), uDesat) * uBright * uTint;
      colour += vec3(0.96, 0.97, 1.0) * max(height, 0.0) * uHighlight * (0.25 + energy);
      colour -= vec3(0.10, 0.10, 0.11) * max(-height, 0.0) * uHighlight * 0.6;
      vec2 centred = (vUv - 0.5) * 2.0 * uAspect;
      float radius = length(centred);
      radius += height * 0.22 * uBlob;
      radius += (sin(vUv.x * 7.3 + uTime * 0.55) + sin(vUv.y * 5.9 - uTime * 0.43)) * 0.055 * uBlob;
      float blob = smoothstep(1.0, 1.0 - uFeather, radius);
      float edge = min(
        smoothstep(0.0, uFeather * 0.6, min(vUv.x, 1.0 - vUv.x)),
        smoothstep(0.0, uFeather * 0.6, min(vUv.y, 1.0 - vUv.y))
      );
      float mask = mix(edge, blob, uBlob);
      float alpha = clamp(uAlpha * mask, 0.0, 1.0);
      gl_FragColor = vec4(colour * alpha, alpha);
    }
  `;

  const LEGACY_UNIFORMS = [
    'uQuad', 'uTex', 'uField', 'uGrid', 'uCoverScale', 'uCoverOffset', 'uAspect',
    'uAlpha', 'uStrength', 'uBlob', 'uFeather', 'uDesat', 'uBright', 'uHighlight',
    'uTime', 'uTint'
  ];

  /* ------------------------------------------------------------- renderer */

  class WaterRenderer {
    constructor(canvas, field) {
      this.canvas = canvas;
      this.field = field;
      this.textures = new Map();
      this.dpr = 1;
      this.width = 1;
      this.height = 1;
      this.mode = 'field';
      this.fluid = null;
      this.time = 0;

      const gl2 = canvas.getContext('webgl2', OPTS);
      const gl = gl2 || canvas.getContext('webgl', OPTS) || canvas.getContext('experimental-webgl', OPTS);
      if (!gl) throw new Error('WebGL unavailable');
      this.gl = gl;
      this.isWebGL2 = !!gl2;

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      this.quad = buffer;

      if (this.isWebGL2) {
        try {
          this.#initFluid();
          this.mode = 'fluid';
        } catch (error) {
          this.fluid = null;
          this.#initLegacy();
        }
      } else {
        this.#initLegacy();
      }
    }

    #bindQuad(program) {
      const { gl } = this;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      const aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    }

    #initFluid() {
      const { gl } = this;
      this.fluid = new FluidSim(gl, 32, 32);
      this.fluid.quad = this.quad;
      this.sceneProgram = link(gl, SCENE_VERT, SCENE_FRAG);
      this.compositeProgram = link(gl, FLUID_VERT, COMPOSITE_FRAG);
      this.sceneLoc = this.#locations(this.sceneProgram);
      this.compositeLoc = this.#locations(this.compositeProgram);
      this.sceneTarget = null;
    }

    #initLegacy() {
      const { gl } = this;
      this.program = link(gl, LEGACY_VS, LEGACY_FS);
      gl.useProgram(this.program);
      this.#bindQuad(this.program);
      this.loc = {};
      LEGACY_UNIFORMS.forEach((name) => { this.loc[name] = gl.getUniformLocation(this.program, name); });
      this.fieldTexture = makeTexture(gl);
      gl.bindTexture(gl.TEXTURE_2D, this.fieldTexture);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, global.WaterField.GRID_W, global.WaterField.GRID_H, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null
      );
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform2f(this.loc.uGrid, global.WaterField.GRID_W, global.WaterField.GRID_H);
      gl.uniform1i(this.loc.uTex, 0);
      gl.uniform1i(this.loc.uField, 1);
    }

    #locations(program) {
      const { gl } = this;
      const loc = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i += 1) {
        const info = gl.getActiveUniform(program, i);
        loc[info.name] = gl.getUniformLocation(program, info.name);
      }
      return loc;
    }

    #simSize(width, height) {
      const aspect = width / Math.max(1, height);
      const long = 512;
      if (aspect >= 1) return { w: long, h: Math.max(24, Math.round(long / aspect)) };
      return { w: Math.max(24, Math.round(long * aspect)), h: long };
    }

    resize(width, height, dpr) {
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      const sizeChanged = this.canvas.width !== w || this.canvas.height !== h;
      if (sizeChanged) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
      this.gl.viewport(0, 0, w, h);
      this.width = width;
      this.height = height;
      this.dpr = dpr;

      if (this.mode === 'fluid') {
        const sim = this.#simSize(width, height);
        this.fluid.resize(sim.w, sim.h);
        if (!this.sceneTarget || this.sceneTarget.width !== w || this.sceneTarget.height !== h) {
          if (this.sceneTarget) {
            this.gl.deleteFramebuffer(this.sceneTarget.fbo);
            this.gl.deleteTexture(this.sceneTarget.texture);
          }
          this.sceneTarget = createByteFBO(this.gl, w, h);
        }
      }
    }

    load(src) {
      if (this.textures.has(src)) return this.textures.get(src);

      const { gl } = this;
      const record = { texture: null, aspect: 1, ready: false, failed: false };
      const promise = new Promise((resolve) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
          try {
            const texture = makeTexture(gl);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            record.texture = texture;
            record.aspect = image.naturalWidth / Math.max(1, image.naturalHeight);
            record.ready = true;
          } catch (error) {
            record.failed = true;
          }
          resolve(record);
        };
        image.onerror = () => { record.failed = true; resolve(record); };
        image.src = src;
      });

      record.promise = promise;
      this.textures.set(src, record);
      return record;
    }

    uploadCanvas(key, canvas) {
      const { gl } = this;
      let record = this.textures.get(key);
      if (!record) {
        record = { texture: makeTexture(gl), aspect: 1, ready: true, failed: false };
        this.textures.set(key, record);
      }
      gl.bindTexture(gl.TEXTURE_2D, record.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      record.aspect = canvas.width / Math.max(1, canvas.height);
      record.ready = true;
      record.failed = false;
      return record;
    }

    beginFrame(dt) {
      const { gl } = this;
      if (this.mode === 'fluid') {
        this.time += dt || 0;
        if (!this.sceneTarget) return;
        this.fluid.step(dt || 1 / 60);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneTarget.fbo);
        gl.viewport(0, 0, this.sceneTarget.width, this.sceneTarget.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(this.sceneProgram);
        this.#bindQuad(this.sceneProgram);
        return;
      }

      gl.bindTexture(gl.TEXTURE_2D, this.fieldTexture);
      gl.texSubImage2D(
        gl.TEXTURE_2D, 0, 0, 0, global.WaterField.GRID_W, global.WaterField.GRID_H,
        gl.RGBA, gl.UNSIGNED_BYTE, this.field.pack()
      );
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.fieldTexture);
      gl.activeTexture(gl.TEXTURE0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    draw(record, plate) {
      if (!record || !record.ready || plate.alpha <= 0.001 || plate.width <= 0 || plate.height <= 0) return;
      if (this.mode === 'fluid') this.#drawScene(record, plate);
      else this.#drawLegacy(record, plate);
    }

    #cover(record, plate) {
      const quadAspect = plate.width / plate.height;
      let scaleX = 1;
      let scaleY = 1;
      if (record.aspect > quadAspect) scaleX = quadAspect / record.aspect;
      else scaleY = record.aspect / quadAspect;
      const zoom = plate.zoom || 1;
      scaleX /= zoom;
      scaleY /= zoom;
      return {
        quadAspect,
        scaleX,
        scaleY,
        offsetX: (1 - scaleX) / 2,
        offsetY: (1 - scaleY) / 2
      };
    }

    #drawScene(record, plate) {
      const { gl, sceneLoc: loc } = this;
      const vw = this.width;
      const vh = this.height;
      const cx = ((plate.x + plate.width / 2) / vw) * 2 - 1;
      const cy = 1 - ((plate.y + plate.height / 2) / vh) * 2;
      gl.uniform4f(loc.uQuad, cx, cy, plate.width / vw, plate.height / vh);
      const cover = this.#cover(record, plate);
      gl.uniform2f(loc.uCoverScale, cover.scaleX, cover.scaleY);
      gl.uniform2f(loc.uCoverOffset, cover.offsetX, cover.offsetY);
      gl.uniform2f(loc.uAspect, Math.max(1, cover.quadAspect) / cover.quadAspect, Math.max(1, 1 / cover.quadAspect));
      gl.uniform1f(loc.uAlpha, plate.alpha);
      gl.uniform1f(loc.uBlob, plate.blob ?? 0);
      gl.uniform1f(loc.uFeather, plate.feather ?? 0.002);
      gl.uniform1f(loc.uDesat, plate.desaturate ?? 0);
      gl.uniform1f(loc.uBright, plate.brightness ?? 1);
      gl.uniform1f(loc.uHighlight, plate.highlight ?? 0);
      gl.uniform1f(loc.uTime, plate.time ?? this.time);
      const tint = plate.tint || [1, 1, 1];
      gl.uniform3f(loc.uTint, tint[0], tint[1], tint[2]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, record.texture);
      gl.uniform1i(loc.uTex, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    #drawLegacy(record, plate) {
      const { gl, loc } = this;
      const vw = this.width;
      const vh = this.height;
      const cx = ((plate.x + plate.width / 2) / vw) * 2 - 1;
      const cy = 1 - ((plate.y + plate.height / 2) / vh) * 2;
      gl.uniform4f(loc.uQuad, cx, cy, plate.width / vw, plate.height / vh);
      const cover = this.#cover(record, plate);
      gl.uniform2f(loc.uCoverScale, cover.scaleX, cover.scaleY);
      gl.uniform2f(loc.uCoverOffset, cover.offsetX, cover.offsetY);
      gl.uniform2f(loc.uAspect, Math.max(1, cover.quadAspect) / cover.quadAspect, Math.max(1, 1 / cover.quadAspect));
      gl.uniform1f(loc.uAlpha, plate.alpha);
      gl.uniform1f(loc.uStrength, plate.strength ?? 0.05);
      gl.uniform1f(loc.uBlob, plate.blob ?? 0);
      gl.uniform1f(loc.uFeather, plate.feather ?? 0.3);
      gl.uniform1f(loc.uDesat, plate.desaturate ?? 0);
      gl.uniform1f(loc.uBright, plate.brightness ?? 1);
      gl.uniform1f(loc.uHighlight, plate.highlight ?? 1);
      gl.uniform1f(loc.uTime, plate.time ?? 0);
      const tint = plate.tint || [1, 1, 1];
      gl.uniform3f(loc.uTint, tint[0], tint[1], tint[2]);
      gl.bindTexture(gl.TEXTURE_2D, record.texture);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    endFrame(preview) {
      if (this.mode !== 'fluid' || !this.sceneTarget) return;
      const { gl, compositeLoc: loc } = this;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.compositeProgram);
      this.#bindQuad(this.compositeProgram);
      if (loc.uTexel) gl.uniform2f(loc.uTexel, this.fluid.texel[0], this.fluid.texel[1]);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.sceneTarget.texture);
      gl.uniform1i(loc.uScene, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.fluid.velocity.read.texture);
      gl.uniform1i(loc.uVelocity, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.fluid.dye.read.texture);
      gl.uniform1i(loc.uDye, 2);
      gl.uniform1f(loc.uPower, 0.13);
      gl.uniform1f(loc.uTime, this.time);
      gl.uniform2f(loc.uPointer, this.fluid.pointer.x, 1 - this.fluid.pointer.y);
      gl.uniform1f(loc.uScreenAspect, this.width / Math.max(1, this.height));

      const hasPreview = preview && preview.record && preview.record.ready && preview.alpha > 0.004;
      gl.uniform1f(loc.uReach, (preview?.active || hasPreview) ? 0.22 : 0.15);
      gl.uniform1f(loc.uPreviewAlpha, hasPreview ? preview.alpha : 0);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, hasPreview ? preview.record.texture : this.sceneTarget.texture);
      gl.uniform1i(loc.uPreview, 3);
      if (hasPreview) {
        const uvX = preview.x / this.width;
        const uvY = 1 - (preview.y + preview.height) / this.height;
        const uvW = preview.width / this.width;
        const uvH = preview.height / this.height;
        gl.uniform4f(loc.uPreviewQuad, uvX, uvY, uvW, uvH);
        const cover = this.#cover(preview.record, preview);
        gl.uniform2f(loc.uPreviewCoverScale, cover.scaleX, cover.scaleY);
        gl.uniform2f(loc.uPreviewCoverOffset, cover.offsetX, cover.offsetY);
        gl.uniform2f(
          loc.uPreviewAspect,
          Math.max(1, cover.quadAspect) / cover.quadAspect,
          Math.max(1, 1 / cover.quadAspect)
        );
        gl.uniform1f(loc.uPreviewFeather, 0.4);
      } else {
        gl.uniform4f(loc.uPreviewQuad, 0, 0, 0, 0);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  global.WaterRenderer = WaterRenderer;
})(window);
