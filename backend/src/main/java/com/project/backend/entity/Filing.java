package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "filings")
public class Filing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ip_asset_id", nullable = false)
    private IPAsset ipAsset;

    // Matches DB column 'date'
    @Column(name = "date") 
    private LocalDateTime filingDate;

    @Column(length = 50)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ✅ ADDED MISSING FIELDS
    @Column(length = 50)
    private String type;

    @Column(length = 100)
    private String jurisdiction;

    // ===== Getters & Setters =====

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public IPAsset getIpAsset() { return ipAsset; }
    public void setIpAsset(IPAsset ipAsset) { this.ipAsset = ipAsset; }

    public LocalDateTime getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDateTime filingDate) { this.filingDate = filingDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // ✅ ADDED MISSING GETTERS & SETTERS
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }
}