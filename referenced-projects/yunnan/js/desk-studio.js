/* 云南手帐 · 桌面工坊
 * 三站一体：显影暗房 → 手帐印坊 → 洱海邮局
 * 全部几何/材质/文字程序化生成
 */
import * as THREE from "three";
import {
  woodTexture,
  paperTexture,
  leatherTexture,
  tileTexture,
  signTexture,
  thoughtLabel,
  stampTexture,
  screenTexture,
  glowTexture,
  pageArt,
} from "./studio-tex.js";

const PAL = {
  cream: "#f5eedc",
  walnut: "#6b4a2f",
  ink: "#1f4d42",
  coral: "#e2724f",
  mustard: "#e2b04f",
  mist: "#8fc8d8",
  paper: "#faf6ea",
  night: "#0f1c22",
};

const SPEEDS = { slow: 0.55, normal: 1, busy: 1.65 };
const TIME_PRESETS = {
  day: { amb: 0.85, sun: 1.35, color: "#fff1d6", fog: 0.012, bg: "#c8ddd6" },
  dusk: { amb: 0.55, sun: 1.05, color: "#ffc078", fog: 0.016, bg: "#8a6a55" },
  night: { amb: 0.22, sun: 0.25, color: "#6a8cff", fog: 0.02, bg: "#0f1c22" },
};

const PRESETS = [
  { text: "一个故事", tone: "warm", page: "lake", route: "water" },
  { text: "一幅画", tone: "ink", page: "rain", route: "forest" },
  { text: "一个奇怪的问题", tone: "cool", page: "tea", route: "mountain" },
];

const PAGE_NAMES = { rain: "雨林页", tea: "茶山页", lake: "洱海页" };
const TONE_NAMES = { warm: "暖调", cool: "冷调", ink: "水墨" };
const ROUTE_NAMES = { water: "水路", mountain: "山路", forest: "林路" };
const TONE_COLORS = { warm: "#e2724f", cool: "#5a9bb8", ink: "#2b3a34" };
const PAGE_COLORS = { rain: "#2f7a52", tea: "#6d8f3c", lake: "#3f7f96" };
const ROUTE_COLORS = { water: "#3f7f96", mountain: "#a0673a", forest: "#2f7a52" };

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: opts.map ? "#ffffff" : color,
    map: opts.map || null,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.04,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    side: opts.side ?? THREE.FrontSide,
  });
}

function box(w, h, d, material, y = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, material, segs = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function lerpV(a, b, t) {
  return a.clone().lerp(b, t);
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

/* ===================== 小人 ===================== */
function makeWorker(style = {}) {
  const g = new THREE.Group();
  const skin = mat(style.skin || "#e8c9a8", { roughness: 0.8 });
  const cloth = mat(style.cloth || "#1f4d42", { roughness: 0.7 });
  const accent = mat(style.accent || "#e2724f", { roughness: 0.55 });

  const body = box(0.22, 0.32, 0.16, cloth, 0.28);
  g.add(body);
  const head = cyl(0.1, 0.1, 0.16, skin, 10);
  head.position.y = 0.54;
  g.add(head);
  const legL = box(0.06, 0.18, 0.06, mat("#2b3a34"), 0.06);
  legL.position.x = -0.05;
  const legR = legL.clone();
  legR.position.x = 0.05;
  g.add(legL, legR);
  const armL = box(0.05, 0.2, 0.05, cloth, 0.32);
  armL.position.set(-0.15, 0.32, 0);
  const armR = armL.clone();
  armR.position.x = 0.15;
  g.add(armL, armR);

  if (style.hat) {
    const hat = cyl(0.12, 0.12, 0.06, accent, 10);
    hat.position.y = 0.64;
    g.add(hat);
  }
  if (style.apron) {
    const apron = box(0.18, 0.2, 0.04, mat("#f5eedc"), 0.26);
    apron.position.z = 0.1;
    g.add(apron);
  }
  if (style.glasses) {
    const frame = box(0.16, 0.03, 0.02, mat("#333"), 0.54);
    frame.position.z = 0.1;
    g.add(frame);
  }

  g.userData = { armL, armR, legL, legR, body, phase: Math.random() * Math.PI * 2, job: style.job || "" };
  g.scale.setScalar(style.scale || 1);
  return g;
}

function animateWorker(w, t, moving, speed) {
  const d = w.userData;
  const bob = Math.sin(t * 6 * speed + d.phase) * (moving ? 0.04 : 0.01);
  w.position.y = (w.userData.baseY || 0) + bob;
  if (d.armL && d.armR) {
    const swing = moving ? Math.sin(t * 8 * speed + d.phase) * 0.55 : Math.sin(t * 2 + d.phase) * 0.08;
    d.armL.rotation.x = swing;
    d.armR.rotation.x = -swing;
  }
}

/* ===================== 念头方块 ===================== */
function makeThought(text, accent) {
  const g = new THREE.Group();
  const map = thoughtLabel(text, accent);
  const mesh = box(0.28, 0.28, 0.28, mat("#faf6ea", { map, roughness: 0.65 }));
  g.add(mesh);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      color: accent,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  glow.scale.set(0.7, 0.7, 1);
  g.add(glow);
  g.userData = { text, accent, mesh, glow };
  return g;
}

/* ===================== 成品明信片 ===================== */
function makePostcard(job) {
  const g = new THREE.Group();
  const paper = box(0.55, 0.02, 0.38, mat("#faf6ea", { map: paperTexture("cream", 1), roughness: 0.9 }));
  g.add(paper);
  const art = box(0.42, 0.015, 0.26, mat(PAGE_COLORS[job.page], { roughness: 0.7, emissive: TONE_COLORS[job.tone], emissiveIntensity: 0.08 }));
  art.position.set(0, 0.02, -0.02);
  g.add(art);
  const stamp = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 0.16),
    mat("#fff", { map: stampTexture(ROUTE_NAMES[job.route], ROUTE_COLORS[job.route]), roughness: 0.8, transparent: true })
  );
  stamp.rotation.x = -Math.PI / 2;
  stamp.position.set(0.16, 0.03, 0.1);
  g.add(stamp);
  g.userData = { job };
  return g;
}

