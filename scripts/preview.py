"""Serve home at / and /home/, with working sibling portfolio/travel routes."""
import argparse
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote

def build_mounts(home, root=None, portfolio=None, travel=None):
    """Choose public site roots without changing any links in the pages."""
    home = Path(home).resolve()
    common = Path(root).resolve() if root is not None else home.parent

    def site_at(candidate):
        candidate = Path(candidate).resolve()
        return candidate if (candidate / 'index.html').is_file() else None

    if portfolio is not None:
        portfolio_dir = site_at(portfolio)
    elif root is None:
        portfolio_dir = site_at(home / 'referenced-projects' / 'index') or site_at(common / 'index')
        if portfolio_dir is None and len(home.parents) > 1:
            portfolio_dir = site_at(home.parents[1] / '简历' / '文创')
    else:
        portfolio_dir = site_at(common / 'index')
    if travel is not None:
        travel_dir = site_at(travel)
    elif root is None:
        travel_dir = site_at(home / 'referenced-projects' / 'yunnan') or site_at(common / 'yunnan')
    else:
        travel_dir = site_at(common / 'yunnan')
    return {'home': home, 'index': portfolio_dir, 'yunnan': travel_dir}


def resolve_request_path(path, mounts):
    raw = unquote(urlsplit(path).path)
    # Backslashes and colons are Windows path separators/drive or stream syntax,
    # never part of a public URL filename in these sites.
    if any(character in raw for character in ('\\', ':', '\x00')):
        return None
    parts = [part for part in raw.split('/') if part]
    if any(part in ('.', '..') for part in parts):
        return None
    prefix = parts.pop(0) if parts and parts[0] in ('index', 'yunnan', 'home') else 'home'
    base = mounts.get(prefix)
    if base is None:
        return None
    candidate = base.joinpath(*parts).resolve()
    if candidate != base and base not in candidate.parents:
        return None
    return candidate


class Handler(SimpleHTTPRequestHandler):
    mounts = {}
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.woff': 'font/woff',
        '.svg': 'image/svg+xml',
    }

    def translate_path(self, path):
        candidate = resolve_request_path(path, self.mounts)
        # An empty filename follows SimpleHTTPRequestHandler's normal 404 path.
        return str(candidate) if candidate is not None else ''

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        self.byte_range = None
        requested = self.headers.get('Range')
        file_path = self.translate_path(self.path)
        if not requested or not os.path.isfile(file_path):
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested.strip())
        stream = open(file_path, 'rb')
        stat = os.fstat(stream.fileno())
        size = stat.st_size
        start = end = 0
        valid = bool(match and size and any(match.groups()))
        if valid:
            first, last = match.groups()
            if first:
                start = int(first)
                end = min(int(last), size - 1) if last else size - 1
            else:
                suffix = int(last)
                start, end = max(0, size - suffix), size - 1
                valid = suffix > 0
            valid = valid and 0 <= start <= end < size
        if not valid:
            stream.close()
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        self.byte_range = (start, end)
        stream.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(file_path))
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Last-Modified', self.date_time_string(stat.st_mtime))
        self.end_headers()
        return stream

    def copyfile(self, source, outputfile):
        try:
            if self.byte_range is None:
                return super().copyfile(source, outputfile)
            remaining = self.byte_range[1] - self.byte_range[0] + 1
            while remaining > 0:
                chunk = source.read(min(128 * 1024, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            # Seeking and closing a player legitimately abandons the old response.
            pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8877)
    parser.add_argument('--home', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--root', type=Path, help='Common root containing index/ and yunnan/.')
    parser.add_argument('--portfolio', type=Path, help='Portfolio folder containing index.html.')
    parser.add_argument('--travel', type=Path, help='Travel folder containing index.html.')
    args = parser.parse_args()
    Handler.mounts = build_mounts(args.home, args.root, args.portfolio, args.travel)
    print(f'Home: http://127.0.0.1:{args.port}/', flush=True)
    for prefix, option in (('index', '--portfolio'), ('yunnan', '--travel')):
        folder = Handler.mounts[prefix]
        print(f'/{prefix}/: {folder if folder is not None else "unavailable; set " + option}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()


if __name__ == '__main__':
    main()
