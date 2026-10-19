package com.salon.handler;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.salon.dao.*;
import com.salon.db.DatabaseConnection;
import com.salon.model.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.*;

/**
 * ApiHandler
 * Routes incoming /api REST requests to appropriate DAO operations.
 * Handles CORS, JSON parsing with Gson, Authentication, and HTTP status codes.
 */
public class ApiHandler implements HttpHandler {

    private final Gson gson = new Gson();
    private final CategoryDAO categoryDAO = new CategoryDAO();
    private final ServiceDAO serviceDAO = new ServiceDAO();
    private final StylistDAO stylistDAO = new StylistDAO();
    private final AppointmentDAO appointmentDAO = new AppointmentDAO();
    private final ReviewDAO reviewDAO = new ReviewDAO();
    private final AdminDAO adminDAO = new AdminDAO();
    private final CustomerDAO customerDAO = new CustomerDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        // Handle CORS Preflight
        setCorsHeaders(exchange);
        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        try {
            if (path.equals("/api/health") && "GET".equalsIgnoreCase(method)) {
                handleHealth(exchange);
            } else if (path.equals("/api/auth/login") && "POST".equalsIgnoreCase(method)) {
                handleLogin(exchange);
            } else if (path.equals("/api/auth/register") && "POST".equalsIgnoreCase(method)) {
                handleRegister(exchange);
            } else if (path.equals("/api/customer/appointments") && "GET".equalsIgnoreCase(method)) {
                handleCustomerAppointments(exchange);
            } else if (path.equals("/api/categories") && "GET".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 200, categoryDAO.getAllCategories());
            } else if (path.equals("/api/services")) {
                handleServices(exchange, method);
            } else if (path.startsWith("/api/services/")) {
                handleServiceById(exchange, method, path);
            } else if (path.equals("/api/stylists")) {
                handleStylists(exchange, method);
            } else if (path.startsWith("/api/stylists/")) {
                handleStylistById(exchange, method, path);
            } else if (path.equals("/api/appointments")) {
                handleAppointments(exchange, method);
            } else if (path.startsWith("/api/appointments/ref/")) {
                handleAppointmentByRef(exchange, path);
            } else if (path.matches("/api/appointments/\\d+/status")) {
                handleAppointmentStatus(exchange, path);
            } else if (path.matches("/api/appointments/\\d+/payment")) {
                handleAppointmentPayment(exchange, path);
            } else if (path.equals("/api/dashboard/stats") && "GET".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 200, appointmentDAO.getDashboardStats());
            } else if (path.equals("/api/reviews")) {
                handleReviews(exchange, method);
            } else {
                sendErrorResponse(exchange, 404, "Endpoint not found: " + path);
            }
        } catch (SQLException e) {
            System.err.println("Database error on " + path + ": " + e.getMessage());
            sendErrorResponse(exchange, 500, "Database error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Server error on " + path + ": " + e.getMessage());
            sendErrorResponse(exchange, 500, "Server error: " + e.getMessage());
        }
    }

    private void handleLogin(HttpExchange exchange) throws Exception {
        String body = readRequestBody(exchange);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
        String role = json.has("role") ? json.get("role").getAsString().toLowerCase() : "customer";
        String password = json.has("password") ? json.get("password").getAsString() : "";
        String identifier = json.has("identifier") ? json.get("identifier").getAsString().trim()
                          : json.has("phone") ? json.get("phone").getAsString().trim()
                          : json.has("username") ? json.get("username").getAsString().trim() : "";

        if (identifier.isEmpty() || password.isEmpty()) {
            sendErrorResponse(exchange, 400, "Identifier and password are required");
            return;
        }

        // 1. Explicit Admin login
        if ("admin".equals(role)) {
            if (!adminDAO.existsByUsername(identifier)) {
                sendErrorResponse(exchange, 404, "Admin account '" + identifier + "' does not exist. Please register first.");
                return;
            }
            Admin admin = adminDAO.login(identifier, password);
            if (admin != null) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("role", "admin");
                res.put("user", admin);
                res.put("message", "Admin login successful");
                sendJsonResponse(exchange, 200, res);
            } else {
                sendErrorResponse(exchange, 401, "Incorrect admin password. Please try again.");
            }
            return;
        }

        // 2. Common Portal Login (Supports both Admin and Customer)
        // First check if this identifier matches an Admin
        if (adminDAO.existsByUsername(identifier)) {
            Admin admin = adminDAO.login(identifier, password);
            if (admin != null) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("role", "admin");
                res.put("user", admin);
                res.put("message", "Welcome back, Admin " + (admin.getFullName() != null ? admin.getFullName() : admin.getUsername()) + "!");
                sendJsonResponse(exchange, 200, res);
                return;
            } else {
                sendErrorResponse(exchange, 401, "Incorrect password. Please try again.");
                return;
            }
        }

        // Next check Customer account existence
        if (!customerDAO.existsByIdentifier(identifier)) {
            sendErrorResponse(exchange, 404, "No account found with mobile/email '" + identifier + "'. Please register first.");
            return;
        }

        Customer customer = customerDAO.login(identifier, password);
        if (customer != null) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("role", "customer");
            res.put("user", customer);
            res.put("message", "Customer login successful");
            sendJsonResponse(exchange, 200, res);
        } else {
            sendErrorResponse(exchange, 401, "Incorrect password. Please try again.");
        }
    }

    private void handleRegister(HttpExchange exchange) throws Exception {
        String body = readRequestBody(exchange);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
        String role = json.has("role") ? json.get("role").getAsString().toLowerCase() : "customer";

        if ("admin".equals(role)) {
            String username = json.has("username") ? json.get("username").getAsString().trim() : "";
            String password = json.has("password") ? json.get("password").getAsString() : "";
            String fullName = json.has("full_name") ? json.get("full_name").getAsString().trim() : "Admin";
            String email = json.has("email") ? json.get("email").getAsString().trim() : "";

            if (username.isEmpty() || password.isEmpty()) {
                sendErrorResponse(exchange, 400, "Username and password required for admin registration");
                return;
            }

            if (adminDAO.existsByUsername(username)) {
                sendErrorResponse(exchange, 409, "Admin username '" + username + "' is already registered. Please login instead.");
                return;
            }

            Admin newAdmin = new Admin();
            newAdmin.setUsername(username);
            newAdmin.setPassword(password);
            newAdmin.setFullName(fullName);
            newAdmin.setEmail(email);
            newAdmin.setRole("Admin");

            int adminId = adminDAO.register(newAdmin);
            newAdmin.setId(adminId);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("role", "admin");
            res.put("user", newAdmin);
            res.put("message", "Admin registered successfully");
            sendJsonResponse(exchange, 201, res);
        } else {
            String name = json.has("name") ? json.get("name").getAsString().trim() : "";
            String phone = json.has("phone") ? json.get("phone").getAsString().trim() : "";
            String email = json.has("email") ? json.get("email").getAsString().trim() : "";
            String password = json.has("password") ? json.get("password").getAsString() : "123456";

            if (name.isEmpty() || phone.isEmpty()) {
                sendErrorResponse(exchange, 400, "Name and mobile number are required");
                return;
            }

            if (customerDAO.existsByIdentifier(phone)) {
                sendErrorResponse(exchange, 409, "An account with mobile number " + phone + " already exists. Please login instead.");
                return;
            }

            if (!email.isEmpty() && customerDAO.existsByIdentifier(email)) {
                sendErrorResponse(exchange, 409, "An account with email " + email + " already exists. Please login instead.");
                return;
            }

            Customer cust = customerDAO.register(name, email, phone, password);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("role", "customer");
            res.put("user", cust);
            res.put("message", "Customer registered successfully");
            sendJsonResponse(exchange, 201, res);
        }
    }

    private void handleCustomerAppointments(HttpExchange exchange) throws Exception {
        String query = exchange.getRequestURI().getQuery();
        String phone = "";
        if (query != null && query.contains("phone=")) {
            phone = query.split("phone=")[1].split("&")[0];
        }
        if (phone.isEmpty()) {
            sendErrorResponse(exchange, 400, "Phone number query parameter required");
            return;
        }
        List<Appointment> list = appointmentDAO.getAppointmentsByCustomerPhone(phone);
        sendJsonResponse(exchange, 200, list);
    }

    private void handleHealth(HttpExchange exchange) throws IOException {
        boolean dbConnected = DatabaseConnection.testConnection();
        Map<String, Object> health = new HashMap<>();
        health.put("status", "online");
        health.put("timestamp", new Date().toString());
        
        Map<String, Object> db = new HashMap<>();
        db.put("connected", dbConnected);
        db.put("message", dbConnected 
            ? "MySQL Database Connected Successfully (" + DatabaseConnection.getDbName() + ")" 
            : "Database Disconnected: " + DatabaseConnection.getLastErrorMessage());
        health.put("database", db);

        sendJsonResponse(exchange, 200, health);
    }

    private void handleServices(HttpExchange exchange, String method) throws Exception {
        if ("GET".equalsIgnoreCase(method)) {
            sendJsonResponse(exchange, 200, serviceDAO.getAllServices());
        } else if ("POST".equalsIgnoreCase(method)) {
            String body = readRequestBody(exchange);
            Service s = gson.fromJson(body, Service.class);
            int newId = serviceDAO.createService(s);
            Map<String, Object> res = new HashMap<>();
            res.put("id", newId);
            res.put("message", "Service created successfully");
            sendJsonResponse(exchange, 201, res);
        }
    }

    private void handleServiceById(HttpExchange exchange, String method, String path) throws Exception {
        int id = Integer.parseInt(path.substring("/api/services/".length()));
        if ("PUT".equalsIgnoreCase(method)) {
            String body = readRequestBody(exchange);
            Service s = gson.fromJson(body, Service.class);
            s.setId(id);
            serviceDAO.updateService(s);
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Service updated successfully");
            sendJsonResponse(exchange, 200, res);
        } else if ("DELETE".equalsIgnoreCase(method)) {
            serviceDAO.deleteService(id);
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Service deleted successfully");
            sendJsonResponse(exchange, 200, res);
        }
    }

    private void handleStylists(HttpExchange exchange, String method) throws Exception {
        if ("GET".equalsIgnoreCase(method)) {
            sendJsonResponse(exchange, 200, stylistDAO.getAllStylists());
        } else if ("POST".equalsIgnoreCase(method)) {
            String body = readRequestBody(exchange);
            Stylist st = gson.fromJson(body, Stylist.class);
            int newId = stylistDAO.createStylist(st);
            Map<String, Object> res = new HashMap<>();
            res.put("id", newId);
            res.put("message", "Stylist added successfully");
            sendJsonResponse(exchange, 201, res);
        }
    }

    private void handleStylistById(HttpExchange exchange, String method, String path) throws Exception {
        int id = Integer.parseInt(path.substring("/api/stylists/".length()));
        if ("PUT".equalsIgnoreCase(method)) {
            String body = readRequestBody(exchange);
            Stylist st = gson.fromJson(body, Stylist.class);
            st.setId(id);
            stylistDAO.updateStylist(st);
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Stylist updated successfully");
            sendJsonResponse(exchange, 200, res);
        } else if ("DELETE".equalsIgnoreCase(method)) {
            stylistDAO.deleteStylist(id);
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Stylist deleted successfully");
            sendJsonResponse(exchange, 200, res);
        }
    }

    private void handleAppointments(HttpExchange exchange, String method) throws Exception {
        if ("GET".equalsIgnoreCase(method)) {
            sendJsonResponse(exchange, 200, appointmentDAO.getAllAppointments());
        } else if ("POST".equalsIgnoreCase(method)) {
            String body = readRequestBody(exchange);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();

            String customerName = json.has("customer_name") ? json.get("customer_name").getAsString() : "";
            String customerEmail = json.has("customer_email") && !json.get("customer_email").isJsonNull() ? json.get("customer_email").getAsString() : "";
            String customerPhone = json.has("customer_phone") ? json.get("customer_phone").getAsString() : "";
            int serviceId = json.has("service_id") ? json.get("service_id").getAsInt() : 1;
            Integer stylistId = json.has("stylist_id") && !json.get("stylist_id").isJsonNull() ? json.get("stylist_id").getAsInt() : null;
            String appointmentDate = json.has("appointment_date") ? json.get("appointment_date").getAsString() : "";
            String appointmentTime = json.has("appointment_time") ? json.get("appointment_time").getAsString() : "";
            String notes = json.has("notes") && !json.get("notes").isJsonNull() ? json.get("notes").getAsString() : "";

            if (customerName.isEmpty() || customerPhone.isEmpty() || appointmentDate.isEmpty() || appointmentTime.isEmpty()) {
                sendErrorResponse(exchange, 400, "Missing required booking fields (Name, Phone, Date, Time)");
                return;
            }

            Map<String, Object> res = appointmentDAO.createAppointment(
                customerName, customerEmail, customerPhone, stylistId, serviceId, appointmentDate, appointmentTime, notes
            );
            sendJsonResponse(exchange, 201, res);
        }
    }

    private void handleAppointmentByRef(HttpExchange exchange, String path) throws Exception {
        String query = path.substring("/api/appointments/ref/".length());
        Appointment a = appointmentDAO.getAppointmentByRefOrPhone(query);
        if (a != null) {
            sendJsonResponse(exchange, 200, a);
        } else {
            sendErrorResponse(exchange, 404, "Appointment not found for: " + query);
        }
    }

    private void handleAppointmentStatus(HttpExchange exchange, String path) throws Exception {
        String[] parts = path.split("/");
        int id = Integer.parseInt(parts[3]);
        String body = readRequestBody(exchange);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
        String status = json.has("status") ? json.get("status").getAsString() : "Pending";

        appointmentDAO.updateStatus(id, status);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Appointment status updated to " + status);
        sendJsonResponse(exchange, 200, res);
    }

    private void handleAppointmentPayment(HttpExchange exchange, String path) throws Exception {
        String[] parts = path.split("/");
        int id = Integer.parseInt(parts[3]);
        String body = readRequestBody(exchange);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();

        String paymentStatus = json.has("payment_status") ? json.get("payment_status").getAsString() : "Paid";
        String paymentMethod = json.has("payment_method") ? json.get("payment_method").getAsString() : "Cash";

        appointmentDAO.updatePayment(id, paymentStatus, paymentMethod);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Payment status updated to " + paymentStatus);
        sendJsonResponse(exchange, 200, res);
    }

    private void handleReviews(HttpExchange exchange, String method) throws Exception {
        if ("GET".equalsIgnoreCase(method)) {
            sendJsonResponse(exchange, 200, reviewDAO.getRecentReviews(10));
        } else if ("POST".equalsIgnoreCase(method)) {
            String body = readRequestBody(exchange);
            Review r = gson.fromJson(body, Review.class);
            int newId = reviewDAO.addReview(r);
            Map<String, Object> res = new HashMap<>();
            res.put("id", newId);
            res.put("message", "Review submitted successfully");
            sendJsonResponse(exchange, 201, res);
        }
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             Scanner scanner = new Scanner(is, StandardCharsets.UTF_8.name())) {
            return scanner.useDelimiter("\\A").hasNext() ? scanner.next() : "";
        }
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, Object data) throws IOException {
        String json = gson.toJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        Map<String, String> err = new HashMap<>();
        err.put("error", message);
        sendJsonResponse(exchange, statusCode, err);
    }
}
