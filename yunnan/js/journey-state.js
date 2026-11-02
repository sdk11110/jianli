window.JourneyState = {
  chapterAt(progress) { return Math.max(0, Math.min(2, Math.floor(progress * 3))); },
  filterPhotos(photos, city) { return city === 'all' ? [...photos] : photos.filter(photo => photo.city === city); }
};
