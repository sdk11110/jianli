/* Atoll-inspired Yunnan boat cruise — textured assets, clear stage */
import * as THREE from "three";

const STOPS = [
  { id: "banna", name: "西双版纳", accent: "#e8c35a" },
  { id: "jingmai", name: "景迈山", accent: "#8fbf5a" },
  { id: "dali", name: "大理", accent: "#6ec4d4" },
  { id: "lijiang", name: "丽江", accent: "#d4886a" },
  { id: "shangri", name: "香格里拉", accent: "#f2f7fb" },
];

const LOOP_MS = 22000;
const TEX_BASE = "/jianli/assets/cruise";
const loader = new THREE.TextureLoader();
const texCache = new Map();

function loadTex(name, { repeat = 1, colorSpace = THREE.SRGBColorSpace } = {}) {
  const key = `${name}:${repeat}`;
  if (texCache.has(key)) return texCache.get(key);
  const t = loader.load(`${TEX_BASE}/${name}.png`);
  t.colorSpace = colorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.repeat.set(repeat, repeat);
  t.needsUpdate = true;
  texCache.set(key, t);
  return t;
}

function makeLabelTexture(text, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 640, 160);
  ctx.fillStyle = "rgba(18, 72, 64, 0.82)";
  roundRect(ctx, 48, 40, 544, 80, 40);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,248,229,0.35)";
  ctx.lineWidth = 2;
  roundRect(ctx, 48, 40, 544, 80, 40);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(110, 80, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8e5";
  ctx.font = "600 44px 'Microsoft YaHei','PingFang SC',sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 340, 82);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function waterMaterial(causticMap) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#0b3a58") },
      uMid: { value: new THREE.Color("#17808f") },
      uShallow: { value: new THREE.Color("#6fd8d0") },
      uFoam: { value: new THREE.Color("#eefaf8") },
      uCaustic: { value: causticMap },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorld;
      varying float vElevate;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 p = position;
        float w1 = sin(p.x * 0.18 + uTime * 1.05) * 0.045;
        float w2 = cos(p.y * 0.22 - uTime * 0.85) * 0.032;
        p.z += w1 + w2;
        vElevate = w1 + w2;
        vec4 world = modelMatrix * vec4(p, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorld;
      varying float vElevate;
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uMid;
      uniform vec3 uShallow;
      uniform vec3 uFoam;
      uniform sampler2D uCaustic;
      void main() {
        float radial = length(vUv - 0.5);
        float depth = smoothstep(0.12, 0.85, radial);
        vec3 col = mix(uShallow, uMid, smoothstep(0.0, 0.5, depth));
        col = mix(col, uDeep, smoothstep(0.45, 1.0, depth));
        vec2 cuv = vUv * 2.4 + vec2(uTime * 0.012, -uTime * 0.008);
        vec3 cau = texture2D(uCaustic, cuv).rgb;
        col += cau * (1.0 - depth) * 0.22;
        float rim = smoothstep(0.02, 0.0, abs(vElevate));
        col = mix(col, uFoam, rim * 0.18);
        float alpha = mix(0.38, 0.78, depth);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

function mat(color, opts = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: opts.map ? "#ffffff" : color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.03,
    map: opts.map || null,
    transparent: opts.transparent || false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  });
  if (opts.map) m.map.colorSpace = THREE.SRGBColorSpace;
  return m;
}

function disc(radius, y, material, segs = 48) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, segs), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.receiveShadow = true;
  return mesh;
}

function addBush(parent, x, z, scale = 1, color = "#3f9a55") {
  const bush = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28 * scale, 1),
    mat(color, { roughness: 0.78, map: loadTex("grass", { repeat: 2 }) })
  );
  bush.position.set(x, 0.28 * scale + 0.42, z);
  bush.scale.y = 0.75 + Math.random() * 0.35;
  bush.castShadow = true;
  bush.receiveShadow = true;
  parent.add(bush);
  if (Math.random() > 0.45) {
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 * scale, 6, 6),
      mat(Math.random() > 0.5 ? "#e86aa0" : "#f0c25a", { roughness: 0.4 })
    );
    flower.position.set(x + 0.1, 0.5 * scale + 0.42, z);
    parent.add(flower);
  }
}

