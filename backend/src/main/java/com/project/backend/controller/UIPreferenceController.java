package com.project.backend.controller;

import com.project.backend.dto.UIPreferenceDTO;
import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import com.project.backend.service.UIPreferenceService;
import com.project.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;             // ADDED
import org.slf4j.LoggerFactory;      // ADDED
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UIPreferenceController {

    // ✅ ADDED MANUAL LOGGER
    private static final Logger log = LoggerFactory.getLogger(UIPreferenceController.class);

    private final UIPreferenceService preferenceService;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    /**
     * GET /api/preferences
     * Get current user's UI preferences
     */
    @GetMapping
    public ResponseEntity<UIPreferenceDTO> getUserPreferences(HttpServletRequest request) {
        User user = getCurrentUser(request);
        log.info("Fetching UI preferences for user: {}", user.getEmail());
        
        UIPreferenceDTO preferences = preferenceService.getUserPreferences(user);
        return ResponseEntity.ok(preferences);
    }

    /**
     * PUT /api/preferences
     * Update user's UI preferences
     */
    @PutMapping
    public ResponseEntity<UIPreferenceDTO> updatePreferences(
            @RequestBody UIPreferenceDTO.UpdateRequest updateRequest,
            HttpServletRequest request) {
        
        User user = getCurrentUser(request);
        log.info("Updating UI preferences for user: {}", user.getEmail());
        
        UIPreferenceDTO updated = preferenceService.updatePreferences(user, updateRequest);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/preferences/reset
     * Reset preferences to default
     */
    @PostMapping("/reset")
    public ResponseEntity<UIPreferenceDTO> resetPreferences(HttpServletRequest request) {
        User user = getCurrentUser(request);
        log.info("Resetting UI preferences for user: {}", user.getEmail());
        
        UIPreferenceDTO reset = preferenceService.resetToDefault(user);
        return ResponseEntity.ok(reset);
    }

    /**
     * Helper method to get current user from Token
     */
    private User getCurrentUser(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        // ✅ Ensure this matches your JwtUtil method (extractUsername or extractEmail)
        String email = jwtUtil.extractUsername(token); 
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new RuntimeException("No valid token found");
    }
}