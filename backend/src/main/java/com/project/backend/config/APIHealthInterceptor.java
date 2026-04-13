package com.project.backend.config;

import com.project.backend.entity.User;
import com.project.backend.service.AdminMonitoringService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class APIHealthInterceptor implements HandlerInterceptor {

    private final AdminMonitoringService monitoringService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) {
        try {
            long startTime = (Long) request.getAttribute("startTime");
            int duration = (int) (System.currentTimeMillis() - startTime);

            String endpoint = request.getRequestURI();
            String method = request.getMethod();
            int status = response.getStatus();
            
            Long userId = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                userId = ((User) auth.getPrincipal()).getId();
            } else if (auth != null && auth.getPrincipal() instanceof Map) {
                try {
                    Map<?, ?> principal = (Map<?, ?>) auth.getPrincipal();
                    userId = Long.valueOf(principal.get("id").toString());
                } catch (Exception ignored) {}
            }

            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }

            String errorMessage = null;
            if (ex != null) {
                errorMessage = ex.getMessage();
            } else if (status >= 400) {
                errorMessage = "HTTP Error " + status;
            }

            monitoringService.logAPIMetric(
                endpoint,
                method,
                duration,
                status,
                errorMessage,
                userId,
                ipAddress
            );

        } catch (Exception e) {
            System.err.println("Failed to log API metric: " + e.getMessage());
        }
    }
}