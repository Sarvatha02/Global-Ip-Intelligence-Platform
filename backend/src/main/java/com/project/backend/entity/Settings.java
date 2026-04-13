package com.project.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_settings")
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    // Notifications
    private boolean emailNotifications = true;
    private boolean criticalAlerts = true;
    private boolean marketingEmails = false;
    private boolean pushNotifications = true;

    // Security
    private boolean twoFactorAuth = false;
    private String sessionTimeout = "30";
    private boolean loginAlerts = true;

    // Appearance
    private String theme = "light";
    private boolean compactMode = false;

    // Privacy
    private boolean publicProfile = true;
    private boolean dataSharing = false;

    // API Key
    private String geminiKey;

    public Settings() {}

    public Settings(Long userId) {
        this.userId = userId;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public boolean isEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public boolean isCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(boolean criticalAlerts) { this.criticalAlerts = criticalAlerts; }

    public boolean isMarketingEmails() { return marketingEmails; }
    public void setMarketingEmails(boolean marketingEmails) { this.marketingEmails = marketingEmails; }

    public boolean isPushNotifications() { return pushNotifications; }
    public void setPushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; }

    public boolean isTwoFactorAuth() { return twoFactorAuth; }
    public void setTwoFactorAuth(boolean twoFactorAuth) { this.twoFactorAuth = twoFactorAuth; }

    public String getSessionTimeout() { return sessionTimeout; }
    public void setSessionTimeout(String sessionTimeout) { this.sessionTimeout = sessionTimeout; }

    public boolean isLoginAlerts() { return loginAlerts; }
    public void setLoginAlerts(boolean loginAlerts) { this.loginAlerts = loginAlerts; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public boolean isCompactMode() { return compactMode; }
    public void setCompactMode(boolean compactMode) { this.compactMode = compactMode; }

    public boolean isPublicProfile() { return publicProfile; }
    public void setPublicProfile(boolean publicProfile) { this.publicProfile = publicProfile; }

    public boolean isDataSharing() { return dataSharing; }
    public void setDataSharing(boolean dataSharing) { this.dataSharing = dataSharing; }

    public String getGeminiKey() { return geminiKey; }
    public void setGeminiKey(String geminiKey) { this.geminiKey = geminiKey; }
}