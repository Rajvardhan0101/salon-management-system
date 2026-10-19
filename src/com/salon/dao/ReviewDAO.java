package com.salon.dao;

import com.salon.db.DatabaseConnection;
import com.salon.model.Review;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Review Data Access Object (DAO)
 * Manages customer feedback and reviews.
 */
public class ReviewDAO {

    public List<Review> getRecentReviews(int limit) throws SQLException {
        List<Review> list = new ArrayList<>();
        String sql = "SELECT * FROM reviews ORDER BY id DESC LIMIT ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit > 0 ? limit : 10);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Review r = new Review();
                    r.setId(rs.getInt("id"));
                    r.setCustomerName(rs.getString("customer_name"));
                    r.setRating(rs.getInt("rating"));
                    r.setComment(rs.getString("comment"));
                    r.setServiceName(rs.getString("service_name"));
                    r.setCreatedAt(rs.getString("created_at"));
                    list.add(r);
                }
            }
        }
        return list;
    }

    public int addReview(Review r) throws SQLException {
        String sql = "INSERT INTO reviews (customer_name, rating, comment, service_name) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, r.getCustomerName());
            ps.setInt(2, r.getRating() > 0 ? r.getRating() : 5);
            ps.setString(3, r.getComment() != null ? r.getComment() : "");
            ps.setString(4, r.getServiceName() != null ? r.getServiceName() : "Salon Service");
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
