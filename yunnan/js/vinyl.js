/* vinyl.js — deck UI, audio-optional playback */

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function initVinyl() {
  const mount = document.getElementById("vinyl-mount");
  if (!mount) return;

  const list = window.TravelContent?.playlist || [];
  let index = 0;
  let playing = false;
  const audio = new Audio();
  audio.preload = "none";

  mount.innerHTML = `
    <div class="vinyl" aria-label="旅途黑胶">
      <div class="vinyl__platter">
        <div class="vinyl__arm" id="vinyl-arm"></div>
        <div class="vinyl__disc" id="vinyl-disc">
          <button type="button" class="vinyl__label" id="vinyl-egg" aria-label="唱盘标签">云南</button>
        </div>
      </div>
      <div class="vinyl__meta">
        <p id="vinyl-title"></p>
        <p id="vinyl-status" class="vinyl__status"></p>
        <div class="vinyl__controls">
          <button type="button" id="vinyl-prev">上一首</button>
          <button type="button" id="vinyl-toggle">播放</button>
          <button type="button" id="vinyl-next">下一首</button>
        </div>
      </div>
    </div>`;

  function current() {
    return list[index] || null;
  }

  function renderMeta() {
    const t = current();
    qs("#vinyl-title", mount).textContent = t ? `${t.title} · ${t.artist}` : "暂无曲目";
    if (!playing || t?.src) {
      qs("#vinyl-status", mount).textContent = t?.src ? "就绪" : "曲目待放入";
    }
  }

  function setPlaying(on) {
    playing = on;
    const reduced = window.TravelApp?.prefersReducedMotion;
    qs("#vinyl-disc", mount).classList.toggle("is-spinning", on && !reduced);
    qs("#vinyl-arm", mount).classList.toggle("is-down", on);
    qs("#vinyl-toggle", mount).textContent = on ? "暂停" : "播放";
  }

  async function play() {
    const t = current();
    if (!t) return;
    if (!t.src) {
      setPlaying(true);
      renderMeta();
      return;
    }
    audio.src = t.src;
    try {
      await audio.play();
      setPlaying(true);
      renderMeta();
    } catch {
      setPlaying(false);
      qs("#vinyl-status", mount).textContent = "需要交互后才能播放";
    }
  }

  function pause() {
    audio.pause();
    setPlaying(false);
    renderMeta();
  }

  function next() {
    if (!list.length) return;
    index = (index + 1) % list.length;
    pause();
    renderMeta();
  }

  function prev() {
    if (!list.length) return;
    index = (index - 1 + list.length) % list.length;
    pause();
    renderMeta();
  }

  qs("#vinyl-toggle", mount).onclick = () => {
    if (playing) pause();
    else play();
  };
  qs("#vinyl-next", mount).addEventListener("click", next);
  qs("#vinyl-prev", mount).addEventListener("click", prev);
  qs("#vinyl-egg", mount).addEventListener("click", () => {
    qs("#vinyl-status", mount).textContent = "路上总有风，记得慢一点。";
  });
  audio.addEventListener("ended", next);

  renderMeta();
  window.TravelVinyl = { play, pause, next, prev };
}

document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(initVinyl));
