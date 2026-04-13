package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "filing_tracker")
public class FilingTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "ip_asset_id", nullable = false)
    private IPAsset ipAsset;

    private String status;
    private LocalDateTime trackedAt;

    // --- CONSTRUCTORS ---
    public FilingTracker() {}

    // --- MANUAL GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public IPAsset getIpAsset() { return ipAsset; }
    public void setIpAsset(IPAsset ipAsset) { this.ipAsset = ipAsset; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTrackedAt() { return trackedAt; }
    public void setTrackedAt(LocalDateTime trackedAt) { this.trackedAt = trackedAt; }

    @PrePersist
    protected void onCreate() {
        this.trackedAt = LocalDateTime.now();
    }
}