const base = 'assets/media/project-reels';

const clip = (id, project, slug, label, note) => ({
  id,
  project,
  slug,
  label,
  note,
  src: `${base}/${project}/${slug}.mp4`,
  poster: `${base}/${project}/${slug}.jpg`,
});

export const projectVideoReels = {
  watch: [
    clip('watch-volume', 'watch', 'watch-volume', '批量生成', '从单条到一批，先把素材跑起来。'),
    clip('watch-review', 'watch', 'watch-review', '机内预览', '真机画面先看清，再过品检。'),
    clip('watch-delivery', 'watch', 'watch-delivery', '规模交付', '2000+ 条，交付节奏被接住。'),
  ],
  training: [
    clip('training-textbook', 'training', 'training-textbook', '教材演示', '把教材页变成可讲的画面。'),
    clip('training-workshop', 'training', 'training-workshop', '共创工作坊', '方法被同事拿去继续做。'),
    clip('training-feedback', 'training', 'training-feedback', '反馈回路', '工具、培训和需求回到同一张桌。'),
  ],
};

export const allProjectVideos = Object.values(projectVideoReels).flat();
