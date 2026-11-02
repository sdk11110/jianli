// The paper frames move; text, links and native scrolling stay in place.
const arrivals = new WeakMap();
const runningArrivals = new Set();
let motionPreference;
const arrivalEase = 'cubic-bezier(.16,1,.3,1)';

function clearArrivals() {
  for (const animation of runningArrivals) animation.cancel();
  runningArrivals.clear();
}

/** Update immediately, then explain the new state with an interruptible arrival. */
export function transitionContent(element, update, { direction = 1 } = {}) {
  arrivals.get(element)?.cancel();
  update();
  if (!element || !element.animate || document.hidden || motionPreference?.matches ||
      matchMedia('(prefers-reduced-motion: reduce)').matches || !element.getClientRects().length) return;
  const animation = element.animate([
    { opacity: .55, transform: `translateX(${Math.sign(direction) * 10}px)` },
    { opacity: 1, transform: 'translateX(0)' },
  ], { duration: 280, easing: arrivalEase });
  arrivals.set(element, animation);
  runningArrivals.add(animation);
  const release = () => {
    runningArrivals.delete(animation);
    if (arrivals.get(element) === animation) arrivals.delete(element);
  };
  animation.finished.then(release, release);
}

function initCards(reduced) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const active = new Set();
  const states = [];
  let frame = 0;
  let previousTime = 0;
  let pointerHost = null;
  const specs = [
    ['.work-tile', '.tile-image'],
    ['.training-image', null],
    ['.preview-item', null],
    ['.photo-object .life-photo', null],
  ];
  const canMove = () => fine.matches && !reduced.matches && !document.hidden;

  function paint(state) {
    const { surface, value } = state;
    surface.style.setProperty('--card-rx', value.rx.toFixed(3) + 'deg');
    surface.style.setProperty('--card-ry', value.ry.toFixed(3) + 'deg');
    surface.style.setProperty('--card-lift', value.lift.toFixed(3) + 'px');
    surface.style.setProperty('--card-x', value.x.toFixed(3) + 'px');
    surface.style.setProperty('--card-y', value.y.toFixed(3) + 'px');
  }

  function reset(state) {
    state.value = { rx: 0, ry: 0, lift: 0, x: 0, y: 0 };
    state.target = { ...state.value };
    state.velocity = { rx: 0, ry: 0, lift: 0, x: 0, y: 0 };
    state.bounds = null;
    state.surface.classList.remove('is-card-engaged', 'is-card-moving');
    active.delete(state);
    paint(state);
  }

  function resetAll() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    pointerHost = null;
    states.forEach(reset);
  }

  function schedule(state) {
    active.add(state);
    state.surface.classList.add('is-card-moving');
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function tick(time) {
    frame = 0;
    if (!canMove()) { resetAll(); return; }
    // A bounded timestep keeps the damped response consistent on 60/120 Hz screens.
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .032) : 1 / 60;
    previousTime = time;
    for (const state of active) {
      let settled = true;
      for (const key of ['rx', 'ry', 'lift', 'x', 'y']) {
        const delta = state.target[key] - state.value[key];
        state.velocity[key] += (delta * 220 - state.velocity[key] * 28) * dt;
        state.value[key] += state.velocity[key] * dt;
        if (Math.abs(delta) > .008 || Math.abs(state.velocity[key]) > .025) settled = false;
      }
      if (settled) {
        state.value = { ...state.target };
        state.surface.classList.remove('is-card-moving');
        active.delete(state);
      }
      paint(state);
    }
    if (active.size) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  }

  for (const [selector, inner] of specs) {
    for (const host of document.querySelectorAll(selector)) {
      const surface = inner ? host.querySelector(inner) : host;
      if (!surface) continue;
      surface.classList.add('motion-card');
      if (host.matches('.life-photo')) surface.classList.add('motion-photo');
      const state = { host, surface, visible: true };
      reset(state);
      states.push(state);
      function move(event) {
        if (event.pointerType === 'touch' || !canMove() || !state.visible) return;
        pointerHost = host;
        // Measure the stationary host, never the transformed surface's bounds.
        const bounds = state.bounds ||= host.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        state.target = { rx: -y * .8, ry: x * 1.05, lift: -4, x: x * 2, y: y * 2 };
        surface.classList.add('is-card-engaged');
        schedule(state);
      }
      host.addEventListener('pointerenter', move, { passive: true });
      host.addEventListener('pointermove', move, { passive: true });
      host.addEventListener('pointerleave', () => {
        if (pointerHost === host) pointerHost = null;
        state.bounds = null;
        surface.classList.remove('is-card-engaged');
        state.target = { rx: 0, ry: 0, lift: 0, x: 0, y: 0 };
        if (canMove()) schedule(state);
        else reset(state);
      }, { passive: true });
      host.addEventListener('pointercancel', () => reset(state), { passive: true });
    }
  }

  if ('IntersectionObserver' in window) {
    const byHost = new Map(states.map(state => [state.host, state]));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const state = byHost.get(entry.target);
        state.visible = entry.isIntersecting;
        if (!state.visible) reset(state);
      }
    }, { threshold: .02 });
    states.forEach(state => observer.observe(state.host));
  }
  reduced.addEventListener('change', resetAll);
  fine.addEventListener('change', resetAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetAll(); });
  window.addEventListener('pagehide', resetAll);
  // The card returns home as soon as the visitor starts scrolling away.
  window.addEventListener('scroll', () => { if (pointerHost) resetAll(); }, { passive: true });
}

