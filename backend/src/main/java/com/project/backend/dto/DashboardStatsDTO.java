package com.project.backend.dto;

import java.util.List;

public class DashboardStatsDTO {
    private Long totalUsers;
    private Long activeUsers;
    private Long totalPatents;
    private Long totalFilings;
    private Long pendingFilings;
    private APIHealthDTO.HealthSnapshot apiHealth;
    private List<UserActivityDTO.ActivityTrend> activityTrends;
    private List<UserGrowthPoint> userGrowth;
    private List<PatentStatusCount> patentStatuses;

    // --- GETTERS & SETTERS ---
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public Long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }
    public Long getTotalPatents() { return totalPatents; }
    public void setTotalPatents(Long totalPatents) { this.totalPatents = totalPatents; }
    public Long getTotalFilings() { return totalFilings; }
    public void setTotalFilings(Long totalFilings) { this.totalFilings = totalFilings; }
    public Long getPendingFilings() { return pendingFilings; }
    public void setPendingFilings(Long pendingFilings) { this.pendingFilings = pendingFilings; }
    public APIHealthDTO.HealthSnapshot getApiHealth() { return apiHealth; }
    public void setApiHealth(APIHealthDTO.HealthSnapshot apiHealth) { this.apiHealth = apiHealth; }
    public List<UserActivityDTO.ActivityTrend> getActivityTrends() { return activityTrends; }
    public void setActivityTrends(List<UserActivityDTO.ActivityTrend> activityTrends) { this.activityTrends = activityTrends; }
    public List<UserGrowthPoint> getUserGrowth() { return userGrowth; }
    public void setUserGrowth(List<UserGrowthPoint> userGrowth) { this.userGrowth = userGrowth; }
    public List<PatentStatusCount> getPatentStatuses() { return patentStatuses; }
    public void setPatentStatuses(List<PatentStatusCount> patentStatuses) { this.patentStatuses = patentStatuses; }

    // --- BUILDER ---
    public static class Builder {
        private DashboardStatsDTO d = new DashboardStatsDTO();
        public Builder totalUsers(Long v) { d.totalUsers = v; return this; }
        public Builder activeUsers(Long v) { d.activeUsers = v; return this; }
        public Builder totalPatents(Long v) { d.totalPatents = v; return this; }
        public Builder totalFilings(Long v) { d.totalFilings = v; return this; }
        public Builder pendingFilings(Long v) { d.pendingFilings = v; return this; }
        public Builder apiHealth(APIHealthDTO.HealthSnapshot v) { d.apiHealth = v; return this; }
        public Builder activityTrends(List<UserActivityDTO.ActivityTrend> v) { d.activityTrends = v; return this; }
        public Builder patentStatuses(List<PatentStatusCount> v) { d.patentStatuses = v; return this; }
        public DashboardStatsDTO build() { return d; }
    }
    public static Builder builder() { return new Builder(); }

    public static class UserGrowthPoint {
        private String date;
        private Long totalUsers;
        private Long newUsers;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
        public Long getNewUsers() { return newUsers; }
        public void setNewUsers(Long newUsers) { this.newUsers = newUsers; }
    }

    public static class PatentStatusCount {
        private String status;
        private Long count;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }

        // Manual Builder
        public static class Builder {
            private PatentStatusCount p = new PatentStatusCount();
            public Builder status(String v) { p.status = v; return this; }
            public Builder count(Long v) { p.count = v; return this; }
            public PatentStatusCount build() { return p; }
        }
        public static Builder builder() { return new Builder(); }
    }
}