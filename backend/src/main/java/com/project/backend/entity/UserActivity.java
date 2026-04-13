package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activities", indexes = {
    @Index(name = "idx_user_activity", columnList = "user_id, timestamp"),
    @Index(name = "idx_activity_type", columnList = "activity_type")
})
public class UserActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false, length = 50)
    private String activityType;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    @Column(length = 50)
    private String ipAddress;
    
    @Column(length = 500)
    private String userAgent;
    
    private Long relatedEntityId;
    
    @Column(length = 50)
    private String relatedEntityType;

    // --- CONSTRUCTORS ---
    public UserActivity() {}

    public UserActivity(Long id, User user, LocalDateTime timestamp, String activityType, String details, 
                        String ipAddress, String userAgent, Long relatedEntityId, String relatedEntityType) {
        this.id = id;
        this.user = user;
        this.timestamp = timestamp;
        this.activityType = activityType;
        this.details = details;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.relatedEntityId = relatedEntityId;
        this.relatedEntityType = relatedEntityType;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // --- BUILDER PATTERN ---
    public static class Builder {
        private UserActivity a = new UserActivity();

        public Builder id(Long v) { a.id = v; return this; }
        public Builder user(User v) { a.user = v; return this; }
        public Builder timestamp(LocalDateTime v) { a.timestamp = v; return this; }
        public Builder activityType(String v) { a.activityType = v; return this; }
        public Builder details(String v) { a.details = v; return this; }
        public Builder ipAddress(String v) { a.ipAddress = v; return this; }
        public Builder userAgent(String v) { a.userAgent = v; return this; }
        public Builder relatedEntityId(Long v) { a.relatedEntityId = v; return this; }
        public Builder relatedEntityType(String v) { a.relatedEntityType = v; return this; }

        public UserActivity build() { return a; }
    }

    public static Builder builder() { return new Builder(); }
}