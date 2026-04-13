package com.project.backend.controller;

import com.project.backend.dto.FilingFeedbackDTO;
import com.project.backend.entity.User;
import com.project.backend.entity.UserFiling;
import com.project.backend.repository.UserFilingRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.service.FilingFeedbackService;
import com.project.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/filings")
@RequiredArgsConstructor
public class FilingManagementController {
    
    private static final Logger log = LoggerFactory.getLogger(FilingManagementController.class);

    private final FilingFeedbackService feedbackService;
    private final UserFilingRepository filingRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllFilings() {
        log.info("Admin fetching all filings list");
        
        List<UserFiling> filings = filingRepo.findAll();

        List<Map<String, Object>> response = filings.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("status", f.getStatus());
            map.put("filingType", f.getFilingType());
            map.put("filedDate", f.getFilingDate() != null ? f.getFilingDate() : f.getCreatedAt());

            if (f.getUser() != null) {
                map.put("userName", f.getUser().getName());
                map.put("userId", f.getUser().getId());
            } else {
                map.put("userName", "Unknown User");
            }

            // Logic to determine Asset Title
            String titleToDisplay = "Untitled Asset";
            String appNumToDisplay = "N/A";

            // Priority 1: Check linked IP Asset
            if (f.getIpAsset() != null) {
                if (f.getIpAsset().getTitle() != null && !f.getIpAsset().getTitle().isEmpty()) {
                    titleToDisplay = f.getIpAsset().getTitle();
                }
                if (f.getIpAsset().getAssetNumber() != null) {
                    appNumToDisplay = f.getIpAsset().getAssetNumber();
                }
            } 
            
            // Priority 2: Check direct Title field (if Asset Title wasn't found or Asset is null)
            // Note: We use the UserFiling's title field if the IPAsset didn't provide one
            if ("Untitled Asset".equals(titleToDisplay) && f.getTitle() != null && !f.getTitle().isEmpty()) {
                titleToDisplay = f.getTitle();
            }
            
            // Priority 3: Use Application Number as Title fallback
            if ("Untitled Asset".equals(titleToDisplay) && f.getApplicationNumber() != null) {
                 titleToDisplay = "App #" + f.getApplicationNumber();
            }

            // Application Number fallback
            if ("N/A".equals(appNumToDisplay) && f.getApplicationNumber() != null) {
                appNumToDisplay = f.getApplicationNumber();
            }

            map.put("assetTitle", titleToDisplay);
            map.put("applicationNumber", appNumToDisplay);
            
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
    
    // ... (Keep existing methods: createFeedback, updateFilingStatus, etc. unchanged) ...
    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FilingFeedbackDTO> createFeedback(
            @PathVariable Long id,
            @RequestBody FilingFeedbackDTO.CreateFeedbackRequest request,
            HttpServletRequest httpRequest) {
        
        User admin = getCurrentUser(httpRequest);
        request.setFilingId(id);  
        
        log.info("Admin {} creating feedback for filing {}", admin.getEmail(), id);
        
        FilingFeedbackDTO feedback = feedbackService.createFeedback(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FilingFeedbackDTO> updateFilingStatus(
            @PathVariable Long id,
            @RequestBody FilingFeedbackDTO.FilingStatusUpdate request,
            HttpServletRequest httpRequest) {
        
        User admin = getCurrentUser(httpRequest);
        log.info("Admin {} updating status for filing {}", admin.getEmail(), id);
        
        FilingFeedbackDTO feedback = feedbackService.updateFilingStatusWithFeedback(id, request, admin);
        return ResponseEntity.ok(feedback);
    }
    
    @GetMapping("/{id}/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FilingFeedbackDTO>> getFeedbackForFiling(@PathVariable Long id) {
        log.info("Fetching feedback for filing {}", id);
        List<FilingFeedbackDTO> feedback = feedbackService.getFeedbackForFiling(id);
        return ResponseEntity.ok(feedback);
    }
    
    @GetMapping("/feedback/unread")
    public ResponseEntity<List<FilingFeedbackDTO>> getUnreadFeedback(HttpServletRequest httpRequest) {
        User user = getCurrentUser(httpRequest);
        log.info("User {} fetching unread feedback", user.getEmail());
        
        List<FilingFeedbackDTO> feedback = feedbackService.getUnreadFeedback(user);
        return ResponseEntity.ok(feedback);
    }
    
    @PutMapping("/feedback/{feedbackId}/read")
    public ResponseEntity<Map<String, String>> markFeedbackAsRead(
            @PathVariable Long feedbackId,
            HttpServletRequest httpRequest) {
        
        User user = getCurrentUser(httpRequest);
        log.info("User {} marking feedback {} as read", user.getEmail(), feedbackId);
        
        feedbackService.markFeedbackAsRead(feedbackId, user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Feedback marked as read");
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/feedback/{feedbackId}/resolve")
    public ResponseEntity<Map<String, String>> markFeedbackAsResolved(
            @PathVariable Long feedbackId,
            HttpServletRequest httpRequest) {
        
        User user = getCurrentUser(httpRequest);
        log.info("User {} marking feedback {} as resolved", user.getEmail(), feedbackId);
        
        feedbackService.markFeedbackAsResolved(feedbackId, user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Feedback marked as resolved");
        return ResponseEntity.ok(response);
    }
    
    private User getCurrentUser(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
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