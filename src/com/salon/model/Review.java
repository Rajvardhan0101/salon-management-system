package com.salon.model;

/**
 * Review Entity
 * Customer feedback and star ratings.
 */
public class Review {
    private int id;
    private String customer_name;
    private int rating;
    private String comment;
    private String service_name;
    private String created_at;

    public Review() {}

    public Review(int id, String customer_name, int rating, String comment, String service_name) {
        this.id = id;
        this.customer_name = customer_name;
        this.rating = rating;
        this.comment = comment;
        this.service_name = service_name;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCustomerName() { return customer_name; }
    public void setCustomerName(String customer_name) { this.customer_name = customer_name; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getServiceName() { return service_name; }
    public void setServiceName(String service_name) { this.service_name = service_name; }

    public String getCreatedAt() { return created_at; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
