package com.project.backend.config;

import com.project.backend.service.AdminMonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class ScheduledTasks {

    // ✅ Manual Logger (Fixes 'variable log not found')
    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);
    
    private final AdminMonitoringService monitoringService;

    // Manual Constructor Injection
    public ScheduledTasks(AdminMonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleMetricsCleanup() {
        log.info("Starting scheduled cleanup of old metrics...");
        monitoringService.cleanupOldMetrics();
        log.info("Scheduled cleanup completed.");
    }
}