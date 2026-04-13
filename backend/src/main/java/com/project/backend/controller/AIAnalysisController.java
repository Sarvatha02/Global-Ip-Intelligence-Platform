package com.project.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.project.backend.service.AIAnalysisService;
import com.project.backend.dto.AIQueryRequest;
import com.project.backend.dto.AIQueryResponse;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
// @CrossOrigin(origins = "*") // Handled globally now
public class AIAnalysisController {
    
    @Autowired
    private AIAnalysisService aiAnalysisService;
    
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeWithAI(@Valid @RequestBody AIQueryRequest request, Authentication auth) {
        try {
            // ✅ FIX: Force usage of authenticated user from Token
            if (auth == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User authentication required"));
            }
            
            String userId = auth.getName(); // Extracts email from JWT Token
            
            AIQueryResponse response = aiAnalysisService.analyzeWithGemini(request.getQuery(), userId);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Analysis failed. Please try again later."));
        }
    }
    
    // ✅ FIX: Removed {userId} from URL path. Now strictly uses Token.
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Access denied"));
            }
            
            String userId = auth.getName(); // Extracts email from JWT Token
            return ResponseEntity.ok(aiAnalysisService.getHistory(userId));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch history"));
        }
    }
    
    @DeleteMapping("/history/{queryId}")
    public ResponseEntity<?> deleteQuery(@PathVariable Long queryId, Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
            }
            String userId = auth.getName();
            aiAnalysisService.deleteQuery(queryId, userId);
            return ResponseEntity.ok(Map.of("message", "Query deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}