function initMethodIndicator(reduced) {
  const tabs = document.querySelector('.method-tabs');
  if (!tabs) return;
  const indicator = document.createElement('span');
  indicator.className = 'method-tab-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  tabs.append(indicator);
  tabs.classList.add('has-motion-indicator');
  let frame = 0;
  let animation;
  let ready = false;
  let lastTransform = '';

  function measure(animate = true) {
    frame = 0;
    const selected = tabs.querySelector('[role="tab"][aria-selected="true"]');
    if (!selected) return;
    const root = tabs.getBoundingClientRect();
    const bounds = selected.getBoundingClientRect();
    const target = `translate(${bounds.left - root.left}px,${bounds.bottom - root.top - 3}px) scaleX(${bounds.width})`;
    if (target === lastTransform) return;
    const before = getComputedStyle(indicator).transform;
    animation?.cancel();
    indicator.style.transform = target;
    if (ready && animate && !reduced.matches && !document.hidden && indicator.animate) {
      animation = indicator.animate([{ transform: before }, { transform: target }], {
        duration: 340, easing: arrivalEase,
      });
    }
    ready = true;
    lastTransform = target;
  }

  const schedule = () => { if (!frame) frame = requestAnimationFrame(() => measure()); };
  new MutationObserver(schedule).observe(tabs, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
  if ('ResizeObserver' in window) new ResizeObserver(() => measure(false)).observe(tabs);
  else window.addEventListener('resize', () => measure(false), { passive: true });
  document.fonts?.ready.then(() => measure(false));
  reduced.addEventListener('change', () => { animation?.cancel(); measure(false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) animation?.cancel(); });
  measure(false);
}

/** CSS owns composition; this module writes only bounded interaction variables.
 * .motion-card receives --card-rx/ry (deg), --card-lift (negative px),
 * --card-x/y (−2 to 2px image displacement). .motion-photo retains its base 3deg roll.
 * .method-tab-indicator needs absolute position, top/left 0, width 1px,
 * height 3px, transform-origin:left center; active tab borders stay 1px.
 */
export function initSurfaceMotion({ reduced = matchMedia('(prefers-reduced-motion: reduce)') } = {}) {
  motionPreference = reduced;
  initCards(reduced);
  initMethodIndicator(reduced);

  reduced.addEventListener('change', () => { if (reduced.matches) clearArrivals(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearArrivals(); });
}

