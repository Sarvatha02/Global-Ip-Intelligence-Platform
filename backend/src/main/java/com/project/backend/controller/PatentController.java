package com.project.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Date;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api") // Base mapping is /api
public class PatentController {

    // --- 1. Internal Data Structure (Record is clean and simple) ---
    // This replaces the need for the external Patent.java file
    private record Patent(
        Long id,
        String title,
        String patentNumber,
        String status,
        Date filingDate,
        String region,
        String category) {}

    // --- 2. Hardcoded Data Set ---
    private final List<Patent> DUMMY_PATENTS = Arrays.asList(
        new Patent(
            1L, 
            "AI-Driven Optimization System", 
            "US2025-12345", 
            "Pending", 
            new Date(System.currentTimeMillis() - 86400000 * 5), // 5 days ago
            "United States", 
            "Software"
        ),
        new Patent(
            2L, 
            "Sustainable Energy Storage Method", 
            "EP-3456789", 
            "Granted", 
            new Date(System.currentTimeMillis() - 86400000 * 30), // 30 days ago
            "Europe", 
            "Energy"
        ),
        new Patent(
            3L, 
            "Smart Agricultural Sensor", 
            "CN-2024-98765", 
            "Under Review", 
            new Date(System.currentTimeMillis() - 86400000 * 60), // 60 days ago
            "China", 
            "Hardware"
        ),
        new Patent(
            4L, 
            "Holographic Display Interface", 
            "JP2023-11223", 
            "Rejected", 
            new Date(System.currentTimeMillis() - 86400000 * 100), // 100 days ago
            "Japan", 
            "Display"
        ),
        new Patent(
            5L, 
            "Biometric Authentication Protocol", 
            "IN-2025-55555", 
            "Pending", 
            new Date(System.currentTimeMillis() - 86400000 * 2), // 2 days ago
            "India", 
            "Security"
        )
    );

    // --- 3. GET /api/patents (Returns ALL patents for initial load) ---
    @GetMapping("/patents")
    public ResponseEntity<List<Patent>> getAllPatents() {
        return ResponseEntity.ok(DUMMY_PATENTS);
    }

    // --- 4. GET /api/patents/search (Returns filtered results) ---
    // NOTE: Your frontend PatentsPage.jsx primarily uses the list returned by /api/patents
    // and filters locally. This endpoint is primarily for robustness.
    @GetMapping("/patents/search")
    public ResponseEntity<List<Patent>> searchPatents(@RequestParam("q") String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(DUMMY_PATENTS);
        }

        final String lowerQuery = query.toLowerCase();

        List<Patent> filteredPatents = DUMMY_PATENTS.stream()
            .filter(p -> 
                p.title().toLowerCase().contains(lowerQuery) ||
                p.patentNumber().toLowerCase().contains(lowerQuery) ||
                p.category().toLowerCase().contains(lowerQuery)
            )
            .collect(Collectors.toList());

        return ResponseEntity.ok(filteredPatents);
    }
}