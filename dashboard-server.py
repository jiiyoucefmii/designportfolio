#!/usr/bin/env python3
"""
BuiltByJimi Portfolio & Dashboard Local Server
Serves static portfolio files and provides lightweight REST APIs for:
- Reading and writing project configurations (js/projects-config.js, js/projects-data.js)
- Uploading assets directly to assets/projects/assets/<projectId>/
- Listing assets in project folders with metadata
Zero third-party dependencies — uses standard library only.
"""

import http.server
import socketserver
import socket
import os
import json
import urllib.parse
import re
import mimetypes

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Ensure common MIME types
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/jpeg', '.jpeg')
mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')


def read_projects_config():
    """Extracts PROJECTS_CONFIG dictionary as JSON by reading js/projects-config.js."""
    config_path = os.path.join(BASE_DIR, 'js', 'projects-config.js')
    if not os.path.exists(config_path):
        return {}

    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'export\s+const\s+PROJECTS_CONFIG\s*=\s*(\{[\s\S]*?\n\};)', content)
    if not match:
        return {}

    js_obj = match.group(1).rstrip(';')
    try:
        return json.loads(js_obj)
    except Exception:
        pass

    try:
        import subprocess
        proc = subprocess.run(['node', '-e', f'console.log(JSON.stringify({js_obj}))'],
                              capture_output=True, text=True, cwd=BASE_DIR, timeout=2)
        if proc.returncode == 0:
            return json.loads(proc.stdout)
    except Exception:
        pass

    try:
        cleaned = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', js_obj)
        cleaned = re.sub(r',\s*([}\]])', r'\1', cleaned)
        return json.loads(cleaned)
    except Exception as e:
        print("Fallback parse error:", e)
        return {}


def write_projects_config(config_dict):
    """Writes updated project configurations into js/projects-config.js and syncs js/projects-data.js."""
    config_path = os.path.join(BASE_DIR, 'js', 'projects-config.js')
    data_path = os.path.join(BASE_DIR, 'js', 'projects-data.js')

    formatted_json = json.dumps(config_dict, indent=2, ensure_ascii=False)

    js_content = f"""/**
 * BUILTBYJIMI - UNIFIED PROJECTS & CASE STUDIES CONFIGURATION
 * Single source of truth for all projects across portfolio, detail pages, and CMS dashboard.
 */

export const PROJECTS_CONFIG = {formatted_json};

/**
 * Helper: Export as Array for cards, carousels, and lists
 */
export function getProjectsList() {{
  return Object.values(PROJECTS_CONFIG).map(p => ({{
    id: p.id,
    number: p.number,
    title: p.title,
    subtitle: p.subtitle,
    industry: p.industry,
    role: p.services ? p.services.slice(0, 3).join(' | ') : '',
    categories: p.categories || [],
    image: p.thumbnail,
    isLive: Boolean(p.isLive !== undefined ? p.isLive : (p.id === 'becht' || p.id === 'asiancooks')),
    link: Boolean(p.isLive !== undefined ? p.isLive : (p.id === 'becht' || p.id === 'asiancooks')) ? `/${{p.id}}` : null
  }}));
}}

/**
 * Helper: Export detail dictionary with enriched nextProject reference
 */
export function getProjectsDetailData() {{
  const result = {{}};
  const entries = Object.entries(PROJECTS_CONFIG);

  entries.forEach(([key, project], idx) => {{
    const nextKey = project.nextProjectId || (idx + 1 < entries.length ? entries[idx + 1][0] : entries[0][0]);
    const nextProjectObj = PROJECTS_CONFIG[nextKey] || entries[0][1];

    result[key] = {{
      ...project,
      nextProject: {{
        id: nextProjectObj.id,
        title: nextProjectObj.title,
        subtitle: nextProjectObj.subtitle,
        cardImage: nextProjectObj.thumbnail
      }}
    }};
  }});

  return result;
}}
"""

    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    projects_list = []
    for key, p in config_dict.items():
        is_live = bool(p.get("isLive") if p.get("isLive") is not None else (p.get("id") in ["becht", "asiancooks"]))
        clean_link = f"/{p.get('id', key)}"
        projects_list.append({
            "id": p.get("id", key),
            "number": p.get("number", "01"),
            "title": p.get("title", ""),
            "categories": p.get("categories", ["branding"]),
            "industry": p.get("industry", ""),
            "role": " | ".join(p.get("services", [])[:3]),
            "subtitle": p.get("subtitle", ""),
            "image": p.get("thumbnail", ""),
            "description": p.get("summary", ""),
            "isLive": is_live,
            "link": clean_link if is_live else None
        })

    data_json = json.dumps(projects_list, indent=2, ensure_ascii=False)
    data_content = f"""/**
 * BUILTBYJIMI - PROJECTS DATA
 * Generated from unified configuration in js/projects-config.js
 * Used by projects.html for the interactive carousel and discipline filters.
 */

const PROJECTS_DATA = {data_json};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = {{ PROJECTS_DATA }};
}}
"""
    with open(data_path, 'w', encoding='utf-8') as f:
        f.write(data_content)

    # Directly synchronize index.html on disk with updated thumbnails and titles
    sync_index_html(config_dict)

    # Synchronize static directory entrypoints for universal hosting
    detail_html_path = os.path.join(BASE_DIR, 'project-detail.html')
    if os.path.exists(detail_html_path):
        with open(detail_html_path, 'r', encoding='utf-8') as f:
            detail_html_content = f.read()
        for key in config_dict.keys():
            p_dir = os.path.join(BASE_DIR, key)
            os.makedirs(p_dir, exist_ok=True)
            with open(os.path.join(p_dir, 'index.html'), 'w', encoding='utf-8') as pf:
                pf.write(detail_html_content)


