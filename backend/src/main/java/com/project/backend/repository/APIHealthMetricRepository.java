package com.project.backend.repository;

import com.project.backend.entity.APIHealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface APIHealthMetricRepository extends JpaRepository<APIHealthMetric, Long> {
    
    // Find all metrics within time range for dashboard charts
    List<APIHealthMetric> findByTimestampBetweenOrderByTimestampAsc(
        LocalDateTime start, 
        LocalDateTime end
    );
    
    // Get metrics for specific endpoint
    List<APIHealthMetric> findByEndpointAndTimestampBetween(
        String endpoint, 
        LocalDateTime start, 
        LocalDateTime end
    );
    
    // Calculate average response time for last 24 hours
    @Query("SELECT AVG(m.responseTime) FROM APIHealthMetric m " +
           "WHERE m.timestamp >= :since")
    Double getAverageResponseTime(@Param("since") LocalDateTime since);
    
    // Count total requests in time range
    @Query("SELECT COUNT(m) FROM APIHealthMetric m " +
           "WHERE m.timestamp BETWEEN :start AND :end")
    Long countRequestsBetween(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    // Count errors in time range
    @Query("SELECT COUNT(m) FROM APIHealthMetric m " +
           "WHERE m.success = false AND m.timestamp BETWEEN :start AND :end")
    Long countErrorsBetween(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    // Get uptime percentage (successful requests / total requests)
    @Query("SELECT (CAST(SUM(CASE WHEN m.success = true THEN 1 ELSE 0 END) AS double) / COUNT(m)) * 100 " +
           "FROM APIHealthMetric m WHERE m.timestamp >= :since")
    Double getUptimePercentage(@Param("since") LocalDateTime since);
    
    // Get most frequently called endpoints
    @Query("SELECT m.endpoint, COUNT(m) as count FROM APIHealthMetric m " +
           "WHERE m.timestamp >= :since " +
           "GROUP BY m.endpoint ORDER BY count DESC")
    List<Object[]> getTopEndpoints(@Param("since") LocalDateTime since);
    
    // Delete old metrics (cleanup - keep last 30 days only)
    void deleteByTimestampBefore(LocalDateTime timestamp);
}