/* ===================== 区域构建 ===================== */
function buildDesk(root) {
  const wood = woodTexture("walnut", 2);
  const top = box(14, 0.35, 9, mat("#6b4a2f", { map: wood, roughness: 0.85 }), 0);
  top.receiveShadow = true;
  root.add(top);
  const legMat = mat("#4a3220", { roughness: 0.9 });
  [
    [-6.2, -0.9, -3.6],
    [6.2, -0.9, -3.6],
    [-6.2, -0.9, 3.6],
    [6.2, -0.9, 3.6],
  ].forEach(([x, y, z]) => {
    const leg = box(0.35, 1.6, 0.35, legMat, y);
    leg.position.set(x, y, z);
    root.add(leg);
  });

  // 桌角道具
  const pencil = cyl(0.03, 0.03, 1.1, mat("#e2b04f"), 8);
  pencil.rotation.z = Math.PI / 2;
  pencil.position.set(-5.5, 0.25, 3.2);
  root.add(pencil);
  const cup = cyl(0.22, 0.18, 0.35, mat("#f5eedc"), 14);
  cup.position.set(5.6, 0.35, 3.1);
  root.add(cup);
  const note = box(0.7, 0.02, 0.7, mat("#faf6ea", { map: paperTexture("kraft", 1) }), 0.2);
  note.position.set(-4.2, 0.2, 3.3);
  note.rotation.y = 0.3;
  root.add(note);
}

function buildDarkroom(root, interactives) {
  const zone = new THREE.Group();
  zone.position.set(-4.2, 0.18, -0.6);
  zone.name = "darkroom";

  // 剖开的老相机机身
  const leather = leatherTexture(2);
  const body = box(2.4, 1.6, 1.8, mat("#2b2622", { map: leather, roughness: 0.9 }), 0.9);
  zone.add(body);
  // 开放剖面（去掉前盖，用暗腔表示）
  const cavity = box(1.9, 1.2, 1.4, mat("#1a1512", { roughness: 1 }), 0.9);
  cavity.position.z = 0.15;
  zone.add(cavity);

  // 镜头
  const lens = cyl(0.35, 0.4, 0.5, mat("#333", { metalness: 0.6, roughness: 0.35 }), 18);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.95, 1.15);
  zone.add(lens);
  const glass = cyl(0.28, 0.28, 0.08, mat("#8fc8d8", { transparent: true, opacity: 0.45, metalness: 0.3, roughness: 0.2 }), 16);
  glass.rotation.x = Math.PI / 2;
  glass.position.set(0, 0.95, 1.4);
  zone.add(glass);

  // 显影槽三连
  const baths = [];
  ["#e2724f", "#5a9bb8", "#2b3a34"].forEach((col, i) => {
    const tray = box(0.45, 0.12, 0.55, mat("#d8bd92", { map: paperTexture("kraft", 1) }), 0.35);
    tray.position.set(-0.55 + i * 0.55, 0.35, 0.2);
    zone.add(tray);
    const liquid = box(0.38, 0.04, 0.45, mat(col, { transparent: true, opacity: 0.7, emissive: col, emissiveIntensity: 0.15 }), 0.42);
    liquid.position.copy(tray.position);
    liquid.position.y = 0.42;
    zone.add(liquid);
    baths.push({ tray, liquid, tone: ["warm", "cool", "ink"][i] });
  });

  // 三个药水阀
  const valves = [];
  ["暖", "冷", "墨"].forEach((label, i) => {
    const g = new THREE.Group();
    g.position.set(-0.55 + i * 0.55, 0.72, 0.85);
    const base = cyl(0.08, 0.1, 0.1, mat("#8a5f3c", { metalness: 0.3, roughness: 0.5 }), 10);
    g.add(base);
    const knob = box(0.14, 0.06, 0.04, mat(TONE_COLORS[["warm", "cool", "ink"][i]], { roughness: 0.4 }));
    knob.position.y = 0.1;
    g.add(knob);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.12),
      mat("#fff", { map: signTexture(label, { w: 256, h: 96, bg: "#1f4d42", size: 48 }), transparent: true })
    );
    sign.position.set(0, -0.18, 0.08);
    g.add(sign);
    g.userData = { kind: "valve", tone: ["warm", "cool", "ink"][i], knob, label: `药水阀 · ${TONE_NAMES[["warm", "cool", "ink"][i]]}` };
    zone.add(g);
    valves.push(g);
    interactives.push(g);
  });

  // 晾片绳
  const line = box(1.8, 0.02, 0.02, mat("#c9b896"), 1.45);
  line.position.z = -0.4;
  zone.add(line);

  // 小屏幕
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.35),
    mat("#0f2a26", { map: screenTexture(["显影中…", "等待光块"], { bg: "#0f2a26", fg: "#8fe3c4" }) })
  );
  screen.position.set(0.85, 1.15, 0.95);
  zone.add(screen);

  // 区域标牌
  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 0.24),
    mat("#fff", { map: signTexture("显影暗房", { sub: "光 → 底片", w: 512, h: 140, size: 48 }), transparent: true })
  );
  title.position.set(0, 1.72, 0.95);
  zone.add(title);

  root.add(zone);
  return { zone, baths, valves, screen, lens };
}

