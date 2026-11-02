/* 桌面工坊：全部纹理由代码生成，不加载任何外部图片 */
import * as THREE from "three";

const CN_FONT = "'Noto Sans SC','Microsoft YaHei','PingFang SC','Heiti SC',sans-serif";
const cache = new Map();

function canvas(size, h) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = h || size;
  return c;
}

function finish(c, { repeat = 1, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

function cached(key, make) {
  if (cache.has(key)) return cache.get(key);
  const t = make();
  cache.set(key, t);
  return t;
}

/* ---------- 木纹：胡桃木书桌、印刷机底座 ---------- */
export function woodTexture(tone = "walnut", repeat = 1) {
  return cached(`wood:${tone}:${repeat}`, () => {
    const s = 512;
    const c = canvas(s);
    const x = c.getContext("2d");
    const base = tone === "walnut" ? ["#6b4a2f", "#8a5f3c"] : ["#b98a55", "#d6ab72"];
    const g = x.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, base[1]);
    g.addColorStop(1, base[0]);
    x.fillStyle = g;
    x.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * s;
      const amp = 4 + Math.random() * 16;
      x.beginPath();
      x.moveTo(0, y);
      for (let px = 0; px <= s; px += 8) {
        x.lineTo(px, y + Math.sin(px * 0.017 + i) * amp * 0.25);
      }
      x.strokeStyle = `rgba(${Math.random() > 0.5 ? "60,38,22" : "150,110,72"},${0.06 + Math.random() * 0.14})`;
      x.lineWidth = 0.6 + Math.random() * 2.4;
      x.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const cx = Math.random() * s;
      const cy = Math.random() * s;
      for (let r = 2; r < 26; r += 3) {
        x.beginPath();
        x.ellipse(cx, cy, r, r * 0.55, Math.random(), 0, Math.PI * 2);
        x.strokeStyle = `rgba(70,44,26,${0.12 - r * 0.003})`;
        x.stroke();
      }
    }
    return finish(c, { repeat });
  });
}

/* ---------- 纸：手帐纸页、明信片、便签 ---------- */
export function paperTexture(tone = "cream", repeat = 1) {
  return cached(`paper:${tone}:${repeat}`, () => {
    const s = 512;
    const c = canvas(s);
    const x = c.getContext("2d");
    const fill = { cream: "#faf6ea", kraft: "#d8bd92", cold: "#eef3f2" }[tone] || "#faf6ea";
    x.fillStyle = fill;
    x.fillRect(0, 0, s, s);
    for (let i = 0; i < 14000; i++) {
      x.fillStyle = `rgba(${120 + Math.random() * 90},${110 + Math.random() * 80},${90 + Math.random() * 70},${0.02 + Math.random() * 0.05})`;
      x.fillRect(Math.random() * s, Math.random() * s, 1, 1);
    }
    for (let i = 0; i < 40; i++) {
      x.strokeStyle = `rgba(160,140,110,${0.03 + Math.random() * 0.05})`;
      x.beginPath();
      const y = Math.random() * s;
      x.moveTo(0, y);
      x.lineTo(s, y + (Math.random() - 0.5) * 12);
      x.stroke();
    }
    return finish(c, { repeat });
  });
}

/* ---------- 皮革：老相机机身 ---------- */
export function leatherTexture(repeat = 2) {
  return cached(`leather:${repeat}`, () => {
    const s = 256;
    const c = canvas(s);
    const x = c.getContext("2d");
    x.fillStyle = "#2b2622";
    x.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) {
      const px = Math.random() * s;
      const py = Math.random() * s;
      const r = 1.5 + Math.random() * 3.5;
      x.beginPath();
      x.arc(px, py, r, 0, Math.PI * 2);
      x.fillStyle = `rgba(${60 + Math.random() * 40},${54 + Math.random() * 34},${48 + Math.random() * 30},0.32)`;
      x.fill();
    }
    return finish(c, { repeat });
  });
}

