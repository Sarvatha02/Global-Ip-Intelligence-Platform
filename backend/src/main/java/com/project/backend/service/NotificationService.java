package com.project.backend.service;

import com.project.backend.entity.Notification;
import com.project.backend.entity.User;
import com.project.backend.entity.UserFiling;
import com.project.backend.entity.IPAsset;
import com.project.backend.repository.NotificationRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.repository.IPAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private IPAssetRepository ipAssetRepository;
    @Autowired private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public List<Notification> getUserNotifications(Integer userId) {
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
        return notificationRepository.findRecentNotifications(userId, twoDaysAgo);
    }

    @Transactional
    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendAlert(Integer userId, Integer assetId, String message, String type) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        IPAsset asset = (assetId != null) ? ipAssetRepository.findById(assetId).orElse(null) : null;

        Notification note = new Notification();
        note.setUser(user);
        note.setIpAsset(asset);
        note.setMessage(message);
        note.setType(type);
        note.setIsRead(false);
        notificationRepository.save(note);

        sendEmailToUser(user.getEmail(), "IP Filing Update: " + type, message);
    }

    // ✅ ADDED: Method for Filing Feedback Service
    @Transactional
    public void sendFilingStatusUpdateNotification(User user, UserFiling filing, String oldStatus, String newStatus) {
        String message = "Filing " + filing.getApplicationNumber() + " status updated from " + oldStatus + " to " + newStatus;
        // Fix: Convert Long to Integer
        sendAlert(user.getId().intValue(), null, message, "STATUS_UPDATE");
    }

    // ✅ ADDED: Method for Feedback creation
    @Transactional
    public void sendFilingFeedbackNotification(User user, Object feedback) {
        // Just a wrapper to alert user about generic feedback
        sendAlert(user.getId().intValue(), null, "You have new feedback on your filing.", "FEEDBACK");
    }

    @Transactional
    public void sendAdminAlert(String userEmail, String filingId, String triggers) {
        User admin = userRepository.findByEmail("bhuvananagarajan0728@gmail.com").orElse(null);
        if (admin != null) {
            Notification note = new Notification();
            note.setUser(admin);
            note.setType("User Alert Request");
            note.setMessage("User " + userEmail + " requested alerts [" + triggers + "] for filing " + filingId);
            note.setIsRead(false);
            notificationRepository.save(note);
            
            String emailBody = "User " + userEmail + " has requested alerts for Filing ID " + filingId + ":\n\n" + triggers;
            sendEmailToUser(admin.getEmail(), "New Alert Request", emailBody);
        }
    }

    private void sendEmailToUser(String toEmail, String subject, String body) {
        try {
            if (toEmail != null && !toEmail.isEmpty()) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(fromEmail);
                mailMessage.setTo(toEmail);
                mailMessage.setSubject(subject);
                mailMessage.setText(body + "\n\n- Global IP Intelligence Team");
                mailSender.send(mailMessage);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }
}