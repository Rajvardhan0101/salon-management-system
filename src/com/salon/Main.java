package com.salon;

import com.salon.db.DatabaseConnection;
import com.salon.handler.ApiHandler;
import com.salon.handler.StaticHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.net.InetSocketAddress;
import java.util.Properties;
import java.util.concurrent.Executors;

/**
 * Salon Management System - Main Application Entry Point
 * 
 * Features:
 * - Built with standard Java HTTP Server (Zero Maven/Spring bloat).
 * - JDBC connection to MySQL database using DAO architecture.
 * - Serves REST API (/api/*) and web frontend (index.html, admin.html).
 */
public class Main {

    private static int port = 3000;

    public static void main(String[] args) {
        try {
            loadConfig();

            // Create HTTP Server
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // Register Handlers
            server.createContext("/api", new ApiHandler());
            server.createContext("/", new StaticHandler("."));

            // Use Multi-threaded Executor for handling concurrent requests
            server.setExecutor(Executors.newCachedThreadPool());

            // Start Server
            server.start();

            // Test Database Connection
            boolean dbOk = DatabaseConnection.testConnection();

            // Print Clean Human-Readable Console Banner
            System.out.println("==================================================================");
            System.out.println("   💈 INDIAN SALON MANAGEMENT SYSTEM (JAVA + JDBC BACKEND) 💈   ");
            System.out.println("==================================================================");
            System.out.printf("  🚀 Server Running:     http://localhost:%d\n", port);
            System.out.printf("  🌐 Customer Portal:    http://localhost:%d/index.html\n", port);
            System.out.printf("  🛡️ Admin Dashboard:    http://localhost:%d/admin.html\n", port);
            System.out.printf("  📡 REST API Health:    http://localhost:%d/api/health\n", port);
            System.out.println("------------------------------------------------------------------");
            if (dbOk) {
                System.out.println("  ✅ MySQL Database:     CONNECTED (" + DatabaseConnection.getDbName() + ")");
            } else {
                System.out.println("  ⚠️ MySQL Database:     NOT CONNECTED");
                System.out.println("     Reason: " + DatabaseConnection.getLastErrorMessage());
                System.out.println("     Tip: Update your MySQL credentials in 'db.properties' file.");
                System.out.println("     Run seed: mysql -u root -p < database/schema.sql");
            }
            System.out.println("==================================================================");
            System.out.println("  [Press Ctrl+C to stop the server]");
            System.out.println();

        } catch (Exception e) {
            System.err.println("❌ Failed to start Salon Management Server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void loadConfig() {
        File file = new File("db.properties");
        if (file.exists()) {
            try (FileInputStream fis = new FileInputStream(file)) {
                Properties props = new Properties();
                props.load(fis);
                if (props.containsKey("server.port")) {
                    port = Integer.parseInt(props.getProperty("server.port"));
                }
            } catch (Exception ignored) {}
        }
    }
}
