from livereload import Server

server = Server()

# Watch all HTML, CSS, and JS files
server.watch('*.html')
server.watch('css/*.css')
server.watch('js/*.js')

print("LiveReload server running at http://127.0.0.1:35729 (or http://localhost:35729)")
print("Any edit to HTML, CSS, or JS will instantly auto-refresh the browser!")

# Serve on port 3000 (or 35729)
server.serve(port=3000, host='0.0.0.0', open_url_delay=None)
