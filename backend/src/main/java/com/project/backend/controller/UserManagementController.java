package com.project.backend.controller;

import com.project.backend.dto.UserManagementDTO;
import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import com.project.backend.service.UserManagementService;
import com.project.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;             // ADDED
import org.slf4j.LoggerFactory;      // ADDED
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
// @Slf4j // REMOVED
public class UserManagementController {
    
    // ✅ ADDED MANUAL LOGGER
    private static final Logger log = LoggerFactory.getLogger(UserManagementController.class);

    private final UserManagementService userManagementService;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    
    /**
     * GET /api/admin/users
     * Get all users with statistics
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        log.info("Admin fetching all users");
        List<UserManagementDTO> users = userManagementService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * POST /api/admin/users
     * Create new user
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserManagementDTO> createUser(
            @RequestBody UserManagementDTO.UserCreateRequest request,
            HttpServletRequest httpRequest) {
        
        User admin = getCurrentUser(httpRequest);
        log.info("Admin {} creating new user: {}", admin.getEmail(), request.getEmail());
        
        UserManagementDTO created = userManagementService.createUser(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * PUT /api/admin/users/{id}/role
     * Update user role
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserManagementDTO> updateUserRole(
            @PathVariable Long id,
            @RequestParam String newRole,
            HttpServletRequest httpRequest) {
        
        User admin = getCurrentUser(httpRequest);
        log.info("Admin {} updating role for user {} to {}", admin.getEmail(), id, newRole);
        
        UserManagementDTO updated = userManagementService.updateUserRole(id, newRole, admin);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * PUT /api/admin/users/{id}/status
     * Toggle user status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserManagementDTO> toggleUserStatus(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        User admin = getCurrentUser(httpRequest);
        log.info("Admin {} toggling status for user {}", admin.getEmail(), id);
        
        UserManagementDTO updated = userManagementService.toggleUserStatus(id, admin);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * DELETE /api/admin/users/{id}
     * Delete user
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        User admin = getCurrentUser(httpRequest);
        log.info("Admin {} deleting user {}", admin.getEmail(), id);
        
        userManagementService.deleteUser(id, admin);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    /**
     * PUT /api/admin/users/{id}
     * Update user details
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserManagementDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserManagementDTO updateRequest,
            HttpServletRequest httpRequest) {
        
        User admin = getCurrentUser(httpRequest);
        log.info("Admin {} updating user {}", admin.getEmail(), id);
        
        // Logic would go here
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User update endpoint");
        return ResponseEntity.ok().build();
    }
    
    /**
     * Helper methods
     */
    private User getCurrentUser(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        String email = jwtUtil.extractUsername(token); // ✅ Use extractUsername or extractEmail based on your JwtUtil
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