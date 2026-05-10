"""Local SPA-aware dev server for docs/.

Run: python3 scripts/dev_server.py [port]   (default port 8000)

Serves docs/ as static files, but falls back to index.html for any path that
doesn't resolve to a file — required for path-based SPA routing where
/units/temple is a client-side route, not a real file. Also adds
no-cache headers so iteration is fast.
"""
from __future__ import annotations

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB_ROOT = ROOT / "docs"


class SPAHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def end_headers(self):
        # No-cache for instant reload
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def do_GET(self):
        # Try as a regular file first
        path = self.translate_path(self.path)
        if os.path.isfile(path) or os.path.isdir(path):
            return super().do_GET()
        # Otherwise: SPA fallback — serve index.html with the original URL
        self.path = "/index.html"
        return super().do_GET()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    httpd = ThreadingHTTPServer(("", port), SPAHandler)
    print(f"serving {WEB_ROOT} at http://localhost:{port}/  (SPA fallback enabled)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
