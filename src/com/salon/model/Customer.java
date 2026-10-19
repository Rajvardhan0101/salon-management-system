package com.salon.model;

/**
 * Customer Entity
 * Represents salon clients with contact details, credentials, and visit counts.
 */
public class Customer {
    private int id;
    private String name;
    private String email;
    private String phone;
    private String password;
    private int total_visits;
    private String created_at;

    public Customer() {}

    public Customer(int id, String name, String email, String phone, int total_visits) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.total_visits = total_visits;
    }

    public Customer(int id, String name, String email, String phone, String password, int total_visits) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.total_visits = total_visits;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getTotalVisits() { return total_visits; }
    public void setTotalVisits(int total_visits) { this.total_visits = total_visits; }

    public String getCreatedAt() { return created_at; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
