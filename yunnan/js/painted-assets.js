(() => {
  const detail = (kind, placement) => `<span class="story-detail detail-${kind} ${placement}" aria-hidden="true"></span>`;
  document.querySelector('#hero')?.insertAdjacentHTML('beforeend', detail('flag','hero-flag'));
  document.querySelectorAll('.postcard').forEach(card => {
    card.insertAdjacentHTML('beforeend',detail('stone','postcard-stone'));
    const stamp = card.querySelector('.stamp');
    if (stamp) { stamp.setAttribute('aria-hidden','true'); stamp.innerHTML=detail('stamps',''); }
  });
  for(const id of ['desk','gallery']){
    document.getElementById(id)?.insertAdjacentHTML('beforeend',
      detail('fish','water-fish-one')+detail('fish','water-fish-two')+
      detail('bubbles','water-bubbles')+detail('reeds','water-reeds-left')+detail('reeds','water-reeds-right'));
  }
  document.querySelector('.letter-paper')?.insertAdjacentHTML('beforeend',detail('stamps','letter-stamps')+detail('stone','letter-stone'));
})();
