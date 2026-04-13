package com.project.backend.service;

import com.project.backend.entity.IPAsset;
import com.project.backend.entity.User;
import com.project.backend.entity.UserFiling;
import com.project.backend.repository.IPAssetRepository;
import com.project.backend.repository.UserFilingRepository;
import com.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FilingTrackerService {

    @Autowired private UserFilingRepository userFilingRepository;
    @Autowired private IPAssetRepository ipAssetRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    /**
     * Fetch all filings
     */
    public List<UserFiling> getAllFilings() {
        return userFilingRepository.findAllByOrderBySubmissionDateDesc();
    }

    /**
     * Update status and send notification
     */
    @Transactional
    public UserFiling updateStatus(Long filingId, String newStatus, String remarks) {
        UserFiling filing = userFilingRepository.findById(filingId)
            .orElseThrow(() -> new RuntimeException("Filing not found with ID: " + filingId));
        
        filing.setStatus(newStatus);
        UserFiling savedFiling = userFilingRepository.save(filing);

        if (filing.getUserId() != null) {
            String message = "Status updated to " + newStatus + " for filing: " + filing.getTitle();
            if (remarks != null && !remarks.isEmpty()) {
                message += ". Admin Remarks: " + remarks;
            }
            try {
                // Ensure ID is passed as Integer to NotificationService
                notificationService.sendAlert(filing.getUserId().intValue(), null, message, "Status Update");
            } catch (Exception e) {
                System.err.println("Notification failed: " + e.getMessage());
            }
        }
        return savedFiling;
    }

    /**
     * Create new filing manually
     */
    @Transactional
    public UserFiling createFiling(UserFiling filing) {
        if (filing.getEmail() != null && !filing.getEmail().isEmpty()) {
            User user = userRepository.findByEmail(filing.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + filing.getEmail()));
            filing.setUserId(user.getId());
        }
        if (filing.getSubmissionDate() == null) filing.setSubmissionDate(LocalDate.now());
        if (filing.getPatentStatus() == null) filing.setPatentStatus("Pending");
        if (filing.getStatus() == null) filing.setStatus("PENDING");

        return userFilingRepository.save(filing);
    }

    /**
     * Track an existing asset
     */
    

@Transactional
public UserFiling trackAsset(String userEmail, Integer assetId) {
    IPAsset asset = ipAssetRepository.findById(assetId)
            .orElseThrow(() -> new RuntimeException("Asset not found"));

    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // 🔴 Change: Ensure we are looking up by Long User ID if needed, 
    // but here we are using patentNumber check which is fine.
    Optional<UserFiling> existing = userFilingRepository.findByPatentNumber(asset.getAssetNumber());
    if (existing.isPresent()) return existing.get();

    UserFiling newFiling = new UserFiling();
    
    newFiling.setUserId(user.getId()); // User.getId() returns Long, so this is perfect now.
    
    newFiling.setEmail(userEmail);
    newFiling.setTitle(asset.getTitle());
    newFiling.setPatentNumber(asset.getAssetNumber());
    newFiling.setCategory(asset.getAssetClass()); // Mapping Asset Class to Category
    newFiling.setFilingType(asset.getType());
    newFiling.setAssignee(asset.getAssignee());
    newFiling.setJurisdiction(asset.getJurisdiction());
    newFiling.setPatentStatus(asset.getStatus());
    newFiling.setDescription(asset.getDetails());
    newFiling.setFilingDate(asset.getFilingDate() != null ? asset.getFilingDate().toLocalDate() : LocalDate.now());
    newFiling.setSubmissionDate(LocalDate.now());
    newFiling.setTags("TRACKED");
    newFiling.setStatus("TRACKED");

    return userFilingRepository.save(newFiling);
}

    /**
     * Delete a filing
     */
    @Transactional
    public void deleteFiling(Long id) {
        if (userFilingRepository.existsById(id)) {
            userFilingRepository.deleteById(id);
        } else {
            throw new RuntimeException("Filing not found");
        }
    }
}