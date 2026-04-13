package com.project.backend.dto;

import java.time.LocalDateTime;

public class UserActivityDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDateTime timestamp;
    private String activityType;
    private String details;
    private String ipAddress;
    private Long relatedEntityId;
    private String relatedEntityType;

    // --- GETTERS & SETTERS (Main Class) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    // --- BUILDER (Main Class) ---
    public static class Builder {
        private UserActivityDTO d = new UserActivityDTO();
        public Builder id(Long v) { d.id = v; return this; }
        public Builder userId(Long v) { d.userId = v; return this; }
        public Builder userName(String v) { d.userName = v; return this; }
        public Builder userEmail(String v) { d.userEmail = v; return this; }
        public Builder timestamp(LocalDateTime v) { d.timestamp = v; return this; }
        public Builder activityType(String v) { d.activityType = v; return this; }
        public Builder details(String v) { d.details = v; return this; }
        public Builder ipAddress(String v) { d.ipAddress = v; return this; }
        public Builder relatedEntityId(Long v) { d.relatedEntityId = v; return this; }
        public Builder relatedEntityType(String v) { d.relatedEntityType = v; return this; }
        public UserActivityDTO build() { return d; }
    }
    public static Builder builder() { return new Builder(); }

    // --- INNER CLASSES ---

    public static class ActivityTrend {
        private String date;
        private Long logins;
        private Long searches;
        private Long filings;
        private Long totalActivities;

        // Getters/Setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Long getLogins() { return logins; }
        public void setLogins(Long logins) { this.logins = logins; }
        public Long getSearches() { return searches; }
        public void setSearches(Long searches) { this.searches = searches; }
        public Long getFilings() { return filings; }
        public void setFilings(Long filings) { this.filings = filings; }
        public Long getTotalActivities() { return totalActivities; }
        public void setTotalActivities(Long totalActivities) { this.totalActivities = totalActivities; }

        // Builder
        public static class Builder {
            private ActivityTrend a = new ActivityTrend();
            public Builder date(String v) { a.date = v; return this; }
            public Builder logins(Long v) { a.logins = v; return this; }
            public Builder searches(Long v) { a.searches = v; return this; }
            public Builder filings(Long v) { a.filings = v; return this; }
            public Builder totalActivities(Long v) { a.totalActivities = v; return this; }
            public ActivityTrend build() { return a; }
        }
        public static Builder builder() { return new Builder(); }
    }

    public static class ActivityBreakdown {
        private String activityType;
        private Long count;
        private Double percentage;

        // Getters/Setters
        public String getActivityType() { return activityType; }
        public void setActivityType(String activityType) { this.activityType = activityType; }
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }

        // Builder
        public static class Builder {
            private ActivityBreakdown b = new ActivityBreakdown();
            public Builder activityType(String v) { b.activityType = v; return this; }
            public Builder count(Long v) { b.count = v; return this; }
            public Builder percentage(Double v) { b.percentage = v; return this; }
            public ActivityBreakdown build() { return b; }
        }
        public static Builder builder() { return new Builder(); }
    }
}