/* ---------- 瓦：白族院落屋顶 ---------- */
export function tileTexture(repeat = 3) {
  return cached(`tile:${repeat}`, () => {
    const s = 256;
    const c = canvas(s);
    const x = c.getContext("2d");
    x.fillStyle = "#5c6068";
    x.fillRect(0, 0, s, s);
    const th = 26;
    const tw = 34;
    for (let row = 0; row < s; row += th) {
      const off = ((row / th) % 2) * (tw / 2);
      for (let col = -tw; col < s; col += tw) {
        const px = col + off;
        const v = 70 + Math.random() * 40;
        x.fillStyle = `rgb(${v},${v + 4},${v + 10})`;
        x.beginPath();
        x.moveTo(px, row + th);
        x.quadraticCurveTo(px + tw / 2, row - 4, px + tw, row + th);
        x.fill();
        x.strokeStyle = "rgba(30,34,40,0.55)";
        x.stroke();
      }
    }
    return finish(c, { repeat });
  });
}

/* ---------- 标牌文字：控制台、区域名 ---------- */
export function signTexture(text, opts = {}) {
  const {
    w = 512,
    h = 128,
    bg = "#1f4d42",
    fg = "#f5eedc",
    size = 54,
    sub = "",
    round = 28,
  } = opts;
  return cached(`sign:${text}:${sub}:${bg}:${fg}:${w}x${h}:${size}`, () => {
    const c = canvas(w, h);
    const x = c.getContext("2d");
    x.clearRect(0, 0, w, h);
    x.fillStyle = bg;
    roundRect(x, 4, 4, w - 8, h - 8, round);
    x.fill();
    x.strokeStyle = "rgba(245,238,220,0.28)";
    x.lineWidth = 3;
    roundRect(x, 4, 4, w - 8, h - 8, round);
    x.stroke();
    x.fillStyle = fg;
    x.textAlign = "center";
    x.textBaseline = "middle";
    if (sub) {
      x.font = `600 ${size}px ${CN_FONT}`;
      x.fillText(text, w / 2, h * 0.4);
      x.font = `400 ${Math.round(size * 0.42)}px ${CN_FONT}`;
      x.globalAlpha = 0.72;
      x.fillText(sub, w / 2, h * 0.74);
      x.globalAlpha = 1;
    } else {
      x.font = `600 ${size}px ${CN_FONT}`;
      x.fillText(text, w / 2, h / 2);
    }
    return finish(c);
  });
}

/* ---------- 念头标签：用户输入的字印在小方块上 ---------- */
export function thoughtLabel(text, accent = "#e2724f") {
  const c = canvas(256, 256);
  const x = c.getContext("2d");
  x.fillStyle = "#faf6ea";
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    x.fillStyle = `rgba(150,130,100,${0.02 + Math.random() * 0.04})`;
    x.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  x.strokeStyle = accent;
  x.lineWidth = 8;
  x.strokeRect(14, 14, 228, 228);
  x.fillStyle = "#2b3a34";
  x.textAlign = "center";
  x.textBaseline = "middle";
  const clipped = (text || "一个念头").slice(0, 20);
  const lines = [];
  const per = clipped.length > 8 ? 4 : 3;
  for (let i = 0; i < clipped.length; i += per) lines.push(clipped.slice(i, i + per));
  const fs = Math.max(26, Math.min(66, 200 / Math.max(per, lines.length)));
  x.font = `600 ${fs}px ${CN_FONT}`;
  const start = 128 - ((lines.length - 1) * fs * 1.18) / 2;
  lines.forEach((ln, i) => x.fillText(ln, 128, start + i * fs * 1.18));
  return finish(c);
}

/* ---------- 邮戳：送达线路盖在明信片上 ---------- */
export function stampTexture(routeName, accent = "#1f4d42") {
  return cached(`stamp:${routeName}:${accent}`, () => {
    const c = canvas(256, 256);
    const x = c.getContext("2d");
    x.clearRect(0, 0, 256, 256);
    x.strokeStyle = accent;
    x.lineWidth = 9;
    x.beginPath();
    x.arc(128, 128, 96, 0, Math.PI * 2);
    x.stroke();
    x.lineWidth = 3;
    x.beginPath();
    x.arc(128, 128, 78, 0, Math.PI * 2);
    x.stroke();
    x.fillStyle = accent;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = `600 46px ${CN_FONT}`;
    x.fillText(routeName, 128, 118);
    x.font = `400 22px ${CN_FONT}`;
    x.fillText("YUNNAN", 128, 162);
    return finish(c);
  });
}

