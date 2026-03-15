#!/usr/bin/env python3
import http.server
import socketserver
import os
import threading
import webbrowser

PORT = 8080
DIRECTORY = "front-end"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("   CINEWORLD - Iniciando servidor...")
print("=" * 50)
print(f"\nAcesse: http://localhost:{PORT}\n")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
