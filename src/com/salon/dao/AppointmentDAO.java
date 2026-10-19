package com.salon.dao;

import com.salon.db.DatabaseConnection;
import com.salon.model.Appointment;
import com.salon.model.Customer;

import java.sql.*;
import java.util.*;

/**
 * Appointment Data Access Object (DAO)
 * Core business operations: booking pipeline, calendar queries, check-in tracking, and analytics.
 */
public class AppointmentDAO {

    private final CustomerDAO customerDAO = new CustomerDAO();

    public List<Appointment> getAllAppointments() throws SQLException {
        List<Appointment> list = new ArrayList<>();
        String sql = "SELECT " +
                     "  a.*, " +
                     "  c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, " +
                     "  st.name AS stylist_name, st.title AS stylist_title, " +
                     "  s.name AS service_name, s.duration_mins " +
                     "FROM appointments a " +
                     "JOIN customers c ON a.customer_id = c.id " +
                     "LEFT JOIN stylists st ON a.stylist_id = st.id " +
                     "JOIN services s ON a.service_id = s.id " +
                     "ORDER BY a.appointment_date DESC, a.appointment_time ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSetToAppointment(rs));
            }
        }
        return list;
    }

    public Appointment getAppointmentByRefOrPhone(String query) throws SQLException {
        String sql = "SELECT " +
                     "  a.*, " +
                     "  c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, " +
                     "  st.name AS stylist_name, st.title AS stylist_title, " +
                     "  s.name AS service_name, s.duration_mins " +
                     "FROM appointments a " +
                     "JOIN customers c ON a.customer_id = c.id " +
                     "LEFT JOIN stylists st ON a.stylist_id = st.id " +
                     "JOIN services s ON a.service_id = s.id " +
                     "WHERE a.ref_code = ? OR c.phone = ? " +
                     "ORDER BY a.id DESC LIMIT 1";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, query);
            ps.setString(2, query);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToAppointment(rs);
                }
            }
        }
        return null;
    }

    public List<Appointment> getAppointmentsByCustomerPhone(String phone) throws SQLException {
        List<Appointment> list = new ArrayList<>();
        String sql = "SELECT " +
                     "  a.*, " +
                     "  c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, " +
                     "  st.name AS stylist_name, st.title AS stylist_title, " +
                     "  s.name AS service_name, s.duration_mins " +
                     "FROM appointments a " +
                     "JOIN customers c ON a.customer_id = c.id " +
                     "LEFT JOIN stylists st ON a.stylist_id = st.id " +
                     "JOIN services s ON a.service_id = s.id " +
                     "WHERE c.phone = ? " +
                     "ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, phone);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToAppointment(rs));
                }
            }
        }
        return list;
    }

    /**
     * Creates new appointment booking with customer registration/lookup.
     */
    public Map<String, Object> createAppointment(
            String customerName, String customerEmail, String customerPhone,
            Integer stylistId, int serviceId,
            String appointmentDate, String appointmentTime, String notes
    ) throws SQLException {

        // 1. Find or create customer
        Customer customer = customerDAO.findOrCreateCustomer(customerName, customerEmail, customerPhone);
        if (customer == null) {
            throw new SQLException("Failed to register customer");
        }

        // 2. Lookup service price
        double price = 250.00;
        String priceSql = "SELECT price FROM services WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(priceSql)) {
            ps.setInt(1, serviceId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    price = rs.getDouble("price");
                }
            }
        }

        // 3. Generate unique booking reference code (SLN-XXXX)
        String refCode = "SLN-" + (1000 + new Random().nextInt(9000));

        // 4. Insert appointment
        String insertSql = "INSERT INTO appointments " +
                           "(ref_code, customer_id, stylist_id, service_id, appointment_date, appointment_time, status, notes, total_price, payment_status) " +
                           "VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, 'Unpaid')";

        int appointmentId = -1;
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, refCode);
            ps.setInt(2, customer.getId());
            if (stylistId != null && stylistId > 0) {
                ps.setInt(3, stylistId);
            } else {
                ps.setNull(3, Types.INTEGER);
            }
            ps.setInt(4, serviceId);
            ps.setString(5, appointmentDate);
            ps.setString(6, appointmentTime);
            ps.setString(7, notes != null ? notes : "");
            ps.setDouble(8, price);

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    appointmentId = rs.getInt(1);
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", appointmentId);
        response.put("ref_code", refCode);
        response.put("message", "Appointment booked successfully!");
        return response;
    }

    public boolean updateStatus(int id, String status) throws SQLException {
        String sql = "UPDATE appointments SET status = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updatePayment(int id, String paymentStatus, String paymentMethod) throws SQLException {
        String updateSql = "UPDATE appointments SET payment_status = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(updateSql)) {
            ps.setString(1, paymentStatus);
            ps.setInt(2, id);
            ps.executeUpdate();
        }

        // If paid, create a payment invoice record
        if ("Paid".equalsIgnoreCase(paymentStatus)) {
            double amount = 0.0;
            String amountSql = "SELECT total_price FROM appointments WHERE id = ?";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement ps = conn.prepareStatement(amountSql)) {
                ps.setInt(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        amount = rs.getDouble("total_price");
                    }
                }
            }

            String paySql = "INSERT INTO payments (appointment_id, payment_method, amount, transaction_ref) VALUES (?, ?, ?, ?)";
            try (Connection conn = DatabaseConnection.getConnection();
                 PreparedStatement ps = conn.prepareStatement(paySql)) {
                ps.setInt(1, id);
                ps.setString(2, paymentMethod != null && !paymentMethod.isEmpty() ? paymentMethod : "Cash");
                ps.setDouble(3, amount);
                ps.setString(4, "TXN-" + System.currentTimeMillis());
                ps.executeUpdate();
            }
        }
        return true;
    }

    public Map<String, Object> getDashboardStats() throws SQLException {
        Map<String, Object> stats = new HashMap<>();

        try (Connection conn = DatabaseConnection.getConnection()) {
            // Today's appointments count
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM appointments WHERE appointment_date = CURDATE()");
                 ResultSet rs = ps.executeQuery()) {
                stats.put("todayAppointments", rs.next() ? rs.getInt(1) : 0);
            }

            // Total revenue from Paid appointments
            try (PreparedStatement ps = conn.prepareStatement("SELECT IFNULL(SUM(total_price), 0) FROM appointments WHERE payment_status = 'Paid'");
                 ResultSet rs = ps.executeQuery()) {
                stats.put("totalRevenue", rs.next() ? rs.getDouble(1) : 0.0);
            }

            // Active stylists count
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM stylists WHERE status = 'Active'");
                 ResultSet rs = ps.executeQuery()) {
                stats.put("activeStylists", rs.next() ? rs.getInt(1) : 0);
            }

            // Total customers count
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM customers");
                 ResultSet rs = ps.executeQuery()) {
                stats.put("totalCustomers", rs.next() ? rs.getInt(1) : 0);
            }
        }
        return stats;
    }

    private Appointment mapResultSetToAppointment(ResultSet rs) throws SQLException {
        Appointment a = new Appointment();
        a.setId(rs.getInt("id"));
        a.setRefCode(rs.getString("ref_code"));
        a.setCustomerId(rs.getInt("customer_id"));
        a.setCustomerName(rs.getString("customer_name"));
        a.setCustomerEmail(rs.getString("customer_email"));
        a.setCustomerPhone(rs.getString("customer_phone"));

        int stId = rs.getInt("stylist_id");
        if (!rs.wasNull()) {
            a.setStylistId(stId);
            a.setStylistName(rs.getString("stylist_name"));
            a.setStylistTitle(rs.getString("stylist_title"));
        }

        a.setServiceId(rs.getInt("service_id"));
        a.setServiceName(rs.getString("service_name"));
        a.setDurationMins(rs.getInt("duration_mins"));

        a.setAppointmentDate(rs.getString("appointment_date"));
        a.setAppointmentTime(rs.getString("appointment_time"));
        a.setStatus(rs.getString("status"));
        a.setNotes(rs.getString("notes"));
        a.setTotalPrice(rs.getDouble("total_price"));
        a.setPaymentStatus(rs.getString("payment_status"));
        a.setCreatedAt(rs.getString("created_at"));
        return a;
    }
}