/* ---------- 屏幕：暗房计时器 / 邮局告示 ---------- */
export function screenTexture(lines, opts = {}) {
  const { bg = "#0f2a26", fg = "#8fe3c4" } = opts;
  return cached(`screen:${lines.join("|")}:${bg}`, () => {
    const c = canvas(256, 128);
    const x = c.getContext("2d");
    x.fillStyle = bg;
    x.fillRect(0, 0, 256, 128);
    x.fillStyle = fg;
    x.font = `500 24px ${CN_FONT}`;
    x.textAlign = "left";
    lines.forEach((ln, i) => x.fillText(ln, 18, 40 + i * 34));
    for (let y = 0; y < 128; y += 3) {
      x.fillStyle = "rgba(0,0,0,0.12)";
      x.fillRect(0, y, 256, 1);
    }
    return finish(c);
  });
}

/* ---------- 光晕贴图：灵感点、灯光 ---------- */
export function glowTexture() {
  return cached("glow", () => {
    const c = canvas(128);
    const x = c.getContext("2d");
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.35, "rgba(255,236,190,0.45)");
    g.addColorStop(1, "rgba(255,236,190,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/* ---------- 页面插画：手帐三页的程序化小景 ---------- */
export function pageArt(kind) {
  return cached(`page:${kind}`, () => {
    const w = 512;
    const h = 640;
    const c = canvas(w, h);
    const x = c.getContext("2d");
    x.fillStyle = "#faf6ea";
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      x.fillStyle = `rgba(150,130,100,${0.015 + Math.random() * 0.035})`;
      x.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    const pal = {
      rain: ["#2f7a52", "#7fbf6a", "#d9a63c"],
      tea: ["#6d8f3c", "#b9c96a", "#e2b04f"],
      lake: ["#3f7f96", "#8fc8d8", "#e2724f"],
    }[kind];
    x.globalAlpha = 0.9;
    if (kind === "rain") {
      for (let i = 0; i < 26; i++) {
        const bx = 40 + Math.random() * (w - 80);
        const by = h - 60 - Math.random() * 300;
        x.fillStyle = pal[i % 2];
        x.beginPath();
        x.ellipse(bx, by, 22 + Math.random() * 26, 34 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
        x.fill();
      }
    } else if (kind === "tea") {
      for (let r = 0; r < 9; r++) {
        x.strokeStyle = pal[r % 2];
        x.lineWidth = 12;
        x.beginPath();
        x.moveTo(20, 140 + r * 54);
        for (let px = 20; px <= w - 20; px += 16) {
          x.lineTo(px, 140 + r * 54 + Math.sin(px * 0.02 + r) * 12);
        }
        x.stroke();
      }
    } else {
      x.fillStyle = pal[1];
      x.fillRect(0, h * 0.5, w, h * 0.5);
      for (let i = 0; i < 12; i++) {
        x.strokeStyle = pal[0];
        x.lineWidth = 5;
        x.beginPath();
        const y = h * 0.55 + i * 22;
        x.moveTo(0, y);
        for (let px = 0; px <= w; px += 14) x.lineTo(px, y + Math.sin(px * 0.04 + i) * 5);
        x.stroke();
      }
      x.fillStyle = pal[2];
      x.beginPath();
      x.arc(w * 0.72, h * 0.3, 52, 0, Math.PI * 2);
      x.fill();
    }
    x.globalAlpha = 1;
    x.fillStyle = "#2b3a34";
    x.font = `600 40px ${CN_FONT}`;
    x.textAlign = "left";
    x.fillText({ rain: "雨林页", tea: "茶山页", lake: "洱海页" }[kind], 36, 72);
    return finish(c);
  });
}

function roundRect(x, px, py, w, h, r) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

export { CN_FONT };
