package com.project.backend.repository;

import com.project.backend.entity.UserFiling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserFilingRepository extends JpaRepository<UserFiling, Long> {
    
    // Fetch all filings ordered by newest submission
    List<UserFiling> findAllByOrderBySubmissionDateDesc();

    // Check for duplicates using Application Number OR Patent Number
    Optional<UserFiling> findByApplicationNumber(String applicationNumber);
    Optional<UserFiling> findByPatentNumber(String patentNumber);

    // Fetch filings by user ID
    @Query("SELECT f FROM UserFiling f WHERE f.user.id = :userId")
    List<UserFiling> findByUserId(@Param("userId") Long userId);

    // Added for Admin Dashboard
    long countByStatus(String status);
}