function buildJournalPress(root, interactives) {
  const zone = new THREE.Group();
  zone.position.set(0.3, 0.18, -0.2);
  zone.name = "journal";

  // 摊开的大手帐
  const coverL = box(2.2, 0.08, 3.2, mat("#1f4d42", { map: paperTexture("kraft", 1), roughness: 0.85 }), 0.1);
  coverL.position.x = -1.15;
  coverL.rotation.y = 0.08;
  zone.add(coverL);
  const coverR = box(2.2, 0.08, 3.2, mat("#1f4d42", { map: paperTexture("kraft", 1), roughness: 0.85 }), 0.1);
  coverR.position.x = 1.15;
  coverR.rotation.y = -0.08;
  zone.add(coverR);

  // 三页立体纸雕（竖起）
  const pages = [];
  ["rain", "tea", "lake"].forEach((kind, i) => {
    const g = new THREE.Group();
    g.position.set(-0.9 + i * 0.95, 0.15, -0.2);
    const sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 1.4),
      mat("#fff", { map: pageArt(kind), roughness: 0.9, side: THREE.DoubleSide })
    );
    sheet.position.y = 0.7;
    sheet.rotation.x = -0.15;
    g.add(sheet);
    // pop-up 折痕小景
    const pop = box(0.35, 0.25, 0.08, mat(PAGE_COLORS[kind], { roughness: 0.7 }), 0.55);
    pop.position.set(0, 0.4, 0.15);
    pop.rotation.x = -0.4;
    g.add(pop);
    g.userData = { kind: "page", page: kind, label: `手帐 · ${PAGE_NAMES[kind]}` };
    zone.add(g);
    pages.push(g);
    interactives.push(g);
  });

  // 印刷机
  const press = box(0.9, 0.55, 0.7, mat("#6b4a2f", { map: woodTexture("oak", 1), roughness: 0.75 }), 0.45);
  press.position.set(1.6, 0.45, 1.1);
  zone.add(press);
  const roller = cyl(0.12, 0.12, 0.7, mat("#444", { metalness: 0.5, roughness: 0.4 }), 12);
  roller.rotation.z = Math.PI / 2;
  roller.position.set(1.6, 0.85, 1.1);
  zone.add(roller);

  // 纸轨道道岔（三向）
  const switcher = new THREE.Group();
  switcher.position.set(0, 0.22, 1.35);
  const base = box(1.4, 0.08, 0.35, mat("#8a5f3c"), 0);
  switcher.add(base);
  const lever = box(0.08, 0.35, 0.08, mat("#e2724f"), 0.2);
  lever.position.set(0, 0.2, 0);
  switcher.add(lever);
  const switchSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.22),
    mat("#fff", { map: signTexture("扳道岔 · 选纸页", { w: 512, h: 96, size: 36 }), transparent: true })
  );
  switchSign.position.set(0, 0.45, 0);
  switcher.add(switchSign);
  switcher.userData = { kind: "pageSwitch", lever, page: "lake", label: "纸轨道道岔 · 决定落在哪一页" };
  zone.add(switcher);
  interactives.push(switcher);

  // 调色台
  const palette = box(0.7, 0.06, 0.5, mat("#f5eedc"), 0.22);
  palette.position.set(-1.5, 0.22, 1.2);
  zone.add(palette);
  ["#e2724f", "#e2b04f", "#2f7a52", "#5a9bb8"].forEach((c, i) => {
    const blob = cyl(0.07, 0.07, 0.04, mat(c), 8);
    blob.position.set(-1.7 + i * 0.14, 0.28, 1.15);
    zone.add(blob);
  });

  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.24),
    mat("#fff", { map: signTexture("手帐印坊", { sub: "纸页 · 压印 · 缝线", w: 512, h: 140, size: 48 }), transparent: true })
  );
  title.position.set(0, 1.72, 1.4);
  zone.add(title);

  root.add(zone);
  return { zone, pages, switcher, roller, press };
}

function buildPostOffice(root, interactives) {
  const zone = new THREE.Group();
  zone.position.set(4.0, 0.18, 0.4);
  zone.name = "post";

  // 白族小院
  const wall = box(2.2, 1.1, 1.6, mat("#f5eedc", { map: paperTexture("cream", 1), roughness: 0.85 }), 0.55);
  zone.add(wall);
  const roof = box(2.5, 0.12, 1.9, mat("#5c6068", { map: tileTexture(2), roughness: 0.9 }), 1.2);
  roof.rotation.z = 0.05;
  zone.add(roof);

  // 邮筒
  const mailbox = cyl(0.22, 0.25, 0.7, mat("#1f4d42"), 12);
  mailbox.position.set(-0.9, 0.45, 0.95);
  zone.add(mailbox);
  const slot = box(0.28, 0.06, 0.04, mat("#0a2e2a"), 0.7);
  slot.position.set(-0.9, 0.7, 1.08);
  zone.add(slot);

  // 立体山路
  const pathPts = [
    new THREE.Vector3(0.2, 0.15, 0.8),
    new THREE.Vector3(0.8, 0.35, 0.2),
    new THREE.Vector3(1.3, 0.55, -0.5),
    new THREE.Vector3(1.6, 0.4, -1.2),
  ];
  const pathCurve = new THREE.CatmullRomCurve3(pathPts);
  const pathGeo = new THREE.TubeGeometry(pathCurve, 32, 0.06, 6, false);
  const pathMesh = new THREE.Mesh(pathGeo, mat("#a0673a", { roughness: 0.95 }));
  zone.add(pathMesh);

  // 小山
  for (let i = 0; i < 5; i++) {
    const hill = cyl(0.25 + Math.random() * 0.2, 0.4, 0.4 + Math.random() * 0.5, mat(i % 2 ? "#2f7a52" : "#4f8a3a"), 8);
    hill.position.set(0.5 + Math.random() * 1.2, 0.2, -0.3 - Math.random() * 1.0);
    zone.add(hill);
  }

  // 路牌三向
  const signpost = new THREE.Group();
  signpost.position.set(0.5, 0.15, 1.0);
  const pole = cyl(0.04, 0.04, 0.9, mat("#6b4a2f"), 8);
  pole.position.y = 0.45;
  signpost.add(pole);
  ["水路", "山路", "林路"].forEach((name, i) => {
    const arm = box(0.55, 0.1, 0.04, mat(ROUTE_COLORS[["water", "mountain", "forest"][i]]), 0.55 + i * 0.18);
    arm.position.set(0.25, 0.55 + i * 0.18, 0);
    arm.rotation.y = (i - 1) * 0.35;
    signpost.add(arm);
    const tx = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.1),
      mat("#fff", { map: signTexture(name, { w: 256, h: 64, bg: "rgba(0,0,0,0)", fg: "#f5eedc", size: 36, round: 4 }), transparent: true })
    );
    tx.position.set(0.25, 0.55 + i * 0.18, 0.03);
    signpost.add(tx);
  });
  signpost.userData = { kind: "routeSign", route: "water", label: "路牌 · 决定送达线路" };
  zone.add(signpost);
  interactives.push(signpost);

  // 展示转台
  const turntable = new THREE.Group();
  turntable.position.set(-0.3, 0.15, -0.7);
  const platter = cyl(0.55, 0.55, 0.08, mat("#8a5f3c", { map: woodTexture("oak", 1) }), 24);
  platter.position.y = 0.1;
  turntable.add(platter);
  const lamp = cyl(0.04, 0.06, 0.5, mat("#c9b896", { metalness: 0.4, roughness: 0.4 }), 8);
  lamp.position.set(0.45, 0.4, 0);
  turntable.add(lamp);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 10),
    mat("#ffe8a8", { emissive: "#ffe8a8", emissiveIntensity: 0.8, roughness: 0.3 })
  );
  bulb.position.set(0.45, 0.7, 0);
  turntable.add(bulb);
  turntable.userData = { kind: "turntable", platter, label: "作品转台 · 查看履历", works: [] };
  zone.add(turntable);
  interactives.push(turntable);

  // 成品架
  const shelf = box(1.2, 0.8, 0.25, mat("#6b4a2f", { map: woodTexture("walnut", 1) }), 0.55);
  shelf.position.set(0.9, 0.55, -0.9);
  zone.add(shelf);

  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.24),
    mat("#fff", { map: signTexture("洱海邮局", { sub: "分拣 · 盖戳 · 送达", w: 512, h: 140, size: 48 }), transparent: true })
  );
  title.position.set(0, 1.65, 1.0);
  zone.add(title);

  root.add(zone);
  return { zone, pathCurve, signpost, turntable, mailbox, shelf };
}

