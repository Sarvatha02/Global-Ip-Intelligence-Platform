package com.project.backend.service;

import com.project.backend.dto.FilingFeedbackDTO;
import com.project.backend.entity.FilingFeedback;
import com.project.backend.entity.User;
import com.project.backend.entity.UserFiling;
import com.project.backend.repository.FilingFeedbackRepository;
import com.project.backend.repository.UserFilingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilingFeedbackService {
    
    // ✅ Manual Logger (Fixes "variable log not found")
    private static final Logger log = LoggerFactory.getLogger(FilingFeedbackService.class);
    
    private final FilingFeedbackRepository feedbackRepo;
    private final UserFilingRepository filingRepo;
    private final NotificationService notificationService;
    private final ActivityLoggerService activityLogger;
    
    /**
     * Create new feedback for a filing
     */
    @Transactional
    public FilingFeedbackDTO createFeedback(FilingFeedbackDTO.CreateFeedbackRequest request, User admin) {
        UserFiling filing = filingRepo.findById(request.getFilingId())
            .orElseThrow(() -> new RuntimeException("Filing not found"));
        
        FilingFeedback feedback = new FilingFeedback();
        feedback.setFiling(filing);
        feedback.setAdmin(admin);
        feedback.setTimestamp(LocalDateTime.now());
        feedback.setFeedbackType(request.getFeedbackType());
        feedback.setMessage(request.getMessage());
        
        // Handle List<String> to String conversion for DB
        if (request.getFieldsToUpdate() != null) {
            feedback.setFieldsToUpdate(String.join(",", request.getFieldsToUpdate()));
        }
        
        feedback.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        feedback.setIsRead(false);
        feedback.setIsResolved(false);
        
        FilingFeedback saved = feedbackRepo.save(feedback);
        
        // Send notification (Safe integer conversion)
        if (filing.getUser() != null) {
            notificationService.sendAlert(
                filing.getUser().getId().intValue(), 
                null, 
                "New Feedback: " + request.getFeedbackType(), 
                "FEEDBACK"
            );
        }
        
        // Log activity
        activityLogger.logActivity(admin, "FEEDBACK_CREATE", 
            "Created feedback for filing: " + filing.getApplicationNumber(),
            filing.getId(), "FILING");
        
        log.info("Admin {} created feedback for filing {}", admin.getEmail(), filing.getApplicationNumber());
        
        return convertToDTO(saved);
    }
    
    /**
     * Update filing status and send feedback
     */
    @Transactional
    public FilingFeedbackDTO updateFilingStatusWithFeedback(Long filingId, FilingFeedbackDTO.FilingStatusUpdate request, User admin) {
        UserFiling filing = filingRepo.findById(filingId)
            .orElseThrow(() -> new RuntimeException("Filing not found"));
        
        String oldStatus = filing.getStatus();
        filing.setStatus(request.getNewStatus());
        filing.setUpdatedAt(LocalDateTime.now());
        filingRepo.save(filing);
        
        FilingFeedback feedback = new FilingFeedback();
        feedback.setFiling(filing);
        feedback.setAdmin(admin);
        feedback.setTimestamp(LocalDateTime.now());
        feedback.setFeedbackType("STATUS_UPDATE");
        feedback.setMessage(request.getFeedbackMessage());
        
        if (request.getFieldsToUpdate() != null) {
            feedback.setFieldsToUpdate(String.join(",", request.getFieldsToUpdate()));
        }
        
        feedback.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        feedback.setIsRead(false);
        feedback.setIsResolved(false);
        
        FilingFeedback saved = feedbackRepo.save(feedback);
        
        // Send notification
        if (filing.getUser() != null) {
            notificationService.sendFilingStatusUpdateNotification(
                filing.getUser(), filing, oldStatus, request.getNewStatus());
        }
        
        // Log activity
        activityLogger.logActivity(admin, "FILING_STATUS_UPDATE", 
            String.format("Updated filing %s status from %s to %s", 
                filing.getApplicationNumber(), oldStatus, request.getNewStatus()),
            filing.getId(), "FILING");
        
        log.info("Admin {} updated filing {} status to {}", 
            admin.getEmail(), filing.getApplicationNumber(), request.getNewStatus());
        
        return convertToDTO(saved);
    }
    
    public List<FilingFeedbackDTO> getFeedbackForFiling(Long filingId) {
        UserFiling filing = filingRepo.findById(filingId)
            .orElseThrow(() -> new RuntimeException("Filing not found"));
        
        return feedbackRepo.findByFilingOrderByTimestampDesc(filing).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<FilingFeedbackDTO> getUnreadFeedback(User user) {
        return feedbackRepo.findUnreadFeedbackForUser(user).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<FilingFeedbackDTO> getUnresolvedFeedback(User user) {
        return feedbackRepo.findUnresolvedFeedbackForUser(user).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void markFeedbackAsRead(Long feedbackId, User user) {
        FilingFeedback feedback = feedbackRepo.findById(feedbackId)
            .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        if (!feedback.getFiling().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        feedback.setIsRead(true);
        feedbackRepo.save(feedback);
    }
    
    @Transactional
    public void markFeedbackAsResolved(Long feedbackId, User user) {
        FilingFeedback feedback = feedbackRepo.findById(feedbackId)
            .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        if (!feedback.getFiling().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        feedback.setIsResolved(true);
        feedbackRepo.save(feedback);
        
        activityLogger.logActivity(user, "FEEDBACK_RESOLVED", 
            "Resolved feedback for filing: " + feedback.getFiling().getApplicationNumber(),
            feedback.getFiling().getId(), "FILING");
    }
    
    /**
     * Convert entity to DTO manually
     */
    private FilingFeedbackDTO convertToDTO(FilingFeedback feedback) {
        FilingFeedbackDTO.Builder builder = FilingFeedbackDTO.builder()
            .id(feedback.getId())
            .filingId(feedback.getFiling().getId())
            .filingTitle(feedback.getFiling().getTitle())
            .applicationNumber(feedback.getFiling().getApplicationNumber())
            .adminId(feedback.getAdmin().getId())
            .adminName(feedback.getAdmin().getName())
            .timestamp(feedback.getTimestamp())
            .feedbackType(feedback.getFeedbackType())
            .message(feedback.getMessage())
            .priority(feedback.getPriority())
            .isRead(feedback.getIsRead())
            .isResolved(feedback.getIsResolved());

        if (feedback.getFieldsToUpdate() != null && !feedback.getFieldsToUpdate().isEmpty()) {
            builder.fieldsToUpdate(List.of(feedback.getFieldsToUpdate().split(",")));
        } else {
            builder.fieldsToUpdate(List.of());
        }

        return builder.build();
    }
}