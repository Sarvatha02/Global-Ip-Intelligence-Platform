package com.project.backend.controller;

import com.project.backend.entity.Settings;
import com.project.backend.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsRepository settingsRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<Settings> getSettings(@PathVariable Long userId) {
        // Return existing settings or create defaults
        Settings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> settingsRepository.save(new Settings(userId)));
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateSettings(@PathVariable Long userId, @RequestBody Map<String, Object> updates) {
        Optional<Settings> optionalSettings = settingsRepository.findByUserId(userId);
        
        // Ensure settings exist before updating
        Settings settings = optionalSettings.orElse(new Settings(userId));

        // Dynamically update fields
        if (updates.containsKey("emailNotifications")) settings.setEmailNotifications((Boolean) updates.get("emailNotifications"));
        if (updates.containsKey("criticalAlerts")) settings.setCriticalAlerts((Boolean) updates.get("criticalAlerts"));
        if (updates.containsKey("marketingEmails")) settings.setMarketingEmails((Boolean) updates.get("marketingEmails"));
        if (updates.containsKey("pushNotifications")) settings.setPushNotifications((Boolean) updates.get("pushNotifications"));
        
        if (updates.containsKey("twoFactorAuth")) settings.setTwoFactorAuth((Boolean) updates.get("twoFactorAuth"));
        if (updates.containsKey("sessionTimeout")) settings.setSessionTimeout((String) updates.get("sessionTimeout"));
        if (updates.containsKey("loginAlerts")) settings.setLoginAlerts((Boolean) updates.get("loginAlerts"));
        
        if (updates.containsKey("theme")) settings.setTheme((String) updates.get("theme"));
        if (updates.containsKey("compactMode")) settings.setCompactMode((Boolean) updates.get("compactMode"));
        
        if (updates.containsKey("publicProfile")) settings.setPublicProfile((Boolean) updates.get("publicProfile"));
        if (updates.containsKey("dataSharing")) settings.setDataSharing((Boolean) updates.get("dataSharing"));
        
        if (updates.containsKey("geminiKey")) settings.setGeminiKey((String) updates.get("geminiKey"));

        settingsRepository.save(settings);
        return ResponseEntity.ok(settings);
    }
}