function addPalm(parent, x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05 * scale, 0.09 * scale, 1.7 * scale, 8),
    mat("#9a6a3c", { map: loadTex("wood", { repeat: 1 }), roughness: 0.9 })
  );
  trunk.position.set(x, 0.95 * scale + 0.2, z);
  trunk.castShadow = true;
  parent.add(trunk);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.62 * scale, 0.12 * scale, 5),
      mat("#3f9a4a", { roughness: 0.55, map: loadTex("grass", { repeat: 1 }) })
    );
    leaf.position.set(x, 1.75 * scale + 0.2, z);
    leaf.rotation.z = -0.85;
    leaf.rotation.y = (i / 6) * Math.PI * 2;
    leaf.castShadow = true;
    parent.add(leaf);
  }
}

function addCoralCluster(parent, x, z, under = false) {
  const palette = ["#e86aa0", "#7ad0c8", "#f0c25a", "#8f6ad8", "#5ecf7a", "#ff8f6b"];
  const y0 = under ? -0.55 : 0.02;
  for (let i = 0; i < 7; i++) {
    const h = 0.2 + Math.random() * (under ? 0.7 : 0.45);
    const geo =
      Math.random() > 0.5
        ? new THREE.CylinderGeometry(0.03 + Math.random() * 0.07, 0.05, h, 5)
        : new THREE.ConeGeometry(0.12 + Math.random() * 0.1, h, 5);
    const mesh = new THREE.Mesh(geo, mat(palette[i % palette.length], { roughness: 0.42 }));
    mesh.position.set(
      x + (Math.random() - 0.5) * 1.4,
      y0 + h * 0.5,
      z + (Math.random() - 0.5) * 1.4
    );
    mesh.castShadow = !under;
    parent.add(mesh);
  }
  if (under && Math.random() > 0.4) {
    for (let f = 0; f < 4; f++) {
      const fish = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 6),
        mat("#5ec8ff", { roughness: 0.3, metalness: 0.15 })
      );
      fish.scale.set(1.6, 0.7, 0.9);
      fish.position.set(x + Math.random() - 0.5, -0.25 - Math.random() * 0.3, z + Math.random() - 0.5);
      parent.add(fish);
    }
  }
}

