package com.farmtech.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "equipments")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type; // e.g., "Tractor", "Harvester"
    private String description;

    // Price per day (existing column)
    @Column(name = "price_per_day")
    private double price; // per-day

    // New: price per hour (optional)
    @Column(name = "price_per_hour")
    private Double pricePerHour; // nullable for old rows

    // Legacy column still present in DB (NOT NULL). Keep it in sync to avoid insert errors.
    @Column(name = "price")
    private Double legacyPrice;

    @Column(length = 1000) // Allow longer image URLs
    private String image;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private Farmer owner; // Link to Farmer entity

    // Keep legacy column in sync for compatibility with existing schema
    @PrePersist
    public void prePersist() {
        if (legacyPrice == null) {
            legacyPrice = price;
        }
    }

    @PreUpdate
    public void preUpdate() {
        legacyPrice = price;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }
    public void setPrice(double price) {
        this.price = price;
    }

    public Double getPricePerHour() {
        return pricePerHour;
    }
    public void setPricePerHour(Double pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    public String getImage() {
        return image;
    }
    public void setImage(String image) {
        this.image = image;
    }

    public Farmer getOwner() {
        return owner;
    }
    public void setOwner(Farmer owner) {
        this.owner = owner;
    }
    
    // Helper method for JPA queries that need ownerId
    public Long getOwnerId() {
        return owner != null ? owner.getId() : null;
    }
}