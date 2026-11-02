(() => {
  'use strict';
  const canvas = document.getElementById('world');
  if (!canvas || typeof THREE === 'undefined') {
    document.body.classList.add('body-no-webgl');
    window.SheepWorld = { setChapter() {}, setPointer() {}, pulse() {}, resize() {}, dispose() {} };
    return;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:700px)');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile.matches, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile.matches ? 1.2 : 1.6));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
  camera.position.z = 8;
  const group = new THREE.Group();
  scene.add(group);

  const count = mobile.matches ? 70 : 140;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    speeds[i] = 0.25 + Math.random() * 0.9;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xf0a040, size: 0.07, transparent: true, opacity: 0.7, depthWrite: false });
  group.add(new THREE.Points(geo, mat));

  const panels = [];
  for (let i = 0; i < 4; i++) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.75),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xe83b4a : 0xffd24a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
    );
    mesh.position.set((i - 1.5) * 2.1, (i % 2 ? 1.2 : -1) * 0.9, -1.2);
    mesh.userData.base = mesh.position.clone();
    group.add(mesh);
    panels.push(mesh);
  }

  const themes = {
    studio: { particle: 0xf0a040, a: 0xe83b4a, b: 0xffd24a, opacity: 0.4 },
    trail: { particle: 0xffc08a, a: 0x1f6b72, b: 0xe85a2a, opacity: 0.35 },
    cozy: { particle: 0xffb07a, a: 0xcb6e45, b: 0x1e4fd6, opacity: 0.3 }
  };

  let pointer = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let pulse = 0;
  let raf = 0;
  let t0 = 0;

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }

  function setChapter(_, sceneName) {
    const theme = themes[sceneName] || themes.studio;
    mat.color.setHex(theme.particle);
    canvas.style.opacity = String(theme.opacity);
    panels.forEach((m, i) => m.material.color.setHex(i % 2 ? theme.b : theme.a));
  }

  function setPointer(x, y) { target.x = x; target.y = y; }
  function pulseBurst(s = 1) { pulse = Math.max(pulse, s); }

  function frame(now) {
    raf = 0;
    if (document.hidden || reduced.matches) return;
    const dt = Math.min(0.05, (now - (t0 || now)) / 1000);
    t0 = now;
    pointer.x += (target.x - pointer.x) * (1 - Math.exp(-dt * 6));
    pointer.y += (target.y - pointer.y) * (1 - Math.exp(-dt * 6));
    pulse *= Math.exp(-dt * 3);

    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(now * 0.001 * speeds[i] + i) * 0.004;
      pos[i * 3] += pointer.x * 0.012 * speeds[i];
      if (pos[i * 3 + 1] > 5.5) pos[i * 3 + 1] = -5.5;
    }
    geo.attributes.position.needsUpdate = true;

    panels.forEach((mesh, i) => {
      const b = mesh.userData.base;
      mesh.position.x = b.x + pointer.x * (0.4 + i * 0.05);
      mesh.position.y = b.y + pointer.y * 0.25 + Math.sin(now * 0.0013 + i) * 0.1;
      mesh.material.opacity = 0.1 + pulse * 0.22;
    });
    group.rotation.y = pointer.x * 0.07;
    renderer.render(scene, camera);
    schedule();
  }

  function schedule() {
    if (!raf && !document.hidden && !reduced.matches) raf = requestAnimationFrame(frame);
  }

  addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; t0 = 0; }
    else schedule();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { cancelAnimationFrame(raf); raf = 0; renderer.clear(); }
    else schedule();
  });

  resize();
  setChapter('hero', 'studio');
  schedule();
  addEventListener('resize', resize, { passive: true });
  window.SheepWorld = { setChapter, setPointer, pulse: pulseBurst, resize, dispose() { cancelAnimationFrame(raf); renderer.dispose(); } };
})();