function makeIsland(kind, accent) {
  const g = new THREE.Group();
  const sandMap = loadTex("sand", { repeat: 3.2 });
  const grassMap = loadTex("grass", { repeat: 2.8 });
  const woodMap = loadTex("wood", { repeat: 1.5 });
  const roofMap = loadTex("roof", { repeat: 2.4 });
  const wallMap = loadTex("wall", { repeat: 1.5 });
  const rockMap = loadTex("rock", { repeat: 1.8 });

  // Stacked discs: planar UVs so sand/grass maps read from above
  const sandSide = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.45, 0.36, 40, 1, true),
    mat("#d9bc6e", { roughness: 0.95 })
  );
  sandSide.position.y = 0.1;
  sandSide.castShadow = true;
  g.add(sandSide);
  const sandTop = disc(3.25, 0.29, mat("#e8d08a", { map: sandMap, roughness: 0.98 }));
  sandTop.castShadow = true;
  g.add(sandTop);

  const landSide = new THREE.Mesh(
    new THREE.CylinderGeometry(2.05, 2.25, 0.4, 36, 1, true),
    mat("#4f8a3a", { roughness: 0.9 })
  );
  landSide.position.y = 0.48;
  landSide.castShadow = true;
  g.add(landSide);
  const landTop = disc(2.08, 0.69, mat("#5f9a4e", { map: grassMap, roughness: 0.9 }));
  landTop.castShadow = true;
  g.add(landTop);

  const shallows = new THREE.Mesh(
    new THREE.RingGeometry(3.3, 4.5, 48),
    new THREE.MeshStandardMaterial({
      color: "#9aefe4",
      transparent: true,
      opacity: 0.42,
      roughness: 0.22,
      metalness: 0.08,
    })
  );
  shallows.rotation.x = -Math.PI / 2;
  shallows.position.y = 0.04;
  g.add(shallows);

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.random() * 0.2;
    addBush(g, Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0.65 + Math.random() * 0.55);
  }
  addCoralCluster(g, 3.5, 0.4);
  addCoralCluster(g, -3.3, -0.8);
  addCoralCluster(g, 2.7, -2.5, true);
  addCoralCluster(g, -2.9, 2.3, true);

  if (kind === "banna") {
    addPalm(g, -0.75, 0.35, 1.15);
    addPalm(g, 0.55, -0.4, 0.95);
    addPalm(g, 0.95, 0.75, 0.8);
    const hut = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.55, 0.7),
      mat("#f4efe4", { map: wallMap, roughness: 0.7 })
    );
    hut.position.set(0.15, 1.12, -0.55);
    hut.castShadow = true;
    g.add(hut);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.75, 0.4, 4),
      mat("#c45a45", { map: roofMap, roughness: 0.6 })
    );
    roof.position.set(0.15, 1.52, -0.55);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
  } else if (kind === "jingmai") {
    for (let i = 0; i < 6; i++) {
      const r = 1.85 - i * 0.24;
      const terrace = disc(
        r,
        0.75 + i * 0.15,
        mat(i % 2 ? "#7fbf5a" : "#4f8a3a", { map: grassMap, roughness: 0.9 })
      );
      terrace.castShadow = true;
      g.add(terrace);
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r + 0.08, 0.12, 28, 1, true),
        mat("#4f8a3a", { roughness: 0.9 })
      );
      rim.position.y = 0.69 + i * 0.15;
      rim.castShadow = true;
      g.add(rim);
    }
  } else if (kind === "dali") {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 1.05, 0.95),
      mat("#f7f3ea", { map: wallMap, roughness: 0.68 })
    );
    wall.position.y = 1.28;
    wall.castShadow = true;
    g.add(wall);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.25, 0.55, 4),
      mat("#c45a45", { map: roofMap, roughness: 0.55 })
    );
    roof.position.y = 2.08;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.08, 0.7),
      mat("#b88855", { map: woodMap, roughness: 0.85 })
    );
    deck.position.set(-1.1, 0.86, 0.55);
    deck.castShadow = true;
    g.add(deck);
    const pool = disc(
      0.7,
      0.52,
      new THREE.MeshStandardMaterial({ color: "#5ec8d8", roughness: 0.12, metalness: 0.28 }),
      28
    );
    pool.position.x = -1.35;
    pool.position.z = 0.95;
    g.add(pool);
    addPalm(g, 1.25, 1.05, 0.85);
  } else if (kind === "lijiang") {
    for (let i = 0; i < 3; i++) {
      const house = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.78, 0.62),
        mat("#f0e6d4", { map: wallMap, roughness: 0.7 })
      );
      house.position.set(-0.8 + i * 0.8, 1.18, -0.1 + (i % 2) * 0.35);
      house.castShadow = true;
      g.add(house);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.12, 0.78),
        mat("#3d2a22", { map: roofMap, roughness: 0.85 })
      );
      roof.position.set(house.position.x, 1.63, house.position.z);
      roof.rotation.z = 0.08 * (i - 1);
      roof.castShadow = true;
      g.add(roof);
    }
  } else {
    const rock = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 2.8, 9),
      mat("#6d737a", { map: rockMap, roughness: 0.96 })
    );
    rock.position.y = 1.75;
    rock.castShadow = true;
    g.add(rock);
    const snow = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.85, 9), mat("#f5fbff", { roughness: 0.42 }));
    snow.position.y = 3.25;
    g.add(snow);
  }

  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeLabelTexture(STOPS.find((s) => s.id === kind).name, accent),
      transparent: true,
      depthTest: false,
    })
  );
  label.scale.set(1.7, 0.42, 1);
  label.position.set(0, 2.7, 0);
  g.add(label);
  return g;
}

