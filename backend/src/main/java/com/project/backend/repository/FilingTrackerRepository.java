package com.project.backend.repository;

import com.project.backend.entity.FilingTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FilingTrackerRepository extends JpaRepository<FilingTracker, Long> {
    
    // 🔴 Change 1: Integer userId -> Long userId
    Optional<FilingTracker> findByUserIdAndIpAssetId(Long userId, Integer ipAssetId);

    // 🔴 Change 2: Integer userId -> Long userId
    List<FilingTracker> findByUserIdOrderByTrackedAtDesc(Long userId);
}