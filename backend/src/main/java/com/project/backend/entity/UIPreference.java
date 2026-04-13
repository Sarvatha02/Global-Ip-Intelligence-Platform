package com.project.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ui_preferences")
public class UIPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
    
    @Column(nullable = false, length = 20)
    private String theme = "DARK";
    
    @Column(nullable = false, length = 20)
    private String dashboardLayout = "GRID";
    
    @Column(nullable = false)
    private Boolean showChartAnimations = true;
    
    @Column(nullable = false)
    private Boolean enableChartTooltips = true;
    
    @Column(nullable = false)
    private Boolean showChartGridLines = true;
    
    @Column(nullable = false)
    private Boolean emailNotifications = true;
    
    @Column(nullable = false)
    private Boolean pushNotifications = true;
    
    @Column(nullable = false)
    private Boolean soundEnabled = false;
    
    @Column(length = 20)
    private String displayDensity = "COMFORTABLE";
    
    @Column(length = 10)
    private String language = "EN";
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // --- CONSTRUCTORS ---
    public UIPreference() {}

    public UIPreference(Long id, User user, String theme, String dashboardLayout, Boolean showChartAnimations,
                        Boolean enableChartTooltips, Boolean showChartGridLines, Boolean emailNotifications,
                        Boolean pushNotifications, Boolean soundEnabled, String displayDensity, String language,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.theme = theme;
        this.dashboardLayout = dashboardLayout;
        this.showChartAnimations = showChartAnimations;
        this.enableChartTooltips = enableChartTooltips;
        this.showChartGridLines = showChartGridLines;
        this.emailNotifications = emailNotifications;
        this.pushNotifications = pushNotifications;
        this.soundEnabled = soundEnabled;
        this.displayDensity = displayDensity;
        this.language = language;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- BUILDER PATTERN ---
    public static class Builder {
        private UIPreference p = new UIPreference();

        public Builder id(Long v) { p.id = v; return this; }
        public Builder user(User v) { p.user = v; return this; }
        public Builder theme(String v) { p.theme = v; return this; }
        public Builder dashboardLayout(String v) { p.dashboardLayout = v; return this; }
        public Builder showChartAnimations(Boolean v) { p.showChartAnimations = v; return this; }
        public Builder enableChartTooltips(Boolean v) { p.enableChartTooltips = v; return this; }
        public Builder showChartGridLines(Boolean v) { p.showChartGridLines = v; return this; }
        public Builder emailNotifications(Boolean v) { p.emailNotifications = v; return this; }
        public Builder pushNotifications(Boolean v) { p.pushNotifications = v; return this; }
        public Builder soundEnabled(Boolean v) { p.soundEnabled = v; return this; }
        public Builder displayDensity(String v) { p.displayDensity = v; return this; }
        public Builder language(String v) { p.language = v; return this; }
        public Builder createdAt(LocalDateTime v) { p.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { p.updatedAt = v; return this; }

        public UIPreference build() { return p; }
    }

    public static Builder builder() { return new Builder(); }
}