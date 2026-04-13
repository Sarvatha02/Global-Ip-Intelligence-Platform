package com.project.backend.controller;

import com.project.backend.entity.User;
import com.project.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
 
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        // Return sanitized list
        List<Map<String, Object>> safeUsers = userService.getAllUsers().stream()
                .map(this::sanitizeUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(safeUsers);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User newUser) {
        try {
            User savedUser = userService.createUser(newUser);
            return ResponseEntity.ok(sanitizeUser(savedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody User userUpdates) {
        try {
            User updatedUser = userService.updateUserProfile(id, userUpdates);
            return ResponseEntity.ok(sanitizeUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Update failed: " + e.getMessage()));
        }
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("userId") Long userId, @RequestParam("file") MultipartFile file) {
        try {
            String avatarUrl = userService.saveAvatar(userId, file);
            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Avatar upload failed: " + e.getMessage()));
        }
    }

    // --- 🟢 DELETE AVATAR ENDPOINT ---
    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable Long id) {
        try {
            userService.deleteAvatar(id);
            return ResponseEntity.ok(Map.of("message", "Avatar removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to remove avatar: " + e.getMessage()));
        }
    }

    // [Security Helper] Filter out sensitive fields (Password/Tokens)
    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> safeUser = new HashMap<>();
        safeUser.put("id", user.getId());
        safeUser.put("name", user.getName());
        safeUser.put("email", user.getEmail());
        safeUser.put("userType", user.getUserType());
        safeUser.put("avatar", user.getAvatar());
        safeUser.put("bio", user.getBio());
        safeUser.put("phone", user.getPhone());
        safeUser.put("jobTitle", user.getJobTitle());
        safeUser.put("company", user.getCompany());
        safeUser.put("location", user.getLocation());
        safeUser.put("linkedin", user.getLinkedin());
        safeUser.put("website", user.getWebsite());
        // Subscription fields
        safeUser.put("planType", user.getPlanType());
        safeUser.put("renewalDate", user.getRenewalDate());
        safeUser.put("billingCycle", user.getBillingCycle());
        safeUser.put("amountPaid", user.getAmountPaid());
        
        return safeUser;
    }
}