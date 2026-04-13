package com.project.backend.controller;

import com.project.backend.entity.Subscription;
import com.project.backend.entity.User;
import com.project.backend.repository.SubscriptionRepository;
import com.project.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            String planName = (String) payload.get("planName");
            String billingCycle = (String) payload.get("billingCycle");
            String paymentId = (String) payload.get("paymentId");
            Double amount = Double.valueOf(payload.get("amount").toString());

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Deactivate previous active subscriptions
            List<Subscription> activeSubs = subscriptionRepository.findAll(); 
            for (Subscription s : activeSubs) {
                if (s.getUser().getId().equals(userId) && "ACTIVE".equals(s.getStatus())) {
                    s.setStatus("INACTIVE");
                    subscriptionRepository.save(s);
                }
            }

            Subscription sub = new Subscription();
            sub.setUser(user);
            sub.setPlanName(planName);
            sub.setBillingCycle(billingCycle);
            sub.setPaymentId(paymentId);
            sub.setAmountPaid(amount);
            sub.setStartDate(LocalDateTime.now());
            sub.setStatus("ACTIVE");
            sub.setIpAsset(null); // Explicitly setting null

            if ("MONTHLY".equalsIgnoreCase(billingCycle)) {
                sub.setEndDate(LocalDateTime.now().plusMonths(1));
            } else {
                sub.setEndDate(LocalDateTime.now().plusYears(1));
            }

            subscriptionRepository.save(sub);

            // Update User Plan
            user.setPlanType(planName);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Subscription successful", "plan", planName));

        } catch (Exception e) {
            e.printStackTrace(); // Logs error to console for debugging
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancel(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Subscription> activeSubs = subscriptionRepository.findAll();
            for (Subscription s : activeSubs) {
                if (s.getUser().getId().equals(userId) && "ACTIVE".equals(s.getStatus())) {
                    s.setStatus("CANCELLED");
                    subscriptionRepository.save(s);
                }
            }

            user.setPlanType("STARTUP");
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Subscription cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}