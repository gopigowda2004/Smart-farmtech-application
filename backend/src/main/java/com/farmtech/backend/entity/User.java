package com.farmtech.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String password;

    private String name;       // short name
    private String fullName;   // full legal name
    private String gender;
    private LocalDate dob;     // date of birth

    private String address;
    private String district;
    private String state;
    private String pincode;

    private String farmSize;       // e.g. 5 acres
    private String cropType;       // e.g. Paddy, Ragi
    private String experience;     // e.g. 10 years farming
    private String equipmentOwned; // e.g. Tractor, Rotavator

    private String role; // FARMER, RENTER, ADMIN
    
    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;
    
    @Column(name = "id_proof_type")
    private String idProofType;
    
    @Column(name = "id_proof_path")
    private String idProofPath;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    // Location coordinates for Google Maps navigation
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    private String village;

    public User() {}

    public User(String email, String phone, String password,
                String name, String fullName, String gender, LocalDate dob,
                String address, String district, String state, String pincode,
                String farmSize, String cropType, String experience, String equipmentOwned,
                String role) {
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.name = name;
        this.fullName = fullName;
        this.gender = gender;
        this.dob = dob;
        this.address = address;
        this.district = district;
        this.state = state;
        this.pincode = pincode;
        this.farmSize = farmSize;
        this.cropType = cropType;
        this.experience = experience;
        this.equipmentOwned = equipmentOwned;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getFarmSize() { return farmSize; }
    public void setFarmSize(String farmSize) { this.farmSize = farmSize; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getEquipmentOwned() { return equipmentOwned; }
    public void setEquipmentOwned(String equipmentOwned) { this.equipmentOwned = equipmentOwned; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
    
    public String getIdProofType() { return idProofType; }
    public void setIdProofType(String idProofType) { this.idProofType = idProofType; }
    
    public String getIdProofPath() { return idProofPath; }
    public void setIdProofPath(String idProofPath) { this.idProofPath = idProofPath; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }
}
