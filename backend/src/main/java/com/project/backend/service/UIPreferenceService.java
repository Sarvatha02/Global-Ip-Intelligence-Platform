package com.project.backend.service;

import com.project.backend.dto.UIPreferenceDTO;
import com.project.backend.entity.UIPreference;
import com.project.backend.entity.User;
import com.project.backend.repository.UIPreferenceRepository;
import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j; // REMOVED
import org.slf4j.Logger;             // ADDED
import org.slf4j.LoggerFactory;      // ADDED
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
// @Slf4j // REMOVED
public class UIPreferenceService {
    
    // ✅ ADDED MANUAL LOGGER
    private static final Logger log = LoggerFactory.getLogger(UIPreferenceService.class);

    private final UIPreferenceRepository preferenceRepo;
    
    public UIPreferenceDTO getUserPreferences(User user) {
        UIPreference preference = preferenceRepo.findByUser(user)
            .orElseGet(() -> createDefaultPreferences(user));
        
        return convertToDTO(preference);
    }
    
    @Transactional
    public UIPreferenceDTO updatePreferences(User user, UIPreferenceDTO.UpdateRequest request) {
        UIPreference preference = preferenceRepo.findByUser(user)
            .orElseGet(() -> createDefaultPreferences(user));
        
        if (request.getTheme() != null) {
            preference.setTheme(request.getTheme());
        }
        if (request.getDashboardLayout() != null) {
            preference.setDashboardLayout(request.getDashboardLayout());
        }
        if (request.getShowChartAnimations() != null) {
            preference.setShowChartAnimations(request.getShowChartAnimations());
        }
        if (request.getEnableChartTooltips() != null) {
            preference.setEnableChartTooltips(request.getEnableChartTooltips());
        }
        if (request.getShowChartGridLines() != null) {
            preference.setShowChartGridLines(request.getShowChartGridLines());
        }
        if (request.getEmailNotifications() != null) {
            preference.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getPushNotifications() != null) {
            preference.setPushNotifications(request.getPushNotifications());
        }
        if (request.getSoundEnabled() != null) {
            preference.setSoundEnabled(request.getSoundEnabled());
        }
        if (request.getDisplayDensity() != null) {
            preference.setDisplayDensity(request.getDisplayDensity());
        }
        if (request.getLanguage() != null) {
            preference.setLanguage(request.getLanguage());
        }
        
        preference.setUpdatedAt(LocalDateTime.now());
        UIPreference saved = preferenceRepo.save(preference);
        
        log.info("Updated UI preferences for user: {}", user.getEmail());
        
        return convertToDTO(saved);
    }
    
    @Transactional
    public UIPreferenceDTO resetToDefault(User user) {
        preferenceRepo.findByUser(user).ifPresent(preferenceRepo::delete);
        UIPreference defaultPref = createDefaultPreferences(user);
        return convertToDTO(defaultPref);
    }
    
    private UIPreference createDefaultPreferences(User user) {
        // ✅ Using Manual Builder (Assuming Entity has manual builder now)
        UIPreference preference = UIPreference.builder()
            .user(user)
            .theme("DARK")
            .dashboardLayout("GRID")
            .showChartAnimations(true)
            .enableChartTooltips(true)
            .showChartGridLines(true)
            .emailNotifications(true)
            .pushNotifications(true)
            .soundEnabled(false)
            .displayDensity("COMFORTABLE")
            .language("EN")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        return preferenceRepo.save(preference);
    }
    
    private UIPreferenceDTO convertToDTO(UIPreference preference) {
        // ✅ Using Manual Builder for DTO
        return UIPreferenceDTO.builder()
            .id(preference.getId())
            .userId(preference.getUser().getId())
            .theme(preference.getTheme())
            .dashboardLayout(preference.getDashboardLayout())
            .showChartAnimations(preference.getShowChartAnimations())
            .enableChartTooltips(preference.getEnableChartTooltips())
            .showChartGridLines(preference.getShowChartGridLines())
            .emailNotifications(preference.getEmailNotifications())
            .pushNotifications(preference.getPushNotifications())
            .soundEnabled(preference.getSoundEnabled())
            .displayDensity(preference.getDisplayDensity())
            .language(preference.getLanguage())
            .build();
    }
}