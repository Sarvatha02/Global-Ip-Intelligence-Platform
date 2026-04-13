package com.project.backend.controller;

import com.project.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
// ✅ Combined CORS to allow both localhost and your specific Network IP (Mobile Support)
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService analyticsService;

    // ===========================
    // 🏠 DASHBOARD CORE ENDPOINTS
    // ===========================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/dashboard/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        return ResponseEntity.ok(analyticsService.getRecentActivity());
    }

    @GetMapping("/dashboard/global-coverage")
    public ResponseEntity<List<Map<String, Object>>> getGlobalCoverage() {
        return ResponseEntity.ok(analyticsService.getGlobalCoverage());
    }

    @GetMapping("/dashboard/upcoming-deadlines")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingDeadlines() {
        return ResponseEntity.ok(analyticsService.getUpcomingDeadlines());
    }

    // ===========================
    // 📊 ANALYTICS & TRENDS
    // ===========================

    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String jurisdiction) {
        return ResponseEntity.ok(analyticsService.getDashboardSummary(dateRange, type, jurisdiction));
    }

    @GetMapping("/analytics/status-distribution")
    public ResponseEntity<Map<String, Object>> getStatusDistribution(
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String jurisdiction) {
        return ResponseEntity.ok(analyticsService.getStatusDistribution(dateRange, type, jurisdiction));
    }

    @GetMapping("/analytics/filings-trend")
    public ResponseEntity<Map<String, Object>> getFilingsTrend(
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String jurisdiction) {
        return ResponseEntity.ok(analyticsService.getFilingsTrend(dateRange, type, jurisdiction));
    }

    @GetMapping("/analytics/field-wise-trends")
    public ResponseEntity<Map<String, Object>> getFieldWiseTrends(
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String jurisdiction) {
        return ResponseEntity.ok(analyticsService.getFieldWiseTrends(dateRange, type, jurisdiction));
    }

    @GetMapping("/analytics/jurisdiction-breakdown")
    public ResponseEntity<Map<String, Object>> getJurisdictionBreakdown(
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String jurisdiction) {
        return ResponseEntity.ok(analyticsService.getJurisdictionBreakdown(dateRange, type, jurisdiction));
    }

    @GetMapping("/analytics/status-timeline")
    public ResponseEntity<Map<String, Object>> getStatusTimeline(
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String jurisdiction) {
        return ResponseEntity.ok(analyticsService.getStatusTimeline(dateRange, type, jurisdiction));
    }

    // ===========================
    // 🌐 LANDSCAPE ANALYSIS
    // ===========================
    
    @GetMapping("/analytics/landscape/classifications")
    public ResponseEntity<Map<String, Object>> getClassificationTrends(
            @RequestParam(required = false) String field,
            @RequestParam(defaultValue = "10") Integer topN) {
        return ResponseEntity.ok(analyticsService.getClassificationTrends(field, topN));
    }

    @GetMapping("/analytics/landscape/competitors")
    public ResponseEntity<Map<String, Object>> getCompetitorAnalysis(
            @RequestParam(required = false) String field,
            @RequestParam(defaultValue = "10") Integer topN) {
        return ResponseEntity.ok(analyticsService.getCompetitorAnalysis(field, topN));
    }

    @GetMapping("/analytics/landscape/innovation-trends")
    public ResponseEntity<Map<String, Object>> getInnovationTrends(
            @RequestParam(required = false) String field,
            @RequestParam(defaultValue = "10") Integer topN) {
        return ResponseEntity.ok(analyticsService.getInnovationTrends(field, topN));
    }

    @GetMapping("/analytics/landscape/top-inventors")
    public ResponseEntity<Map<String, Object>> getTopInventors(
            @RequestParam(required = false) String field,
            @RequestParam(defaultValue = "10") Integer topN) {
        return ResponseEntity.ok(analyticsService.getTopInventors(field, topN));
    }

    @GetMapping("/analytics/landscape/convergence")
    public ResponseEntity<Map<String, Object>> getTechnologyConvergence(
            @RequestParam(required = false) String field,
            @RequestParam(defaultValue = "10") Integer topN) {
        return ResponseEntity.ok(analyticsService.getTechnologyConvergence(field, topN));
    }

    @GetMapping("/analytics/landscape/lifecycle")
    public ResponseEntity<Map<String, Object>> getLifecycleAnalysis(
            @RequestParam(required = false) String field,
            @RequestParam(defaultValue = "10") Integer topN) {
        return ResponseEntity.ok(analyticsService.getLifecycleAnalysis(field, topN));
    }

    // ===========================
    // 🔍 DRILL DOWN (Matches Frontend API)
    // ===========================
    @GetMapping("/analytics/assets/category")
    public ResponseEntity<Map<String, Object>> getAssetsByCategory(
            @RequestParam String category,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String jurisdiction) {
        return ResponseEntity.ok(analyticsService.getAssetsByCategory(category, dateRange, type, jurisdiction));
    }
}