package com.project.backend.service;

import com.project.backend.entity.Subscription;
import com.project.backend.entity.User;
import com.project.backend.repository.SubscriptionRepository;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    // --- CREATE SUBSCRIPTION ---
    @Transactional
    public Subscription createSubscription(Long userId, String planName, String billingCycle, Double amount, String paymentId) {
        System.out.println("Processing subscription for User: " + userId + " Plan: " + planName);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // 1. Create History Record
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlanName(planName);
        sub.setBillingCycle(billingCycle);
        sub.setAmountPaid(amount);
        sub.setPaymentId(paymentId);
        sub.setStatus("ACTIVE");
        sub.setStartDate(LocalDateTime.now());

        if ("yearly".equalsIgnoreCase(billingCycle)) {
            sub.setEndDate(LocalDateTime.now().plusYears(1));
        } else {
            sub.setEndDate(LocalDateTime.now().plusDays(30));
        }

        Subscription savedSub = subscriptionRepository.save(sub);

        // 2. Update User Profile
        user.setPlanType(planName);
        user.setSubscriptionDate(LocalDateTime.now());
        user.setAmountPaid(amount);
        user.setBillingCycle(billingCycle);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        user.setRenewalDate(sub.getEndDate().format(formatter));
        
        userRepository.saveAndFlush(user); // Force write

        return savedSub;
    }

    // --- CANCEL SUBSCRIPTION ---
    @Transactional
    public void cancelSubscription(Long userId) {
        System.out.println("🔄 Service: Cancelling subscription for User ID: " + userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // 1. Revert User to Free / Startup
        user.setPlanType("STARTUP"); 
        user.setRenewalDate(null);
        user.setBillingCycle(null);
        user.setAmountPaid(0.0);
        user.setSubscriptionDate(null);

        // 2. Force Save to User Table
        userRepository.saveAndFlush(user);

        // 3. 🟢 OPTIONAL: Mark most recent subscription as Cancelled in History
        // (This is purely for your records in the subscriptions table to keep history clean)
        // Note: You would need a custom query in SubscriptionRepository to find the active one.
        // Example: subscriptionRepository.markLatestAsCancelled(userId); 

        System.out.println("✅ User " + userId + " reverted to STARTUP plan.");
    }
}