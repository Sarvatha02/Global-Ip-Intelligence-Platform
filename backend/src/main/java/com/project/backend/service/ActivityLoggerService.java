package com.project.backend.service;

import com.project.backend.entity.User;
import com.project.backend.entity.UserActivity;
import com.project.backend.repository.UserActivityRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ActivityLoggerService {
    
    private static final Logger log = LoggerFactory.getLogger(ActivityLoggerService.class);
    
    private final UserActivityRepository activityRepo;
    
    @Async
    @Transactional
    public void logActivity(User user, String activityType, String details) {
        logActivity(user, activityType, details, null, null);
    }
    
    @Async
    @Transactional
    public void logActivity(User user, String activityType, String details, 
                            Long relatedEntityId, String relatedEntityType) {
        try {
            String ipAddress = null;
            String userAgent = null;
            
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = getClientIP(request);
                userAgent = request.getHeader("User-Agent");
            }
            
            // Manual object creation instead of Builder
            UserActivity activity = new UserActivity();
            activity.setUser(user);
            activity.setTimestamp(LocalDateTime.now());
            activity.setActivityType(activityType);
            activity.setDetails(details);
            activity.setIpAddress(ipAddress);
            activity.setUserAgent(userAgent);
            activity.setRelatedEntityId(relatedEntityId);
            activity.setRelatedEntityType(relatedEntityType);
            
            activityRepo.save(activity);
            
            log.debug("Logged activity: {} for user: {}", activityType, user.getEmail());
            
        } catch (Exception e) {
            log.error("Failed to log activity for user: {}", user.getEmail(), e);
        }
    }
    
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}