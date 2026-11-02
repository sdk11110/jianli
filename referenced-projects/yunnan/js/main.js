/* main.js — narrative render, scroll atmosphere, FAQ */

let activeChapterId = null;
const listeners = [];

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function polaroidMarkup(photo, extraClass) {
  if (!photo) return "";
  const cls = extraClass ? `polaroid ${extraClass}` : "polaroid";
  return `<figure class="${cls}">
    <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.caption)}" />
    <figcaption>${escapeHtml(photo.caption)}</figcaption>
  </figure>`;
}

function bindImgFallback(img) {
  img.addEventListener("error", () => {
    img.closest(".polaroid")?.classList.add("is-missing");
    img.removeAttribute("src");
  });
}

function renderHero(site) {
  const root = qs("#hero");
  if (!root || !site) return;
  root.innerHTML = `
    <div class="hero-sky" aria-hidden="true">
      <span class="hero-cloud hero-cloud--a"></span>
      <span class="hero-cloud hero-cloud--b"></span>
      <span class="hero-ridge hero-ridge--back"></span>
      <span class="hero-ridge hero-ridge--mid"></span>
      <span class="hero-ridge hero-ridge--front"></span>
      <span class="hero-deck"></span>
    </div>
    <div class="hero-inner">
      <div class="hero-copy">
        <h1>${escapeHtml(site.title)}</h1>
        <p class="hero-line">${escapeHtml(site.heroLine)}</p>
        <p class="hero-route">${escapeHtml(site.subtitle)}</p>
        <a class="hero-cta" href="#about">开始旅程</a>
      </div>
      <div id="map-mount" class="hero-map"></div>
    </div>
    <a class="hero-scroll" href="#about" aria-label="向下滚动">下滑</a>
  `;
}

function renderAbout(content) {
  const root = qs("#about");
  if (!root || !content) return;
  const about = content.about || {};
  const paras = about.letter || [];
  root.innerHTML = `
    <div class="section-inner about-layout">
      <div class="about-letter">
        <h2>${escapeHtml(about.title || "开场")}</h2>
        ${paras.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
      </div>
    </div>
  `;
}

function renderChapter(chapter) {
  const root = chapter?.id ? qs(`#${chapter.id}`) : null;
  if (!root) return;
  root.style.setProperty("--scene-wash", chapter.wash || "#e8e0d4");
  root.style.setProperty("--chapter-accent", chapter.accent || "");
  root.innerHTML = `
    <div class="scene-wash" aria-hidden="true"></div>
    <div class="scene-motif" aria-hidden="true"></div>
    <div class="section-inner scene-inner">
      <p class="scene-mood">${escapeHtml(chapter.mood || "")}</p>
      <h2>${escapeHtml(chapter.name)}</h2>
      <div class="chapter-body">
        ${(chapter.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
      </div>
      <p class="scene-hint">照片不在这里——往下到物件台，用相机一张张取出来。</p>
    </div>
  `;
}

function renderDesk() {
  const root = qs("#desk");
  if (!root) return;
  root.innerHTML = `
    <div class="section-inner">
      <h2>物件台</h2>
      <p class="desk-lead">地图上的城走完了。把相机按下，把黑胶转起来——旅途物件在这张木桌上。</p>
      <div class="desk-grid">
        <div id="camera-mount"></div>
        <div id="vinyl-mount"></div>
      </div>
      <div id="polaroid-stage" aria-live="polite"></div>
    </div>
  `;
}

function renderGallery(photos) {
  const root = qs("#gallery");
  if (!root) return;
  const list = photos || [];
  root.innerHTML = `
    <div class="section-inner">
      <h2>展厅</h2>
      <p class="gallery-lead">整段旅程的底片，集中放在这里。前面章节只讲感觉，不堆照片。</p>
      <div class="gallery-wall">
        ${list.map((p) => polaroidMarkup(p)).join("")}
      </div>
    </div>
  `;
}

function renderFaq(faq) {
  const root = qs("#faq");
  if (!root) return;
  const items = faq || [];
  root.innerHTML = `
    <div class="section-inner">
      <h2>FAQ</h2>
      <div class="faq-list">
        ${items
          .map(
            (item, i) => `
          <div class="faq-item${i === 0 ? " is-open" : ""}">
            <button type="button" class="faq-q" aria-expanded="${i === 0 ? "true" : "false"}">${escapeHtml(item.q)}</button>
            <div class="faq-a"><p>${escapeHtml(item.a)}</p></div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
  const list = qs(".faq-list", root);
  if (!list) return;
  list.addEventListener("click", (event) => {
    const btn = event.target.closest(".faq-q");
    if (!btn || !list.contains(btn)) return;
    const item = btn.closest(".faq-item");
    const willOpen = !item.classList.contains("is-open");
    list.querySelectorAll(".faq-item").forEach((el) => {
      const open = willOpen && el === item;
      el.classList.toggle("is-open", open);
      el.querySelector(".faq-q")?.setAttribute("aria-expanded", String(open));
    });
  });
}

function renderOutro(outro) {
  const root = qs("#outro");
  if (!root || !outro) return;
  root.innerHTML = `
    <div class="section-inner outro-letter">
      <h2>${escapeHtml(outro.title)}</h2>
      ${(outro.letter || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
      <p class="outro-sign">${escapeHtml(outro.signOff)}</p>
      <p class="outro-share">${escapeHtml(outro.shareHint)}</p>
    </div>
  `;
}

