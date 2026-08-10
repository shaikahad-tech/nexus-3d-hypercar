#!/usr/bin/env python3
# NEXUS 3D - local development server.
# Serves the project root over HTTP (required for ES6 module imports).
import http.server
import socketserver
import sys
from pathlib import Path

PORT = 8000
DIRECTORY = str(Path(__file__).parent)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        if path.endswith(".js"):
            return "text/javascript"
        return mimetype

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"\n  NEXUS 3D - Aether GT")
        print(f"  Serving at http://localhost:{port}")
        print(f"  Press Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.")
            httpd.shutdown()
