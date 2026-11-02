import unittest
from pathlib import Path
import tempfile

from build_pages import pages_prefix, prefix_root_paths, rewrite_published_paths


class PagesBuildTests(unittest.TestCase):
    def test_user_site_stays_at_domain_root(self):
        self.assertEqual(pages_prefix(''), '')
        self.assertEqual(pages_prefix('shaodike.github.io'), '')

    def test_project_site_uses_repository_name(self):
        self.assertEqual(pages_prefix('jianli'), '/jianli')
        self.assertEqual(pages_prefix('/jianli/'), '/jianli')

    def test_only_site_root_paths_are_prefixed(self):
        source = '''
        <a href="/index/">作品</a>
        <a href="/yunnan/showcase-20261101.html">手帐</a>
        <a href="/home/#delivery">返回</a>
        <a href="../home/#work">总站</a>
        fetch('/assets/portfolio-scenes-20261101/reuse.json')
        src="/assets/portfolio-scenes-20261101/watch-scene.webp"
        url(/assets/portfolio-scenes-20261101/approved-sans.woff2)
        url('/assets/fonts/hand.woff2')
        <use href="#diagonal"/>
        "https://example.com/assets/remote.png"
        '''
        updated, count = prefix_root_paths(source, '/jianli')
        self.assertEqual(count, 8)
        self.assertIn('href="/jianli/index/"', updated)
        self.assertIn('href="/jianli/yunnan/showcase-20261101.html"', updated)
        self.assertIn('href="/jianli/#delivery"', updated)
        self.assertIn('href="../#work"', updated)
        self.assertNotIn('/home/', updated)
        self.assertIn("fetch('/jianli/assets/portfolio-scenes-20261101/reuse.json')", updated)
        self.assertIn('src="/jianli/assets/portfolio-scenes-20261101/watch-scene.webp"', updated)
        self.assertIn('url(/jianli/assets/portfolio-scenes-20261101/approved-sans.woff2)', updated)
        self.assertIn("url('/jianli/assets/fonts/hand.woff2')", updated)
        self.assertIn('href="#diagonal"', updated)
        self.assertIn('https://example.com/assets/remote.png', updated)

    def test_user_site_still_drops_the_home_alias(self):
        updated, count = prefix_root_paths('<a href="/home/#yunnan"></a><a href="../home/#work"></a>', '')
        self.assertEqual(count, 2)
        self.assertEqual(updated, '<a href="/#yunnan"></a><a href="../#work"></a>')

    def test_rewrite_skips_binaries_and_can_run_twice(self):
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder)
            page = site / 'index.html'
            page.write_text('<a href="/index/"></a>', encoding='utf-8')
            video = site / 'clip.mp4'
            video.write_bytes(b'\x00/assets/')
            self.assertEqual(rewrite_published_paths(site, '/jianli'), 1)
            self.assertEqual(page.read_text(encoding='utf-8'), '<a href="/jianli/index/"></a>')
            self.assertEqual(video.read_bytes(), b'\x00/assets/')
            self.assertEqual(rewrite_published_paths(site, '/jianli'), 0)


if __name__ == '__main__':
    unittest.main()