function setupScrollSpy(chapterIds) {
  const ids = chapterIds || [];
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const chapterEls = ids.map((id) => qs(`#${id}`)).filter(Boolean);
  const navSections = navLinks
    .map((a) => {
      const id = a.getAttribute("href")?.replace(/^#/, "");
      return id ? qs(`#${id}`) : null;
    })
    .filter(Boolean);

  const ratios = new Map();
  const accentById = new Map(
    (window.TravelContent?.chapters || []).map((ch) => [ch.id, ch.accent])
  );

  function setActiveChapter(id) {
    if (id === activeChapterId) return;
    activeChapterId = id;
    const accent = accentById.get(id);
    if (accent) {
      document.documentElement.style.setProperty("--chapter-accent", accent);
    }
    document.body.dataset.activeChapter = id || "";
    listeners.forEach((cb) => {
      try {
        cb(id);
      } catch (err) {
        console.warn("onChapterChange listener failed", err);
      }
    });
  }

  function setActiveNav(id) {
    navLinks.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
    });
  }

  function pickBest(candidates) {
    let bestId = null;
    let bestRatio = 0;
    for (const el of candidates) {
      const ratio = ratios.get(el.id) || 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = el.id;
      }
    }
    return bestRatio > 0 ? bestId : null;
  }

  const observed = new Set([...chapterEls, ...navSections]);
  if (!observed.size || typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        if (entry.target.classList.contains("chapter")) {
          entry.target.classList.toggle("is-inview", entry.isIntersecting && entry.intersectionRatio > 0.12);
        }
      }
      const chapterId = pickBest(chapterEls);
      if (chapterId) setActiveChapter(chapterId);
      const navId = pickBest(navSections);
      if (navId) setActiveNav(navId);
    },
    {
      root: null,
      rootMargin: "-22% 0px -42% 0px",
      threshold: [0, 0.12, 0.25, 0.4, 0.6, 0.8, 1],
    }
  );

  observed.forEach((el) => observer.observe(el));
}

function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return { r: 243, g: 237, b: 226 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mixHex(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const k = Math.min(1, Math.max(0, t));
  const r = Math.round(A.r + (B.r - A.r) * k);
  const g = Math.round(A.g + (B.g - A.g) * k);
  const bch = Math.round(A.b + (B.b - A.b) * k);
  return `rgb(${r}, ${g}, ${bch})`;
}

function setupScrollAtmosphere() {
  const chapters = window.TravelContent?.chapters || [];
  if (!chapters.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paper = "#F3EDE2";
  let ticking = false;

  function update() {
    ticking = false;
    const mid = window.innerHeight * 0.42;
    let wash = paper;
    let accent = chapters[0].accent;
    let progress = 0;

    for (let i = 0; i < chapters.length; i += 1) {
      const el = qs(`#${chapters[i].id}`);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const start = rect.top;
      const end = rect.bottom;
      if (mid >= start && mid <= end) {
        const local = (mid - start) / Math.max(rect.height, 1);
        const next = chapters[i + 1];
        wash = next
          ? mixHex(chapters[i].wash || paper, next.wash || paper, local)
          : chapters[i].wash || paper;
        accent = next
          ? mixHex(chapters[i].accent, next.accent, local)
          : chapters[i].accent;
        progress = (i + local) / chapters.length;
        el.style.setProperty("--scene-progress", String(local.toFixed(3)));
        break;
      }
      if (mid < start && i === 0) {
        wash = mixHex(paper, chapters[0].wash || paper, Math.max(0, 1 - start / window.innerHeight));
        break;
      }
      if (mid > end && i === chapters.length - 1) {
        wash = chapters[i].wash || paper;
        accent = chapters[i].accent;
        progress = 1;
      }
    }

    document.documentElement.style.setProperty("--page-wash", wash);
    document.documentElement.style.setProperty("--chapter-accent", accent);
    document.documentElement.style.setProperty("--journey-progress", String(progress.toFixed(3)));

    if (!reduced) {
      const ridges = document.querySelectorAll(".hero-ridge, .hero-cloud");
      const y = window.scrollY;
      ridges.forEach((node, idx) => {
        const depth = (idx + 1) * 0.04;
        node.style.transform = `translate3d(0, ${y * depth}px, 0)`;
      });
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

function initTravelApp() {
  const C = window.TravelContent;
  if (C) {
    renderHero(C.site);
    renderAbout(C);
    (C.chapters || []).forEach((chapter) => renderChapter(chapter));
    renderDesk();
    renderGallery(C.photos || []);
    renderFaq(C.faq || []);
    renderOutro(C.outro);
    const chapterIds = ["banna", "puer", "dali"];
    setupScrollSpy(chapterIds);
    setupScrollAtmosphere();
    document.querySelectorAll("main img").forEach(bindImgFallback);
  }

  window.TravelApp = {
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    getActiveChapterId() {
      return activeChapterId;
    },
    onChapterChange(cb) {
      if (typeof cb !== "function") return;
      listeners.push(cb);
      if (activeChapterId) cb(activeChapterId);
    },
  };
}

document.addEventListener("DOMContentLoaded", initTravelApp);
