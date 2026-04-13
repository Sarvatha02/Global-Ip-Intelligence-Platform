package com.project.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FilingFeedbackDTO {
    private Long id;
    private Long filingId;
    private String filingTitle;
    private String applicationNumber;
    private Long adminId;
    private String adminName;
    private LocalDateTime timestamp;
    private String feedbackType;
    private String message;
    private List<String> fieldsToUpdate;
    private String priority;
    private Boolean isRead;
    private Boolean isResolved;

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getFilingId() { return filingId; }
    public void setFilingId(Long filingId) { this.filingId = filingId; }
    public String getFilingTitle() { return filingTitle; }
    public void setFilingTitle(String filingTitle) { this.filingTitle = filingTitle; }
    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }
    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }
    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getFeedbackType() { return feedbackType; }
    public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<String> getFieldsToUpdate() { return fieldsToUpdate; }
    public void setFieldsToUpdate(List<String> fieldsToUpdate) { this.fieldsToUpdate = fieldsToUpdate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public Boolean getIsResolved() { return isResolved; }
    public void setIsResolved(Boolean isResolved) { this.isResolved = isResolved; }

    // --- MANUAL BUILDER ---
    public static class Builder {
        private FilingFeedbackDTO d = new FilingFeedbackDTO();
        public Builder id(Long v) { d.id = v; return this; }
        public Builder filingId(Long v) { d.filingId = v; return this; }
        public Builder filingTitle(String v) { d.filingTitle = v; return this; }
        public Builder applicationNumber(String v) { d.applicationNumber = v; return this; }
        public Builder adminId(Long v) { d.adminId = v; return this; }
        public Builder adminName(String v) { d.adminName = v; return this; }
        public Builder timestamp(LocalDateTime v) { d.timestamp = v; return this; }
        public Builder feedbackType(String v) { d.feedbackType = v; return this; }
        public Builder message(String v) { d.message = v; return this; }
        public Builder fieldsToUpdate(List<String> v) { d.fieldsToUpdate = v; return this; }
        public Builder priority(String v) { d.priority = v; return this; }
        public Builder isRead(Boolean v) { d.isRead = v; return this; }
        public Builder isResolved(Boolean v) { d.isResolved = v; return this; }
        public FilingFeedbackDTO build() { return d; }
    }
    public static Builder builder() { return new Builder(); }

    // INNER CLASSES FOR REQUESTS
    public static class CreateFeedbackRequest {
        private Long filingId;
        private String feedbackType;
        private String message;
        private List<String> fieldsToUpdate;
        private String priority;
        
        public Long getFilingId() { return filingId; }
        public void setFilingId(Long filingId) { this.filingId = filingId; }
        public String getFeedbackType() { return feedbackType; }
        public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<String> getFieldsToUpdate() { return fieldsToUpdate; }
        public void setFieldsToUpdate(List<String> fieldsToUpdate) { this.fieldsToUpdate = fieldsToUpdate; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class FilingStatusUpdate {
        private String newStatus;
        private String feedbackMessage;
        private List<String> fieldsToUpdate;
        private String priority;

        public String getNewStatus() { return newStatus; }
        public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
        public String getFeedbackMessage() { return feedbackMessage; }
        public void setFeedbackMessage(String feedbackMessage) { this.feedbackMessage = feedbackMessage; }
        public List<String> getFieldsToUpdate() { return fieldsToUpdate; }
        public void setFieldsToUpdate(List<String> fieldsToUpdate) { this.fieldsToUpdate = fieldsToUpdate; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }
}