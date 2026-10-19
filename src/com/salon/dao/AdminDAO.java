package com.salon.dao;

import com.salon.db.DatabaseConnection;
import com.salon.model.Admin;

import java.sql.*;

/**
 * Admin Data Access Object (DAO)
 * Manages administrator authentication, profile retrieval, and staff registration.
 */
public class AdminDAO {

    public Admin login(String username, String password) throws SQLException {
        String sql = "SELECT * FROM admins WHERE username = ? AND password = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, password);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Admin admin = new Admin();
                    admin.setId(rs.getInt("id"));
                    admin.setUsername(rs.getString("username"));
                    admin.setFullName(rs.getString("full_name"));
                    admin.setEmail(rs.getString("email"));
                    admin.setRole(rs.getString("role"));
                    admin.setCreatedAt(rs.getString("created_at"));
                    return admin;
                }
            }
        }
        return null;
    }

    public boolean existsByUsername(String username) throws SQLException {
        String sql = "SELECT id FROM admins WHERE username = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public int register(Admin admin) throws SQLException {
        if (existsByUsername(admin.getUsername())) {
            throw new SQLException("Username '" + admin.getUsername() + "' is already taken.");
        }

        String sql = "INSERT INTO admins (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, admin.getUsername());
            ps.setString(2, admin.getPassword());
            ps.setString(3, admin.getFullName());
            ps.setString(4, admin.getEmail() != null ? admin.getEmail() : "");
            ps.setString(5, admin.getRole() != null ? admin.getRole() : "Admin");

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return -1;
    }
}
