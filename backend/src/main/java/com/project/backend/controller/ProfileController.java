package com.project.backend.controller;

import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    @PutMapping("/users/profile")
    // Use Map<String, Object> to handle both String (email) and Numbers (id)
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updateData) {
        
        // 1. CHECK FOR ID
        if (!updateData.containsKey("id")) {
             return ResponseEntity.badRequest().body(Map.of("message", "User ID is missing in the request."));
        }

        // 2. FIND USER BY ID (Safe & Stable)
        Long userId = Long.valueOf(updateData.get("id").toString());
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found with ID: " + userId));
        }

        User user = userOptional.get();
        boolean changesMade = false;

        // 3. GET NEW DATA
        String newName = (String) updateData.get("name");
        String newEmail = (String) updateData.get("email");
        String newBio = (String) updateData.getOrDefault("bio", "");

        // 4. UPDATE NAME
        if (newName != null && !newName.isBlank() && !user.getName().equals(newName)) {
            user.setName(newName);
            changesMade = true;
        }

        // 5. UPDATE EMAIL (With Duplicate Check)
        if (newEmail != null && !newEmail.isBlank() && !user.getEmail().equals(newEmail)) {
            // Check if ANYONE ELSE has this email
            if (userRepository.existsByEmail(newEmail)) {
                 return ResponseEntity.status(409).body(Map.of(
                     "message", "This email is already taken by another user."
                 ));
            }
            user.setEmail(newEmail);
            changesMade = true;
        }
        
        // 6. SAVE
        User savedUser = user;
        if (changesMade) {
            savedUser = userRepository.save(user); 
        }

        // 7. RETURN SUCCESS
        return ResponseEntity.ok(Map.of(
            "message", "Profile updated successfully.",
            "user", Map.of(
                "id", savedUser.getId(),
                "name", savedUser.getName(),
                "email", savedUser.getEmail(),
                "userType", savedUser.getUserType(),
                "bio", newBio 
            )
        ));
    }
}