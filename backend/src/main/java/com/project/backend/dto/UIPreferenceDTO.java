package com.project.backend.dto;

public class UIPreferenceDTO {
    
    private Long id;
    private Long userId;
    private String theme;                    // DARK, LIGHT, PURPLE
    private String dashboardLayout;          // GRID, LIST, COMPACT
    private Boolean showChartAnimations;
    private Boolean enableChartTooltips;
    private Boolean showChartGridLines;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean soundEnabled;
    private String displayDensity;           // COMFORTABLE, COMPACT, SPACIOUS
    private String language;
    
    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getDashboardLayout() { return dashboardLayout; }
    public void setDashboardLayout(String dashboardLayout) { this.dashboardLayout = dashboardLayout; }

    public Boolean getShowChartAnimations() { return showChartAnimations; }
    public void setShowChartAnimations(Boolean showChartAnimations) { this.showChartAnimations = showChartAnimations; }

    public Boolean getEnableChartTooltips() { return enableChartTooltips; }
    public void setEnableChartTooltips(Boolean enableChartTooltips) { this.enableChartTooltips = enableChartTooltips; }

    public Boolean getShowChartGridLines() { return showChartGridLines; }
    public void setShowChartGridLines(Boolean showChartGridLines) { this.showChartGridLines = showChartGridLines; }

    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public Boolean getPushNotifications() { return pushNotifications; }
    public void setPushNotifications(Boolean pushNotifications) { this.pushNotifications = pushNotifications; }

    public Boolean getSoundEnabled() { return soundEnabled; }
    public void setSoundEnabled(Boolean soundEnabled) { this.soundEnabled = soundEnabled; }

    public String getDisplayDensity() { return displayDensity; }
    public void setDisplayDensity(String displayDensity) { this.displayDensity = displayDensity; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    // --- BUILDER PATTERN ---
    public static class Builder {
        private UIPreferenceDTO dto = new UIPreferenceDTO();

        public Builder id(Long id) { dto.id = id; return this; }
        public Builder userId(Long userId) { dto.userId = userId; return this; }
        public Builder theme(String theme) { dto.theme = theme; return this; }
        public Builder dashboardLayout(String dashboardLayout) { dto.dashboardLayout = dashboardLayout; return this; }
        public Builder showChartAnimations(Boolean showChartAnimations) { dto.showChartAnimations = showChartAnimations; return this; }
        public Builder enableChartTooltips(Boolean enableChartTooltips) { dto.enableChartTooltips = enableChartTooltips; return this; }
        public Builder showChartGridLines(Boolean showChartGridLines) { dto.showChartGridLines = showChartGridLines; return this; }
        public Builder emailNotifications(Boolean emailNotifications) { dto.emailNotifications = emailNotifications; return this; }
        public Builder pushNotifications(Boolean pushNotifications) { dto.pushNotifications = pushNotifications; return this; }
        public Builder soundEnabled(Boolean soundEnabled) { dto.soundEnabled = soundEnabled; return this; }
        public Builder displayDensity(String displayDensity) { dto.displayDensity = displayDensity; return this; }
        public Builder language(String language) { dto.language = language; return this; }

        public UIPreferenceDTO build() { return dto; }
    }

    public static Builder builder() { return new Builder(); }

    // --- INNER CLASS: UpdateRequest ---
    public static class UpdateRequest {
        private String theme;
        private String dashboardLayout;
        private Boolean showChartAnimations;
        private Boolean enableChartTooltips;
        private Boolean showChartGridLines;
        private Boolean emailNotifications;
        private Boolean pushNotifications;
        private Boolean soundEnabled;
        private String displayDensity;
        private String language;

        // Getters & Setters for UpdateRequest
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }

        public String getDashboardLayout() { return dashboardLayout; }
        public void setDashboardLayout(String dashboardLayout) { this.dashboardLayout = dashboardLayout; }

        public Boolean getShowChartAnimations() { return showChartAnimations; }
        public void setShowChartAnimations(Boolean showChartAnimations) { this.showChartAnimations = showChartAnimations; }

        public Boolean getEnableChartTooltips() { return enableChartTooltips; }
        public void setEnableChartTooltips(Boolean enableChartTooltips) { this.enableChartTooltips = enableChartTooltips; }

        public Boolean getShowChartGridLines() { return showChartGridLines; }
        public void setShowChartGridLines(Boolean showChartGridLines) { this.showChartGridLines = showChartGridLines; }

        public Boolean getEmailNotifications() { return emailNotifications; }
        public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }

        public Boolean getPushNotifications() { return pushNotifications; }
        public void setPushNotifications(Boolean pushNotifications) { this.pushNotifications = pushNotifications; }

        public Boolean getSoundEnabled() { return soundEnabled; }
        public void setSoundEnabled(Boolean soundEnabled) { this.soundEnabled = soundEnabled; }

        public String getDisplayDensity() { return displayDensity; }
        public void setDisplayDensity(String displayDensity) { this.displayDensity = displayDensity; }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
    }
}