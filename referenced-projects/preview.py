from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial
import argparse
p=argparse.ArgumentParser()
p.add_argument('--port',type=int,default=8878)
a=p.parse_args()
root=Path(__file__).resolve().parent
print(f'Portfolio: http://127.0.0.1:{a.port}/index/',flush=True)
print(f'Travel: http://127.0.0.1:{a.port}/yunnan/',flush=True)
ThreadingHTTPServer(('127.0.0.1',a.port),partial(SimpleHTTPRequestHandler,directory=str(root))).serve_forever()
