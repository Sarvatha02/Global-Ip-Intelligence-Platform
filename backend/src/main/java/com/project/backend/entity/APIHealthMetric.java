package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_health_metrics", indexes = {
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_endpoint", columnList = "endpoint")
})
public class APIHealthMetric {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false, length = 500)
    private String endpoint;
    
    @Column(nullable = false)
    private Integer responseTime;
    
    @Column(nullable = false)
    private Integer statusCode;
    
    @Column(nullable = false)
    private Boolean success;
    
    @Column(length = 10)
    private String method;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    private Long userId;
    
    @Column(length = 50)
    private String ipAddress;

    // --- CONSTRUCTORS ---
    public APIHealthMetric() {}

    public APIHealthMetric(Long id, LocalDateTime timestamp, String endpoint, Integer responseTime, 
                           Integer statusCode, Boolean success, String method, String errorMessage, 
                           Long userId, String ipAddress) {
        this.id = id;
        this.timestamp = timestamp;
        this.endpoint = endpoint;
        this.responseTime = responseTime;
        this.statusCode = statusCode;
        this.success = success;
        this.method = method;
        this.errorMessage = errorMessage;
        this.userId = userId;
        this.ipAddress = ipAddress;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public Integer getResponseTime() { return responseTime; }
    public void setResponseTime(Integer responseTime) { this.responseTime = responseTime; }

    public Integer getStatusCode() { return statusCode; }
    public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // --- BUILDER PATTERN ---
    public static class Builder {
        private APIHealthMetric m = new APIHealthMetric();

        public Builder id(Long v) { m.id = v; return this; }
        public Builder timestamp(LocalDateTime v) { m.timestamp = v; return this; }
        public Builder endpoint(String v) { m.endpoint = v; return this; }
        public Builder responseTime(Integer v) { m.responseTime = v; return this; }
        public Builder statusCode(Integer v) { m.statusCode = v; return this; }
        public Builder success(Boolean v) { m.success = v; return this; }
        public Builder method(String v) { m.method = v; return this; }
        public Builder errorMessage(String v) { m.errorMessage = v; return this; }
        public Builder userId(Long v) { m.userId = v; return this; }
        public Builder ipAddress(String v) { m.ipAddress = v; return this; }

        public APIHealthMetric build() { return m; }
    }

    public static Builder builder() { return new Builder(); }
}