package com.salon.db;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.*;
import java.util.Properties;

/**
 * DatabaseConnection Utility
 * Manages JDBC connections to MySQL database using db.properties configuration.
 */
public class DatabaseConnection {

    private static String host = "localhost";
    private static int port = 3306;
    private static String dbName = "salon_db";
    private static String user = "root";
    private static String password = "root";
    private static String lastErrorMessage = "";

    static {
        loadProperties();
        try {
            // Register MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("❌ MySQL JDBC Driver not found in classpath! Check lib/ folder.");
            lastErrorMessage = e.getMessage();
        }
    }

    public static void loadProperties() {
        File propFile = new File("db.properties");
        if (propFile.exists()) {
            try (InputStream input = new FileInputStream(propFile)) {
                Properties props = new Properties();
                props.load(input);

                host = props.getProperty("db.host", "localhost");
                port = Integer.parseInt(props.getProperty("db.port", "3306"));
                dbName = props.getProperty("db.name", "salon_db");
                user = props.getProperty("db.user", "root");
                password = props.getProperty("db.password", "root");
            } catch (Exception e) {
                System.err.println("⚠️ Could not load db.properties, using default credentials: " + e.getMessage());
            }
        }
    }

    /**
     * Get a new JDBC Connection to MySQL.
     */
    public static Connection getConnection() throws SQLException {
        String url = String.format(
            "jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8",
            host, port, dbName
        );
        return DriverManager.getConnection(url, user, password);
    }

    /**
     * Tests database connectivity and returns connection status.
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            lastErrorMessage = "";
            if (conn != null && !conn.isClosed()) {
                ensureAuthSchema(conn);
                return true;
            }
            return false;
        } catch (SQLException e) {
            lastErrorMessage = e.getMessage();
            return false;
        }
    }

    public static void ensureAuthSchema(Connection conn) {
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE TABLE IF NOT EXISTS `admins` (" +
                         "  `id` INT AUTO_INCREMENT PRIMARY KEY," +
                         "  `username` VARCHAR(100) UNIQUE NOT NULL," +
                         "  `password` VARCHAR(255) NOT NULL," +
                         "  `full_name` VARCHAR(150) NOT NULL," +
                         "  `email` VARCHAR(150)," +
                         "  `role` VARCHAR(50) DEFAULT 'Admin'," +
                         "  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                         ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            try (ResultSet rs = stmt.executeQuery("SELECT id FROM admins WHERE username = 'admin'")) {
                if (!rs.next()) {
                    try (Statement insertStmt = conn.createStatement()) {
                        insertStmt.execute("INSERT INTO admins (username, password, full_name, email, role) VALUES ('admin', 'admin123', 'Salon Manager', 'admin@salon.in', 'Admin')");
                    }
                }
            }

            try {
                stmt.execute("ALTER TABLE `customers` ADD COLUMN `password` VARCHAR(255) DEFAULT '123456'");
            } catch (SQLException ignored) {
                // Column likely already exists
            }
        } catch (Exception ignored) {}
    }

    public static String getLastErrorMessage() {
        return lastErrorMessage;
    }

    public static String getDbName() {
        return dbName;
    }

    public static String getUser() {
        return user;
    }
}
