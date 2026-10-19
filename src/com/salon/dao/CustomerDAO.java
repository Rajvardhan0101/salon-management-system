package com.salon.dao;

import com.salon.db.DatabaseConnection;
import com.salon.model.Customer;

import java.sql.*;

/**
 * Customer Data Access Object (DAO)
 * Manages client records, authentication, registration, visit history, and auto-registration.
 */
public class CustomerDAO {

    /**
     * Checks if a customer exists with the given phone or email.
     */
    public boolean existsByIdentifier(String identifier) throws SQLException {
        if (identifier == null || identifier.trim().isEmpty()) return false;
        String sql = "SELECT id FROM customers WHERE phone = ? OR email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, identifier.trim());
            ps.setString(2, identifier.trim());
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /**
     * Customer Login by Phone or Email with Password.
     */
    public Customer login(String identifier, String password) throws SQLException {
        String sql = "SELECT * FROM customers WHERE (phone = ? OR email = ?) AND (password = ? OR password IS NULL)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, identifier);
            ps.setString(2, identifier);
            ps.setString(3, password);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Customer c = new Customer();
                    c.setId(rs.getInt("id"));
                    c.setName(rs.getString("name"));
                    c.setEmail(rs.getString("email"));
                    c.setPhone(rs.getString("phone"));
                    c.setTotalVisits(rs.getInt("total_visits"));
                    c.setCreatedAt(rs.getString("created_at"));
                    return c;
                }
            }
        }
        return null;
    }

    /**
     * Customer Registration
     * Checks if user already exists before registration.
     */
    public Customer register(String name, String email, String phone, String password) throws SQLException {
        // Enforce user existence check: reject if user already exists
        if (existsByIdentifier(phone)) {
            throw new SQLException("An account with mobile number " + phone + " already exists. Please login instead.");
        }
        if (email != null && !email.trim().isEmpty() && existsByIdentifier(email.trim())) {
            throw new SQLException("An account with email " + email + " already exists. Please login instead.");
        }

        // Insert new customer record
        String insertSql = "INSERT INTO customers (name, email, phone, password, total_visits) VALUES (?, ?, ?, ?, 1)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setString(2, email != null ? email : "");
            ps.setString(3, phone);
            ps.setString(4, password != null ? password : "123456");
            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    int id = rs.getInt(1);
                    return new Customer(id, name, email, phone, 1);
                }
            }
        }
        return null;
    }

    /**
     * Finds an existing customer by phone number, or creates a new one.
     * Increments total_visits for repeat visits.
     */
    public Customer findOrCreateCustomer(String name, String email, String phone) throws SQLException {
        String selectSql = "SELECT * FROM customers WHERE phone = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(selectSql)) {
            ps.setString(1, phone);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int id = rs.getInt("id");
                    int visits = rs.getInt("total_visits") + 1;
                    
                    // Update visit count and email if provided
                    String updateSql = "UPDATE customers SET total_visits = ?, email = IFNULL(?, email) WHERE id = ?";
                    try (PreparedStatement updatePs = conn.prepareStatement(updateSql)) {
                        updatePs.setInt(1, visits);
                        updatePs.setString(2, email);
                        updatePs.setInt(3, id);
                        updatePs.executeUpdate();
                    }

                    return new Customer(id, rs.getString("name"), rs.getString("email"), phone, visits);
                }
            }
        }

        // Insert new customer
        String insertSql = "INSERT INTO customers (name, email, phone, password, total_visits) VALUES (?, ?, ?, '123456', 1)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setString(2, email != null ? email : "");
            ps.setString(3, phone);
            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    int id = rs.getInt(1);
                    return new Customer(id, name, email, phone, 1);
                }
            }
        }
        return null;
    }

    public int getTotalCustomerCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM customers";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }
}
