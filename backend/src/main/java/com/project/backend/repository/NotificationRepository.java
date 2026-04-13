package com.project.backend.repository;

import com.project.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    /**
     * FIXED QUERY LOGIC:
     * 1. Match User ID
     * 2. AND (
     * is_read is FALSE (Show all unread, no matter how old)
     * OR
     * timestamp is recent (Show history for the last 2 days even if read)
     * )
     */
    @Query(value = "SELECT * FROM notifications n WHERE n.user_id = :userId AND (n.is_read = false OR n.timestamp >= :cutoffDate) ORDER BY n.timestamp DESC", nativeQuery = true)
    List<Notification> findRecentNotifications(@Param("userId") Integer userId, @Param("cutoffDate") LocalDateTime cutoffDate);
}