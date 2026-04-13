package com.project.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Aggregated counts from ip_assets table
        Integer totalPatents = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ip_assets", Integer.class);
        Integer activeAssets = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM ip_assets WHERE status IN ('ACTIVE', 'GRANTED', 'REGISTERED')", Integer.class);
        
        // Counts from your user_filings table
        Integer activeFilings = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM user_filings WHERE status = 'PENDING'", Integer.class);
        
        Integer criticalAlerts = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM ip_assets WHERE status = 'EXPIRED'", Integer.class);

        stats.put("totalPatents", totalPatents);
        stats.put("activeFilings", activeFilings);
        stats.put("protectedAssets", activeAssets);
        stats.put("criticalAlerts", criticalAlerts);
        stats.put("portfolioValue", "2.4"); // Formula-based or mock based on requirements
        stats.put("growth", 15);

        return stats;
    }

    public List<Map<String, Object>> getRecentActivity() {
        // Joins the last actions from the user_filings table
        String sql = "SELECT title, description, submission_date as time FROM user_filings " +
                     "ORDER BY submission_date DESC LIMIT 3";
        
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getGlobalCoverage() {
        // Calculates regional percentage based on total assets
        String totalSql = "SELECT COUNT(*) FROM ip_assets";
        Double total = jdbcTemplate.queryForObject(totalSql, Double.class);
        
        if (total == 0) return new ArrayList<>();

        String sql = "SELECT jurisdiction as region, COUNT(*) as count FROM ip_assets GROUP BY jurisdiction";
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
        
        results.forEach(row -> {
            Long count = (Long) row.get("count");
            row.put("percent", Math.round((count / total) * 100));
        });

        return results;
    }

    public List<Map<String, Object>> getUpcomingDeadlines() {
        // Mocking deadlines for compliance gate UI
        List<Map<String, Object>> deadlines = new ArrayList<>();
        deadlines.add(Map.of("task", "Maintenance Fee", "date", "Jan 25, 2025", "priority", "High"));
        deadlines.add(Map.of("task", "Office Action", "date", "Feb 02, 2025", "priority", "Medium"));
        return deadlines;
    }
}