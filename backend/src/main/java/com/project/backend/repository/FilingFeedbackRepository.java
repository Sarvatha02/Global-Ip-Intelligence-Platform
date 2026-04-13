package com.project.backend.repository;

import com.project.backend.entity.FilingFeedback;
import com.project.backend.entity.User;
import com.project.backend.entity.UserFiling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilingFeedbackRepository extends JpaRepository<FilingFeedback, Long> {
    
    // Get all feedback for a specific filing
    List<FilingFeedback> findByFilingOrderByTimestampDesc(UserFiling filing);
    
    // Get unread feedback for user's filings
    @Query("SELECT f FROM FilingFeedback f " +
           "WHERE f.filing.user = :user AND f.isRead = false " +
           "ORDER BY f.timestamp DESC")
    List<FilingFeedback> findUnreadFeedbackForUser(@Param("user") User user);
    
    // Get unresolved feedback for user's filings
    @Query("SELECT f FROM FilingFeedback f " +
           "WHERE f.filing.user = :user AND f.isResolved = false " +
           "ORDER BY f.priority DESC, f.timestamp DESC")
    List<FilingFeedback> findUnresolvedFeedbackForUser(@Param("user") User user);
    
    // Count unread feedback for user
    @Query("SELECT COUNT(f) FROM FilingFeedback f " +
           "WHERE f.filing.user = :user AND f.isRead = false")
    Long countUnreadFeedbackForUser(@Param("user") User user);
    
    // Get all feedback created by admin
    List<FilingFeedback> findByAdminOrderByTimestampDesc(User admin);
}