function makeBoat() {
  const g = new THREE.Group();
  const woodMap = loadTex("wood", { repeat: 1 });
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.28, 0.58),
    mat("#f8f5f0", { roughness: 0.38 })
  );
  hull.position.y = 0.18;
  hull.castShadow = true;
  g.add(hull);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.48, 6), mat("#f8f5f0", { roughness: 0.38 }));
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(0.72, 0.18, 0);
  nose.castShadow = true;
  g.add(nose);
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.05, 0.48),
    mat("#c9955c", { map: woodMap, roughness: 0.82 })
  );
  deck.position.set(-0.28, 0.34, 0);
  deck.castShadow = true;
  g.add(deck);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.36), mat("#2f8a72", { roughness: 0.48 }));
  seat.position.set(-0.05, 0.4, 0);
  seat.castShadow = true;
  g.add(seat);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.28), mat("#255f55", { roughness: 0.5 }));
  cabin.position.set(-0.35, 0.48, 0);
  g.add(cabin);
  const motor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.14), mat("#333", { roughness: 0.4, metalness: 0.3 }));
  motor.position.set(-0.72, 0.28, 0);
  g.add(motor);
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), mat("#444"));
  flagPole.position.set(0.55, 0.45, 0);
  g.add(flagPole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.13), mat("#a64731", { roughness: 0.55, side: THREE.DoubleSide }));
  flag.position.set(0.64, 0.55, 0);
  g.add(flag);
  return g;
}

