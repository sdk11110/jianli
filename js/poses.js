(() => {
  'use strict';

  const map = {
    wave: 'assets/character/sheep-wave.webp',
    code: 'assets/character/sheep-code.webp',
    think: 'assets/character/sheep-think.webp',
    map: 'assets/character/sheep-map.webp',
    read: 'assets/character/sheep-read.webp',
    coffee: 'assets/character/sheep-coffee.webp'
  };

  function applyPose(section, pose, alt) {
    if (!section) return;
    const sheep = section.querySelector('[data-sheep]');
    if (!sheep) return;
    const main = sheep.querySelector('.sheep-main');
    const altImg = sheep.querySelector('.sheep-alt');
    if (main && map[pose] && !main.src.includes(map[pose].split('/').pop())) {
      main.src = map[pose];
    }
    if (altImg && map[alt || pose]) {
      altImg.src = map[alt || pose];
    }
  }

  function setAlt(section, on) {
    section?.querySelector('[data-sheep]')?.classList.toggle('is-alt', !!on);
  }

  window.SheepPoses = { map, applyPose, setAlt };
})();
