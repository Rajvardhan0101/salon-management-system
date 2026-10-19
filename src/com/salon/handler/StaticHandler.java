package com.salon.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * StaticHandler
 * Serves static web frontend assets (HTML, CSS, JavaScript, images) from the project directory.
 */
public class StaticHandler implements HttpHandler {

    private final String baseDir;

    public StaticHandler(String baseDir) {
        this.baseDir = baseDir;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();

        // Default route to index.html
        if (path.equals("/") || path.isEmpty()) {
            path = "/index.html";
        } else if (path.equals("/admin")) {
            path = "/admin.html";
        }

        // Prevent directory traversal attacks
        if (path.contains("..")) {
            send404(exchange, "Invalid path");
            return;
        }

        // Clean leading slash for local file lookup
        String relativePath = path.startsWith("/") ? path.substring(1) : path;
        File file = new File(baseDir, relativePath);

        if (!file.exists() || file.isDirectory()) {
            send404(exchange, "File Not Found: " + path);
            return;
        }

        // Determine MIME Content-Type
        String contentType = getContentType(file.getName());
        exchange.getResponseHeaders().set("Content-Type", contentType);

        byte[] bytes = new byte[(int) file.length()];
        try (FileInputStream fis = new FileInputStream(file)) {
            fis.read(bytes);
        }

        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String getContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
        if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
        if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".sql")) return "text/plain; charset=UTF-8";
        return "application/octet-stream";
    }

    private void send404(HttpExchange exchange, String message) throws IOException {
        byte[] bytes = ("<h1>404 Not Found</h1><p>" + message + "</p>").getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
        exchange.sendResponseHeaders(404, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
