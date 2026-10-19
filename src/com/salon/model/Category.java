package com.salon.model;

/**
 * Category Entity
 * Represents service groupings (e.g., Hair Care, Facials, Beard Grooming).
 */
public class Category {
    private int id;
    private String name;
    private String description;
    private String icon;
    private String created_at;

    public Category() {}

    public Category(int id, String name, String description, String icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getCreatedAt() { return created_at; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
