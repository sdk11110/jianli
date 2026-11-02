const MOUNT_ROOTS = new Set(['assets', 'css', 'docs', 'home', 'index', 'js', 'scripts', 'yunnan']);

export function sitePrefix(pageUrl) {
  const page = new URL(pageUrl);
  const parts = page.pathname.split('/').filter(Boolean);
  const homeIndex = parts.lastIndexOf('home');
  if (homeIndex >= 0) return `/${parts.slice(0, homeIndex).join('/')}${homeIndex ? '/' : ''}`;
  // Project Pages live at /<repo>/, while the local preview and a user site stay at /.
  const [head] = parts;
  if (page.hostname.endsWith('.github.io') && head && !head.includes('.') && !MOUNT_ROOTS.has(head)) {
    return `/${head}/`;
  }
  return '/';
}

export function siteLinks(pageUrl) {
  const page = new URL(pageUrl);
  const root = new URL(sitePrefix(pageUrl), page.origin);
  const project = file => new URL(`index/${file}`, root).href;
  return {
    portfolio: project(''),
    watch: project('assets/watch-link/showcase-20261101.html'),
    training: project('assets/training-platform/platform-tour/showcase-20261101.html'),
    math: project('assets/math-project/interactive-h5/showcase-20261101.html'),
    delivery: project('assets/project-delivery/showcase-20261101.html'),
    textbook: project('assets/interactive-textbook/gitlab-pages-deploy/index.html'),
    travel: new URL('yunnan/showcase-20261101.html', root).href,
  };
}
