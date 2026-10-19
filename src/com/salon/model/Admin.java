package com.salon.model;

/**
 * Admin Entity
 * Represents salon administrators and staff managers.
 */
public class Admin {
    private int id;
    private String username;
    private String password;
    private String full_name;
    private String email;
    private String role;
    private String created_at;

    public Admin() {}

    public Admin(int id, String username, String full_name, String email, String role) {
        this.id = id;
        this.username = username;
        this.full_name = full_name;
        this.email = email;
        this.role = role;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return full_name; }
    public void setFullName(String full_name) { this.full_name = full_name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCreatedAt() { return created_at; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
