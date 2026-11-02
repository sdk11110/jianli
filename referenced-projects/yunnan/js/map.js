/* map.js — hero route map + chapter stickers */

function initMap() {
  const mount = document.getElementById("map-mount");
  if (!mount || !window.TravelContent) return;

  mount.innerHTML = `
    <div class="travel-map" role="group" aria-label="行程地图">
      <svg viewBox="0 0 640 220" class="travel-map__svg" aria-hidden="true">
        <path
          id="route-path"
          class="travel-map__path"
          d="M80 150 C 180 40, 300 40, 320 110 S 480 200, 560 90"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
        />
      </svg>
      <button type="button" class="sticker sticker--banna" data-target="banna" style="left:12%;top:58%">西双版纳</button>
      <button type="button" class="sticker sticker--puer" data-target="puer" style="left:46%;top:40%">普洱</button>
      <button type="button" class="sticker sticker--dali" data-target="dali" style="left:82%;top:28%">大理</button>
    </div>`;

  mount.querySelectorAll(".sticker").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.scrollIntoView({
        behavior: window.TravelApp?.prefersReducedMotion ? "auto" : "smooth",
      });
    });
  });

  const sync = (id) => {
    mount.querySelectorAll(".sticker").forEach((b) => {
      b.classList.toggle("is-active", Boolean(id) && b.dataset.target === id);
    });
  };

  window.TravelApp?.onChapterChange(sync);

  const path = mount.querySelector("#route-path");
  if (path && !window.TravelApp?.prefersReducedMotion) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.getBoundingClientRect();
    path.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.33, 1, 0.68, 1)";
    path.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName !== "stroke-dashoffset") return;
        path.style.transition = "none";
        path.style.strokeDasharray = "6 8";
        path.style.strokeDashoffset = "0";
      },
      { once: true }
    );
    requestAnimationFrame(() => {
      path.style.strokeDashoffset = "0";
    });
  } else if (path) {
    path.style.strokeDasharray = "6 8";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(initMap);
});
