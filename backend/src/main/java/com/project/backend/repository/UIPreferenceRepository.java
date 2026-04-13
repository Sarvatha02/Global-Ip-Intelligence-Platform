package com.project.backend.repository;

import com.project.backend.entity.UIPreference;
import com.project.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UIPreferenceRepository extends JpaRepository<UIPreference, Long> {
    
    // Find preferences for specific user
    Optional<UIPreference> findByUser(User user);
    
    // Check if user has custom preferences
    boolean existsByUser(User user);
    
    // Delete preferences when user is deleted
    void deleteByUser(User user);
}