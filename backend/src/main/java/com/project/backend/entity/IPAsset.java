package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ip_assets")
public class IPAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50)
    private String type;

    @Column(name = "asset_number", length = 100)
    private String assetNumber;

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(length = 255)
    private String assignee;

    @Column(length = 255)
    private String inventor;

    @Column(length = 100)
    private String jurisdiction;

    @Column(name = "filing_date")
    private LocalDateTime filingDate;
    
    @Column(name = "publication_date")
    private LocalDateTime publicationDate; 

    @Column(length = 50)
    private String status;

    // 'class' is a reserved keyword in SQL/Java, mapped to 'assetClass'
    @Column(name = "class", length = 100)
    private String assetClass;

    @Column(columnDefinition = "TEXT")
    private String details; 

    @Column(name = "api_source", length = 100)
    private String apiSource;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    @OneToMany(mappedBy = "ipAsset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Filing> filings;

    // ===========================
    // 🛠️ GETTERS & SETTERS
    // ===========================

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAssetNumber() { return assetNumber; }
    public void setAssetNumber(String assetNumber) { this.assetNumber = assetNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    
    // Alias for Service compatibility
    public String getOwner() { return assignee; }

    public String getInventor() { return inventor; }
    public void setInventor(String inventor) { this.inventor = inventor; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public LocalDateTime getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDateTime filingDate) { this.filingDate = filingDate; }
    
    public LocalDateTime getPublicationDate() { return publicationDate; }
    public void setPublicationDate(LocalDateTime publicationDate) { this.publicationDate = publicationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssetClass() { return assetClass; }
    public void setAssetClass(String assetClass) { this.assetClass = assetClass; }
    
    // Alias for Service compatibility
    public String getClassification() { return assetClass; }
    public void setClassification(String classification) { this.assetClass = classification; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    // Alias for Service compatibility (AbstractText mapping)
    public String getAbstractText() { return details; }
    public void setAbstractText(String abstractText) { this.details = abstractText; }

    public String getApiSource() { return apiSource; }
    public void setApiSource(String apiSource) { this.apiSource = apiSource; }
    
    // Alias for Service compatibility
    public String getSource() { return apiSource; }
    public void setSource(String source) { this.apiSource = source; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    
    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }

    public List<Filing> getFilings() { return filings; }
    public void setFilings(List<Filing> filings) { this.filings = filings; }
}