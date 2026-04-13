package com.project.backend.service;

import com.project.backend.dto.*;
import com.project.backend.entity.*;
import com.project.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminMonitoringService {
    
    private static final Logger log = LoggerFactory.getLogger(AdminMonitoringService.class);
    
    private final APIHealthMetricRepository healthMetricRepo;
    private final UserActivityRepository activityRepo;
    private final UserRepository userRepo;
    private final IPAssetRepository patentRepo;
    private final UserFilingRepository filingRepo;
    private final SystemMetricRepository systemMetricRepo;
    
    public APIHealthDTO.HealthSnapshot getAPIHealthSnapshot() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        
        Double uptime = healthMetricRepo.getUptimePercentage(last24Hours);
        Double avgResponseTime = healthMetricRepo.getAverageResponseTime(last24Hours);
        Long totalRequests = healthMetricRepo.countRequestsBetween(last24Hours, LocalDateTime.now());
        Long errorCount = healthMetricRepo.countErrorsBetween(last24Hours, LocalDateTime.now());
        
        Double errorRate = totalRequests > 0 ? 
            (errorCount.doubleValue() / totalRequests.doubleValue()) * 100 : 0.0;
        
        return APIHealthDTO.HealthSnapshot.builder()
            .uptimePercentage(uptime != null ? uptime : 0.0)
            .averageResponseTime(avgResponseTime != null ? avgResponseTime.intValue() : 0)
            .totalRequests(totalRequests)
            .errorCount(errorCount)
            .errorRate(errorRate)
            .lastUpdated(LocalDateTime.now())
            .build();
    }
    
    public List<APIHealthDTO.MetricDataPoint> getAPIHealthTimeSeries(int hours) {
        LocalDateTime startTime = LocalDateTime.now().minusHours(hours);
        List<APIHealthMetric> metrics = healthMetricRepo
            .findByTimestampBetweenOrderByTimestampAsc(startTime, LocalDateTime.now());
        
        Map<String, List<APIHealthMetric>> groupedByHour = metrics.stream()
            .collect(Collectors.groupingBy(m -> 
                m.getTimestamp().format(DateTimeFormatter.ofPattern("HH:00"))
            ));
        
        return groupedByHour.entrySet().stream()
            .map(entry -> {
                List<APIHealthMetric> hourMetrics = entry.getValue();
                int avgResponse = (int) hourMetrics.stream()
                    .mapToInt(APIHealthMetric::getResponseTime)
                    .average()
                    .orElse(0);
                long requests = hourMetrics.size();
                long errors = hourMetrics.stream()
                    .filter(m -> !m.getSuccess())
                    .count();
                
                return APIHealthDTO.MetricDataPoint.builder()
                    .time(entry.getKey())
                    .responseTime(avgResponse)
                    .requests(requests)
                    .errors(errors)
                    .build();
            })
            .sorted(Comparator.comparing(APIHealthDTO.MetricDataPoint::getTime))
            .collect(Collectors.toList());
    }
    
    public List<APIHealthDTO.EndpointStats> getEndpointStatistics() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<APIHealthMetric> metrics = healthMetricRepo
            .findByTimestampBetweenOrderByTimestampAsc(last24Hours, LocalDateTime.now());
        
        Map<String, List<APIHealthMetric>> groupedByEndpoint = metrics.stream()
            .collect(Collectors.groupingBy(APIHealthMetric::getEndpoint));
        
        return groupedByEndpoint.entrySet().stream()
            .map(entry -> {
                List<APIHealthMetric> endpointMetrics = entry.getValue();
                long count = endpointMetrics.size();
                double avgResponse = endpointMetrics.stream()
                    .mapToInt(APIHealthMetric::getResponseTime)
                    .average()
                    .orElse(0);
                long errors = endpointMetrics.stream()
                    .filter(m -> !m.getSuccess())
                    .count();
                double errorRate = (errors * 100.0) / count;
                
                return APIHealthDTO.EndpointStats.builder()
                    .endpoint(entry.getKey())
                    .requestCount(count)
                    .avgResponseTime(avgResponse)
                    .errorRate(errorRate)
                    .build();
            })
            .sorted(Comparator.comparing(APIHealthDTO.EndpointStats::getRequestCount).reversed())
            .limit(10)  
            .collect(Collectors.toList());
    }
    
    public List<UserActivityDTO.ActivityTrend> getActivityTrends(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        
        List<UserActivity> activities = activityRepo
            .findByTimestampBetweenOrderByTimestampDesc(startDate, LocalDateTime.now());
        
        Map<String, Map<String, Long>> dailyActivityMap = new HashMap<>();
        
        for (UserActivity activity : activities) {
            String date = activity.getTimestamp().toLocalDate().toString();
            dailyActivityMap.putIfAbsent(date, new HashMap<>());
            Map<String, Long> dayMap = dailyActivityMap.get(date);
            dayMap.merge(activity.getActivityType(), 1L, Long::sum);
        }
        
        return dailyActivityMap.entrySet().stream()
            .map(entry -> {
                Map<String, Long> dayActivities = entry.getValue();
                return UserActivityDTO.ActivityTrend.builder()
                    .date(entry.getKey())
                    .logins(dayActivities.getOrDefault("LOGIN", 0L))
                    .searches(dayActivities.getOrDefault("SEARCH", 0L))
                    .filings(dayActivities.getOrDefault("FILING_CREATE", 0L) + 
                            dayActivities.getOrDefault("FILING_UPDATE", 0L))
                    .totalActivities(dayActivities.values().stream().mapToLong(Long::longValue).sum())
                    .build();
            })
            .sorted(Comparator.comparing(UserActivityDTO.ActivityTrend::getDate))
            .collect(Collectors.toList());
    }
    
    public DashboardStatsDTO getDashboardStatistics() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        
        long totalUsers = userRepo.count();
        long activeUsers = activityRepo.countUniqueActiveUsers(last24Hours, LocalDateTime.now());
        long totalPatents = patentRepo.count();
        long totalFilings = filingRepo.count();
        long pendingFilings = filingRepo.countByStatus("Pending");
        
        APIHealthDTO.HealthSnapshot apiHealth = getAPIHealthSnapshot();
        
        List<UserActivityDTO.ActivityTrend> activityTrends = getActivityTrends(7);
        
        // Ensure IPAssetRepository has this method or remove this section
        List<Object[]> statusCounts = patentRepo.countByStatusGrouped();
        List<DashboardStatsDTO.PatentStatusCount> patentStatuses = statusCounts.stream()
            .map(row -> DashboardStatsDTO.PatentStatusCount.builder()
                .status((String) row[0])
                .count((Long) row[1])
                .build())
            .collect(Collectors.toList());
        
        return DashboardStatsDTO.builder()
            .totalUsers(totalUsers)
            .activeUsers(activeUsers)
            .totalPatents(totalPatents)
            .totalFilings(totalFilings)
            .pendingFilings(pendingFilings)
            .apiHealth(apiHealth)
            .activityTrends(activityTrends)
            .patentStatuses(patentStatuses)
            .build();
    }
    
    @Transactional
    public void logAPIMetric(String endpoint, String method, int responseTime, 
                            int statusCode, String errorMessage, Long userId, String ipAddress) {
        
        // Manual Builder usage since Lombok is removed from Entity
        APIHealthMetric metric = new APIHealthMetric();
        metric.setTimestamp(LocalDateTime.now());
        metric.setEndpoint(endpoint);
        metric.setMethod(method);
        metric.setResponseTime(responseTime);
        metric.setStatusCode(statusCode);
        metric.setSuccess(statusCode < 400);
        metric.setErrorMessage(errorMessage);
        metric.setUserId(userId);
        metric.setIpAddress(ipAddress);
        
        healthMetricRepo.save(metric);
    }
    
    @Transactional
    public void cleanupOldMetrics() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        healthMetricRepo.deleteByTimestampBefore(cutoff);
        activityRepo.deleteByTimestampBefore(cutoff);
        systemMetricRepo.deleteByTimestampBefore(cutoff);
        log.info("Cleaned up metrics older than {}", cutoff);
    }
}