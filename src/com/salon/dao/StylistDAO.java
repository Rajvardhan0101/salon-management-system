package com.salon.dao;

import com.salon.db.DatabaseConnection;
import com.salon.model.Stylist;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Stylist Data Access Object (DAO)
 * Handles CRUD operations for salon artists/stylists.
 */
public class StylistDAO {

    public List<Stylist> getAllStylists() throws SQLException {
        List<Stylist> list = new ArrayList<>();
        String sql = "SELECT * FROM stylists ORDER BY id ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Stylist st = new Stylist();
                st.setId(rs.getInt("id"));
                st.setName(rs.getString("name"));
                st.setTitle(rs.getString("title"));
                st.setBio(rs.getString("bio"));
                st.setEmail(rs.getString("email"));
                st.setPhone(rs.getString("phone"));
                st.setAvatarUrl(rs.getString("avatar_url"));
                st.setRating(rs.getDouble("rating"));
                st.setStatus(rs.getString("status"));
                st.setCreatedAt(rs.getString("created_at"));
                list.add(st);
            }
        }
        return list;
    }

    public int createStylist(Stylist st) throws SQLException {
        String sql = "INSERT INTO stylists (name, title, bio, email, phone, avatar_url, rating, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, st.getName());
            ps.setString(2, st.getTitle() != null ? st.getTitle() : "Hair Specialist");
            ps.setString(3, st.getBio() != null ? st.getBio() : "");
            ps.setString(4, st.getEmail() != null ? st.getEmail() : "");
            ps.setString(5, st.getPhone() != null ? st.getPhone() : "");
            ps.setString(6, st.getAvatarUrl() != null ? st.getAvatarUrl() : "");
            ps.setDouble(7, st.getRating() > 0 ? st.getRating() : 5.0);
            ps.setString(8, st.getStatus() != null ? st.getStatus() : "Active");

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return -1;
    }

    public boolean updateStylist(Stylist st) throws SQLException {
        String sql = "UPDATE stylists SET name = ?, title = ?, bio = ?, email = ?, phone = ?, avatar_url = ?, status = ? WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, st.getName());
            ps.setString(2, st.getTitle());
            ps.setString(3, st.getBio());
            ps.setString(4, st.getEmail());
            ps.setString(5, st.getPhone());
            ps.setString(6, st.getAvatarUrl());
            ps.setString(7, st.getStatus() != null ? st.getStatus() : "Active");
            ps.setInt(8, st.getId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteStylist(int id) throws SQLException {
        String sql = "DELETE FROM stylists WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
