/**
 * Shared water field.
 *
 * A single coarse grid simulation drives every fluid interaction on the page:
 * the hero plate, the hover preview, headline letters and the cursor all read
 * from this one field, so pointer drag, scroll and hover all feel like the same
 * body of water rather than separate effects.
 *
 * Two coupled layers:
 *   height   — wave equation, gives outward-travelling ripples that interfere
 *   velocity — semi-Lagrangian advected drag, gives the smeared trail behind the pointer
 *
 * The GPU only ever reads the packed result, so image distortion and DOM
 * distortion cannot drift apart.
 */
(function (global) {
  'use strict';

  const GRID_W = 128;
  const GRID_H = 72;
  const CELLS = GRID_W * GRID_H;

  // c^2 * dt^2 / dx^2 — must stay under 0.5 for a stable 2D wave equation.
  const WAVE_SPEED = 0.34;
  const WAVE_DAMPING = 0.9915;
  const DRAG_DISSIPATION = 0.955;
  const HEIGHT_TO_SLOPE = 46;
  const DRAG_GAIN = 0.9;

  const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

  class WaterField {
    constructor() {
      this.height = new Float32Array(CELLS);
      this.prevHeight = new Float32Array(CELLS);
      this.nextHeight = new Float32Array(CELLS);
      this.velX = new Float32Array(CELLS);
      this.velY = new Float32Array(CELLS);
      this.tmpX = new Float32Array(CELLS);
      this.tmpY = new Float32Array(CELLS);
      this.packed = new Uint8Array(CELLS * 4);

      this.pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, active: false, speed: 0 };
      this.energy = 0;
      this.version = 0;
      this.aspect = 1;
      this.paused = false;
    }

    setAspect(aspect) {
      this.aspect = aspect || 1;
    }

    /** Pointer position in normalized viewport space. */
    movePointer(nx, ny) {
      const x = clamp(nx, 0, 1);
      const y = clamp(ny, 0, 1);
      if (!this.pointer.active) {
        this.pointer.px = x;
        this.pointer.py = y;
        this.pointer.active = true;
      }
      this.pointer.x = x;
      this.pointer.y = y;
    }

    releasePointer() {
      this.pointer.active = false;
    }

    /**
     * Push a disturbance into the water.
     * @param {number} nx normalized x
     * @param {number} ny normalized y
     * @param {number} dx normalized velocity x
     * @param {number} dy normalized velocity y
     * @param {number} radius normalized radius
     * @param {number} amount dimple depth
     */
    splat(nx, ny, dx, dy, radius = 0.06, amount = 1) {
      const cx = nx * GRID_W;
      const cy = ny * GRID_H;
      const rx = Math.max(1.5, radius * GRID_W);
      const ry = Math.max(1.5, radius * GRID_H * this.aspect);
      const x0 = Math.max(0, Math.floor(cx - rx * 2));
      const x1 = Math.min(GRID_W - 1, Math.ceil(cx + rx * 2));
      const y0 = Math.max(0, Math.floor(cy - ry * 2));
      const y1 = Math.min(GRID_H - 1, Math.ceil(cy + ry * 2));
      const invRx2 = 1 / (rx * rx);
      const invRy2 = 1 / (ry * ry);

      for (let y = y0; y <= y1; y += 1) {
        const ddy = y + 0.5 - cy;
        for (let x = x0; x <= x1; x += 1) {
          const ddx = x + 0.5 - cx;
          const falloff = Math.exp(-(ddx * ddx * invRx2 + ddy * ddy * invRy2));
          if (falloff < 0.004) continue;
          const i = y * GRID_W + x;
          this.height[i] -= amount * falloff * 0.5;
          this.velX[i] += dx * falloff * 26;
          this.velY[i] += dy * falloff * 26;
        }
      }
      this.energy = Math.min(1, this.energy + Math.abs(amount) * 0.22);
    }

    /** A wide, soft current — used to let scrolling stir the same water. */
    current(dy, strength) {
      if (Math.abs(strength) < 0.0001) return;
      for (let i = 0; i < CELLS; i += 1) {
        this.velY[i] += dy * strength;
      }
      this.energy = Math.min(1, this.energy + Math.abs(strength) * 0.8);
    }

    step(dt) {
      if (this.paused) return;
      const scale = clamp(dt / (1 / 60), 0.35, 2.2);

      this.#trackPointer(scale);
      this.#advect(scale);
      this.#integrateWave(scale);

      this.energy *= Math.pow(0.94, scale);
      this.version += 1;
    }

    #trackPointer(scale) {
      const p = this.pointer;
      if (!p.active) {
        p.speed *= 0.9;
        return;
      }
      const dx = p.x - p.px;
      const dy = p.y - p.py;
      const speed = Math.hypot(dx, dy);
      p.speed += (speed - p.speed) * 0.35;

      if (speed > 0.0006) {
        // Sub-step along the travelled segment so fast flicks stay continuous
        // instead of leaving a dotted trail of splats.
        const steps = Math.min(6, Math.max(1, Math.ceil(speed / 0.012)));
        const amount = Math.min(1.15, speed * 16) / steps;
        for (let s = 1; s <= steps; s += 1) {
          const t = s / steps;
          this.splat(
            p.px + dx * t,
            p.py + dy * t,
            dx / steps,
            dy / steps,
            0.055 + Math.min(0.05, speed * 0.9),
            amount * scale
          );
        }
      }
      p.px = p.x;
      p.py = p.y;
    }

    #advect(scale) {
      const { velX, velY, tmpX, tmpY } = this;
      const dissipation = Math.pow(DRAG_DISSIPATION, scale);
      const step = 0.55 * scale;

      for (let y = 0; y < GRID_H; y += 1) {
        for (let x = 0; x < GRID_W; x += 1) {
          const i = y * GRID_W + x;
          let sx = x - velX[i] * step;
          let sy = y - velY[i] * step;
          sx = clamp(sx, 0, GRID_W - 1.001);
          sy = clamp(sy, 0, GRID_H - 1.001);

          const x0 = sx | 0;
          const y0 = sy | 0;
          const fx = sx - x0;
          const fy = sy - y0;
          const x1 = x0 + 1 < GRID_W ? x0 + 1 : x0;
          const y1 = y0 + 1 < GRID_H ? y0 + 1 : y0;
          const i00 = y0 * GRID_W + x0;
          const i10 = y0 * GRID_W + x1;
          const i01 = y1 * GRID_W + x0;
          const i11 = y1 * GRID_W + x1;
          const w00 = (1 - fx) * (1 - fy);
          const w10 = fx * (1 - fy);
          const w01 = (1 - fx) * fy;
          const w11 = fx * fy;

          tmpX[i] = (velX[i00] * w00 + velX[i10] * w10 + velX[i01] * w01 + velX[i11] * w11) * dissipation;
          tmpY[i] = (velY[i00] * w00 + velY[i10] * w10 + velY[i01] * w01 + velY[i11] * w11) * dissipation;
        }
      }
      this.velX = tmpX;
      this.velY = tmpY;
      this.tmpX = velX;
      this.tmpY = velY;
    }

    #integrateWave(scale) {
      const { height, prevHeight, nextHeight } = this;
      const c2 = WAVE_SPEED * clamp(scale, 0.5, 1.6);
      const damping = Math.pow(WAVE_DAMPING, scale);

      for (let y = 0; y < GRID_H; y += 1) {
        const up = (y > 0 ? y - 1 : y) * GRID_W;
        const down = (y < GRID_H - 1 ? y + 1 : y) * GRID_W;
        const row = y * GRID_W;
        for (let x = 0; x < GRID_W; x += 1) {
          const i = row + x;
          const left = row + (x > 0 ? x - 1 : x);
          const right = row + (x < GRID_W - 1 ? x + 1 : x);
          const laplacian = height[left] + height[right] + height[up + x] + height[down + x] - 4 * height[i];
          let value = 2 * height[i] - prevHeight[i] + c2 * laplacian;
          value *= damping;
          nextHeight[i] = value > 3 ? 3 : value < -3 ? -3 : value;
        }
      }
      this.prevHeight = height;
      this.height = nextHeight;
      this.nextHeight = prevHeight;
    }

    /**
     * Displacement at a normalized point, in normalized units.
     * Wave slope gives the refractive ripple, advected velocity gives the drag.
     */
    sample(nx, ny, out) {
      const target = out || { x: 0, y: 0, height: 0, strength: 0 };
      const gx = clamp(nx * GRID_W - 0.5, 0, GRID_W - 1.001);
      const gy = clamp(ny * GRID_H - 0.5, 0, GRID_H - 1.001);
      const x0 = gx | 0;
      const y0 = gy | 0;
      const fx = gx - x0;
      const fy = gy - y0;
      const x1 = x0 + 1 < GRID_W ? x0 + 1 : x0;
      const y1 = y0 + 1 < GRID_H ? y0 + 1 : y0;
      const xm = x0 > 0 ? x0 - 1 : x0;
      const ym = y0 > 0 ? y0 - 1 : y0;

      const h = this.height;
      const bilinear = (buf) =>
        buf[y0 * GRID_W + x0] * (1 - fx) * (1 - fy) +
        buf[y0 * GRID_W + x1] * fx * (1 - fy) +
        buf[y1 * GRID_W + x0] * (1 - fx) * fy +
        buf[y1 * GRID_W + x1] * fx * fy;

      const centre = bilinear(h);
      const slopeX = (h[y0 * GRID_W + x1] - h[y0 * GRID_W + xm]) * 0.5;
      const slopeY = (h[y1 * GRID_W + x0] - h[ym * GRID_W + x0]) * 0.5;

      target.height = centre;
      target.x = (slopeX * HEIGHT_TO_SLOPE + bilinear(this.velX) * DRAG_GAIN) / GRID_W;
      target.y = (slopeY * HEIGHT_TO_SLOPE + bilinear(this.velY) * DRAG_GAIN) / GRID_H;
      target.strength = Math.min(1, Math.hypot(target.x, target.y) * 12 + Math.abs(centre) * 0.8);
      return target;
    }

    /** RGBA8: rg = displacement, b = height, a = local energy. */
    pack() {
      const { packed, height, velX, velY } = this;
      for (let y = 0; y < GRID_H; y += 1) {
        const up = (y > 0 ? y - 1 : y) * GRID_W;
        const down = (y < GRID_H - 1 ? y + 1 : y) * GRID_W;
        const row = y * GRID_W;
        for (let x = 0; x < GRID_W; x += 1) {
          const i = row + x;
          const left = row + (x > 0 ? x - 1 : x);
          const right = row + (x < GRID_W - 1 ? x + 1 : x);
          const slopeX = (height[right] - height[left]) * 0.5;
          const slopeY = (height[down + x] - height[up + x]) * 0.5;
          const dx = slopeX * HEIGHT_TO_SLOPE * 0.02 + velX[i] * DRAG_GAIN * 0.02;
          const dy = slopeY * HEIGHT_TO_SLOPE * 0.02 + velY[i] * DRAG_GAIN * 0.02;
          const o = i * 4;
          packed[o] = clamp(dx * 0.5 + 0.5, 0, 1) * 255;
          packed[o + 1] = clamp(dy * 0.5 + 0.5, 0, 1) * 255;
          packed[o + 2] = clamp(height[i] * 0.35 + 0.5, 0, 1) * 255;
          packed[o + 3] = clamp(Math.hypot(dx, dy) * 6, 0, 1) * 255;
        }
      }
      return packed;
    }
  }

  WaterField.GRID_W = GRID_W;
  WaterField.GRID_H = GRID_H;
  global.WaterField = WaterField;
})(window);
