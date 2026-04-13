package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "filing_feedbacks", indexes = {
    @Index(name = "idx_filing_feedback", columnList = "filing_id")
})
public class FilingFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filing_id", nullable = false)
    private UserFiling filing;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false, length = 50)
    private String feedbackType;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(columnDefinition = "TEXT")
    private String fieldsToUpdate;
    
    @Column(length = 20)
    private String priority = "MEDIUM";
    
    @Column(nullable = false)
    private Boolean isRead = false;
    
    @Column(nullable = false)
    private Boolean isResolved = false;

    // --- CONSTRUCTORS ---
    public FilingFeedback() {}

    public FilingFeedback(Long id, UserFiling filing, User admin, LocalDateTime timestamp, String feedbackType, 
                          String message, String fieldsToUpdate, String priority, Boolean isRead, Boolean isResolved) {
        this.id = id;
        this.filing = filing;
        this.admin = admin;
        this.timestamp = timestamp;
        this.feedbackType = feedbackType;
        this.message = message;
        this.fieldsToUpdate = fieldsToUpdate;
        this.priority = priority;
        this.isRead = isRead;
        this.isResolved = isResolved;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserFiling getFiling() { return filing; }
    public void setFiling(UserFiling filing) { this.filing = filing; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getFeedbackType() { return feedbackType; }
    public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getFieldsToUpdate() { return fieldsToUpdate; }
    public void setFieldsToUpdate(String fieldsToUpdate) { this.fieldsToUpdate = fieldsToUpdate; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public Boolean getIsResolved() { return isResolved; }
    public void setIsResolved(Boolean isResolved) { this.isResolved = isResolved; }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // --- BUILDER PATTERN ---
    public static class Builder {
        private FilingFeedback f = new FilingFeedback();

        public Builder id(Long v) { f.id = v; return this; }
        public Builder filing(UserFiling v) { f.filing = v; return this; }
        public Builder admin(User v) { f.admin = v; return this; }
        public Builder timestamp(LocalDateTime v) { f.timestamp = v; return this; }
        public Builder feedbackType(String v) { f.feedbackType = v; return this; }
        public Builder message(String v) { f.message = v; return this; }
        public Builder fieldsToUpdate(String v) { f.fieldsToUpdate = v; return this; }
        public Builder priority(String v) { f.priority = v; return this; }
        public Builder isRead(Boolean v) { f.isRead = v; return this; }
        public Builder isResolved(Boolean v) { f.isResolved = v; return this; }

        public FilingFeedback build() { return f; }
    }

    public static Builder builder() { return new Builder(); }
}