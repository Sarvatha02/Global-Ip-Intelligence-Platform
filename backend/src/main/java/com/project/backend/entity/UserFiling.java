package com.project.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // ✅ IMPORT ADDED
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_filings")
public class UserFiling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ FIX 1: Added JsonIgnoreProperties to handle Lazy Loading
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) 
    private User user;

    // ✅ FIX 2: Added JsonIgnoreProperties here too
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ip_asset_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private IPAsset ipAsset;

    @Column(name = "application_number")
    private String applicationNumber;

    @Column(name = "patent_number")
    private String patentNumber;

    private String title;
    private String category;
    
    @Column(name = "filing_type")
    private String filingType;
    
    @Column(name = "inventor_name")
    private String inventorName;
    
    private String assignee;
    private String jurisdiction;
    
    @Transient
    private String email; 
    
    @Column(name = "filing_date")
    private LocalDate filingDate;
    
    @Column(name = "expiration_date")
    private LocalDate expirationDate;
    
    @Column(name = "patent_status")
    private String patentStatus;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String tags;
    private String status = "PENDING"; 
    
    @Column(name = "submission_date")
    private LocalDate submissionDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserFiling() {}

    // ... (Keep ALL getters and setters exactly as they were in the previous correct version) ...
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Long getUserId() { return user != null ? user.getId() : null; }
    public void setUserId(Long userId) { 
        if (this.user == null) this.user = new User();
        this.user.setId(userId);
    }

    public IPAsset getIpAsset() { return ipAsset; }
    public void setIpAsset(IPAsset ipAsset) { this.ipAsset = ipAsset; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public String getPatentNumber() { return patentNumber; }
    public void setPatentNumber(String patentNumber) { this.patentNumber = patentNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFilingType() { return filingType; }
    public void setFilingType(String filingType) { this.filingType = filingType; }

    public String getInventorName() { return inventorName; }
    public void setInventorName(String inventorName) { this.inventorName = inventorName; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getEmail() { return user != null ? user.getEmail() : email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDate filingDate) { this.filingDate = filingDate; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public String getPatentStatus() { return patentStatus; }
    public void setPatentStatus(String patentStatus) { this.patentStatus = patentStatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDate submissionDate) { this.submissionDate = submissionDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        if (submissionDate == null) submissionDate = LocalDate.now();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}