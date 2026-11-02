(() => {
  const $ = (s) => document.querySelector(s);
  const decor = (kind, position) =>
    `<span class="decor decor-${kind} ${position}" aria-hidden="true"></span>`;

  $('#hero').insertAdjacentHTML(
    'beforeend',
    decor('cloud', 'cloud-left') +
      decor('cloud2', 'cloud-right') +
      decor('flowers', 'flower-left') +
      decor('flowers', 'flower-right') +
      decor('leaves', 'leaf-left') +
      decor('leaves', 'leaf-right') +
      decor('petals', 'petals-float') +
      decor('stars', 'stars-float')
  );
  for (const id of ['about', 'desk', 'gallery', 'faq', 'outro']) {
    $('#' + id).insertAdjacentHTML(
      'beforeend',
      decor(id === 'desk' ? 'leaves' : 'flowers', 'scene-flower-left') +
        decor(id === 'gallery' ? 'petals' : 'flowers', 'scene-flower-right')
    );
  }

  const scene = $('.record-scene');
  if (!scene) return;

  const REST = 0;
  const PLAY = 1;
  const SNAP = 0.55;

  scene.innerHTML = `
    <div class="turntable has-record" aria-label="互动唱机：拨动唱臂到黑胶上播放">
      <img class="player-base" src="assets/illustrations/record-player-journal.png" alt="红色旅行箱唱机，黑胶已在唱盘上" draggable="false">
      <div class="mounted-record">
        <div class="vinyl-spin">
          <img class="vinyl-img" src="assets/illustrations/vinyl-disc.png" alt="黑胶唱片" draggable="false">
        </div>
      </div>
      <button type="button" class="tonearm-handle" id="tonearm-handle"
        aria-label="拖动唱臂放到黑胶上开始播放"
        aria-describedby="record-instruction"
        style="--arm:0">
        <span class="tonearm-pivot" aria-hidden="true"></span>
        <span class="tonearm-beam" aria-hidden="true"></span>
        <span class="tonearm-head" aria-hidden="true"></span>
      </button>
      <span class="music-note note-a" aria-hidden="true">♪</span>
      <span class="music-note note-b" aria-hidden="true">♫</span>
    </div>
    <p class="hand-note" id="record-instruction">把唱臂拨到黑胶上，听这一首</p>
    <div class="turntable-controls">
      <button type="button" id="record-toggle">拨到黑胶上</button>
    </div>
    <p id="record-status" aria-live="polite">黑胶静静等着。拨动右边唱臂，放到碟上就会转起来。</p>
    <span class="tiny-note">合成环境音 · 非实地录音 · 就这一首</span>`;

  const table = $('.turntable');
  const arm = $('#tonearm-handle');
  const toggle = $('#record-toggle');
  const instruction = $('#record-instruction');
  const status = $('#record-status');
  const sound = $('.sound-switch');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  let armT = REST;
  let armOn = false;
  let dragging = false;
  let dragStartX = 0;
  let dragStartT = 0;

  const isPlaying = () => sound?.getAttribute('aria-pressed') === 'true';

  function paintUI() {
    const onDisc = armT >= SNAP;
    const playing = isPlaying();
    table.classList.toggle('is-playing', onDisc && playing);
    table.classList.toggle('arm-down', onDisc);
    arm.classList.toggle('is-on-disc', onDisc);
    arm.style.setProperty('--arm', armT.toFixed(4));

    toggle.textContent = onDisc ? '抬起唱臂' : '拨到黑胶上';
    arm.setAttribute(
      'aria-label',
      onDisc ? '唱臂在碟上，拖回可停止' : '拖动唱臂放到黑胶上开始播放'
    );
    instruction.textContent = onDisc
      ? '唱臂落下了。这一首，慢慢听。'
      : '把唱臂拨到黑胶上，听这一首';
    status.textContent = onDisc
      ? playing
        ? '黑胶在转 · 合成环境音'
        : '唱臂已落下 · 声音已暂停'
      : '黑胶静静等着。拨动右边唱臂，放到碟上就会转起来。';
  }

  function applyArmSound() {
    const onDisc = armT >= SNAP;
    if (onDisc === armOn) {
      paintUI();
      return;
    }
    armOn = onDisc;
    if (onDisc && !isPlaying()) sound?.click();
    if (!onDisc && isPlaying()) sound?.click();
    paintUI();
  }

  function setArm(t, { snap = false, animate = true } = {}) {
    let next = Math.min(1, Math.max(0, t));
    if (snap) next = next >= SNAP ? PLAY : REST;
    armT = next;
    if (!animate || reduced.matches) arm.style.transition = 'none';
    else arm.style.transition = '';
    applyArmSound();
  }

  arm.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartT = armT;
    arm.setPointerCapture(e.pointerId);
    arm.classList.add('is-dragging');
    arm.style.transition = 'none';
  });

  arm.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    /* Drag left (toward disc) raises engagement */
    const delta = (dragStartX - e.clientX) / 130;
    armT = Math.min(1, Math.max(0, dragStartT + delta));
    arm.style.setProperty('--arm', armT.toFixed(4));
    arm.classList.toggle('is-on-disc', armT >= SNAP);
    table.classList.toggle('arm-down', armT >= SNAP);
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    arm.classList.remove('is-dragging');
    try {
      arm.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setArm(armT, { snap: true, animate: true });
  }

  arm.addEventListener('pointerup', endDrag);
  arm.addEventListener('pointercancel', endDrag);

  arm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setArm(armT >= SNAP ? REST : PLAY, { snap: true });
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      /* Left = onto disc (visual), Right = lift */
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setArm(PLAY, { snap: true });
      else setArm(REST, { snap: true });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setArm(REST, { snap: true });
    }
  });

  toggle.addEventListener('click', () => {
    setArm(armT >= SNAP ? REST : PLAY, { snap: true });
  });

  if (sound) {
    new MutationObserver(paintUI).observe(sound, {
      attributes: true,
      attributeFilter: ['aria-pressed'],
    });
  }

  setArm(REST, { animate: false });
})();
