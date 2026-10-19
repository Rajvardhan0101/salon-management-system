package com.salon.model;

/**
 * Stylist Entity
 * Represents salon staff/artists (barbers, hairdressers, estheticians).
 */
public class Stylist {
    private int id;
    private String name;
    private String title;
    private String bio;
    private String email;
    private String phone;
    private String avatar_url;
    private double rating;
    private String status;
    private String created_at;

    public Stylist() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatarUrl() { return avatar_url; }
    public void setAvatarUrl(String avatar_url) { this.avatar_url = avatar_url; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return created_at; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
