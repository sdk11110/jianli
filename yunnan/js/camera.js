/* camera.js — Polaroid queue, eject, flip, clear */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function photosForChapter(city) {
  const photos = window.TravelContent?.photos || [];
  const filtered = photos.filter((p) => p.city === city);
  const queue = filtered.length ? [...filtered] : photos.filter((p) => p.city !== "gallery");
  const ids = new Set(queue.map((p) => p.id));

  for (const photo of photos) {
    if (photo.city === "about" && !ids.has(photo.id)) {
      queue.push(photo);
      ids.add(photo.id);
    }
  }

  return queue;
}

function backFaceMarkup(photo) {
  const note = escapeHtml(photo.note);
  const egg =
    photo.id === "snow-roof"
      ? `<span class="egg">路上总有风，记得慢一点。</span>`
      : "";
  return `<p>${note}${egg}</p>`;
}

function bindImgFallback(img) {
  img.addEventListener("error", () => {
    img.closest(".polaroid")?.classList.add("is-missing");
    img.removeAttribute("src");
  });
}

function initCamera() {
  const mount = document.getElementById("camera-mount");
  const stage = document.getElementById("polaroid-stage");
  if (!mount || !stage) return;

  let queue = [];
  let cursor = 0;

  function rebuildQueue() {
    const id = window.TravelApp?.getActiveChapterId() || "banna";
    queue = photosForChapter(id);
  }

  mount.innerHTML = `
    <div class="camera" aria-label="旅行相机">
      <div class="camera__body"></div>
      <button type="button" class="camera__shutter" id="camera-eject">出一张</button>
      <button type="button" class="camera__clear" id="camera-clear">收起卡片</button>
    </div>`;

  function flip(cardEl) {
    if (!cardEl?.classList?.contains("polaroid")) return;
    cardEl.classList.toggle("is-flipped");
  }

  function clear() {
    stage.innerHTML = "";
  }

  function eject() {
    rebuildQueue();
    if (!queue.length) return;

    const photo = queue[cursor % queue.length];
    cursor += 1;

    const card = document.createElement("article");
    card.className = "polaroid";
    card.innerHTML = `
      <div class="polaroid__inner">
        <div class="polaroid__face polaroid__face--front">
          <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.caption)}" />
          <p class="polaroid__caption">${escapeHtml(photo.caption)}</p>
        </div>
        <div class="polaroid__face polaroid__face--back">${backFaceMarkup(photo)}</div>
      </div>`;

    card.style.setProperty("--tilt", `${(Math.random() * 10 - 5).toFixed(1)}deg`);
    card.addEventListener("click", () => flip(card));

    const img = card.querySelector("img");
    if (img) bindImgFallback(img);

    stage.appendChild(card);

    if (window.TravelApp?.prefersReducedMotion) {
      card.classList.add("is-settled");
    } else {
      requestAnimationFrame(() => {
        card.classList.add("is-ejected");
        requestAnimationFrame(() => card.classList.add("is-settled"));
      });
    }
  }

  mount.querySelector("#camera-eject")?.addEventListener("click", eject);
  mount.querySelector("#camera-clear")?.addEventListener("click", clear);

  window.TravelCamera = { eject, clear, flip };

  rebuildQueue();
  window.TravelApp?.onChapterChange(() => {
    cursor = 0;
    rebuildQueue();
  });
}

document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(initCamera));
