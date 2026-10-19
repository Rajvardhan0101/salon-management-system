package com.salon.dao;

import com.salon.db.DatabaseConnection;
import com.salon.model.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Service Data Access Object (DAO)
 * Handles CRUD operations for salon services.
 */
public class ServiceDAO {

    public List<Service> getAllServices() throws SQLException {
        List<Service> list = new ArrayList<>();
        String sql = "SELECT s.*, c.name AS category_name " +
                     "FROM services s " +
                     "JOIN categories c ON s.category_id = c.id " +
                     "ORDER BY s.id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Service s = new Service();
                s.setId(rs.getInt("id"));
                s.setCategoryId(rs.getInt("category_id"));
                s.setCategoryName(rs.getString("category_name"));
                s.setName(rs.getString("name"));
                s.setDescription(rs.getString("description"));
                s.setDurationMins(rs.getInt("duration_mins"));
                s.setPrice(rs.getDouble("price"));
                s.setImageUrl(rs.getString("image_url"));
                s.setStatus(rs.getString("status"));
                s.setCreatedAt(rs.getString("created_at"));
                list.add(s);
            }
        }
        return list;
    }

    public Service getServiceById(int id) throws SQLException {
        String sql = "SELECT s.*, c.name AS category_name " +
                     "FROM services s " +
                     "JOIN categories c ON s.category_id = c.id " +
                     "WHERE s.id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Service s = new Service();
                    s.setId(rs.getInt("id"));
                    s.setCategoryId(rs.getInt("category_id"));
                    s.setCategoryName(rs.getString("category_name"));
                    s.setName(rs.getString("name"));
                    s.setDescription(rs.getString("description"));
                    s.setDurationMins(rs.getInt("duration_mins"));
                    s.setPrice(rs.getDouble("price"));
                    s.setImageUrl(rs.getString("image_url"));
                    s.setStatus(rs.getString("status"));
                    s.setCreatedAt(rs.getString("created_at"));
                    return s;
                }
            }
        }
        return null;
    }

    public int createService(Service s) throws SQLException {
        String sql = "INSERT INTO services (category_id, name, description, duration_mins, price, image_url, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, s.getCategoryId() > 0 ? s.getCategoryId() : 1);
            ps.setString(2, s.getName());
            ps.setString(3, s.getDescription());
            ps.setInt(4, s.getDurationMins() > 0 ? s.getDurationMins() : 30);
            ps.setDouble(5, s.getPrice());
            ps.setString(6, s.getImageUrl() != null ? s.getImageUrl() : "");
            ps.setString(7, s.getStatus() != null ? s.getStatus() : "Active");

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return -1;
    }

    public boolean updateService(Service s) throws SQLException {
        String sql = "UPDATE services SET category_id = ?, name = ?, description = ?, duration_mins = ?, price = ?, image_url = ?, status = ? WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, s.getCategoryId() > 0 ? s.getCategoryId() : 1);
            ps.setString(2, s.getName());
            ps.setString(3, s.getDescription());
            ps.setInt(4, s.getDurationMins());
            ps.setDouble(5, s.getPrice());
            ps.setString(6, s.getImageUrl() != null ? s.getImageUrl() : "");
            ps.setString(7, s.getStatus() != null ? s.getStatus() : "Active");
            ps.setInt(8, s.getId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteService(int id) throws SQLException {
        String sql = "DELETE FROM services WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
