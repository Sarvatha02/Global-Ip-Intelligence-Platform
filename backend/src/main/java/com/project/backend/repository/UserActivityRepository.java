package com.project.backend.repository;

import com.project.backend.entity.User;
import com.project.backend.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    
    // Get all activities for a specific user
    List<UserActivity> findByUserOrderByTimestampDesc(User user);
    
    // Get activities within time range
    List<UserActivity> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime start, 
        LocalDateTime end
    );
    
    // Get activities for specific user in time range
    List<UserActivity> findByUserAndTimestampBetween(
        User user, 
        LocalDateTime start, 
        LocalDateTime end
    );
    
    // Count activities by type in time range
    @Query("SELECT a.activityType, COUNT(a) FROM UserActivity a " +
           "WHERE a.timestamp BETWEEN :start AND :end " +
           "GROUP BY a.activityType")
    List<Object[]> countActivitiesByType(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    // Get daily activity counts for trend analysis
    @Query("SELECT FUNCTION('DATE', a.timestamp) as date, COUNT(a) as count " +
           "FROM UserActivity a " +
           "WHERE a.timestamp BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE', a.timestamp) " +
           "ORDER BY date")
    List<Object[]> getDailyActivityCounts(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    // Count unique active users in time range
    @Query("SELECT COUNT(DISTINCT a.user) FROM UserActivity a " +
           "WHERE a.timestamp BETWEEN :start AND :end")
    Long countUniqueActiveUsers(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    // Get most active users (by activity count)
    @Query("SELECT a.user, COUNT(a) as activityCount FROM UserActivity a " +
           "WHERE a.timestamp >= :since " +
           "GROUP BY a.user ORDER BY activityCount DESC")
    List<Object[]> getMostActiveUsers(@Param("since") LocalDateTime since);
    
    // Delete old activities (cleanup)
    void deleteByTimestampBefore(LocalDateTime timestamp);
}