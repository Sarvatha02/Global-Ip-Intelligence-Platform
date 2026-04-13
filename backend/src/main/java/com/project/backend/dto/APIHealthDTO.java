package com.project.backend.dto;

import java.time.LocalDateTime;

public class APIHealthDTO {

    public static class HealthSnapshot {
        private Double uptimePercentage;
        private Integer averageResponseTime;
        private Long totalRequests;
        private Long errorCount;
        private Double errorRate;
        private LocalDateTime lastUpdated;

        // --- GETTERS & SETTERS ---
        public Double getUptimePercentage() { return uptimePercentage; }
        public void setUptimePercentage(Double uptimePercentage) { this.uptimePercentage = uptimePercentage; }
        public Integer getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(Integer averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public Long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(Long totalRequests) { this.totalRequests = totalRequests; }
        public Long getErrorCount() { return errorCount; }
        public void setErrorCount(Long errorCount) { this.errorCount = errorCount; }
        public Double getErrorRate() { return errorRate; }
        public void setErrorRate(Double errorRate) { this.errorRate = errorRate; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

        // --- BUILDER ---
        public static class Builder {
            private HealthSnapshot h = new HealthSnapshot();
            public Builder uptimePercentage(Double v) { h.uptimePercentage = v; return this; }
            public Builder averageResponseTime(Integer v) { h.averageResponseTime = v; return this; }
            public Builder totalRequests(Long v) { h.totalRequests = v; return this; }
            public Builder errorCount(Long v) { h.errorCount = v; return this; }
            public Builder errorRate(Double v) { h.errorRate = v; return this; }
            public Builder lastUpdated(LocalDateTime v) { h.lastUpdated = v; return this; }
            public HealthSnapshot build() { return h; }
        }
        public static Builder builder() { return new Builder(); }
    }

    public static class MetricDataPoint {
        private String time;
        private Integer responseTime;
        private Long requests;
        private Long errors;

        // --- GETTERS & SETTERS ---
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public Integer getResponseTime() { return responseTime; }
        public void setResponseTime(Integer responseTime) { this.responseTime = responseTime; }
        public Long getRequests() { return requests; }
        public void setRequests(Long requests) { this.requests = requests; }
        public Long getErrors() { return errors; }
        public void setErrors(Long errors) { this.errors = errors; }

        // --- BUILDER ---
        public static class Builder {
            private MetricDataPoint m = new MetricDataPoint();
            public Builder time(String v) { m.time = v; return this; }
            public Builder responseTime(Integer v) { m.responseTime = v; return this; }
            public Builder requests(Long v) { m.requests = v; return this; }
            public Builder errors(Long v) { m.errors = v; return this; }
            public MetricDataPoint build() { return m; }
        }
        public static Builder builder() { return new Builder(); }
    }

    public static class EndpointStats {
        private String endpoint;
        private Long requestCount;
        private Double avgResponseTime;
        private Double errorRate;

        // --- GETTERS & SETTERS ---
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public Long getRequestCount() { return requestCount; }
        public void setRequestCount(Long requestCount) { this.requestCount = requestCount; }
        public Double getAvgResponseTime() { return avgResponseTime; }
        public void setAvgResponseTime(Double avgResponseTime) { this.avgResponseTime = avgResponseTime; }
        public Double getErrorRate() { return errorRate; }
        public void setErrorRate(Double errorRate) { this.errorRate = errorRate; }

        // --- BUILDER ---
        public static class Builder {
            private EndpointStats e = new EndpointStats();
            public Builder endpoint(String v) { e.endpoint = v; return this; }
            public Builder requestCount(Long v) { e.requestCount = v; return this; }
            public Builder avgResponseTime(Double v) { e.avgResponseTime = v; return this; }
            public Builder errorRate(Double v) { e.errorRate = v; return this; }
            public EndpointStats build() { return e; }
        }
        public static Builder builder() { return new Builder(); }
    }
}