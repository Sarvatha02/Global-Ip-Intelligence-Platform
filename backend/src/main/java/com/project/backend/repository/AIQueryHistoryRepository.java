// AIQueryHistoryRepository.java
package com.project.backend.repository;

import com.project.backend.entity.AIQueryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIQueryHistoryRepository extends JpaRepository<AIQueryHistory, Long> {
    
    List<AIQueryHistory> findByUserIdOrderByTimestampDesc(String userId);
    
    @Query("SELECT COUNT(a) FROM AIQueryHistory a WHERE a.userId = :userId AND a.timestamp > :since")
    long countRecentQueries(String userId, LocalDateTime since);
    
    List<AIQueryHistory> findTop20ByUserIdOrderByTimestampDesc(String userId);
}