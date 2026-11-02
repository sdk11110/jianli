(() => {
  "use strict";

  let demoData = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
  const mediaObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
  }, { threshold: 0.15 });
  function registerMedia(video) {
    if (!video || video.dataset.mediaGuard) return;
    video.dataset.mediaGuard = 'true';
    mediaObserver.observe(video);
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause());
  });
  let scriptData = null;


  const state = {
    pipelineDone: false,
    currentPhase: "select",
    isRunning: false,
    jobId: null,
    selectedPages: [],
    awaitingPhase: "select",
    reviewPhase: null,
  };

  const SERVER_PHASES = ["vision", "prompt", "seedance", "upscale", "ffmpeg", "audio", "finalize"];

  const PHASE_ORDER = ["vision", "prompt", "seedance", "upscale", "ffmpeg", "audio", "done"];

  const $ = (sel) => document.querySelector(sel);


  const reviewLabels = {vision:'教材识读',prompt:'分镜与提示词',seedance:'生成画面',audio:'音画与配音',finalize:'最终成片品检'};
  function emitState() {
    window.dispatchEvent(new CustomEvent('textbook:state', {detail:{phase:state.isRunning?(state._mockJob?.running_phase||state.currentPhase||state.awaitingPhase):state.awaitingPhase,reviewPhase:state.reviewPhase,running:state.isRunning,done:state.pipelineDone,selected:[...state.selectedPages],completed:[...(state._mockJob?.completed_phases||[])],progress:state._mockJob?.progress||0}}));
  }
  function syncReview() {
    const gate=$('#reviewGate'); if(!gate)return;
    gate.hidden=!state.reviewPhase;
    $('#phaseSelectPanel').hidden=!!state.reviewPhase;
    if(state.reviewPhase) {
      $('#reviewGateTitle').textContent=state.reviewPhase==='finalize'?'最终品检 · 待确认':reviewLabels[state.reviewPhase]+' · 待人工确认';
      $('#reviewGateCopy').textContent={vision:'核对教材情景、角色和教学语句，再进入分镜设计。',prompt:'检查情景与教材约束、镜头衔接及对白，确认后再生成。',seedance:'查看已有片段，检查人物、语境与运动；不合格可返回本步。',audio:'检查教材发音、音画同步和背景音乐，确认后输出。',finalize:'查看真实成片，确认内容、画面与声音，完成模拟验收。'}[state.reviewPhase];
    }
  }

  function finalVideoSrc() {
    return "assets/video/final.mp4";
  }

  function syncHeroVideoFromDemo() {
    const video = $("#heroVideo");
    if (!video || !demoData?.video_file) return;
    const src = finalVideoSrc();
    const source = video.querySelector("source");
    if (source) {
      source.src = src;
      video.load();
    }
  }

  function cjkSpace(text) {
    if (!text) return text;
    return String(text)
      .replace(/([\u4e00-\u9fff])([A-Za-z0-9])/g, "$1 $2")
      .replace(/([A-Za-z0-9])([\u4e00-\u9fff])/g, "$1 $2");
  }

  function setupNavSpy() {
    const links = [...document.querySelectorAll(".nav a")];
    const sections = links
      .map((a) => {
        const id = a.getAttribute("href")?.slice(1);
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("active", id && link.getAttribute("href") === `#${id}`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        } else if (window.scrollY < 120) {
          setActive(null);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));

    window.addEventListener("scroll", () => {
      if (window.scrollY < 120) setActive(null);
    }, { passive: true });
  }

  function openLightbox(url, caption) {
    if (!url) return;
    const box = $('#imageLightbox');
    $('#lightboxImg').src = url;
    $('#lightboxImg').alt = caption || '教材参考图';
    $('#lightboxCaption').textContent = caption || '';
    if (!box.open) box.showModal();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const box = $('#imageLightbox');
    if (!box.open) return;
    box.close();
    document.body.style.overflow = '';
  }

  function setupLightbox() {
    $('#imageLightbox').addEventListener('close', () => { document.body.style.overflow = ''; });
    $("#lightboxClose")?.addEventListener("click", closeLightbox);
    $("#lightboxBackdrop")?.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });

    document.querySelectorAll(".photo-card img:not(.photo-hover-swap)").forEach((img) => {
      img.classList.add("hero-zoomable");
      img.title = "点击放大";
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox(img.src, img.alt || "参考场景图");
      });
    });
  }

  function setupHeroVideo() {
    const player = $('#heroVideoPlayer');
    const video = $('#heroVideo');
    const playBtn = $('#heroVideoPlay');
    const sound = $('#heroSound');
    const seek = $('#heroSeek');
    const message = $('#heroPlayerMessage');
    let hasTried = false;
    const time = value => `${Math.floor((value || 0) / 60)}:${String(Math.floor((value || 0) % 60)).padStart(2, '0')}`;
    const sync = () => {
      const playing = !video.paused && !video.ended;
      player.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-label', playing ? '暂停教学成片' : '有声播放教学成片');
      sound.setAttribute('aria-pressed', String(video.muted));
      sound.setAttribute('aria-label', video.muted ? '开启声音' : '关闭声音');
      sound.querySelector('span').textContent = video.muted ? '声音关' : '声音开';
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      seek.value = duration ? video.currentTime / duration * 100 : 0;
      seek.style.setProperty('--seek-progress', `${seek.value}%`);
      seek.disabled = !duration;
      $('#heroTime').textContent = `${time(video.currentTime)} / ${time(duration)}`;
      seek.setAttribute('aria-valuetext', `${time(video.currentTime)}，总长 ${time(duration)}`);
      if (playing) message.textContent = '';
    };
    const play = () => {
      hasTried = true;
      video.muted = false;
      video.volume = 0.85;
      if (video.error) video.load();
      const attempt = video.play();
      attempt?.catch(() => { message.textContent = video.error ? '视频暂时未加载，点击重试' : '点击，有声播放'; sync(); });
    };
    const toggle = () => video.paused ? play() : video.pause();
    playBtn.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
    sound.addEventListener('click', () => { video.muted = !video.muted; sync(); });
    seek.addEventListener('input', () => { if (Number.isFinite(video.duration)) video.currentTime = video.duration * Number(seek.value) / 100; });
    $('#heroExpand').addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (player.requestFullscreen) await player.requestFullscreen();
        else video.webkitEnterFullscreen?.();
      } catch { message.textContent = '可在当前画面继续播放'; }
    });
    ['play', 'pause', 'ended', 'timeupdate', 'durationchange', 'loadedmetadata', 'volumechange'].forEach(event => video.addEventListener(event, sync));
    video.addEventListener('waiting', () => { message.textContent = '正在准备画面…'; });
    video.addEventListener('playing', () => { message.textContent = ''; });
    video.addEventListener('error', () => { message.textContent = '视频暂时未加载，点击重试'; });
    registerMedia(video);
    const entrance = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && !hasTried && !document.hidden && !reducedMotion.matches) play();
    }, { threshold: 0.4 });
    entrance.observe(video);
    sync();
  }

  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    $("#toastStack").appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function setProgress(pct, label) {
    $("#progressFill").style.width = `${pct}%`;
    $("#progressPct").textContent = `${pct}%`;
    if (label) $("#progressLabel").textContent = label;
    emitState();
  }

  function setStep(step) {
    document.querySelectorAll(".step-item").forEach((el) => {
      const s = el.dataset.step;
      const si = PHASE_ORDER.indexOf(s);
      const idx = PHASE_ORDER.indexOf(step);
      el.classList.remove("active", "done");
      if (s === step) {
        el.classList.add(step === "done" ? "done" : "active");
      } else if (si >= 0 && si < idx) {
        el.classList.add("done");
      }
    });
  }

  function setOutputStats(html) {
    const el = $("#outputStats");
    if (!html) {
      el.classList.add("panel-hidden");
      el.innerHTML = "";
      return;
    }
    el.classList.remove("panel-hidden");
    el.innerHTML = html;
  }

  function renderLessonPreview(lesson, revealed = null) {
    const scenes = lesson.scenes;
    const count = revealed == null ? scenes.length : revealed;
    return scenes.map((s, i) => {
      const visible = i < count;
      const dialogues = s.dialogues.map((d) => `${d.en} / ${d.zh}`).join(" · ");
      return `
        <div class="output-dialogue-item${visible ? "" : " pending"}">
          <span class="row-idx">${s.scene_id}</span>
          <div>
            <div class="en">${s.topic}</div>
            <div class="cn">${visible ? dialogues : "待解析…"}</div>
            ${visible ? `<div class="audio-tag">P${s.page} · ${s.visual_elements.join(", ")}</div>` : ""}
          </div>
        </div>`;
    }).join("");
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shotCount() {
    return demoData?.shots?.length || scriptData?.scenes?.length || 0;
  }

  function formatShotLabel(count) {
    if (!count) return "动态分镜";
    return `${count} 幕`;
  }

  function parsePresetParts(preset) {
    const lines = String(preset || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const styleLine = lines.find((l) => l.startsWith("风格：") || l.startsWith("风格:")) || "";
    const style = styleLine.replace(/^风格[：:]\s*/, "").trim()
      || "儿童教材扁平卡通风，粗黑色描边，高饱和撞色，2D插画质感";
    return { style };
  }

  const RULE_TITLE_BY_INDEX = {
    1: "场景拆解",
    2: "一图一视频",
    3: "角色设定",
    4: "对白接力",
    5: "镜头语言要求",
    6: "情节发挥要求",
    7: "台词还原",
    8: "提示词输出项",
    9: "输出格式",
  };

  function parseScriptRules(template) {
    if (!template) return [];
    const text = String(template).trim();
    const lead = [];
    const numbered = [];
    const parts = text.split(/(?=【[^】]+】)/);

    for (const part of parts) {
      const chunk = part.trim();
      if (!chunk) continue;

      const section = chunk.match(/^【([^】]+)】([\s\S]*)$/);
      if (section) {
        const title = section[1];
        const bodyText = section[2].trim();
        if (title.includes("角色")) continue;
        if (title.includes("规则")) {
          const blocks = bodyText.split(/\n(?=\d+\.)/).map((b) => b.trim()).filter(Boolean);
          blocks.forEach((block) => {
            const matched = block.match(/^(\d+)\.\s*([\s\S]+)/);
            if (!matched) return;
            const index = Number(matched[1]);
            const rawBody = matched[2].split("\n").map((l) => l.trim()).filter(Boolean);
            const first = rawBody[0] || "";
            // 角色随教材变化，不展示写死角色的规则
            if (/角色设定固定|见下方模板/.test(first)) return;

            const bracket = first.match(/^【([^】]+)】(.*)$/);
            let cardTitle = RULE_TITLE_BY_INDEX[index] || `规则 ${index}`;
            let body = rawBody;
            if (bracket) {
              cardTitle = bracket[1];
              const rest = bracket[2].trim();
              body = rest ? [rest, ...rawBody.slice(1)] : rawBody.slice(1);
            } else if (index === 9 && /^输出格式[：:]/.test(first)) {
              cardTitle = "输出格式";
              body = [first.replace(/^输出格式[：:]\s*/, ""), ...rawBody.slice(1)].filter(Boolean);
            }
            numbered.push({
              index,
              title: cardTitle,
              body: body
                .map((line) => line.replace(/^\d+\.\s*/, "").trim())
                .filter((line) => line && !/^\d+\.?$/.test(line)),
            });
          });
        } else if (title.includes("核心原则")) {
          lead.push({
            index: null,
            title: "核心原则",
            body: bodyText.split("\n").map((l) => l.trim()).filter(Boolean),
          });
        } else {
          lead.push({
            index: null,
            title,
            body: bodyText.split("\n").map((l) => l.trim()).filter(Boolean),
          });
        }
        continue;
      }

      if (chunk.startsWith("现在请")) continue;
      lead.unshift({
        index: null,
        title: "前置说明",
        body: chunk.split("\n").map((l) => l.trim()).filter(Boolean),
      });
    }

    return [...lead, ...numbered].filter((r) => r.body.length);
  }

  function renderScriptRules(template) {
    const el = $("#scriptTemplate");
    if (!el) return;
    const rules = parseScriptRules(template);
    const summary = $("#scriptTemplateSummary");
    if (summary) {
      summary.textContent = "固定提示词模板 · Skill";
    }
    if (!rules.length) {
      el.innerHTML = `<div class="script-prose">${escapeHtml(template || "")}</div>`;
      return;
    }
    el.innerHTML = rules.map((rule) => `
      <article class="script-rule-card">
        <div class="script-rule-head">
          ${rule.index != null ? `<span class="script-rule-index">${rule.index}</span>` : ""}
          <h4>${escapeHtml(rule.title)}</h4>
        </div>
        <div class="script-rule-body">
          ${rule.body.map((line) => {
            const cleaned = String(line).replace(/^\d+\.\s*/, "").trim();
            if (!cleaned || /^\d+\.?$/.test(cleaned)) return "";
            const bullet = cleaned.match(/^[-·•]\s*(.+)$/);
            if (bullet) {
              return `<p class="is-bullet">${escapeHtml(bullet[1])}</p>`;
            }
            return `<p>${escapeHtml(cleaned)}</p>`;
          }).join("")}
        </div>
      </article>`).join("");
  }

  function renderScriptStyle(preset, scenes) {
    const el = $("#scriptStyle");
    if (!el) return;
    const fromPreset = parsePresetParts(preset).style;
    const fromScene = scenes?.find((s) => s.style)?.style || "";
    const style = fromPreset || fromScene || "儿童教材扁平卡通风，粗黑色描边，高饱和撞色，2D插画质感";
    const chips = ["儿童教材扁平卡通", "粗黑描边", "高饱和", "2D"];
    el.innerHTML = `
      <div class="script-style-fixed-body">
        <p>${escapeHtml(style)}</p>
        <div class="script-style-chips">
          ${chips.map((c) => `<span>${escapeHtml(c)}</span>`).join("")}
        </div>
      </div>`;
  }

  function bindScriptZoomables(root) {
    (root || document).querySelectorAll(".script-zoomable").forEach((img) => {
      if (img.dataset.zoomBound === "1") return;
      img.dataset.zoomBound = "1";
      img.title = "点击放大";
      img.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(img.currentSrc || img.src, img.alt || "预览");
      });
    });
  }

  function renderScriptInputs(script) {
    const el = $("#scriptInputs");
    if (!el) return;
    const book = demoData?.book || {};
    const pages = demoData?.textbook_pages || [];
    const scenes = script?.scenes || [];
    const seen = new Set();
    const refs = scenes.filter((s) => {
      const key = (s.ref_image || "").replace(/（.*?）/g, "").replace(/\.\w+$/, "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const bookName = book.name || "译林版小学英语教材";
    const unitLabel = [book.unit, book.title].filter(Boolean).join(" · ") || script?.title || "当前单元";
    const pageThumbs = pages.slice(0, 3).map((page) => {
      const src = page.image_url || `assets/original/${encodeURIComponent(page.original_image || "")}`;
      return `<img class="script-zoomable" src="${src}" alt="教材页面 P${page.page}" loading="lazy" />`;
    }).join("");
    const refThumbs = refs.slice(0, 4).map((scene, i) => {
      const code = (scene.ref_image || "").replace(/\.\w+$/, "").replace(/（.*?）/g, "");
      return `<img class="script-zoomable" src="${scene.ref_image_url || ""}" alt="参考图 ${escapeHtml(code)}" loading="lazy" />`;
    }).join("");

    el.innerHTML = `
      <div class="script-material-item is-book">
        <span class="script-material-icon" aria-hidden="true">书</span>
        <div class="script-material-copy">
          <strong>${escapeHtml(bookName)}</strong>
          <span>${escapeHtml(unitLabel)}</span>
        </div>
      </div>
      <div class="script-material-item">
        <div class="script-material-thumbs">${pageThumbs || `<span class="script-material-empty">无页</span>`}</div>
        <div class="script-material-copy">
          <strong>教材页面</strong>
          <span>${pages.length} 页</span>
        </div>
      </div>
      <div class="script-material-item">
        <div class="script-material-thumbs">${refThumbs || `<span class="script-material-empty">无图</span>`}</div>
        <div class="script-material-copy">
          <strong>参考图片</strong>
          <span>${refs.length} 张</span>
        </div>
      </div>
      <div class="script-material-item is-meta">
        <div class="script-material-copy">
          <strong>可选设定</strong>
          <span>角色随教材识别 · 风格可覆盖</span>
        </div>
      </div>`;

    bindScriptZoomables(el);
  }

  function arcPhaseClass(label) {
    const text = String(label || "");
    if (text.includes("起")) return "arc-qi";
    if (text.includes("合")) return "arc-he";
    if (text.includes("转")) return "arc-zhuan";
    if (text.includes("承")) return "arc-cheng";
    return "arc-cheng";
  }

  function renderArcPill(label) {
    return `<span class="arc-pill ${arcPhaseClass(label)}">${escapeHtml(label || "")}</span>`;
  }

  function updateScriptMeta(script) {
    const count = script?.scenes?.length || shotCount();
    const arcTag = $("#scriptArcTag");
    const shotTag = $("#scriptShotTag");
    if (arcTag) {
      arcTag.textContent = count
        ? `起承转合 · 本单元 ${count} 幕`
        : "起承转合 · 幕数随教材变化";
    }
    if (shotTag && count) {
      shotTag.textContent = `${count} 幕 · 点表切换 · 同时仅看 1 幕`;
    }
  }

  function scenePromptText(scene) {
    if (scene.script_prompt) return scene.script_prompt;
    const raw = String(scene.prompt || "");
    const m = raw.match(/\[脚本提示词\]\s*([\s\S]+?)(?:\n\n\[(?:旁白|台词)\]|$)/);
    if (m) return m[1].trim();
    return raw.replace(/^风格[：:][^\n]*\n?/, "").replace(/\[(?:旁白|台词)\][\s\S]*/, "").trim();
  }

  function sceneDialogueLines(scene) {
    const lines = [];
    if (scene.voiceover) {
      lines.push({ type: "旁白", en: scene.voiceover, zh: "" });
    }
    (scene.subtitles || []).forEach((line) => {
      lines.push({ type: "台词", en: line.en || "", zh: line.zh || "" });
    });
    if (!lines.length && scene.dialogues) {
      String(scene.dialogues)
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((en) => {
          const isVo = /旁白/.test(en);
          lines.push({ type: isVo ? "旁白" : "台词", en, zh: "" });
        });
    }
    return lines;
  }

  function renderSceneDialogue(scene) {
    const lines = sceneDialogueLines(scene);
    if (!lines.length) return "";
    const hasVoice = lines.some((l) => l.type === "旁白");
    return `
      <h4>${hasVoice && lines.every((l) => l.type === "旁白") ? "旁白" : "旁白 / 台词"}</h4>
      <ul class="script-dialogues">
        ${lines.map((line) => `
          <li class="script-dialogue-item${line.type === "旁白" ? " is-voiceover" : ""}">
            <span class="dialogue-tag">${line.type}</span>
            <span class="dialogue-en">${escapeHtml(line.en)}</span>
            ${line.zh ? `<span class="dialogue-zh">${escapeHtml(line.zh)}</span>` : ""}
          </li>`).join("")}
      </ul>`;
  }

  function renderActiveSceneDetail(scene) {
    const el = $("#scriptScenes");
    if (!el) return;
    if (!scene) {
      el.innerHTML = `<div class="script-scene-empty">在上方表格中点击某一幕，查看分镜详情</div>`;
      return;
    }
    el.innerHTML = `
      <article class="script-scene-detail-card" data-scene="${scene.id}">
        <div class="script-scene-detail-head">
          <span class="arc-pill ${arcPhaseClass(scene.arc_label)}">${escapeHtml(scene.arc_label || "")}</span>
          <strong>${escapeHtml(scene.title || "")}</strong>
        </div>
        <div class="script-scene-grid">
          <div class="script-scene-ref">
            <div class="script-field-label">参考图 · ${escapeHtml(scene.ref_image || "")}</div>
            <img class="script-zoomable" src="${scene.ref_image_url || ""}" alt="${escapeHtml(scene.title)} · ${escapeHtml(scene.ref_image || "")}" loading="lazy" />
          </div>
          <div class="script-scene-detail">
            <h4>镜头</h4>
            <div class="script-prose">${escapeHtml(scene.camera || "")}</div>
            <h4>视频提示词</h4>
            <div class="script-prose script-prompt-block">${escapeHtml(scenePromptText(scene))}</div>
            ${renderSceneDialogue(scene)}
          </div>
        </div>
      </article>`;
    bindScriptZoomables(el);
  }

  function selectScriptScene(sceneId) {
    const scenes = scriptData?.scenes || [];
    const scene = scenes.find((s) => String(s.id) === String(sceneId)) || scenes[0];
    if (!scene) return;

    $("#scriptArcTable tbody")?.querySelectorAll("tr").forEach((tr) => {
      tr.classList.toggle("is-active", String(tr.dataset.scene) === String(scene.id));
    });
    $("#scriptSceneTabs")?.querySelectorAll("button").forEach((btn) => {
      const active = String(btn.dataset.scene) === String(scene.id);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    renderActiveSceneDetail(scene);
  }

  function audioStepClass(progress, doneAt, activeAt) {
    const p = progress || 0;
    if (p >= doneAt) return " done";
    if (p >= activeAt) return " active";
    return "";
  }

  function shotDialoguePreview(shot) {
    if ((shot.subtitles || []).length) {
      return shot.subtitles.map((line) => line.en).join(" / ");
    }
    const spoken = (shot.dialogue_timeline || []).find((line) => /[A-Za-z]/.test(line.line || ""));
    return spoken ? spoken.line : "";
  }

  function renderShotsList(shots, revealed = null) {
    const count = revealed == null ? shots.length : revealed;
    return shots.map((s, i) => {
      const visible = i < count;
      const arc = s.arc_label || "";
      const camera = s.camera || "";
      const dialogue = shotDialoguePreview(s);
      const preview = dialogue || scenePromptText(s).slice(0, 120);
      return `
        <div class="output-dialogue-item${visible ? "" : " pending"}">
          <span class="row-idx">${s.id}</span>
          <img class="shot-thumb" src="assets/images/${escapeHtml(s.ref_image)}" alt="本幕参考图" loading="lazy">
          <div>
            <div class="en">${arc} ${s.scene_title || s.name}</div>
            <div class="cn">${visible ? `${camera} · 参考图 ${s.ref_image || ""}` : "脚本生成中…"}</div>
            ${visible ? `<div class="audio-tag">${dialogue ? `台词：${escapeHtml(dialogue)}` : escapeHtml(preview)}</div>` : ""}
          </div>
        </div>`;
    }).join("");
  }

  function enableVideoAudio(video) {
    if (!video) return;
    video.muted = false;
    video.volume = 1;
  }

  function renderStudioPlayer({
    src,
    poster,
    label,
    badge,
    videoId = "",
    muted = false,
    loop = false,
    compact = false,
    forceMute = false,
  }) {
    const cls = `hero-video-player studio-video-player${compact ? " is-compact" : ""}`;
    return `
      <div class="${cls}"${forceMute ? ' data-force-mute="1"' : ""}>
        <div class="hero-video-frame">
          <video
            ${videoId ? `id="${escapeHtml(videoId)}"` : ""}
            class="hero-video workbench-video"
            ${muted ? "muted" : ""}
            ${loop ? "loop" : ""}
            playsinline
            preload="metadata"
            poster="${escapeHtml(poster)}"
          >
            <source src="${src}" type="video/mp4" />
          </video>
          <button type="button" class="hero-video-play" aria-label="播放视频">
            <span class="hero-video-play-icon" aria-hidden="true">▶</span>
          </button>
          <button type="button" class="studio-video-fs" aria-label="全屏播放" title="全屏">
            <svg class="studio-video-fs-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path class="fs-expand" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path class="fs-collapse" d="M9 9H4V4m11 5h5V4M9 15H4v5m11-5h5v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="hero-video-bar">
          <span class="hero-video-label">${escapeHtml(label)}</span>
          <span class="hero-video-badge">${escapeHtml(badge)}</span>
        </div>
      </div>`;
  }

  function renderSegmentGrid(shots, type = "raw", revealed = null) {
    const count = revealed == null ? shots.length : revealed;
    const base = type === "hd" ? "assets/segments/hd/" : "assets/segments/raw/";
    const kind = type === "hd" ? "高清片段" : "原始片段";
    return `
      <div class="output-segment-grid">
        ${shots.map((s, i) => {
          const visible = i < count;
          const file = type === "hd" ? s.hd_video : s.raw_video;
          return `
            <div class="output-segment-card${visible ? "" : " pending"}">
              ${visible
                ? renderStudioPlayer({
                    src: `${base}${encodeURIComponent(file)}`,
                    poster: `assets/images/${s.ref_image}`,
                    label: s.name,
                    badge: `${s.duration || 5}s · ${kind}`,
                    muted: true,
                    forceMute: true,
                    compact: true,
                  })
                : `<div class="segment-placeholder">生成中…</div>`}
            </div>`;
        }).join("")}
      </div>`;
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  async function requestElFullscreen(el) {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    if (el.webkitEnterFullscreen) return el.webkitEnterFullscreen();
  }

  async function exitElFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  }

  function syncStudioFullscreenButtons() {
    document.querySelectorAll(".studio-video-player").forEach((player) => {
      const frame = player.querySelector(".hero-video-frame");
      const video = player.querySelector("video");
      const fsBtn = player.querySelector(".studio-video-fs");
      const active = getFullscreenElement() === frame || getFullscreenElement() === video;
      player.classList.toggle("is-fullscreen", active);
      if (!fsBtn) return;
      fsBtn.setAttribute("aria-label", active ? "退出全屏" : "全屏播放");
      fsBtn.title = active ? "退出全屏" : "全屏";
      fsBtn.classList.toggle("is-active", active);
    });
  }

  if (!window.__studioFsListenerBound) {
    window.__studioFsListenerBound = true;
    document.addEventListener("fullscreenchange", syncStudioFullscreenButtons);
    document.addEventListener("webkitfullscreenchange", syncStudioFullscreenButtons);
  }

  function wireWorkbenchVideos() {
    const body = $("#outputBody");
    if (!body) return;
    const players = [...body.querySelectorAll(".studio-video-player")];
    const videos = players.map((p) => p.querySelector("video")).filter(Boolean);

    players.forEach((player) => {
      const frame = player.querySelector(".hero-video-frame");
      const video = player.querySelector("video");
      const playBtn = player.querySelector(".hero-video-play");
      const fsBtn = player.querySelector(".studio-video-fs");
      if (!video) return;
      registerMedia(video);

      if (player.dataset.forceMute === "1") {
        video.muted = true;
        video.volume = 0;
        video.addEventListener("volumechange", () => {
          if (!video.muted || video.volume > 0) {
            video.muted = true;
            video.volume = 0;
          }
        });
      } else {
        enableVideoAudio(video);
      }

      const syncPlayState = () => {
        const playing = !video.paused && !video.ended;
        player.classList.toggle("is-playing", playing);
        if (playBtn) {
          playBtn.setAttribute("aria-label", playing ? "暂停视频" : "播放视频");
          const icon = playBtn.querySelector(".hero-video-play-icon");
          if (icon) icon.textContent = playing ? "❚❚" : "▶";
        }
      };

      const togglePlay = () => {
        if (video.paused) {
          videos.forEach((other) => {
            if (other !== video && !other.paused) other.pause();
          });
          if (player.dataset.forceMute !== "1") {
            enableVideoAudio(video);
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      };

      const toggleFullscreen = async (e) => {
        e?.stopPropagation?.();
        try {
          const current = getFullscreenElement();
          if (current === frame || current === video) {
            await exitElFullscreen();
          } else {
            await requestElFullscreen(frame || video);
            if (player.dataset.forceMute !== "1") {
              enableVideoAudio(video);
            }
            if (video.paused) video.play().catch(() => {});
          }
        } catch (_) {
          // ignore fullscreen rejection
        }
        syncStudioFullscreenButtons();
      };

      playBtn?.addEventListener("click", togglePlay);
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", syncPlayState);
      video.addEventListener("pause", syncPlayState);
      video.addEventListener("ended", syncPlayState);
      fsBtn?.addEventListener("click", toggleFullscreen);
      syncPlayState();
    });

    syncStudioFullscreenButtons();
  }

  function updateStepOutput(mode, extra = {}) {
    if (!demoData) return;
    const shots = demoData.shots;
    const lesson = demoData.lesson_preview;
    const stats = demoData.pipeline_stats;
    const eyebrow = $("#outputEyebrow");
    const title = $("#outputTitle");
    const desc = $("#outputDesc");
    const body = $("#outputBody");

    switch (mode) {
      case "idle":
        eyebrow.textContent = "链路预览";
        title.textContent = "图生视频流程";
        desc.textContent = cjkSpace("完整链路：读懂教材 → 设计分镜 → AI 生成画面 → 提升画质拼接 → 配音配乐 → 输出成片");
        body.innerHTML = `
          <div class="output-placeholder">
    
            <p>在左侧选用教材页，再开始演示</p>
            <p style="margin-top:6px;font-size:0.78rem">逐步查看已有的教材解析、分镜与视频片段</p>
          </div>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${shots.length}</strong><span>镜头数</span></div>
          <div class="stat-pill"><strong>6</strong><span>处理阶段</span></div>`);
        break;

      case "vision-running": {
        const revealed = extra.revealed ?? Math.max(1, Math.floor((extra.progress || 0) / 15 * lesson.scenes.length));
        eyebrow.textContent = "① 读懂教材";
        title.textContent = "课程内容整理中";
        desc.textContent = "正在展示本单元两页教材的已有解析、对话与画面信息…";
        body.innerHTML = `
          <div class="output-file-tag">课程内容清单</div>
          <div class="output-dialogue-list">${renderLessonPreview(lesson, revealed)}</div>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${revealed}</strong><span>已解析场景</span></div>
          <div class="stat-pill"><strong>${extra.progress || 0}%</strong><span>整体进度</span></div>`);
        break;
      }

      case "vision-done":
        eyebrow.textContent = "① 读懂教材";
        title.textContent = "课程内容清单";
        desc.textContent = "识读完成：对话、场景和画面要素已整理完毕，可进入分镜设计。";
        body.innerHTML = `
          <div class="output-file-tag">课程内容清单 ✓</div>
          <div class="output-dialogue-list">${renderLessonPreview(lesson)}</div>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${lesson.scenes.length}</strong><span>场景数</span></div>
          <div class="stat-pill"><strong>${demoData.vision_stats.dialogues_total}</strong><span>对话句数</span></div>`);
        break;

      case "prompt-running": {
        const revealed = extra.revealed ?? Math.max(1, Math.floor(((extra.progress || 15) - 15) / 15 * shots.length));
        eyebrow.textContent = "② 设计分镜";
        title.textContent = "分镜脚本生成中";
        desc.textContent = "按起承转合规则，为每幕编排运镜、台词节奏和画面描述…";
        body.innerHTML = `
          <div class="output-file-tag">分镜脚本</div>
          <div class="output-dialogue-list">${renderShotsList(shots, revealed)}</div>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${revealed}</strong><span>已编排幕数</span></div>
          <div class="stat-pill"><strong>${extra.progress || 0}%</strong><span>整体进度</span></div>`);
        break;
      }

      case "prompt-done":
        eyebrow.textContent = "② 设计分镜";
        title.textContent = "分镜脚本";
        desc.textContent = `${shots.length} 幕分镜已就绪：起承转合结构，含参考图、运镜和秒级台词安排。`;
        body.innerHTML = `
          <div class="output-file-tag">分镜脚本 ✓</div>
          <div class="output-dialogue-list">${renderShotsList(shots)}</div>
          <a class="output-link" href="#script">查看完整脚本设计 →</a>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${shots.length}</strong><span>分镜幕数</span></div>
          <div class="stat-pill"><strong>${shots.length}</strong><span>镜头数量</span></div>
          <div class="stat-pill"><strong>起承转合</strong><span>故事结构</span></div>`);
        break;

      case "seedance-running": {
        const revealed = extra.revealed ?? Math.max(1, Math.floor(((extra.progress || 30) - 30) / 20 * shots.length));
        eyebrow.textContent = "③ AI 生成画面";
        title.textContent = "视频片段生成中";
        desc.textContent = "当前为模拟生成展示；实际生成时可约 5 个视频并行生成，整体约 5 分钟。";
        body.innerHTML = renderSegmentGrid(shots, "raw", revealed);
        setOutputStats(`
          <div class="stat-pill"><strong>${revealed}</strong><span>已生成片段</span></div>
          <div class="stat-pill"><strong>${extra.progress || 0}%</strong><span>整体进度</span></div>`);
        break;
      }

      case "seedance-done":
        eyebrow.textContent = "③ AI 生成画面";
        title.textContent = "各幕视频片段";
        desc.textContent = `当前为模拟生成展示；实际生成时可约 5 个视频并行生成，整体约 5 分钟。现已展示 ${stats.raw_segments} 段动画片段。`;
        body.innerHTML = renderSegmentGrid(shots, "raw");
        setOutputStats(`
          <div class="stat-pill"><strong>${stats.raw_segments}</strong><span>已生成幕数</span></div>
          <div class="stat-pill"><strong>AI 动画</strong><span>图生视频</span></div>`);
        break;

      case "upscale-running": {
        const revealed = extra.revealed ?? Math.max(1, Math.floor(((extra.progress || 50) - 50) / 18 * shots.length));
        eyebrow.textContent = "④ 提升画质";
        title.textContent = "画质提升处理中";
        desc.textContent = "逐幕超分处理，画面更清晰流畅…";
        body.innerHTML = renderSegmentGrid(shots, "hd", revealed);
        setOutputStats(`
          <div class="stat-pill"><strong>${revealed}</strong><span>已超分</span></div>
          <div class="stat-pill"><strong>${extra.progress || 0}%</strong><span>整体进度</span></div>`);
        break;
      }

      case "upscale-done":
        eyebrow.textContent = "④ 提升画质";
        title.textContent = "高清视频片段";
        desc.textContent = `${shots.length} 幕高清画面已就绪，进入视频拼接。`;
        body.innerHTML = renderSegmentGrid(shots, "hd");
        setOutputStats(`
          <div class="stat-pill"><strong>${stats.hd_segments}</strong><span>高清片段</span></div>
          <div class="stat-pill"><strong>${stats.resolution}</strong><span>画质</span></div>`);
        break;

      case "ffmpeg-running":
        eyebrow.textContent = "⑤ 拼接画面";
        title.textContent = "视频拼接中";
        desc.textContent = "5 幕高清片段按顺序无缝连接，合成完整画面…";
        body.innerHTML = `
          <div class="output-rendering" style="padding:24px">
            <div class="spinner-ring"></div>
            <p>正在拼接 ${shots.length} 幕高清画面…</p>
            <p style="font-size:0.78rem;margin-top:8px;color:var(--text-muted)">预计总时长 ${stats.duration_seconds} 秒</p>
          </div>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${shots.length}</strong><span>拼接段数</span></div>
          <div class="stat-pill"><strong>${extra.progress || 0}%</strong><span>整体进度</span></div>`);
        break;

      case "ffmpeg-done": {
        const poster = shots[0]?.ref_image || "p014_1.png";
        eyebrow.textContent = "⑤ 拼接画面";
        title.textContent = "完整视频画面";
        desc.textContent = "各幕画面已拼接完成，等待配音配乐。";
        body.innerHTML = `
          ${renderStudioPlayer({
            videoId: "splicedVideo",
            src: finalVideoSrc(),
            poster: `assets/images/${poster}`,
            label: "拼接画面预览",
            badge: `${shots.length} 幕已拼接 · 暂无音频`,
            muted: true,
            forceMute: true,
          })}
          <p class="output-video-hint">画面轨已就绪，可预览各幕拼接效果 · 下一步配音配乐</p>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${stats.duration_seconds}s</strong><span>画面时长</span></div>
          <div class="stat-pill"><strong>无音频</strong><span>待处理</span></div>`);
        break;
      }

      case "audio-running":
        eyebrow.textContent = "⑥ 配音配乐";
        title.textContent = "声音处理中";
        desc.textContent = "对齐台词时间 → 替换教材配音 → 混入背景音乐…";
        body.innerHTML = `
          <div class="output-audio-steps">
            <div class="audio-step${audioStepClass(extra.progress, 85, 85)}">分离原始声音</div>
            <div class="audio-step${audioStepClass(extra.progress, 88, 85)}">识别台词时间</div>
            <div class="audio-step${audioStepClass(extra.progress, 91, 88)}">对齐配音节奏</div>
            <div class="audio-step${audioStepClass(extra.progress, 95, 91)}">替换教材配音</div>
            <div class="audio-step${audioStepClass(extra.progress, 98, 95)}">混入背景音乐</div>
          </div>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${demoData?.vision_stats?.dialogues_total || 8}</strong><span>对话句数</span></div>
          <div class="stat-pill"><strong>${extra.progress || 0}%</strong><span>整体进度</span></div>`);
        break;

      case "done": {
        const videoLabel = extra.videoLabel || demoData?.video_label || "教学成片";
        const videoFile = extra.videoFile || demoData?.video_file || "";
        eyebrow.textContent = "最终产出";
        title.textContent = "双音轨教学成片";
        desc.textContent = `演示完成，查看已有成片：${videoLabel}（音轨 1 配音+BGM · 音轨 2 纯 BGM）`;
        body.innerHTML = `
          <div class="output-file-tag">${escapeHtml(videoFile || videoLabel)}</div>
          ${renderStudioPlayer({
            videoId: "mainVideo",
            src: finalVideoSrc(),
            poster: "assets/images/p015_1.png",
            label: "教学成片预览",
            badge: `${stats.shot_count || shots.length} 幕镜头 · 图生视频成片`,
            muted: false,
          })}
          <a class="output-link" href="assets/video/final.mp4" download>下载这份教学成片</a><ul class="menu-list" style="margin-top:12px">
            ${shots.map((s) => `<li><span>${s.name}</span><span>${s.duration}s</span></li>`).join("")}
            <li><span>共 ${shots.length} 幕 · ${stats.resolution || "3144×2160 · 60fps"} · 双音轨</span><span></span></li>
          </ul>`;
        setOutputStats(`
          <div class="stat-pill"><strong>${stats.shot_count}</strong><span>镜头数</span></div>
          <div class="stat-pill"><strong>${Number.isFinite($("#heroVideo")?.duration)?$("#heroVideo").duration.toFixed(1)+"s":"以播放器为准"}</strong><span>成片时长</span></div>
          <div class="stat-pill"><strong>双音轨</strong><span>配音+BGM</span></div>
          <div class="stat-pill"><strong>已命名</strong><span>正式交付</span></div>`);
        break;
      }

      default:
        break;
    }

    wireWorkbenchVideos();
  }

  function phaseToOutput(phase, progress) {
    const p = progress || 0;
    const shots = demoData?.shots?.length || 5;
    const scenes = demoData?.lesson_preview?.scenes?.length || 5;

    const map = {
      vision: p < 15 ? ["vision-running", { progress: p, revealed: Math.max(1, Math.floor(p / 15 * scenes)) }] : ["vision-done", {}],
      prompt: p < 30 ? ["prompt-running", { progress: p, revealed: Math.max(1, Math.floor((p - 15) / 15 * shots)) }] : ["prompt-done", {}],
      seedance: p < 50 ? ["seedance-running", { progress: p, revealed: Math.max(1, Math.floor((p - 30) / 20 * shots)) }] : ["seedance-done", {}],
      upscale: p < 68 ? ["upscale-running", { progress: p, revealed: Math.max(1, Math.floor((p - 50) / 18 * shots)) }] : ["upscale-done", {}],
      ffmpeg: p < 82 ? ["ffmpeg-running", { progress: p }] : ["ffmpeg-done", {}],
      audio: p < 98 ? ["audio-running", { progress: p }] : ["audio-done", { progress: p }],
      finalize: ["done", {}],
      done: ["done", {}],
    };

    const entry = map[phase] || ["idle", {}];
    updateStepOutput(entry[0], entry[1]);
  }

  function setStatus(text, type) {
    const chip = $("#statusChip");
    chip.textContent = text;
    chip.className = "status-chip" + (type ? ` ${type}` : "");
  }

  function appendLog(lines) {
    const box = $("#logConsole");
    if (!lines.length) return;
    if (box.querySelector(".muted")) box.innerHTML = "";
    box.textContent = (box.textContent ? box.textContent + "\n" : "") + lines.join("\n");
    box.scrollTop = box.scrollHeight;
  }

  function clearLog() {
    $("#logConsole").innerHTML = "";
  }

  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  function renderScriptDesign(script) {
    if (!script) return;
    scriptData = script;
    const summaryEl = $("#scriptOutputSummary");
    if (summaryEl) {
      summaryEl.textContent = cjkSpace(script.design_summary || "");
      summaryEl.classList.toggle("is-empty", !script.design_summary);
    }
    renderScriptInputs(script);
    renderScriptRules(script.prompt_template || "");
    renderScriptStyle(script.character_preset || "", script.scenes || []);
    updateScriptMeta(script);

    const scenes = script.scenes || [];
    const arcs = script.story_arc || [];
    const tbody = $("#scriptArcTable tbody");
    tbody.innerHTML = arcs.map((row, i) => {
      const scene = scenes[i] || scenes.find((s) => Number(s.id) === Number(row.shot)) || null;
      const sceneId = scene?.id ?? row.shot;
      return `
      <tr data-scene="${sceneId}" tabindex="0" role="button" aria-label="查看第 ${row.shot} 幕详情">
        <td>${row.shot}</td>
        <td>${renderArcPill(row.arc)}</td>
        <td>${escapeHtml(row.scene)}</td>
        <td><code>${escapeHtml(row.ref_image)}</code></td>
        <td>${escapeHtml(row.camera)}</td>
        <td>${escapeHtml(row.emotion)}</td>
        <td>${escapeHtml(row.dialogues)}</td>
      </tr>`;
    }).join("");

    const tabs = $("#scriptSceneTabs");
    if (tabs) {
      tabs.innerHTML = scenes.map((scene) => `
        <button type="button" data-scene="${scene.id}" aria-pressed="false">
          第 ${scene.id} 幕
        </button>`).join("");
      tabs.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => selectScriptScene(btn.dataset.scene));
      });
    }

    tbody.querySelectorAll("tr").forEach((tr) => {
      tr.addEventListener("click", () => selectScriptScene(tr.dataset.scene));
      tr.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectScriptScene(tr.dataset.scene);
        }
      });
    });

    selectScriptScene(scenes[0]?.id || arcs[0]?.shot || 1);
  }

  let workflowActiveStep = 1;
  let collabActiveStep = 1;
  let collabStepsCache = [];

  function renderCollabDetail(step, focus) {
    const panel = $("#aiCapDetail");
    if (!panel || !step) return;

    const process = (step.process || [])
      .map((p) => `<span class="collab-chip">${cjkSpace(p)}</span>`)
      .join("");
    const review = step.human_review;
    const checks = review
      ? (review.checks || []).map((c) => `<li>${cjkSpace(c)}</li>`).join("")
      : "";
    const stepNo = String(step.step || "").padStart(2, "0");
    const focusHuman = focus === "human" && !!review;

    panel.innerHTML = `
      <div class="collab-detail-card${step.is_final ? " is-final" : ""}">
        <header class="collab-detail-head">
          <span class="collab-detail-num">STEP ${stepNo}</span>
          <h3>${step.icon ? `<span class="collab-detail-icon" aria-hidden="true">${step.icon}</span>` : ""}${cjkSpace(step.title)}</h3>
        </header>
        <div class="collab-detail-block is-ai${!focusHuman ? " is-focus" : ""}">
          <p class="collab-detail-label">AI 执行</p>
          ${step.summary ? `<p class="collab-detail-text">${cjkSpace(step.summary)}</p>` : ""}
          ${process ? `<div class="collab-chips">${process}</div>` : ""}
          ${!step.summary && !process ? `<p class="collab-detail-text">该节点为流程节点</p>` : ""}
        </div>
        ${review ? `
          <div class="collab-detail-block is-human${focusHuman ? " is-focus" : ""}">
            <p class="collab-detail-label">人工审核</p>
            <strong>${cjkSpace(review.label)}</strong>
            ${review.summary ? `<p class="collab-detail-text">${cjkSpace(review.summary)}</p>` : ""}
            ${checks ? `<ul class="collab-checks">${checks}</ul>` : ""}
          </div>` : `
          <div class="collab-detail-block is-human is-empty">
            <p class="collab-detail-label">人工审核</p>
            <p class="collab-detail-text">本步骤无需人工介入</p>
          </div>`}
      </div>`;
  }

  function setCollabActiveStep(stepNum, focus = "ai") {
    collabActiveStep = stepNum;
    const step = collabStepsCache.find((s) => s.step === stepNum) || collabStepsCache[0];
    if (!step) return;

    document.querySelectorAll("[data-collab-step]").forEach((el) => {
      const n = Number(el.dataset.collabStep);
      const kind = el.dataset.collabKind || "ai";
      el.classList.toggle("is-active", n === stepNum && kind === focus);
      if (kind === "ai") el.classList.toggle("is-selected", n === stepNum);
    });

    document.querySelectorAll(".collab-col").forEach((col) => {
      col.classList.toggle("is-active", Number(col.dataset.step) === stepNum);
    });

    renderCollabDetail(step, focus);
  }

  function renderAiPipeline(steps) {
    const track = $("#aiCapFlow");
    if (!track) return;

    if (!track.dataset.focusGuard) {
      track.addEventListener("focusin", (event) => {
        const target = event.target.closest("button");
        if (!target || !track.contains(target)) return;
        const bounds = track.getBoundingClientRect();
        const node = target.getBoundingClientRect();
        // Eight pixels contain the existing 2px outline and 5px offset.
        const left = bounds.left + track.clientLeft + 8;
        const right = bounds.left + track.clientLeft + track.clientWidth - 8;
        const delta = node.left < left ? node.left - left
          : node.right > right ? node.right - right : 0;
        if (Math.abs(delta) > 0.5) {
          track.scrollTo({ left: track.scrollLeft + delta, behavior: "instant" });
        }
      });
      track.dataset.focusGuard = "true";
    }

    const list = steps || [];
    collabStepsCache = list;
    if (!list.length) {
      track.innerHTML = `<div class="loading-card">暂无流程数据</div>`;
      const panel = $("#aiCapDetail");
      if (panel) panel.innerHTML = `<div class="loading-card">暂无流程数据</div>`;
      return;
    }

    track.innerHTML = list.map((s, i) => {
      const hasReview = !!s.human_review;
      const isLast = i === list.length - 1;
      const shortLabel = s.short_label || s.title;

      return `
        <div class="collab-col role-${s.role || "ai"}${s.is_final ? " is-final" : ""}${hasReview ? " has-review" : ""}" data-step="${s.step}" role="listitem">
          <button type="button"
            class="collab-ai-node"
            data-collab-step="${s.step}"
            data-collab-kind="ai"
            aria-label="查看 ${escapeHtml(s.title)} 详情">
            <span class="collab-ai-icon" aria-hidden="true"></span>
            <span class="collab-ai-title">${cjkSpace(shortLabel)}</span>
          </button>
          ${hasReview ? `
            <button type="button"
              class="collab-human-node"
              data-collab-step="${s.step}"
              data-collab-kind="human"
              aria-label="查看 ${escapeHtml(s.human_review.label)} 详情">
              <span class="collab-human-dot" aria-hidden="true"></span>
              <span class="collab-human-title">${cjkSpace(s.human_review.label.replace(/^制作/, "").replace(/^品检审核.*/, "品检审核"))}</span>
            </button>` : `<span class="collab-human-spacer" aria-hidden="true"></span>`}
        </div>
        ${!isLast ? `<div class="collab-connector" aria-hidden="true"><span></span></div>` : ""}`;
    }).join("");

    track.querySelectorAll("[data-collab-step]").forEach((el) => {
      el.addEventListener("click", () => {
        setCollabActiveStep(Number(el.dataset.collabStep), el.dataset.collabKind || "ai");
      });
    });

    if (!list.some((s) => s.step === collabActiveStep)) {
      collabActiveStep = list[0].step;
    }
    setCollabActiveStep(collabActiveStep, "ai");
  }

  function renderWorkflowFlowBlock(s) {
    const processItems = (s.process || []).map(
      (p) => `<span class="workflow-flow-chip">${cjkSpace(p)}</span>`
    ).join("");
    const processBlock = processItems ? `
        <div class="workflow-flow-connector" aria-hidden="true">
          <span class="workflow-flow-line"></span>
          <span class="workflow-flow-arrow">↓</span>
        </div>
        <div class="workflow-flow-row process">
          <span class="workflow-flow-label">处理</span>
          <div class="workflow-flow-chips">${processItems}</div>
        </div>` : "";
    return `
      <div class="workflow-flow">
        <div class="workflow-flow-row input">
          <span class="workflow-flow-label">输入</span>
          <span class="workflow-flow-value">${escapeHtml(s.input || "")}</span>
        </div>
        ${processBlock}
        <div class="workflow-flow-connector" aria-hidden="true">
          <span class="workflow-flow-line"></span>
          <span class="workflow-flow-arrow">↓</span>
        </div>
        <div class="workflow-flow-row output">
          <span class="workflow-flow-label">输出</span>
          <span class="workflow-flow-value accent">${escapeHtml(s.output || "")}</span>
        </div>
      </div>`;
  }

  function renderFlowDetailCard(step, opts = {}) {
    const stepLabel = opts.stepLabel || `STEP ${step.step}`;
    const highlights = (step.highlights || []).map(
      (h) => `<span class="workflow-highlight-badge">${cjkSpace(h)}</span>`
    ).join("");
    const points = (step.points || []).map(
      (p) => `<li>${cjkSpace(p)}</li>`
    ).join("");
    const expandBlock = points ? `
        <details class="workflow-expand">
          <summary>查看本步骤的制作要点</summary>
          <ul class="workflow-expand-list">${points}</ul>
        </details>` : "";
    const costBlock = '';
    const check = step.review ? `<div class="step-review"><strong>人工检查 · ${escapeHtml(step.review.summary)}</strong><p>${step.review.checks.map(escapeHtml).join(' · ')}</p></div>` : '';

    return `
      <div class="workflow-detail-card${step.is_final ? " is-final" : ""}">
        <header class="workflow-detail-head">
          <div class="workflow-detail-title">
            <span class="workflow-detail-num">${stepLabel}</span>
            <h3>${step.icon ? `<span class="workflow-detail-icon" aria-hidden="true">${step.icon}</span>` : ""}${cjkSpace(step.title)}</h3>
          </div>
          ${step.is_final ? `<p class="workflow-final-banner">教学成片 · 进入验收</p>` : ""}
        </header>
        ${renderWorkflowFlowBlock(step)}
        ${check}
        ${costBlock}
        ${highlights ? `<div class="workflow-highlights">${highlights}</div>` : ""}
        ${expandBlock}
      </div>`;
  }

  function renderWorkflowDetail(step) {
    const panel = $("#workflowDetail");
    if (!panel || !step) return;
    panel.innerHTML = renderFlowDetailCard(step);
  }

  function setWorkflowActiveStep(stepNum, steps) {
    workflowActiveStep = stepNum;
    const step = steps.find((s) => s.step === stepNum) || steps[0];
    if (!step) return;

    document.querySelectorAll(".workflow-timeline-node").forEach((node) => {
      const n = Number(node.dataset.workflowStep);
      node.classList.toggle("is-active", n === stepNum);
      node.classList.remove("is-done");
      node.setAttribute("aria-pressed", String(n === stepNum));
    });

    document.querySelectorAll(".workflow-pipeline-node").forEach((node) => {
      const n = Number(node.dataset.workflowStep);
      node.classList.toggle("is-active", n === stepNum);
      node.classList.remove("is-done");
      node.setAttribute("aria-current", n === stepNum ? "step" : "false");
    });

    renderWorkflowDetail(step);
  }

  function bindWorkflowInteractions(steps) {
    const clickHandler = (stepNum) => setWorkflowActiveStep(stepNum, steps);
    document.querySelectorAll("[data-workflow-step]").forEach((el) => {
      el.addEventListener("click", () => clickHandler(Number(el.dataset.workflowStep)));
    });
  }

  function renderWorkflowSteps(steps) {
    const timeline = $("#workflowTimeline");
    if (!timeline || !steps?.length) return;

    timeline.innerHTML = `
      <div class="workflow-timeline-track">
        ${steps.map((s, i) => `
          <button type="button"
            class="workflow-timeline-node${s.step === workflowActiveStep ? " is-active" : ""}${s.step < workflowActiveStep ? " is-done" : ""}"
            data-workflow-step="${s.step}"
            aria-label="步骤 ${s.step}：${escapeHtml(s.title)}">
            <span class="workflow-timeline-index">${s.step}</span>
            <span class="workflow-timeline-label">${escapeHtml(s.short_label || s.title)}</span>
          </button>
          ${i < steps.length - 1 ? `<span class="workflow-timeline-connector" aria-hidden="true"></span>` : ""}
        `).join("")}
      </div>`;

    if (!steps.some((s) => s.step === workflowActiveStep)) {
      workflowActiveStep = steps[0].step;
    }

    bindWorkflowInteractions(steps);
    setWorkflowActiveStep(workflowActiveStep, steps);
  }

  function renderPrinciples(data) {
    if (!data) return;
    if (data.workflow_steps) {
      const reviewSteps = [null, 3, 4, 5, 6, 7];
      renderWorkflowSteps(data.workflow_steps.map((step, index) => ({ ...step, icon: "",
        review: data.ai_pipeline?.find(entry => entry.step === reviewSteps[index])?.human_review,
      })));
    }
    const costSummary = $("#workflowCostSummary");
    if (costSummary && data.cost_summary) {
      const c = data.cost_summary;
      costSummary.innerHTML = `
        <span class="workflow-cost-chip is-paid">${escapeHtml(c.estimate)}</span>
        <span class="workflow-cost-chip">${escapeHtml(c.per_shot)}</span>
        <span class="workflow-cost-note">${escapeHtml(c.paid_note)} · ${escapeHtml(c.free_note)}</span>`;
    }
    if (data.ai_pipeline) renderAiPipeline(data.ai_pipeline);
  }

  function getPhaseAction(phase) {
    const map = {
      select: { label: "开始识读教材", run: "vision", hint: "请先点击选用本单元教材原图", status: "待选用教材原图" },
      prompt: { label: "设计分镜脚本", run: "prompt", hint: "读懂教材已完成，点击生成分镜", status: "待设计分镜" },
      seedance: { label: "生成视频画面", run: "seedance", hint: "分镜脚本已就绪，点击逐幕生成", status: "待生成画面" },
      upscale: { label: "提升画质", run: "upscale", hint: "视频片段已生成，点击超分处理", status: "待提升画质" },
      ffmpeg: { label: "拼接完整画面", run: "ffmpeg", hint: "高清片段已就绪，点击拼接", status: "待拼接画面" },
      audio: { label: "配音配乐", run: "audio", hint: "画面已拼接，点击处理声音", status: "待配音配乐" },
      finalize: { label: "输出双音轨成片", run: "finalize", hint: "声音处理完成，点击输出正式成片", status: "待输出成片" },
      done: { label: "流程已完成", run: null, hint: "全部步骤已完成", status: "已完成" },
    };
    return map[phase] || map.select;
  }

  function renderTextbookPicker() {
    const picker = $("#textbookPicker");
    if (!picker || !demoData?.textbook_pages?.length) return;
    picker.innerHTML = demoData.textbook_pages.map((page) => {
      const file = page.original_image;
      const selected = state.selectedPages.includes(file);
      return `
        <button type="button" class="textbook-page-card${selected ? " is-selected" : ""}" aria-pressed="${selected}" data-page="${escapeHtml(file)}">
          <img src="${page.image_url || `assets/original/${encodeURIComponent(file)}`}" alt="P${page.page}" loading="lazy" />
          <div class="textbook-page-meta">
            <strong>P${page.page}</strong>
            <span>${escapeHtml(page.scene_hint || "")}</span>
          </div>
          <span class="textbook-page-check">${selected ? "✓ 已选用" : "点击选用"}</span>
        </button>`;
    }).join("");

    picker.querySelectorAll(".textbook-page-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.isRunning || state.pipelineDone) return;
        const file = btn.dataset.page;
        if (state.selectedPages.includes(file)) {
          state.selectedPages = state.selectedPages.filter((p) => p !== file);
        } else {
          state.selectedPages.push(file);
        }
        renderTextbookPicker();
        updatePhaseActionUI();
        [...picker.querySelectorAll("button")].find(control => control.dataset.page === file)?.focus({preventScroll:true});
      });
    });
  }

  function updatePhaseActionUI() {
    const action = getPhaseAction(state.awaitingPhase);
    syncReview();
    const btn = $("#phaseActionBtn");
    const hint = $("#phaseActionHint");
    const title = $("#phaseActionTitle");
    if (!btn) return;

    const needPages = state.awaitingPhase === "select";
    const pagesOk = state.selectedPages.length > 0;
    const textEl = $("#phaseActionBtnText");
    if (textEl) textEl.textContent = state.isRunning ? "当前步骤执行中…" : action.label;
    btn.disabled = state.isRunning || state.pipelineDone || !!state.reviewPhase || (needPages && !pagesOk) || !action.run;
    if (hint) hint.textContent = action.hint;
    if (title) {
      title.textContent = state.awaitingPhase === "select"
        ? "选用教材原图"
        : `下一步：${action.label}`;
    }
    $('#demoReset').disabled = state.isRunning || !state.jobId;
    setStatus(state.reviewPhase ? "待人工确认" : state.isRunning ? "正在演示："+action.label : action.status, state.isRunning ? "working" : state.pipelineDone ? "done" : "");
    emitState();
  }

  async function ensureJob() {
    if (state.jobId) return state.jobId;
    state.jobId = "static_" + Date.now();
    state._mockJob = {
      id: state.jobId,
      status: "ready",
      progress: 0,
      phase: "select",
      running_phase: null,
      completed_phases: [],
      logs: ["工作台已就绪 · 请先选用教材原图，再逐步执行各阶段"],
    };
    return state.jobId;
  }

  async function runCurrentPhase() {
    if (state.isRunning || state.pipelineDone || state.reviewPhase) return;
    const action = getPhaseAction(state.awaitingPhase);
    if (!action.run) return;
    if (state.awaitingPhase === "select" && !state.selectedPages.length) {
      toast("请先选用教材原图");
      return;
    }

    state.isRunning = true;
    state.currentPhase = action.run;
    $("#phaseActionSpinner")?.classList.remove("panel-hidden");
    updatePhaseActionUI();

    const runPhase = action.run;
    if (runPhase === "vision") {
      clearLog();
      appendLog(["已确认教材原图，开始识读…"]);
      setStep("vision");
      updateStepOutput("vision-running", { progress: 0 });
    } else {
      appendLog([`开始执行：${action.label}`]);
      if (PHASE_ORDER.includes(runPhase)) setStep(runPhase);
    }

    try {
      await ensureJob();
      const job = await mockRunPhase(runPhase);
      state.awaitingPhase = job.phase || "done";

      if (job.status === "completed") {
        state.pipelineDone = true;
        state.awaitingPhase = "done";
        setStep("done");
        setProgress(100, "流程演示完成");
        updateStepOutput("done", {
          videoLabel: job.result?.video_label || demoData?.video_label,
          videoFile: job.result?.video_file || demoData?.video_file,
        });
        const video = document.getElementById("mainVideo");
        if (job.result?.video_url && video) {
          enableVideoAudio(video);
          video.load();
          video.pause();
        }
        toast(`演示完成，现有成片：${job.result?.video_label || demoData?.video_label || "教学视频"}`);
      } else {
        const next = getPhaseAction(state.awaitingPhase);
        appendLog([`${action.label} 完成 · 请点击「${next.label}」继续`]);
        phaseToOutput(
          SERVER_PHASES.includes(runPhase) ? runPhase : state.awaitingPhase,
          job.progress,
        );
        if (runPhase === "vision") updateStepOutput("vision-done");
        if (runPhase === "prompt") updateStepOutput("prompt-done");
        if (runPhase === "seedance") updateStepOutput("seedance-done");
        if (runPhase === "upscale") updateStepOutput("upscale-done");
        if (runPhase === "ffmpeg") updateStepOutput("ffmpeg-done");
        if (runPhase === "audio") updateStepOutput("audio-running", { progress: 98 });
      }
    } catch {
      setStatus("流程异常", "");
      toast("当前步骤执行失败，请重试");
    } finally {
      if(state._mockJob?.completed_phases?.includes(runPhase) && Object.hasOwn(reviewLabels,runPhase)) {
        state.reviewPhase=runPhase;
        if(runPhase==='finalize')state.pipelineDone=false;
      }
      state.isRunning = false;
      $("#phaseActionSpinner")?.classList.add("panel-hidden");
      updatePhaseActionUI();
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function mockRunPhase(phase) {
    const job = state._mockJob;
    const demo = demoData;
    const shots = demo.shots || [];
    const scenes = demo.lesson_preview?.scenes || [];
    job.running_phase = phase;
    job.status = "running";

    const phaseConfigs = {
      vision: { start: 0, end: 15, logs: () => {
        const l = [];
        for (const pn of state.selectedPages) {
          const pg = (demo.textbook_pages||[]).find(p=>p.original_image===pn);
          l.push(`  ✓ 已选用教材原图 · P${pg?.page||""} · ${pn} · ${pg?.scene_hint||""}`);
        }
        l.push(`选用 ${state.selectedPages.length} 页体验；以下产出展示本单元两页的固定样例。`);
        for (const sc of scenes) l.push(`  ✓ 场景 ${sc.scene_id} · ${sc.topic} · ${sc.dialogues.length} 句对话`);
        l.push(`课程内容已整理 · ${scenes.length} 个场景 · ${demo.vision_stats.dialogues_total} 句对话`);
        return l;
      }},
      prompt: { start: 15, end: 30, logs: () => {
        const l = [];
        for (const s of shots) l.push(`  ✓ ${s.arc_label} ${s.name} · ${s.camera} · 分镜脚本已生成`);
        l.push(`分镜脚本已输出 · ${shots.length} 幕起承转合结构就绪`);
        return l;
      }},
      seedance: { start: 30, end: 50, logs: () => {
        const l = ["  ※ 当前为模拟生成展示", "  ※ 实际生成速度：约 5 个视频可并行生成", "  ※ 约5分钟仅指并行生成环节，不含审核返修"];
        for (const s of shots) l.push(`  ✓ ${s.name} · ${s.raw_video} · 已生成`);
        return l;
      }},
      upscale: { start: 50, end: 68, logs: () => {
        const l = [];
        for (const s of shots) l.push(`  ✓ ${s.name} · ${s.hd_video} · 3144×2160·60fps`);
        return l;
      }},
      ffmpeg: { start: 68, end: 82, logs: () => [`  ✓ 拼接 ${shots.length} 段高清片段 · 实际时长以成片播放器为准`] },
      audio: { start: 82, end: 98, logs: () => [
        "  ✓ 原始声音已分离",
        `  ✓ ${demo.vision_stats.dialogues_total} 句台词时间已识别`,
        "  ✓ 教材配音已逐句替换",
        "  ✓ 背景音乐已统一混入",
        "  ✓ 双音轨封装完成：配音+BGM / 纯BGM",
        `  ✓ 成片命名：${demo.video_file}`,
      ]},
      finalize: { start: 98, end: 100, logs: () => [
        "  ✓ 正在封装双音轨成片…",
        "  ✓ 音轨 1：教材配音 + 背景音乐（默认播放）",
        "  ✓ 音轨 2：纯背景音乐（可切换）",
        `成片已输出 · ${demo.video_label || demo.video_file}`,
      ]},
    };

    const cfg = phaseConfigs[phase];
    if (!cfg) return job;

    const logs = cfg.logs();
    const totalSteps = logs.length;
    for (let i = 0; i < totalSteps; i++) {
      // A short, legible reveal of fixed local artifacts; this is not service latency.
      await sleep(Math.max(110, Math.round(1400 / totalSteps)));
      job.logs.push(logs[i]);
      appendLog([logs[i]]);
      job.progress = cfg.start + Math.round(((i + 1) / totalSteps) * (cfg.end - cfg.start));
      setProgress(job.progress, "正在演示本步骤");
      const trackPhase = phase === "finalize" ? "audio" : phase;
      if (PHASE_ORDER.includes(trackPhase)) setStep(trackPhase);
      phaseToOutput(trackPhase, job.progress);
    }

    job.running_phase = null;
    if (phase === "finalize") {
      job.status = "completed";
      job.phase = "done";
      job.progress = 100;
      job.completed_phases = [...SERVER_PHASES];
      job.result = {
        stats: demo.pipeline_stats,
        video_url: "assets/video/final.mp4",
        video_file: demo.video_file,
        video_label: demo.video_label || demo.video_file,
        shot_count: shots.length,
        dual_audio: !!demo.pipeline_stats.dual_audio,
      };
    } else {
      const completed = job.completed_phases || [];
      if (!completed.includes(phase)) completed.push(phase);
      job.completed_phases = completed;
      job.status = "phase_done";
      const nextIdx = SERVER_PHASES.indexOf(phase) + 1;
      job.phase = nextIdx < SERVER_PHASES.length ? SERVER_PHASES[nextIdx] : "done";
    }
    return job;
  }


  function fillForm(demo) {
    const b = demo.book;
    $("#fieldBook").textContent = `${b.name} · ${b.unit}`;
    $("#fieldShots").textContent = `${demo.shots.length} 幕（随教材内容变化）`;
    $("#demoBookLabel").textContent = cjkSpace(`${b.name} · ${b.unit} ${b.title}`);
    const stats = demo.pipeline_stats;
    $("#heroStatsBadge").textContent = `${stats.shot_count} 幕镜头 · 图生视频成片`;
  }

  async function loadJSON(url) {
    try {
      return await fetchJSON(url);
    } catch {
      return null;
    }
  }

  async function init() {
    const [demo, principles, script, health] = await Promise.all([
      loadJSON("api/demo.json"),
      loadJSON("api/principles.json"),
      loadJSON("api/script.json"),
      loadJSON("api/health.json"),
    ]);

    if (demo) {
      demoData = demo;
      fillForm(demo);
      syncHeroVideoFromDemo();
      renderTextbookPicker();
      updatePhaseActionUI();
      updateStepOutput("idle");
    }

    if (principles) {
      renderPrinciples(principles);
    } else {
      const grid = $("#principlesGrid");
      if (grid) {
        grid.innerHTML = `<article class="feature-card">案例数据暂不可用，请刷新重试</article>`;
      }
      $("#healthStatus").textContent = "案例数据暂不可用，请刷新重试";
    }

    if (script) {
      renderScriptDesign(script);
    } else {
      const summary = $("#scriptOutputSummary");
      if (summary) summary.textContent = "脚本数据暂不可用，请刷新重试";
    }

    if (health?.video_ready) {
      if (demo && script && principles) $("#healthStatus").textContent = "本地案例已就绪";
      $("#healthStatus").className = "ok";
    } else if (!principles && !demo) {
      $("#healthStatus").textContent = "案例数据暂不可用，请刷新重试";
    }

    $('#demoReset').addEventListener('click', () => {
      if (state.isRunning) return;
      document.querySelectorAll('.workbench-video').forEach(video => video.pause());
      Object.assign(state, { pipelineDone:false, currentPhase:'select', isRunning:false, jobId:null,
        selectedPages:[], awaitingPhase:'select', reviewPhase:null, _mockJob:null });
      renderTextbookPicker(); updatePhaseActionUI(); setStep('vision'); setProgress(0, '等待开始');
      $('#logConsole').textContent = '先选用教材原图，再逐步体验各阶段';
      updateStepOutput('idle');
      $('#textbookPicker button')?.focus({preventScroll:true});
    });
    $('#reviewApprove').addEventListener('click',()=>{
      if(!state.reviewPhase||state.isRunning)return;
      const reviewed=state.reviewPhase;state.reviewPhase=null;
      if(reviewed==='finalize')state.pipelineDone=true;
      appendLog(['人工确认通过：'+reviewLabels[reviewed]]);updatePhaseActionUI();
      (state.pipelineDone?$('#demoReset'):$('#phaseActionBtn')).focus({preventScroll:true});
    });
    $('#reviewRework').addEventListener('click',()=>{
      const phase=state.reviewPhase;if(!phase||state.isRunning)return;
      const index=SERVER_PHASES.indexOf(phase);state.reviewPhase=null;state.pipelineDone=false;state.awaitingPhase=phase;
      state._mockJob.completed_phases=state._mockJob.completed_phases.filter(x=>SERVER_PHASES.indexOf(x)<index);
      state._mockJob.phase=phase;state._mockJob.status='phase_done';state._mockJob.progress=[0,15,30,50,68,82,98][index];
      setProgress(state._mockJob.progress,'审核退回：'+reviewLabels[phase]);setStep(phase==='finalize'?'audio':phase);
      appendLog(['人工审核退回：'+reviewLabels[phase]+'；本地示意可重新执行。']);updatePhaseActionUI();
      $('#phaseActionBtn').focus({preventScroll:true});
    });
    $("#phaseActionBtn")?.addEventListener("click", runCurrentPhase);
    $("#pipelineBtn")?.addEventListener("click", runCurrentPhase);

    $("#heroStartBtn").addEventListener("click", () => {
      document.getElementById("demo")?.scrollIntoView({ behavior: scrollBehavior() });
    });

    setStep("vision");
    setupLightbox();
    setupHeroVideo();
    setupNavSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