function buildConsole(root, interactives) {
  const g = new THREE.Group();
  g.position.set(0, 0.18, 3.6);

  const board = box(5.5, 0.2, 1.1, mat("#4a3220", { map: woodTexture("walnut", 1), roughness: 0.85 }), 0.1);
  g.add(board);

  // 思考速度旋钮
  const speedKnob = new THREE.Group();
  speedKnob.position.set(-1.8, 0.35, 0);
  const skBase = cyl(0.28, 0.32, 0.12, mat("#8a5f3c", { metalness: 0.25, roughness: 0.5 }), 16);
  speedKnob.add(skBase);
  const skHandle = box(0.06, 0.08, 0.22, mat("#e2724f"), 0.1);
  skHandle.position.y = 0.12;
  speedKnob.add(skHandle);
  const skSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.22),
    mat("#fff", { map: signTexture("思考速度", { sub: "慢 · 正常 · 忙", w: 512, h: 110, size: 40 }), transparent: true })
  );
  skSign.position.set(0, -0.28, 0.2);
  speedKnob.add(skSign);
  speedKnob.userData = { kind: "speedKnob", handle: skHandle, level: 1, label: "思考速度旋钮" };
  g.add(speedKnob);
  interactives.push(speedKnob);

  // 专注/漫游拨杆
  const focusLever = new THREE.Group();
  focusLever.position.set(0, 0.35, 0);
  const flBase = box(0.5, 0.12, 0.3, mat("#333", { metalness: 0.4, roughness: 0.5 }), 0);
  focusLever.add(flBase);
  const flStick = box(0.08, 0.35, 0.08, mat("#e2b04f"), 0.2);
  flStick.position.set(-0.12, 0.2, 0);
  focusLever.add(flStick);
  const flSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.22),
    mat("#fff", { map: signTexture("专注 / 漫游", { w: 512, h: 96, size: 38 }), transparent: true })
  );
  flSign.position.set(0, -0.28, 0.2);
  focusLever.add(flSign);
  focusLever.userData = { kind: "focusLever", stick: flStick, focus: true, label: "专注 / 漫游拨杆" };
  g.add(focusLever);
  interactives.push(focusLever);

  // 灵光一现按钮
  const sparkBtn = new THREE.Group();
  sparkBtn.position.set(1.8, 0.4, 0);
  const btn = cyl(0.28, 0.28, 0.16, mat("#e2724f", { emissive: "#e2724f", emissiveIntensity: 0.25 }), 20);
  sparkBtn.add(btn);
  const btnSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.22),
    mat("#fff", { map: signTexture("灵光一现", { sub: "空格键", w: 512, h: 110, size: 40 }), transparent: true })
  );
  btnSign.position.set(0, -0.32, 0.2);
  sparkBtn.add(btnSign);
  sparkBtn.userData = { kind: "sparkBtn", btn, cooldown: 0, label: "灵光一现 · 空格" };
  g.add(sparkBtn);
  interactives.push(sparkBtn);

  // 时间小钟
  const clock = new THREE.Group();
  clock.position.set(0, 0.55, -0.35);
  const face = cyl(0.22, 0.22, 0.06, mat("#f5eedc"), 20);
  face.rotation.x = Math.PI / 2;
  clock.add(face);
  const hand = box(0.03, 0.16, 0.02, mat("#1f4d42"), 0.05);
  hand.position.y = 0.06;
  clock.add(hand);
  clock.userData = { kind: "clock", hand, mode: "day", label: "小钟 · 白天/黄昏/深夜" };
  g.add(clock);
  interactives.push(clock);

  root.add(g);
  return { speedKnob, focusLever, sparkBtn, clock };
}

/* ===================== 流水线状态机 ===================== */
const STAGES = ["idle", "receive", "develop", "assemble", "print", "post", "deliver", "done"];

function createJob(text, overrides = {}) {
  return {
    id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: (text || "一个念头").slice(0, 20),
    tone: overrides.tone || "warm",
    page: overrides.page || "lake",
    route: overrides.route || "water",
    stage: "receive",
    progress: 0,
    mesh: null,
    postcard: null,
    spark: !!overrides.spark,
    startedAt: performance.now(),
  };
}

function jobSummary(job) {
  return `${job.text} · ${TONE_NAMES[job.tone]} + ${PAGE_NAMES[job.page]} + ${ROUTE_NAMES[job.route]} → 一张明信片`;
}

