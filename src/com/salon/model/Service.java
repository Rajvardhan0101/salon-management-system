package com.salon.model;

/**
 * Service Entity
 * Represents salon treatments/services with pricing in INR (₹).
 */
public class Service {
    private int id;
    private int category_id;
    private String category_name;
    private String name;
    private String description;
    private int duration_mins;
    private double price;
    private String image_url;
    private String status;
    private String created_at;

    public Service() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getCategoryId() { return category_id; }
    public void setCategoryId(int category_id) { this.category_id = category_id; }

    public String getCategoryName() { return category_name; }
    public void setCategoryName(String category_name) { this.category_name = category_name; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getDurationMins() { return duration_mins; }
    public void setDurationMins(int duration_mins) { this.duration_mins = duration_mins; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getImageUrl() { return image_url; }
    public void setImageUrl(String image_url) { this.image_url = image_url; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return created_at; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