def sync_index_html(config_dict):
    """Synchronizes index.html featured work cards directly on disk with the latest project metadata and thumbnails."""
    index_path = os.path.join(BASE_DIR, 'index.html')
    if not os.path.exists(index_path):
        return

    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    for pid, p in config_dict.items():
        title = p.get('title', '')
        subtitle = p.get('subtitle') or p.get('industry', '')
        thumb = p.get('thumbnail', '')
        if not thumb:
            continue

        pattern = re.compile(
            rf'(<article\s+class="work-card[^"]*"\s+data-project-id="{re.escape(pid)}">)([\s\S]*?)(</article>)',
            re.IGNORECASE
        )

        def replace_card(m):
            start_tag = m.group(1)
            inner = m.group(2)
            end_tag = m.group(3)

            inner = re.sub(r'<div\s+class="card-inner[^"]*">', f'<a href="/{pid}" class="card-inner">', inner)
            inner = re.sub(r'<a\s+href="[^"]*"\s+class="card-inner[^"]*">', f'<a href="/{pid}" class="card-inner">', inner)
            if '<a href="/' in inner and '</div>\n          </article>' in (inner + '\n          ' + end_tag):
                inner = re.sub(r'</div>(\s*)$', r'</a>\1', inner)

            inner = re.sub(
                r'<img\s+src="[^"]*"\s+alt="[^"]*"\s+loading="lazy">',
                f'<img src="{thumb}" alt="{title}" loading="lazy">',
                inner
            )

            if title:
                inner = re.sub(
                    r'<h3\s+class="card-title">[^<]*</h3>',
                    f'<h3 class="card-title">{title}</h3>',
                    inner
                )

            if subtitle:
                inner = re.sub(
                    r'<p\s+class="card-subtitle">[^<]*</p>',
                    f'<p class="card-subtitle">{subtitle}</p>',
                    inner
                )

            return f'{start_tag}{inner}{end_tag}'

        html = pattern.sub(replace_card, html)

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)


class DashboardRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_html_file(self, rel_path):
        full_path = os.path.join(BASE_DIR, rel_path)
        if not os.path.exists(full_path):
            self.send_error(404, "File not found")
            return
        with open(full_path, 'rb') as f:
            content = f.read()
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.end_headers()

    def do_GET(self):
        # Strip caching validation headers so browser never receives 304 during dynamic edits
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        if 'If-None-Match' in self.headers:
            del self.headers['If-None-Match']

        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        if path == '/api/projects':
            config = read_projects_config()
            self.send_json({"status": "success", "projects": config})
            return

        if path == '/api/assets':
            project_id = params.get('project', [''])[0]
            if not project_id:
                self.send_json({"status": "error", "message": "Missing project param"}, 400)
                return

            target_dir = os.path.join(BASE_DIR, 'assets', 'projects', 'assets', project_id)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir, exist_ok=True)

            files = []
            for fname in sorted(os.listdir(target_dir)):
                fpath = os.path.join(target_dir, fname)
                if os.path.isfile(fpath):
                    ext = os.path.splitext(fname)[1].lower()
                    is_img = ext in ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']
                    is_vid = ext in ['.mp4', '.webm', '.mov']
                    size_bytes = os.path.getsize(fpath)
                    files.append({
                        "name": fname,
                        "relPath": f"assets/projects/assets/{project_id}/{fname}",
                        "isImage": is_img,
                        "isVideo": is_vid,
                        "size": size_bytes,
                        "sizeFormatted": f"{size_bytes / 1024:.1f} KB" if size_bytes < 1024 * 1024 else f"{size_bytes / (1024*1024):.2f} MB"
                    })

            self.send_json({"status": "success", "project": project_id, "files": files})
            return

        # Clean URL Routing for web pages
        clean_path = path.strip('/')
        if clean_path in ('', 'index'):
            return self.serve_html_file('index.html')
        if clean_path in ('projects', 'work'):
            return self.serve_html_file('projects.html')
        if clean_path == 'dashboard':
            return self.serve_html_file('dashboard.html')
        if clean_path == 'project-detail':
            return self.serve_html_file('project-detail.html')

        # Check if requested slug is a project ID
        known_projects = ['becht', 'mitidja', 'noctael', 'vagdor', 'carilly', 'designsystem', 'pharma', 'delivery', 'asiancooks']
        try:
            cfg = read_projects_config()
            if cfg:
                known_projects = list(cfg.keys())
        except Exception:
            pass

        if clean_path in known_projects:
            return self.serve_html_file('project-detail.html')

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        if path == '/api/save':
            content_len = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_len).decode('utf-8')
            try:
                data = json.loads(body)
                projects = data.get('projects')
                if not projects:
                    self.send_json({"status": "error", "message": "No projects provided"}, 400)
                    return

                write_projects_config(projects)
                self.send_json({"status": "success", "message": "Configuration saved and synced successfully"})
            except Exception as e:
                self.send_json({"status": "error", "message": str(e)}, 500)
            return

        if path == '/api/upload':
            project_id = params.get('project', [''])[0]
            filename = params.get('filename', [''])[0]
            if not project_id or not filename:
                self.send_json({"status": "error", "message": "Missing project or filename"}, 400)
                return

            filename = os.path.basename(filename)
            target_dir = os.path.join(BASE_DIR, 'assets', 'projects', 'assets', project_id)
            os.makedirs(target_dir, exist_ok=True)
            target_file = os.path.join(target_dir, filename)

            content_len = int(self.headers.get('Content-Length', 0))
            file_data = self.rfile.read(content_len)

            with open(target_file, 'wb') as f:
                f.write(file_data)

            rel_path = f"assets/projects/assets/{project_id}/{filename}"
            self.send_json({
                "status": "success",
                "message": f"File {filename} uploaded successfully",
                "relPath": rel_path,
                "name": filename
            })
            return

        self.send_json({"status": "error", "message": "Endpoint not found"}, 404)


def run_server():
    import webbrowser
    import threading
    import time

    def launch_browser():
        time.sleep(0.8)
        try:
            webbrowser.open(f"http://127.0.0.1:{PORT}/dashboard.html")
        except Exception:
            pass

    server_class = http.server.ThreadingHTTPServer
    server_class.allow_reuse_address = False
    DashboardRequestHandler.protocol_version = "HTTP/1.1"

    # Check if server is already running on port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.settimeout(0.4)
        if probe.connect_ex(('127.0.0.1', PORT)) == 0:
            print("==================================================", flush=True)
            print(" BuiltByJimi Portfolio & CMS Dashboard Server", flush=True)
            print(f" [Notice] Server is ALREADY running on port {PORT}!", flush=True)
            print(f" Opening dashboard: http://127.0.0.1:{PORT}/dashboard.html", flush=True)
            print("==================================================", flush=True)
            webbrowser.open(f"http://127.0.0.1:{PORT}/dashboard.html")
            return

    try:
        httpd = server_class(('0.0.0.0', PORT), DashboardRequestHandler)
    except OSError:
        print("==================================================", flush=True)
        print(" BuiltByJimi Portfolio & CMS Dashboard Server", flush=True)
        print(f" [Notice] Port {PORT} is already in use.", flush=True)
        print(f" Opening dashboard: http://127.0.0.1:{PORT}/dashboard.html", flush=True)
        print("==================================================", flush=True)
        webbrowser.open(f"http://127.0.0.1:{PORT}/dashboard.html")
        return

    with httpd:
        print("==================================================", flush=True)
        print(" BuiltByJimi Portfolio & CMS Dashboard Server", flush=True)
        print(f" -> Dashboard:  http://127.0.0.1:{PORT}/dashboard.html", flush=True)
        print(f" -> Portfolio:  http://127.0.0.1:{PORT}", flush=True)
        print("==================================================", flush=True)
        print(" Opening dashboard in your default browser...", flush=True)
        print(" Press Ctrl+C in this terminal to stop the server.", flush=True)

        threading.Thread(target=launch_browser, daemon=True).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.", flush=True)
            httpd.server_close()


if __name__ == '__main__':
    run_server()
