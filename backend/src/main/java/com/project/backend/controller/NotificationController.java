package com.project.backend.controller;

import com.project.backend.entity.Notification;
import com.project.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationService notificationService;

    // ✅ GET NOTIFICATIONS: Returns Unread + Recent History (2 Days)
    // Used by the Dashboard Bell Icon
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // ✅ MARK AS READ
    // Called when a user clicks a notification in the UI
    @PutMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Read");
    }

    // ✅ NOTIFY ADMIN
    // Called when a User sets up alerts for a filing in the Tracker
    @PostMapping("/notify-admin")
    public ResponseEntity<?> notifyAdmin(@RequestBody Map<String, Object> payload) {
        try {
            String userEmail = (String) payload.get("userEmail");
            String filingId = (String) payload.get("filingId");
            
            // Handle triggers safely (default to "General" if null)
            String triggers = payload.get("triggers") != null ? payload.get("triggers").toString() : "General";

            notificationService.sendAdminAlert(userEmail, filingId, triggers);
            return ResponseEntity.ok("Admin notified");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}