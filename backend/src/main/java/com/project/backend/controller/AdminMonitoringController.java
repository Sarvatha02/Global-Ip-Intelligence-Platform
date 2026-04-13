package com.project.backend.controller;

import com.project.backend.dto.*;
import com.project.backend.service.AdminMonitoringService;
import com.project.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j; // REMOVED LOMBOK LOGGER
import org.slf4j.Logger;             // ADDED MANUAL LOGGER
import org.slf4j.LoggerFactory;      // ADDED MANUAL LOGGER
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/monitoring")
@RequiredArgsConstructor
// @Slf4j // REMOVED
public class AdminMonitoringController {
    
    // ✅ ADDED MANUAL LOGGER
    private static final Logger log = LoggerFactory.getLogger(AdminMonitoringController.class);

    private final AdminMonitoringService monitoringService;
    private final JwtUtil jwtUtil;
    
    /**
     * GET /api/admin/monitoring/health/snapshot
     * Get current API health snapshot for dashboard
     */
    @GetMapping("/health/snapshot")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIHealthDTO.HealthSnapshot> getHealthSnapshot() {
        log.info("Fetching API health snapshot");
        APIHealthDTO.HealthSnapshot snapshot = monitoringService.getAPIHealthSnapshot();
        return ResponseEntity.ok(snapshot);
    }
    
    /**
     * GET /api/admin/monitoring/health/timeseries
     * Get API health metrics time series for charts
     */
    @GetMapping("/health/timeseries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<APIHealthDTO.MetricDataPoint>> getHealthTimeSeries(
            @RequestParam(defaultValue = "24") int hours) {
        log.info("Fetching API health time series for {} hours", hours);
        List<APIHealthDTO.MetricDataPoint> timeSeries = 
            monitoringService.getAPIHealthTimeSeries(hours);
        return ResponseEntity.ok(timeSeries);
    }
    
    /**
     * GET /api/admin/monitoring/health/endpoints
     * Get endpoint performance statistics
     */
    @GetMapping("/health/endpoints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<APIHealthDTO.EndpointStats>> getEndpointStatistics() {
        log.info("Fetching endpoint statistics");
        List<APIHealthDTO.EndpointStats> stats = monitoringService.getEndpointStatistics();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * GET /api/admin/monitoring/activity/trends
     * Get user activity trends
     */
    @GetMapping("/activity/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserActivityDTO.ActivityTrend>> getActivityTrends(
            @RequestParam(defaultValue = "7") int days) {
        log.info("Fetching activity trends for {} days", days);
        List<UserActivityDTO.ActivityTrend> trends = 
            monitoringService.getActivityTrends(days);
        return ResponseEntity.ok(trends);
    }
    
    /**
     * GET /api/admin/monitoring/dashboard/stats
     * Get complete dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        log.info("Fetching complete dashboard statistics");
        DashboardStatsDTO stats = monitoringService.getDashboardStatistics();
        return ResponseEntity.ok(stats);
    }
}