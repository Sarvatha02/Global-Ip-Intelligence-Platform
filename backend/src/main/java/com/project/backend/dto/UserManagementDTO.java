package com.project.backend.dto;

import java.time.LocalDateTime;

public class UserManagementDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String subscription;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Long totalActivities;
    private String ipAddress;

    // --- GETTERS & SETTERS (Main) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubscription() { return subscription; }
    public void setSubscription(String subscription) { this.subscription = subscription; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    public Long getTotalActivities() { return totalActivities; }
    public void setTotalActivities(Long totalActivities) { this.totalActivities = totalActivities; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    // --- BUILDER (Main) ---
    public static class Builder {
        private UserManagementDTO u = new UserManagementDTO();
        public Builder id(Long v) { u.id = v; return this; }
        public Builder name(String v) { u.name = v; return this; }
        public Builder email(String v) { u.email = v; return this; }
        public Builder role(String v) { u.role = v; return this; }
        public Builder status(String v) { u.status = v; return this; }
        public Builder subscription(String v) { u.subscription = v; return this; }
        public Builder createdAt(LocalDateTime v) { u.createdAt = v; return this; }
        public Builder totalActivities(Long v) { u.totalActivities = v; return this; }
        public UserManagementDTO build() { return u; }
    }
    public static Builder builder() { return new Builder(); }

    // --- INNER CLASSES (Requests) ---
    public static class UserCreateRequest {
        private String name;
        private String email;
        private String password;
        private String role;
        private String userType;

        // Getters/Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }
    }

    public static class UserRoleUpdate {
        private String newRole;
        public String getNewRole() { return newRole; }
        public void setNewRole(String newRole) { this.newRole = newRole; }
    }

    public static class UserStatusUpdate {
        private String status;
        private String reason;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}