/* ===================== 主入口 ===================== */
export function initDeskStudio(mount, ui = {}) {
  if (!mount) return () => {};

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = matchMedia("(max-width: 800px)").matches;
  const width = () => Math.max(1, mount.clientWidth || innerWidth);
  const height = () => Math.max(1, mount.clientHeight || Math.min(innerHeight, 900));

  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(width(), height());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "desk-studio__canvas";
  renderer.domElement.tabIndex = 0;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(TIME_PRESETS.day.bg);
  scene.fog = new THREE.FogExp2(TIME_PRESETS.day.bg, TIME_PRESETS.day.fog);

  const camera = new THREE.PerspectiveCamera(36, width() / height(), 0.1, 80);
  const camHome = { pos: new THREE.Vector3(0.8, 6.4, 11.2), target: new THREE.Vector3(0.2, 0.6, 0.4) };
  camera.position.copy(camHome.pos);
  const camTarget = camHome.target.clone();
  let camFocus = null;
  let idleOrbit = 0;
  let userControlUntil = 0;

  // 光
  const hemi = new THREE.HemisphereLight("#fff8e8", "#4a5a48", TIME_PRESETS.day.amb);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(TIME_PRESETS.day.color, TIME_PRESETS.day.sun);
  sun.position.set(6, 12, 5);
  sun.castShadow = !isMobile;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  scene.add(sun);
  const fill = new THREE.PointLight("#ffe0a8", 0.4, 20);
  fill.position.set(-3, 3, 2);
  scene.add(fill);
  const deskLamp = new THREE.PointLight("#ffd090", 0.15, 8);
  deskLamp.position.set(4, 2.5, -1);
  scene.add(deskLamp);

  const world = new THREE.Group();
  scene.add(world);

  const interactives = [];
  buildDesk(world);
  const darkroom = buildDarkroom(world, interactives);
  const journal = buildJournalPress(world, interactives);
  const post = buildPostOffice(world, interactives);
  const deskConsole = buildConsole(world, interactives);

  // 投念头按钮（暗房旁实体）
  const dropBtn = new THREE.Group();
  dropBtn.position.set(-4.2, 0.35, 1.6);
  const db = box(1.1, 0.35, 0.45, mat("#1f4d42", { emissive: "#1f4d42", emissiveIntensity: 0.15 }), 0.2);
  dropBtn.add(db);
  const dbSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.28),
    mat("#fff", { map: signTexture("投一个念头", { w: 512, h: 110, size: 42 }), transparent: true })
  );
  dbSign.position.set(0, 0.45, 0.05);
  dropBtn.add(dbSign);
  dropBtn.userData = { kind: "dropThought", label: "投一个念头" };
  world.add(dropBtn);
  interactives.push(dropBtn);

  // 小人
  const workers = [];
  const workerSpecs = [
    { job: "receiver", pos: [-4.0, 0, 0.5], hat: true, cloth: "#1f4d42" },
    { job: "developer", pos: [-4.4, 0, -0.3], apron: true, cloth: "#3a5a50" },
    { job: "washer", pos: [-3.7, 0, -0.5], cloth: "#5a9bb8" },
    { job: "courier1", pos: [-2.2, 0, 0.2], hat: true, cloth: "#e2724f" },
    { job: "assembler", pos: [-0.5, 0, 0.6], glasses: true, cloth: "#1f4d42" },
    { job: "printer", pos: [1.4, 0, 1.0], apron: true, cloth: "#6b4a2f" },
    { job: "binder", pos: [0.8, 0, 0.3], cloth: "#2f7a52" },
    { job: "daydreamer", pos: [0.2, 0, -1.2], cloth: "#8fc8d8" },
    { job: "sleeper", pos: [1.0, 0, -1.0], cloth: "#c9b896" },
    { job: "sorter", pos: [3.5, 0, 0.8], hat: true, cloth: "#1f4d42" },
    { job: "stamper", pos: [4.2, 0, 0.3], apron: true, cloth: "#e2b04f" },
    { job: "rider", pos: [4.5, 0, -0.2], hat: true, cloth: "#a0673a" },
    { job: "curator", pos: [3.7, 0, -0.8], glasses: true, cloth: "#1f4d42" },
    { job: "idle", pos: [-5.0, 0, 2.5], cloth: "#6d8f3c" },
  ];
  workerSpecs.forEach((spec) => {
    const w = makeWorker(spec);
    w.position.set(spec.pos[0], 0.18, spec.pos[2]);
    w.userData.baseY = 0.18;
    w.userData.home = new THREE.Vector3(spec.pos[0], 0.18, spec.pos[2]);
    w.userData.job = spec.job;
    world.add(w);
    workers.push(w);
  });

  // 状态
  let speedKey = "normal";
  let focusMode = true;
  let timeMode = "day";
  let sparkTimer = 0;
  let sparkCooldown = 0;
  let job = null;
  let gallery = [];
  let dragging = null;
  let hoverObj = null;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = false;
  let lastPointer = { x: 0, y: 0 };
  let spherical = { theta: 0.08, phi: 1.12, radius: 13.2 };
  const sphericalHome = { ...spherical };

  function setTimeMode(mode) {
    timeMode = mode;
    const p = TIME_PRESETS[mode];
    hemi.intensity = p.amb;
    sun.intensity = p.sun;
    sun.color.set(p.color);
    scene.background.set(p.bg);
    scene.fog.color.set(p.bg);
    scene.fog.density = p.fog;
    deskLamp.intensity = mode === "night" ? 1.2 : mode === "dusk" ? 0.5 : 0.15;
    fill.intensity = mode === "night" ? 0.15 : 0.4;
    deskConsole.clock.userData.mode = mode;
    ui.onTime?.(mode);
  }

  function setSpeed(level) {
    speedKey = ["slow", "normal", "busy"][level] || "normal";
    deskConsole.speedKnob.userData.level = level;
    deskConsole.speedKnob.userData.handle.rotation.y = (level - 1) * 0.8;
    ui.onSpeed?.(speedKey);
  }

  function setFocus(on) {
    focusMode = on;
    deskConsole.focusLever.userData.focus = on;
    deskConsole.focusLever.userData.stick.position.x = on ? -0.12 : 0.12;
    // 非专注时档案馆/走神更活跃（用透明度暗示）
    workers.forEach((w) => {
      const dream = w.userData.job === "daydreamer" || w.userData.job === "sleeper";
      w.visible = focusMode ? !dream || Math.random() > 0.3 : true;
      if (!focusMode && dream) w.scale.setScalar(1.15);
      else w.scale.setScalar(1);
    });
    ui.onFocus?.(on);
  }

  function updateProgressUI() {
    if (!ui.onProgress) return;
    if (!job) {
      ui.onProgress({ stage: "idle", text: "工作室里静悄悄。投一个念头吧。", pct: 0 });
      return;
    }
    const labels = {
      receive: "暗房接住了光",
      develop: `显影中 · ${TONE_NAMES[job.tone]}`,
      assemble: `拼装中 · 准备落入${PAGE_NAMES[job.page]}`,
      print: "印刷机压印中",
      post: "邮局分拣盖戳",
      deliver: `马帮走${ROUTE_NAMES[job.route]}`,
      done: "作品抵达转台",
    };
    ui.onProgress({
      stage: job.stage,
      text: labels[job.stage] || job.text,
      pct: Math.round(job.progress * 100),
      summary: job.stage === "done" ? jobSummary(job) : "",
      job,
    });
  }

  function spawnJob(text, overrides = {}) {
    if (job && job.stage !== "done" && job.stage !== "idle") return null;
    if (job?.mesh) world.remove(job.mesh);
    job = createJob(text, overrides);
    job.mesh = makeThought(job.text, TONE_COLORS[job.tone]);
    job.mesh.position.set(-4.2, 0.9, 1.35);
    world.add(job.mesh);
    updateProgressUI();
    ui.onJob?.(job);
    return job;
  }

  function advanceJob(dt) {
    if (!job || job.stage === "done" || job.stage === "idle") return;
    const speed = SPEEDS[speedKey] * (sparkTimer > 0 ? 1.4 : 1);
    job.progress += dt * 0.035 * speed;

    const m = job.mesh;
    if (!m) return;

    // 各阶段位置插值
    const paths = {
      receive: [new THREE.Vector3(-4.2, 0.9, 1.35), new THREE.Vector3(-4.2, 0.7, 0.4)],
      develop: [new THREE.Vector3(-4.2, 0.7, 0.4), new THREE.Vector3(-4.2, 0.55, 0.1)],
      assemble: [new THREE.Vector3(-4.2, 0.55, 0.1), new THREE.Vector3(0.0, 0.55, 0.8)],
      print: [new THREE.Vector3(0.0, 0.55, 0.8), new THREE.Vector3(1.5, 0.7, 1.0)],
      post: [new THREE.Vector3(1.5, 0.7, 1.0), new THREE.Vector3(3.2, 0.6, 0.9)],
      deliver: [new THREE.Vector3(3.2, 0.6, 0.9), new THREE.Vector3(3.7, 0.55, -0.5)],
    };

    const stage = job.stage;
    if (paths[stage]) {
      const t = clamp(job.progress, 0, 1);
      const [a, b] = paths[stage];
      m.position.copy(lerpV(a, b, t));
      m.rotation.y += dt * 1.2 * speed;
      m.userData.glow.material.opacity = 0.25 + Math.sin(performance.now() * 0.005) * 0.1;
    }

    // 小人跟物料
    const escorts = {
      receive: "receiver",
      develop: "developer",
      assemble: "assembler",
      print: "printer",
      post: "sorter",
      deliver: "rider",
    };
    const escort = workers.find((w) => w.userData.job === escorts[stage]);
    if (escort && m) {
      const dest = m.position.clone();
      dest.y = escort.userData.baseY;
      dest.x += 0.35;
      escort.position.lerp(dest, 0.04 * speed);
      escort.lookAt(m.position.x, escort.position.y, m.position.z);
      escort.userData.moving = true;
    }

    if (job.progress >= 1) {
      job.progress = 0;
      const idx = STAGES.indexOf(job.stage);
      if (idx < STAGES.length - 1) {
        job.stage = STAGES[idx + 1];
        if (job.stage === "develop") {
          // 显影池高亮当前 tone
          darkroom.baths.forEach((b) => {
            b.liquid.material.emissiveIntensity = b.tone === job.tone ? 0.45 : 0.08;
          });
        }
        if (job.stage === "assemble") {
          journal.pages.forEach((p) => {
            p.scale.setScalar(p.userData.page === job.page ? 1.12 : 0.95);
          });
          journal.switcher.userData.lever.rotation.z = { rain: -0.5, tea: 0, lake: 0.5 }[job.page];
        }
        if (job.stage === "print") {
          // 换成明信片外形暗示
          m.scale.set(1.4, 0.3, 1.1);
        }
        if (job.stage === "deliver") {
          post.signpost.rotation.y = { water: -0.3, mountain: 0, forest: 0.3 }[job.route];
        }
        if (job.stage === "done") {
          finishJob();
        }
        updateProgressUI();
      }
    }
  }

  function finishJob() {
    if (!job) return;
    if (job.mesh) world.remove(job.mesh);
    const card = makePostcard(job);
    card.position.set(3.7, 0.45, -0.55);
    world.add(card);
    job.postcard = card;
    gallery.unshift({ ...job, card });
    if (gallery.length > 3) {
      const old = gallery.pop();
      if (old.card) world.remove(old.card);
    }
    // 架上排列
    gallery.forEach((g, i) => {
      if (!g.card) return;
      g.card.position.set(4.5, 0.55 + i * 0.12, -0.75);
      g.card.rotation.set(0, -0.4, 0);
    });
    // 转台上放最新
    if (gallery[0]?.card) {
      gallery[0].card.position.set(3.7, 0.45, -0.55);
      gallery[0].card.rotation.set(0, 0, 0);
    }
    post.turntable.userData.works = gallery.slice();
    updateProgressUI();
    ui.onComplete?.(job);
    // 短暂停留后允许新念头
    setTimeout(() => {
      if (job?.stage === "done") {
        job.stage = "idle";
        updateProgressUI();
      }
    }, 2500);
  }

  function triggerSpark() {
    if (sparkCooldown > 0) return;
    sparkCooldown = 12;
    sparkTimer = 6;
    deskConsole.sparkBtn.userData.btn.material.emissiveIntensity = 0.8;
    // 走神阳台冒星
    const star = makeThought("灵光", "#e2b04f");
    star.position.set(0.3, 1.2, -1.0);
    world.add(star);
    const start = performance.now();
    const anim = () => {
      const t = (performance.now() - start) / 6000;
      if (t >= 1) {
        world.remove(star);
        return;
      }
      star.position.lerpVectors(new THREE.Vector3(0.3, 1.2, -1.0), new THREE.Vector3(0, 0.8, 0.5), t);
      star.rotation.y += 0.08;
      requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
    workers.forEach((w) => {
      w.rotation.x = -0.2;
      setTimeout(() => (w.rotation.x = 0), 800);
    });
    if (!job || job.stage === "idle" || job.stage === "done") {
      spawnJob("灵光一现", { tone: "warm", page: "lake", route: "water", spark: true });
    } else {
      job.spark = true;
    }
    ui.onSpark?.();
  }

  /* -------- 相机 -------- */
  function applyOrbit() {
    if (camFocus) {
      camera.position.lerp(camFocus.pos, 0.06);
      camTarget.lerp(camFocus.target, 0.06);
    } else {
      const now = performance.now();
      if (now > userControlUntil && !reduced) {
        idleOrbit += 0.00025;
        spherical.theta = sphericalHome.theta + Math.sin(idleOrbit) * 0.18;
        spherical.phi = sphericalHome.phi + Math.cos(idleOrbit * 0.7) * 0.05;
      }
      const { theta, phi, radius } = spherical;
      camera.position.set(
        camHome.target.x + radius * Math.sin(phi) * Math.sin(theta),
        camHome.target.y + radius * Math.cos(phi),
        camHome.target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camTarget.copy(camHome.target);
    }
    camera.lookAt(camTarget);
  }

  function focusZone(name) {
    const map = {
      darkroom: { pos: new THREE.Vector3(-4.2, 3.2, 4.5), target: new THREE.Vector3(-4.2, 0.8, -0.2) },
      journal: { pos: new THREE.Vector3(0.3, 3.5, 5.0), target: new THREE.Vector3(0.3, 0.7, 0) },
      post: { pos: new THREE.Vector3(4.0, 3.2, 4.8), target: new THREE.Vector3(4.0, 0.7, 0) },
      turntable: { pos: new THREE.Vector3(3.7, 2.4, 2.2), target: new THREE.Vector3(3.7, 0.5, -0.55) },
    };
    camFocus = map[name] || null;
    ui.onFocusZone?.(name);
  }

  function resetCamera() {
    camFocus = null;
    spherical = { ...sphericalHome };
    ui.onFocusZone?.(null);
  }

  /* -------- 交互 -------- */
  function getHits(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(interactives, true);
  }

  function findInteractive(obj) {
    let o = obj;
    while (o) {
      if (o.userData?.kind) return o;
      o = o.parent;
    }
    return null;
  }

  function onPointerMove(e) {
    if (pointerDown && !dragging && !camFocus) {
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      spherical.theta -= dx * 0.005;
      spherical.phi = clamp(spherical.phi + dy * 0.004, 0.55, 1.35);
      userControlUntil = performance.now() + 4000;
    }
    lastPointer = { x: e.clientX, y: e.clientY };

    const hits = getHits(e);
    const obj = hits[0] ? findInteractive(hits[0].object) : null;
    if (hoverObj && hoverObj !== obj) {
      hoverObj.traverse?.((c) => {
        if (c.isMesh && c.material?.emissive) c.material.emissiveIntensity = c.userData?._emi || 0;
      });
    }
    hoverObj = obj;
    if (obj) {
      renderer.domElement.style.cursor = "pointer";
      ui.onHover?.(obj.userData.label || "");
      obj.traverse?.((c) => {
        if (c.isMesh && c.material?.emissive) {
          c.userData._emi = c.userData._emi ?? c.material.emissiveIntensity;
          c.material.emissiveIntensity = Math.max(0.2, c.userData._emi + 0.2);
        }
      });
    } else {
      renderer.domElement.style.cursor = pointerDown ? "grabbing" : "grab";
      ui.onHover?.("");
    }
  }

  function onPointerDown(e) {
    pointerDown = true;
    lastPointer = { x: e.clientX, y: e.clientY };
    userControlUntil = performance.now() + 4000;
  }

  function onPointerUp(e) {
    const dx = Math.abs(e.clientX - lastPointer.x);
    const dy = Math.abs(e.clientY - lastPointer.y);
    const clicked = pointerDown && dx < 5 && dy < 5;
    pointerDown = false;
    if (!clicked) return;

    const hits = getHits(e);
    const obj = hits[0] ? findInteractive(hits[0].object) : null;
    if (!obj) return;
    handleClick(obj);
  }

  function handleClick(obj) {
    const k = obj.userData.kind;
    if (k === "dropThought") {
      ui.openThoughtModal?.();
      return;
    }
    if (k === "valve") {
      if (job && (job.stage === "receive" || job.stage === "develop")) {
        job.tone = obj.userData.tone;
        if (job.mesh) {
          job.mesh.userData.glow.material.color.set(TONE_COLORS[job.tone]);
        }
        darkroom.baths.forEach((b) => {
          b.liquid.material.emissiveIntensity = b.tone === job.tone ? 0.5 : 0.08;
        });
        updateProgressUI();
        ui.toast?.(`显影偏向 · ${TONE_NAMES[job.tone]}`);
      } else {
        ui.toast?.("等念头进暗房，再扳药水阀");
      }
      focusZone("darkroom");
      return;
    }
    if (k === "pageSwitch" || k === "page") {
      const pages = ["rain", "tea", "lake"];
      if (k === "pageSwitch") {
        const cur = pages.indexOf(obj.userData.page || "lake");
        obj.userData.page = pages[(cur + 1) % 3];
        obj.userData.lever.rotation.z = { rain: -0.5, tea: 0, lake: 0.5 }[obj.userData.page];
        if (job && ["develop", "assemble", "print"].includes(job.stage)) {
          job.page = obj.userData.page;
          journal.pages.forEach((p) => p.scale.setScalar(p.userData.page === job.page ? 1.12 : 0.95));
          updateProgressUI();
          ui.toast?.(`落入 · ${PAGE_NAMES[job.page]}`);
        } else {
          ui.toast?.(`道岔指向 · ${PAGE_NAMES[obj.userData.page]}`);
        }
      } else if (obj.userData.page) {
        if (job) {
          job.page = obj.userData.page;
          journal.switcher.userData.page = job.page;
          journal.switcher.userData.lever.rotation.z = { rain: -0.5, tea: 0, lake: 0.5 }[job.page];
          journal.pages.forEach((p) => p.scale.setScalar(p.userData.page === job.page ? 1.12 : 0.95));
          updateProgressUI();
          ui.toast?.(`落入 · ${PAGE_NAMES[job.page]}`);
        } else {
          ui.toast?.(`纸页 · ${PAGE_NAMES[obj.userData.page]}`);
        }
      }
      focusZone("journal");
      return;
    }
    if (k === "routeSign") {
      const routes = ["water", "mountain", "forest"];
      const cur = routes.indexOf(obj.userData.route || "water");
      obj.userData.route = routes[(cur + 1) % 3];
      obj.rotation.y = { water: -0.3, mountain: 0, forest: 0.3 }[obj.userData.route];
      if (job && (job.stage === "post" || job.stage === "deliver" || job.stage === "print")) {
        job.route = obj.userData.route;
        updateProgressUI();
        ui.toast?.(`改走 · ${ROUTE_NAMES[job.route]}`);
      } else {
        ui.toast?.(`路牌指向 · ${ROUTE_NAMES[obj.userData.route]}`);
      }
      focusZone("post");
      return;
    }
    if (k === "turntable") {
      focusZone("turntable");
      const latest = gallery[0];
      if (latest) ui.showWork?.(latest);
      else ui.toast?.("转台还空着，先投一个念头");
      return;
    }
    if (k === "speedKnob") {
      const next = (obj.userData.level + 1) % 3;
      setSpeed(next);
      ui.toast?.(`节奏 · ${["慢悠悠", "正常", "忙碌"][next]}`);
      return;
    }
    if (k === "focusLever") {
      setFocus(!obj.userData.focus);
      ui.toast?.(focusMode ? "专注模式 · 当前路线亮起" : "漫游模式 · 阳台更热闹");
      return;
    }
    if (k === "sparkBtn") {
      triggerSpark();
      return;
    }
    if (k === "clock") {
      const modes = ["day", "dusk", "night"];
      const next = modes[(modes.indexOf(timeMode) + 1) % 3];
      setTimeMode(next);
      ui.toast?.({ day: "白天", dusk: "黄昏", night: "深夜" }[next]);
      return;
    }
  }

  function onWheel(e) {
    e.preventDefault();
    spherical.radius = clamp(spherical.radius + e.deltaY * 0.008, 7, 18);
    userControlUntil = performance.now() + 4000;
    if (camFocus) camFocus = null;
  }

  function onKey(e) {
    if (e.code === "Space") {
      e.preventDefault();
      triggerSpark();
    }
    if (e.code === "Escape") resetCamera();
  }

  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);

  // 浮尘
  const dustCount = isMobile ? 40 : 90;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 12;
    dustPos[i * 3 + 1] = 0.5 + Math.random() * 3;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      map: glowTexture(),
      color: "#fff8e0",
      size: 0.08,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  scene.add(dust);

  let frame = 0;
  let running = true;
  const clock = new THREE.Clock();

  // 默认念头
  spawnJob("一段晚霞", { tone: "warm", page: "lake", route: "water" });

  function tick() {
    frame = requestAnimationFrame(tick);
    if (!running || document.hidden) return;
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    const speed = SPEEDS[speedKey];

    advanceJob(dt);

    workers.forEach((w) => {
      const moving = !!w.userData.moving;
      animateWorker(w, t, moving, speed);
      w.userData.moving = false;
      // 闲置小人轻微漂移回家
      if (!moving && w.userData.home) {
        w.position.lerp(w.userData.home, 0.01);
      }
    });

    // 印刷辊转动
    if (journal.roller) journal.roller.rotation.x += dt * 2.5 * speed;
    if (post.turntable?.userData.platter) post.turntable.userData.platter.rotation.y += dt * 0.4;

    // 浮尘
    const arr = dust.geometry.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      arr[i * 3 + 1] += Math.sin(t + i) * 0.0015;
      if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = 0.4;
    }
    dust.geometry.attributes.position.needsUpdate = true;

    if (sparkTimer > 0) {
      sparkTimer -= dt;
      if (sparkTimer <= 0) deskConsole.sparkBtn.userData.btn.material.emissiveIntensity = 0.25;
    }
    if (sparkCooldown > 0) sparkCooldown -= dt;

    applyOrbit();
    renderer.render(scene, camera);
  }
  if (!reduced) frame = requestAnimationFrame(tick);
  else {
    applyOrbit();
    renderer.render(scene, camera);
  }

  function onResize() {
    const w = width();
    const h = height();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  const ro = new ResizeObserver(onResize);
  ro.observe(mount);
  mount.dataset.ready = "true";

  // 对外 API
  const api = {
    dropThought(text, preset) {
      const p = preset || PRESETS.find((x) => x.text === text) || {};
      return spawnJob(text || p.text, p);
    },
    resetCamera,
    focusZone,
    setSpeed,
    setFocus,
    setTimeMode,
    triggerSpark,
    getJob: () => job,
    getGallery: () => gallery.slice(),
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      renderer.dispose();
      mount.replaceChildren();
    },
  };

  window.__deskStudio = api;
  return api;
}

export { PRESETS, PAGE_NAMES, TONE_NAMES, ROUTE_NAMES, jobSummary };
