package com.project.backend.service;

import com.project.backend.dto.GeoLocationDTO;
import com.project.backend.dto.PatentDTO;
import com.project.backend.entity.FilingTracker;
import com.project.backend.entity.IPAsset;
import com.project.backend.entity.User;
import com.project.backend.repository.FilingTrackerRepository;
import com.project.backend.repository.IPAssetRepository;
import com.project.backend.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class IPAssetService {

    private final IPAssetRepository ipAssetRepository;
    private final FilingTrackerRepository filingTrackerRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ExternalIPService externalIPService;

    public IPAssetService(IPAssetRepository ipAssetRepository,
                          FilingTrackerRepository filingTrackerRepository,
                          UserRepository userRepository,
                          NotificationService notificationService,
                          ExternalIPService externalIPService) {
        this.ipAssetRepository = ipAssetRepository;
        this.filingTrackerRepository = filingTrackerRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.externalIPService = externalIPService;
    }

    @Transactional
    public List<IPAsset> saveOrUpdateAll(List<IPAsset> apiAssets) {
        List<IPAsset> savedAssets = new ArrayList<>();

        for (IPAsset newAsset : apiAssets) {
            String assetNumber = newAsset.getAssetNumber();

            if (assetNumber == null || assetNumber.trim().isEmpty()) {
                continue;
            }

            Optional<IPAsset> existingAssetOpt = ipAssetRepository.findByAssetNumber(assetNumber);

            if (existingAssetOpt.isPresent()) {
                IPAsset existingAsset = existingAssetOpt.get();
                existingAsset.setTitle(truncate(newAsset.getTitle(), 255));
                existingAsset.setStatus(newAsset.getStatus());
                existingAsset.setAssetClass(newAsset.getAssetClass());
                existingAsset.setAssignee(truncate(newAsset.getAssignee(), 255));
                existingAsset.setDetails(truncate(newAsset.getDetails(), 1000));
                existingAsset.setJurisdiction(newAsset.getJurisdiction());
                existingAsset.setApiSource("api");
                existingAsset.setLastUpdated(LocalDateTime.now());

                savedAssets.add(ipAssetRepository.save(existingAsset));
            } else {
                newAsset.setAssetClass(newAsset.getAssetClass() != null ? newAsset.getAssetClass() : "Unknown");
                newAsset.setApiSource("api");
                newAsset.setLastUpdated(LocalDateTime.now());
                savedAssets.add(ipAssetRepository.save(newAsset));
            }
        }
        return savedAssets;
    }

    @Transactional
    public void trackAsset(Integer userId, Integer assetId) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        IPAsset asset = ipAssetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        Optional<FilingTracker> existing = filingTrackerRepository.findByUserIdAndIpAssetId(Long.valueOf(userId), assetId);
        if (existing.isPresent()) {
            throw new RuntimeException("Asset is already being tracked.");
        }

        FilingTracker tracker = new FilingTracker();
        tracker.setUser(user);
        tracker.setIpAsset(asset);
        tracker.setStatus(asset.getStatus());
        tracker.setTrackedAt(LocalDateTime.now());
        filingTrackerRepository.save(tracker);

        String message = "Filing Tracker: Now monitoring " + asset.getAssetNumber();
        notificationService.sendAlert(userId, assetId, message, "TRACKING_START");
    }

    public List<IPAsset> getAllAssetsForAnalysis() {
        return ipAssetRepository.findAll();
    }

    public List<GeoLocationDTO> getGeoDistribution(String keyword) {
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }

        List<Object[]> results = ipAssetRepository.getJurisdictionCounts(keyword);
        List<GeoLocationDTO> distribution = new ArrayList<>();

        for (Object[] row : results) {
            GeoLocationDTO dto = new GeoLocationDTO();
            dto.setJurisdiction((String) row[0]);
            int count = ((Long) row[1]).intValue();
            dto.setCount(count);
            dto.setPatentCount((long) count);
            distribution.add(dto);
        }
        return distribution;
    }

    public Page<IPAsset> search(String keyword, String type, String jurisdictions, String status, String source, 
                                 int page, int size, String sortBy, String sortDirection) {

        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }
        if (type == null) type = "ALL";
        if (source == null || source.equalsIgnoreCase("local")) {
            source = "all";
        }

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        if ("api".equalsIgnoreCase(source)) {
            System.out.println("Calling External API for: " + keyword);
            List<PatentDTO> apiResults = externalIPService.searchSerpApi(keyword);
            saveApiResultsToDatabase(apiResults);
            return ipAssetRepository.searchAssets(keyword, type, jurisdictions, status, "api", pageable);
        }

        return ipAssetRepository.searchAssets(keyword, type, jurisdictions, status, source, pageable);
    }

    @Transactional
    public IPAsset saveAsset(IPAsset asset) {
        asset.setLastUpdated(LocalDateTime.now());
        if (asset.getStatus() == null || asset.getStatus().isEmpty()) {
            asset.setStatus("PENDING");
        }
        if (asset.getFilingDate() == null) {
            asset.setFilingDate(LocalDateTime.now());
        }
        return ipAssetRepository.save(asset);
    }

    @Transactional
    public IPAsset createAsset(IPAsset asset) {
        if (ipAssetRepository.existsByAssetNumber(asset.getAssetNumber())) {
            throw new RuntimeException("Asset Number already exists: " + asset.getAssetNumber());
        }
        asset.setLastUpdated(LocalDateTime.now());
        asset.setApiSource("local");
        return ipAssetRepository.save(asset);
    }

    public Optional<IPAsset> getAssetById(Integer id) {
        return ipAssetRepository.findById(id);
    }

    @Transactional
    public IPAsset updateAsset(Integer id, IPAsset updates) {
        return ipAssetRepository.findById(id).map(asset -> {
            asset.setTitle(truncate(updates.getTitle(), 255));
            asset.setStatus(updates.getStatus());
            asset.setAssetClass(updates.getAssetClass());
            asset.setAssignee(truncate(updates.getAssignee(), 255));
            asset.setDetails(truncate(updates.getDetails(), 1000));
            asset.setLastUpdated(LocalDateTime.now());
            return ipAssetRepository.save(asset);
        }).orElseThrow(() -> new RuntimeException("Asset not found with ID: " + id));
    }

    @Transactional
    public void deleteAsset(Integer id) {
        if (!ipAssetRepository.existsById(id)) {
            throw new RuntimeException("Asset not found, deletion aborted.");
        }
        ipAssetRepository.deleteById(id);
    }

    @Transactional
    public void saveApiResultsToDatabase(List<PatentDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) return;

        int saved = 0;
        for (PatentDTO dto : dtos) {
            try {
                String assetId = (dto.getAssetNumber() != null && !dto.getAssetNumber().isEmpty()) 
                                 ? dto.getAssetNumber() : dto.getId();

                if (!ipAssetRepository.existsByAssetNumber(assetId)) {
                    IPAsset asset = new IPAsset();
                    asset.setAssetNumber(assetId);
                    asset.setTitle(truncate(dto.getTitle(), 255));
                    asset.setDetails(truncate(dto.getAbstractText(), 1000));
                    asset.setType("PATENT");
                    asset.setStatus("ACTIVE");
                    asset.setJurisdiction(dto.getJurisdiction() != null ? dto.getJurisdiction() : "US");
                    asset.setAssignee(truncate(dto.getAssignee(), 255));
                    asset.setInventor(truncate(dto.getInventor(), 255));
                    asset.setFilingDate(parseDate(dto.getFilingDate()));
                    asset.setApiSource("api");
                    asset.setLastUpdated(LocalDateTime.now());
                    ipAssetRepository.save(asset);
                    saved++;
                }
            } catch (Exception e) {
                System.err.println("Error saving asset: " + e.getMessage());
            }
        }
        System.out.println("Saved " + saved + " new API records");
    }

    private String truncate(String val, int length) {
        if (val == null) return null;
        return (val.length() > length) ? val.substring(0, length - 3) + "..." : val;
    }

    private LocalDateTime parseDate(String dateStr) {
        try {
            if (dateStr == null || dateStr.isEmpty()) return LocalDateTime.now();
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE).atStartOfDay();
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}