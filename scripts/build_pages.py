"""Assemble the public site with the same mounts as scripts/preview.py.

Home stays at /, the portfolio is published at /index/, and the travel journal
at /yunnan/. On a GitHub project site the published copy also gains the
repository prefix, because those pages are not served from the domain root.
"""
import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / '_site'
SKIP_NAMES = {
    '.git', '.github', '.impeccable', '_site', 'backups', 'referenced-projects', 'scripts',
    '__pycache__',
}
TEXT_SUFFIXES = {'.css', '.html', '.js', '.mjs', '.svg'}
ROOT_PATH = re.compile(r'(?P<lead>["\'`]|url\()/(?P<mount>assets|index|yunnan)/')
HOME_PATH = re.compile(r'(?P<lead>["\'`]|url\()/home/')


def pages_prefix(repository):
    """Return the URL prefix GitHub Pages will add, or '' for a user site."""
    name = (repository or '').strip().strip('/')
    if not name or name.lower().endswith('.github.io'):
        return ''
    return '/' + name


def prefix_root_paths(text, prefix):
    """Map preview-server paths onto a static host.

    /home/ exists only in the local server. Published links go to the site
    root, with the repository prefix when GitHub Pages adds one. /assets/,
    /index/ and /yunnan/ keep their mounts and gain that same prefix.
    """
    count = 0

    def replace_home(match):
        nonlocal count
        count += 1
        return f"{match.group('lead')}{prefix}/"

    text = HOME_PATH.sub(replace_home, text)
    relative_home = text.count('../home/')
    if relative_home:
        text = text.replace('../home/', '../')
        count += relative_home
    if not prefix:
        return text, count

    def replace_mount(match):
        nonlocal count
        count += 1
        return f"{match.group('lead')}{prefix}/{match.group('mount')}/"

    return ROOT_PATH.sub(replace_mount, text), count


def copy_publish_tree(source, destination):
    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir()
    for item in source.iterdir():
        if item.name in SKIP_NAMES or item.name.startswith('.'):
            continue
        target = destination / item.name
        if item.is_dir():
            shutil.copytree(item, target, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
        else:
            shutil.copy2(item, target)
    portfolio = source / 'referenced-projects' / 'index'
    travel = source / 'referenced-projects' / 'yunnan'
    if not (portfolio / 'index.html').is_file() or not (travel / 'index.html').is_file():
        raise SystemExit('referenced-projects/index and referenced-projects/yunnan must both contain index.html')
    shutil.copytree(portfolio, destination / 'index')
    shutil.copytree(travel, destination / 'yunnan')
    (destination / '.nojekyll').write_text('', encoding='utf-8')


def rewrite_published_paths(site, prefix):
    changed = 0
    for path in site.rglob('*'):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        original = path.read_text(encoding='utf-8')
        updated, count = prefix_root_paths(original, prefix)
        if count:
            path.write_text(updated, encoding='utf-8')
            changed += count
    return changed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--repository', default='', help='GitHub repository name. User sites (*.github.io) stay at /.')
    parser.add_argument('--output', type=Path, default=SITE)
    args = parser.parse_args()
    prefix = pages_prefix(args.repository)
    copy_publish_tree(ROOT, args.output)
    changed = rewrite_published_paths(args.output, prefix)
    print(f'Site: {args.output}')
    print(f'Prefix: {prefix or "/"}')
    print(f'Rewritten root paths: {changed}')


if __name__ == '__main__':
    main()
