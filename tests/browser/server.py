# Servidor de proves: serveix l'arrel del repo i desa a tests/browser/result.txt el que l'arnès envia per POST.
# Ús: python tests/browser/server.py [port]   (per defecte 8768)
# També serveix per obrir l'app en local: http://127.0.0.1:8768/
import http.server, os, sys, time, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(HERE, '..', '..'))
# Un GIF transparent d'1x1 (bytes escrits en hexadecimal).
GIF = bytes.fromhex('47494638396101000100800000ffffff00000021f90401000000002c00000000010001000002024401003b')

class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # /slow?ms=4000 respon tard: endarrereix el "load" de frames.html perquè la captura surti amb tot pintat.
        if self.path.startswith('/slow'):
            ms = int(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).get('ms', ['4000'])[0])
            time.sleep(ms / 1000)
            self.send_response(200)
            self.send_header('Content-Type', 'image/gif')
            self.end_headers()
            self.wfile.write(GIF)
            return
        super().do_GET()

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        with open(os.path.join(HERE, 'result.txt'), 'wb') as f:
            f.write(body)
        self.send_response(204)
        self.end_headers()

    def log_message(self, *a):
        pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8768
print(f'App a http://127.0.0.1:{port}/ i proves a http://127.0.0.1:{port}/tests/browser/harness.html')
http.server.ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
