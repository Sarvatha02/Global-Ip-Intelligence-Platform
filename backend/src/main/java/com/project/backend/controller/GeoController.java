package com.project.backend.controller;

import com.project.backend.dto.GeoLocationDTO;
import com.project.backend.service.GeoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geo")

public class GeoController {

    @Autowired
    private GeoService geoService;

    @GetMapping("/distribution")
    public ResponseEntity<List<GeoLocationDTO>> getGeoDistribution(
            @RequestParam(required = false) String ipType,
            @RequestParam(required = false) String status
    ) {
        List<GeoLocationDTO> distribution = geoService.getGeoDistribution(ipType, status);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/distribution/search")
    public ResponseEntity<List<GeoLocationDTO>> getGeoDistributionByKeyword(
            @RequestParam String keyword,
            @RequestParam(required = false) String ipType
    ) {
        List<GeoLocationDTO> distribution = geoService.getGeoDistributionByKeyword(keyword, ipType);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Map<String, Object> stats = geoService.getGlobalStats();
        return ResponseEntity.ok(stats);
    }
}