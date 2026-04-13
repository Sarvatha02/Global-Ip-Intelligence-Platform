package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_metrics", indexes = {
    @Index(name = "idx_metric_timestamp", columnList = "timestamp")
})
public class SystemMetric {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    private Double cpuUsage;
    private Long memoryUsed;
    private Long memoryTotal;
    private Integer activeConnections;
    private Integer requestsPerMinute;
    private Integer avgResponseTime;
    private Integer errorCount;
    private Integer activeSessions;

    // --- CONSTRUCTORS ---
    public SystemMetric() {}

    public SystemMetric(Long id, LocalDateTime timestamp, Double cpuUsage, Long memoryUsed, Long memoryTotal,
                        Integer activeConnections, Integer requestsPerMinute, Integer avgResponseTime, 
                        Integer errorCount, Integer activeSessions) {
        this.id = id;
        this.timestamp = timestamp;
        this.cpuUsage = cpuUsage;
        this.memoryUsed = memoryUsed;
        this.memoryTotal = memoryTotal;
        this.activeConnections = activeConnections;
        this.requestsPerMinute = requestsPerMinute;
        this.avgResponseTime = avgResponseTime;
        this.errorCount = errorCount;
        this.activeSessions = activeSessions;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(Double cpuUsage) { this.cpuUsage = cpuUsage; }

    public Long getMemoryUsed() { return memoryUsed; }
    public void setMemoryUsed(Long memoryUsed) { this.memoryUsed = memoryUsed; }

    public Long getMemoryTotal() { return memoryTotal; }
    public void setMemoryTotal(Long memoryTotal) { this.memoryTotal = memoryTotal; }

    public Integer getActiveConnections() { return activeConnections; }
    public void setActiveConnections(Integer activeConnections) { this.activeConnections = activeConnections; }

    public Integer getRequestsPerMinute() { return requestsPerMinute; }
    public void setRequestsPerMinute(Integer requestsPerMinute) { this.requestsPerMinute = requestsPerMinute; }

    public Integer getAvgResponseTime() { return avgResponseTime; }
    public void setAvgResponseTime(Integer avgResponseTime) { this.avgResponseTime = avgResponseTime; }

    public Integer getErrorCount() { return errorCount; }
    public void setErrorCount(Integer errorCount) { this.errorCount = errorCount; }

    public Integer getActiveSessions() { return activeSessions; }
    public void setActiveSessions(Integer activeSessions) { this.activeSessions = activeSessions; }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // --- BUILDER PATTERN ---
    public static class Builder {
        private SystemMetric m = new SystemMetric();

        public Builder id(Long v) { m.id = v; return this; }
        public Builder timestamp(LocalDateTime v) { m.timestamp = v; return this; }
        public Builder cpuUsage(Double v) { m.cpuUsage = v; return this; }
        public Builder memoryUsed(Long v) { m.memoryUsed = v; return this; }
        public Builder memoryTotal(Long v) { m.memoryTotal = v; return this; }
        public Builder activeConnections(Integer v) { m.activeConnections = v; return this; }
        public Builder requestsPerMinute(Integer v) { m.requestsPerMinute = v; return this; }
        public Builder avgResponseTime(Integer v) { m.avgResponseTime = v; return this; }
        public Builder errorCount(Integer v) { m.errorCount = v; return this; }
        public Builder activeSessions(Integer v) { m.activeSessions = v; return this; }

        public SystemMetric build() { return m; }
    }

    public static Builder builder() { return new Builder(); }
}