function makeSeafloor() {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(28, 64),
    mat("#1a5a62", { map: loadTex("sand", { repeat: 8 }), roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.85;
  floor.receiveShadow = true;
  g.add(floor);
  const patches = [
    [-4, -1],
    [1, 4],
    [7, 3],
    [10, -2],
    [3, -6],
    [-2, 3],
    [5, 0],
  ];
  patches.forEach(([x, z]) => addCoralCluster(g, x, z, true));
  return g;
}

export function initBoatCruise(mount) {
  if (!mount) return () => {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const width = () => Math.max(1, mount.clientWidth || innerWidth);
  const height = () => Math.max(1, mount.clientHeight || Math.min(innerHeight, 980));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(width(), height());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "boat-cruise__canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#8ecfd0", 0.008);
  scene.background = new THREE.Color("#5fb8c0");

  // Close Atoll-like follow cam — boat stays readable
  const camera = new THREE.PerspectiveCamera(34, width() / height(), 0.1, 160);
  camera.position.set(0, 11.5, 10.5);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight("#f3fff8", "#2f6a58", 0.85));
  const sun = new THREE.DirectionalLight("#fff1d6", 1.7);
  sun.position.set(12, 22, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.bottom = -22;
  sun.shadow.bias = -0.00025;
  sun.shadow.radius = 2.5;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#9fd8d4", 0.35);
  fill.position.set(-10, 8, -6);
  scene.add(fill);

  scene.add(makeSeafloor());

  const causticMap = loadTex("caustic", { repeat: 1 });
  const waterMat = waterMaterial(causticMap);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(64, 64, 160, 160), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.02;
  water.receiveShadow = true;
  scene.add(water);

  const islandSlots = [
    { id: "banna", pos: new THREE.Vector3(-4.8, 0, -1.8) },
    { id: "jingmai", pos: new THREE.Vector3(0.8, 0, 4.8) },
    { id: "dali", pos: new THREE.Vector3(6.5, 0, 4.2) },
    { id: "lijiang", pos: new THREE.Vector3(10.2, 0, -0.8) },
    { id: "shangri", pos: new THREE.Vector3(4.2, 0, -6.5) },
  ];
  islandSlots.forEach((slot) => {
    const stop = STOPS.find((s) => s.id === slot.id);
    const island = makeIsland(slot.id, stop.accent);
    island.position.copy(slot.pos);
    island.rotation.y = (Math.random() - 0.5) * 0.4;
    scene.add(island);
  });

  const pathPoints = [
    new THREE.Vector3(-6.8, 0.12, 0.1),
    new THREE.Vector3(-4.2, 0.12, 0.9),
    new THREE.Vector3(-0.8, 0.12, 3.6),
    new THREE.Vector3(2.4, 0.12, 6.2),
    new THREE.Vector3(5.8, 0.12, 5.8),
    new THREE.Vector3(9.0, 0.12, 2.6),
    new THREE.Vector3(11.5, 0.12, -0.4),
    new THREE.Vector3(8.6, 0.12, -3.6),
    new THREE.Vector3(3.2, 0.12, -7.6),
    new THREE.Vector3(-0.8, 0.12, -6.4),
    new THREE.Vector3(-4.4, 0.12, -3.6),
    new THREE.Vector3(-6.8, 0.12, 0.1),
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints, true, "catmullrom", 0.4);
  const route = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(260)),
    new THREE.LineDashedMaterial({
      color: "#174d43",
      dashSize: 0.24,
      gapSize: 0.18,
      transparent: true,
      opacity: 0.32,
    })
  );
  route.computeLineDistances();
  scene.add(route);

  const boat = makeBoat();
  boat.scale.setScalar(2.6);
  scene.add(boat);

  const foamMap = loadTex("foam", { repeat: 1 });
  const wakeCount = 220;
  const wakePos = new Float32Array(wakeCount * 3);
  const wakeGeo = new THREE.BufferGeometry();
  wakeGeo.setAttribute("position", new THREE.BufferAttribute(wakePos, 3));
  const wake = new THREE.Points(
    wakeGeo,
    new THREE.PointsMaterial({
      map: foamMap,
      color: "#ffffff",
      size: 0.42,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  scene.add(wake);
  const wakeTrail = [];

  let start = performance.now();
  let frame = 0;
  let running = !reduced;
  const clock = new THREE.Clock();
  const tmpLook = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const camPos = new THREE.Vector3(0, 11.5, 10.5);

  function placeBoat(t) {
    const p = curve.getPointAt(t);
    const look = curve.getPointAt((t + 0.012) % 1);
    boat.position.copy(p);
    boat.position.y = 0.14 + Math.sin(performance.now() * 0.005) * 0.03;
    tmpLook.set(look.x, boat.position.y, look.z);
    boat.lookAt(tmpLook);
    boat.rotateY(Math.PI);
    wakeTrail.unshift(p.clone());
    if (wakeTrail.length > wakeCount) wakeTrail.pop();
    for (let i = 0; i < wakeCount; i++) {
      const wp = wakeTrail[i] || p;
      const spread = Math.sqrt(i) * 0.014;
      wakePos[i * 3] = wp.x + (Math.random() - 0.5) * spread;
      wakePos[i * 3 + 1] = 0.08;
      wakePos[i * 3 + 2] = wp.z + (Math.random() - 0.5) * spread;
    }
    wakeGeo.attributes.position.needsUpdate = true;
    wake.material.opacity = 0.55 + 0.3 * Math.sin(performance.now() * 0.01);

    // Soft follow: keep boat large in frame like Atoll
    camTarget.lerp(p, 0.06);
    const desired = new THREE.Vector3(p.x - 1.2, 9.8, p.z + 8.6);
    camPos.lerp(desired, 0.045);
  }

  if (reduced) {
    placeBoat(0.18);
    renderer.render(scene, camera);
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!running || document.hidden) return;
    const t = ((now - start) % LOOP_MS) / LOOP_MS;
    waterMat.uniforms.uTime.value = clock.getElapsedTime();
    placeBoat(t);
    camera.position.copy(camPos);
    camera.lookAt(camTarget.x, 0.2, camTarget.z);
    renderer.render(scene, camera);
  }
  if (!reduced) frame = requestAnimationFrame(tick);

  function onResize() {
    const w = width(),
      h = height();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (reduced) renderer.render(scene, camera);
  }
  const ro = new ResizeObserver(onResize);
  ro.observe(mount);
  mount.dataset.ready = "true";

  return function destroy() {
    running = false;
    cancelAnimationFrame(frame);
    ro.disconnect();
    renderer.dispose();
    mount.replaceChildren();
  };
}
