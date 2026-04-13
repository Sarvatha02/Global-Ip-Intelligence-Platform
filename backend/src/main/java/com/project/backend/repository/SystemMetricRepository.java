package com.project.backend.repository;

import com.project.backend.entity.SystemMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemMetricRepository extends JpaRepository<SystemMetric, Long> {
    
    // Get metrics within time range
    List<SystemMetric> findByTimestampBetweenOrderByTimestampAsc(
        LocalDateTime start, 
        LocalDateTime end
    );
    
    // Get latest system metric
    SystemMetric findTopByOrderByTimestampDesc();
    
    // Calculate average CPU usage
    @Query("SELECT AVG(m.cpuUsage) FROM SystemMetric m " +
           "WHERE m.timestamp >= :since")
    Double getAverageCpuUsage(@Param("since") LocalDateTime since);
    
    // Calculate average memory usage
    @Query("SELECT AVG(m.memoryUsed) FROM SystemMetric m " +
           "WHERE m.timestamp >= :since")
    Double getAverageMemoryUsage(@Param("since") LocalDateTime since);
    
    // Delete old metrics (cleanup)
    void deleteByTimestampBefore(LocalDateTime timestamp);
}