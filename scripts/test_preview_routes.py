"""Routing checks run without opening a port or touching the source sites."""
import tempfile
import unittest
from pathlib import Path

from preview import build_mounts, resolve_request_path


class PreviewRoutesTests(unittest.TestCase):
    def setUp(self):
        self.script_folder = Path(__file__).resolve().parent
        self.temporary = tempfile.TemporaryDirectory(prefix='preview-test-', dir=self.script_folder)
        self.base = Path(self.temporary.name).resolve()
        self.home = self.make_site(self.base / 'ai' / 'tep1' / 'jianli')

    def tearDown(self):
        self.assertIn(self.script_folder, self.base.parents)
        self.temporary.cleanup()

    def make_site(self, folder):
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'index.html').write_text('<title>Test</title>', encoding='utf-8')
        return folder.resolve()

    def test_home_and_home_alias_preserve_relative_assets(self):
        mounts = build_mounts(self.home)
        for url in ('/', '/home/', '/home/index.html', '/index.html?version=2'):
            expected = self.home if url in ('/', '/home/') else self.home / 'index.html'
            self.assertEqual(resolve_request_path(url, mounts), expected)
        self.assertEqual(resolve_request_path('/home/css/site.css', mounts), self.home / 'css' / 'site.css')

    def test_existing_common_portfolio_wins_over_discovery(self):
        sibling = self.make_site(self.home.parent / 'index')
        self.make_site(self.home.parents[1] / '简历' / '文创')
        mounts = build_mounts(self.home)
        self.assertEqual(mounts['index'], sibling)
        self.assertEqual(resolve_request_path('/index/assets/watch-link/index.html', mounts), sibling / 'assets' / 'watch-link' / 'index.html')

    def test_known_local_portfolio_is_discovered(self):
        portfolio = self.make_site(self.home.parents[1] / '简历' / '文创')
        self.assertEqual(build_mounts(self.home)['index'], portfolio)

    def test_explicit_roots_and_individual_mounts_are_authoritative(self):
        common = self.base / 'published'
        index = self.make_site(common / 'index')
        travel = self.make_site(common / 'yunnan')
        override = self.make_site(self.base / 'selected-portfolio')
        mounts = build_mounts(self.home, root=common)
        self.assertEqual(mounts['index'], index)
        self.assertEqual(mounts['yunnan'], travel)
        self.assertEqual(build_mounts(self.home, root=common, portfolio=override)['index'], override)

    def test_missing_explicit_portfolio_never_falls_back(self):
        self.make_site(self.home.parent / 'index')
        self.make_site(self.home.parents[1] / '简历' / '文创')
        self.assertIsNone(build_mounts(self.home, portfolio=self.base / 'missing')['index'])
        self.assertIsNone(build_mounts(self.home, root=self.base / 'missing-root')['index'])

    def test_missing_travel_is_404_until_configured(self):
        mounts = build_mounts(self.home)
        self.assertIsNone(resolve_request_path('/yunnan/', mounts))
        travel = self.make_site(self.base / 'selected-travel')
        mounts = build_mounts(self.home, travel=travel)
        self.assertEqual(resolve_request_path('/yunnan/notes/page.html', mounts), travel / 'notes' / 'page.html')
        self.assertIsNone(build_mounts(self.home, travel=self.base / 'missing-travel')['yunnan'])

    def test_encoded_traversal_and_windows_path_syntax_are_rejected(self):
        mounts = build_mounts(self.home)
        for url in ('/../secret', '/home/%2e%2e/secret', '/index/assets/../secret', '/%2e/secret',
                    '/home/%5c..%5csecret', '/C:/Windows/win.ini', '/index.html:secret', '/bad%00name'):
            with self.subTest(url=url):
                self.assertIsNone(resolve_request_path(url, mounts))

    def test_supplied_package_is_self_contained_and_preferred(self):
        portfolio = self.make_site(self.home / 'referenced-projects' / 'index')
        travel = self.make_site(self.home / 'referenced-projects' / 'yunnan')
        self.make_site(self.home.parent / 'index')
        self.make_site(self.home.parents[1] / '简历' / '文创')
        mounts = build_mounts(self.home)
        self.assertEqual(mounts['index'], portfolio)
        self.assertEqual(mounts['yunnan'], travel)
        self.assertEqual(resolve_request_path('/yunnan/js/content.js', mounts), travel / 'js' / 'content.js')

    def test_explicit_mount_configuration_still_overrides_package(self):
        self.make_site(self.home / 'referenced-projects' / 'index')
        self.make_site(self.home / 'referenced-projects' / 'yunnan')
        common = self.base / 'explicit'
        portfolio = self.make_site(common / 'index')
        travel = self.make_site(common / 'yunnan')
        mounts = build_mounts(self.home, root=common)
        self.assertEqual(mounts['index'], portfolio)
        self.assertEqual(mounts['yunnan'], travel)
        self.assertIsNone(build_mounts(self.home, root=self.base / 'missing')['yunnan'])

    def test_resolved_link_cannot_escape_mount(self):
        outside = self.base / 'outside'
        outside.mkdir()
        shortcut = self.home / 'outside-link'
        try:
            shortcut.symlink_to(outside, target_is_directory=True)
        except OSError:
            self.skipTest('Creating symbolic links is unavailable on this machine.')
        self.assertIsNone(resolve_request_path('/outside-link/private.txt', build_mounts(self.home)))


if __name__ == '__main__':
    unittest.main()
