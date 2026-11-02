const BRIEF_END = 0.33;
const SCRAMBLE_END = 0.68;

export function clampProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(1, Math.max(0, number));
}

export function phaseAtProgress(value) {
  const progress = clampProgress(value);
  if (progress <= BRIEF_END) return 'brief';
  if (progress <= SCRAMBLE_END) return 'scramble';
  return 'deliver';
}

function smooth(value) {
  const progress = clampProgress(value);
  return progress * progress * (3 - 2 * progress);
}

function between(progress, start, end) {
  if (end <= start) return 1;
  return smooth((progress - start) / (end - start));
}

function mix(start, end, amount) {
  return start + (end - start) * amount;
}

function px(value) {
  return `${Number(value.toFixed(2))}px`;
}

function transform({ x = 0, y = 0, rotate = 0, scale = 1 }) {
  return `translate(${px(x)},${px(y)}) rotate(${Number(rotate.toFixed(2))}deg) scale(${Number(scale.toFixed(4))})`;
}

function opacity(value) {
  return Number(Math.min(1, Math.max(0, value)).toFixed(4));
}

export function sceneAtProgress(value, { mobile = false } = {}) {
  const progress = clampProgress(value);
  const reveal = between(progress, 0, 0.18);
  const scramble = between(progress, BRIEF_END, SCRAMBLE_END);
  const deliver = between(progress, SCRAMBLE_END, 0.86);
  const drift = mobile ? 0.58 : 1;
  const letteringStart = {
    x: -44 * drift,
    y: 9 * drift,
    rotate: -1.4,
    scale: 0.96,
  };
  const letteringMid = {
    x: -13 * drift,
    y: -4 * drift,
    rotate: -0.6,
    scale: 0.985,
  };
  const letteringEnd = {
    x: 3 * drift,
    y: 0,
    rotate: 0.2,
    scale: 1.008,
  };
  const characterStart = {
    x: 78 * drift,
    y: 30 * drift,
    rotate: 2.2,
    scale: 0.94,
  };
  const characterMid = {
    x: -22 * drift,
    y: -8 * drift,
    rotate: -0.8,
    scale: 1.018,
  };
  const characterEnd = {
    x: 4 * drift,
    y: 2 * drift,
    rotate: 0.2,
    scale: 1.004,
  };
  const lettering = reveal < 1
    ? {
        opacity: opacity(mix(0.2, 1, reveal)),
        transform: transform({
          x: mix(letteringStart.x, letteringMid.x, reveal),
          y: mix(letteringStart.y, letteringMid.y, reveal),
          rotate: mix(letteringStart.rotate, letteringMid.rotate, reveal),
          scale: mix(letteringStart.scale, letteringMid.scale, reveal),
        }),
      }
    : {
        opacity: 1,
        transform: transform({
          x: mix(letteringMid.x, letteringEnd.x, scramble),
          y: mix(letteringMid.y, letteringEnd.y, scramble),
          rotate: mix(letteringMid.rotate, letteringEnd.rotate, scramble),
          scale: mix(letteringMid.scale, letteringEnd.scale, scramble),
        }),
      };
  const character = reveal < 1
    ? {
        opacity: opacity(mix(0.38, 1, reveal)),
        transform: transform({
          x: mix(characterStart.x, characterMid.x, reveal),
          y: mix(characterStart.y, characterMid.y, reveal),
          rotate: mix(characterStart.rotate, characterMid.rotate, reveal),
          scale: mix(characterStart.scale, characterMid.scale, reveal),
        }),
      }
    : {
        opacity: 1,
        transform: transform({
          x: mix(characterMid.x, characterEnd.x, scramble),
          y: mix(characterMid.y, characterEnd.y, scramble),
          rotate: mix(characterMid.rotate, characterEnd.rotate, scramble),
          scale: mix(characterMid.scale, characterEnd.scale, scramble),
        }),
      };

  const tagReveal = between(progress, 0.18, 0.38);
  const railReveal = between(progress, 0.56, 0.76);
  const cueReveal = between(progress, 0.66, 0.82);

  return {
    progress,
    phase: phaseAtProgress(progress),
    lettering,
    character,
    lines: {
      opacity: opacity(mix(0.08, 0.68, between(progress, 0.02, 0.22))),
      transform: `scale(${Number(mix(0.84, 1.04, Math.max(reveal, scramble)).toFixed(4))})`,
    },
    tags: {
      opacity: opacity(tagReveal),
      transform: transform({
        x: mix(94, 0, tagReveal),
        y: mix(-24, 8, tagReveal),
        rotate: mix(8, -1, tagReveal),
        scale: mix(0.85, 1, tagReveal),
      }),
    },
    comicRail: {
      opacity: opacity(mix(0.05, 0.94, railReveal)),
      transform: transform({
        x: mix(88, -3, railReveal),
        y: mix(58, -6, railReveal),
        rotate: mix(14, 1.5, railReveal),
        scale: mix(0.82, 1.02, railReveal),
      }),
    },
    cue: {
      opacity: opacity(cueReveal),
      transform: `translateX(${px(mix(18, 0, cueReveal))})`,
    },
    reaction: {
      scale: 1 + (between(progress, 0.32, 0.46) * 0.06),
      rotate: -8 + (between(progress, 0.32, 0.46) * 3),
    },
    tagsVisible: tagReveal > 0.01,
    comicRailVisible: railReveal > 0.01,
  };
}

export const heroSceneBounds = Object.freeze({ briefEnd: BRIEF_END, scrambleEnd: SCRAMBLE_END });
