package com.project.backend.service;

import com.project.backend.entity.IPAsset;
import com.project.backend.repository.IPAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final IPAssetRepository ipAssetRepository;

    private String getSmartCategoryName(String code) {
        if (code == null || code.trim().isEmpty()) return "Unclassified";
        String clean = code.trim().toUpperCase();

        if (clean.contains("G06N") || clean.contains("CLASS 12") || clean.contains("12") || clean.contains("AI") || clean.contains("INTELLIGENCE") || clean.contains("MACHINE")) 
            return "Artificial Intelligence";
        
        if (clean.contains("G06F") || clean.contains("CLASS 25") || clean.contains("25") || clean.contains("CLOUD") || clean.contains("COMPUTING")) 
            return "Cloud Computing";
        
        if (clean.contains("H04W") || clean.contains("CLASS 28") || clean.contains("28") || clean.contains("5G") || clean.contains("WIRELESS")) 
            return "5G & Wireless";
        
        if (clean.contains("A61K") || clean.contains("C12N") || clean.contains("CLASS 1") || clean.contains("1B") || clean.contains("BIO") || clean.contains("PHARMA")) 
            return "Biotech & Pharma";
        
        if (clean.contains("B60") || clean.contains("CLASS 38") || clean.contains("38") || clean.contains("ELECTRIC") || clean.contains("VEHICLE")) 
            return "Electric Vehicles";
        
        if (clean.contains("H02S") || clean.contains("CLASS 41") || clean.contains("41") || clean.contains("SOLAR") || clean.contains("RENEWABLE")) 
            return "Renewable Energy";
        
        if (clean.contains("B25J") || clean.contains("ROBOT")) 
            return "Robotics";
            
        if (clean.contains("H01L") || clean.contains("SEMICONDUCTOR")) 
            return "Semiconductors";
            
        if (clean.contains("H04L") || clean.contains("SECURITY") || clean.contains("CYBER")) 
            return "Cybersecurity";

        return "Other Technologies"; 
    }

    private List<IPAsset> getAssetsForLandscape(String field) {
        List<IPAsset> allAssets = ipAssetRepository.findAll();

        if (field == null || field.equalsIgnoreCase("all") || field.equalsIgnoreCase("All Technologies")) {
            return allAssets;
        }

        String searchKey = field.toUpperCase();
        if (searchKey.contains("AI") || searchKey.contains("INTELLIGENCE")) searchKey = "ARTIFICIAL INTELLIGENCE";
        else if (searchKey.contains("BIO") || searchKey.contains("PHARMA")) searchKey = "BIOTECH & PHARMA";
        else if (searchKey.contains("5G") || searchKey.contains("WIRELESS")) searchKey = "5G & WIRELESS";
        else if (searchKey.contains("CLOUD")) searchKey = "CLOUD COMPUTING";
        else if (searchKey.contains("ELECTRIC") || searchKey.contains("VEHICLE")) searchKey = "ELECTRIC VEHICLES";
        
        String finalSearch = searchKey;

        return allAssets.stream()
                .filter(a -> {
                    if (a.getAssetClass() == null) return false;
                    String rawClass = a.getAssetClass().toUpperCase();
                    String smartName = getSmartCategoryName(rawClass).toUpperCase();
                    return rawClass.contains(finalSearch) || smartName.contains(finalSearch);
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDashboardStats() {
        return getDashboardSummary(null, null, null);
    }

    public Map<String, Object> getDashboardSummary(String dateRange, String type, String jurisdiction) {
        List<IPAsset> filteredAssets = getFilteredAssets(dateRange, type, jurisdiction);
        
        long totalFilings = filteredAssets.size();
        
        long activePatents = filteredAssets.stream()
                .filter(a -> isStatusActive(a.getStatus()))
                .count();
                
        long pendingApplications = filteredAssets.stream()
                .filter(a -> a.getStatus() != null && "PENDING".equalsIgnoreCase(a.getStatus().trim()))
                .count();
                
        long expiringSoon = filteredAssets.stream()
                .filter(this::isExpiringSoon)
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFilings", totalFilings);
        summary.put("activePatents", activePatents);
        summary.put("pendingApplications", pendingApplications);
        summary.put("expiringSoon", expiringSoon);
        
        return summary;
    }

    public Map<String, Object> getStatusDistribution(String dateRange, String type, String jurisdiction) {
        List<IPAsset> assets = getFilteredAssets(dateRange, type, jurisdiction);
        
        Map<String, Long> statusCounts = assets.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getStatus() != null ? a.getStatus().toUpperCase() : "UNKNOWN",
                        Collectors.counting()
                ));

        List<Map<String, Object>> distribution = statusCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .sorted((a, b) -> Long.compare((Long)b.get("value"), (Long)a.get("value")))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", distribution);
        return result;
    }

    public Map<String, Object> getFilingsTrend(String dateRange, String type, String jurisdiction) {
        List<IPAsset> assets = getFilteredAssets(dateRange, type, jurisdiction);
        
        Map<YearMonth, Long> monthlyPatents = new TreeMap<>();
        Map<YearMonth, Long> monthlyTrademarks = new TreeMap<>();

        for (IPAsset asset : assets) {
            if (asset.getFilingDate() != null) {
                YearMonth ym = YearMonth.from(asset.getFilingDate());
                String assetType = asset.getType() != null ? asset.getType() : "PATENT";
                
                if ("PATENT".equalsIgnoreCase(assetType)) {
                    monthlyPatents.merge(ym, 1L, Long::sum);
                } else {
                    monthlyTrademarks.merge(ym, 1L, Long::sum);
                }
            }
        }

        List<Map<String, Object>> trend = new ArrayList<>();
        Set<YearMonth> allMonths = new TreeSet<>();
        allMonths.addAll(monthlyPatents.keySet());
        allMonths.addAll(monthlyTrademarks.keySet());

        for (YearMonth ym : allMonths) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", ym.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            item.put("patents", monthlyPatents.getOrDefault(ym, 0L));
            item.put("trademarks", monthlyTrademarks.getOrDefault(ym, 0L));
            trend.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("data", trend);
        return result;
    }

    public Map<String, Object> getFieldWiseTrends(String dateRange, String type, String jurisdiction) {
        return getClassificationTrends("all", 10);
    }

    public Map<String, Object> getJurisdictionBreakdown(String dateRange, String type, String jurisdiction) {
        List<IPAsset> assets = getFilteredAssets(dateRange, type, jurisdiction);
        
        Map<String, Long> jurisdictionCounts = assets.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getJurisdiction() != null ? a.getJurisdiction() : "Global",
                        Collectors.counting()
                ));

        List<Map<String, Object>> breakdown = jurisdictionCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("jurisdiction", entry.getKey());
                    item.put("patents", entry.getValue());
                    return item;
                })
                .sorted((a, b) -> Long.compare((Long)b.get("patents"), (Long)a.get("patents")))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", breakdown);
        return result;
    }

    public Map<String, Object> getStatusTimeline(String dateRange, String type, String jurisdiction) {
        List<IPAsset> assets = getFilteredAssets(dateRange, type, jurisdiction);
        
        Map<String, Map<String, Long>> quarterlyStatus = new TreeMap<>();

        for (IPAsset asset : assets) {
            if (asset.getFilingDate() != null) {
                int year = asset.getFilingDate().getYear();
                int quarter = (asset.getFilingDate().getMonthValue() - 1) / 3 + 1;
                String key = "Q" + quarter + " " + year;
                
                quarterlyStatus.putIfAbsent(key, new HashMap<>());
                Map<String, Long> statusMap = quarterlyStatus.get(key);
                
                if (isStatusActive(asset.getStatus())) {
                    statusMap.merge("granted", 1L, Long::sum);
                } 
                else if ("PENDING".equalsIgnoreCase(asset.getStatus())) {
                    statusMap.merge("filed", 1L, Long::sum);
                }
            }
        }

        List<Map<String, Object>> timeline = quarterlyStatus.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("quarter", entry.getKey());
                    item.put("granted", entry.getValue().getOrDefault("granted", 0L));
                    item.put("filed", entry.getValue().getOrDefault("filed", 0L));
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", timeline);
        return result;
    }

    public List<Map<String, Object>> getRecentActivity() {
        return ipAssetRepository.findTop10ByOrderByLastUpdatedDesc().stream()
                .map(asset -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", asset.getId());
                    item.put("title", asset.getTitle());
                    item.put("type", asset.getType());
                    item.put("date", asset.getLastUpdated());
                    item.put("action", "Updated");
                    return item;
                }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getGlobalCoverage() {
        Map<String, Object> breakdown = getJurisdictionBreakdown(null, null, null);
        return (List<Map<String, Object>>) breakdown.get("data");
    }

    public List<Map<String, Object>> getUpcomingDeadlines() {
        return ipAssetRepository.findAll().stream()
                .filter(this::isExpiringSoon)
                .sorted(Comparator.comparing(IPAsset::getFilingDate))
                .limit(10)
                .map(asset -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", asset.getId());
                    item.put("title", asset.getTitle());
                    item.put("deadline", asset.getFilingDate().plusYears(20));
                    item.put("type", "Patent Expiry");
                    return item;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getClassificationTrends(String field, Integer topN) {
        List<IPAsset> assets = getAssetsForLandscape(field);

        Map<String, Long> classificationCounts = new HashMap<>();
        for (IPAsset asset : assets) {
            if (asset.getAssetClass() != null && !asset.getAssetClass().isEmpty()) {
                String[] codes = asset.getAssetClass().split(",");
                Set<String> uniqueCategoriesForAsset = new HashSet<>();
                for (String code : codes) {
                    uniqueCategoriesForAsset.add(getSmartCategoryName(code));
                }
                
                for (String category : uniqueCategoriesForAsset) {
                    classificationCounts.merge(category, 1L, Long::sum);
                }
            }
        }

        List<Map<String, Object>> trends = classificationCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("code", entry.getKey()); 
                    item.put("count", entry.getValue());
                    item.put("description", "Technology Field");
                    return item;
                })
                .sorted((a, b) -> Long.compare((Long)b.get("count"), (Long)a.get("count")))
                .limit(topN != null ? topN : 10)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", trends);
        return result;
    }

    public Map<String, Object> getTechnologyConvergence(String field, Integer topN) {
        List<IPAsset> assets = getAssetsForLandscape(field);
        
        Map<String, Set<String>> fieldCooccurrence = new HashMap<>();
        
        for (IPAsset asset : assets) {
            if (asset.getAssetClass() != null && !asset.getAssetClass().isEmpty()) {
                String[] rawFields = asset.getAssetClass().split(",");
                Set<String> uniqueCategories = new HashSet<>();
                
                for(String rf : rawFields) {
                    uniqueCategories.add(getSmartCategoryName(rf));
                }
                List<String> fields = new ArrayList<>(uniqueCategories);

                if (fields.size() > 1) {
                    for (int i = 0; i < fields.size(); i++) {
                        String field1 = fields.get(i);
                        for (int j = i + 1; j < fields.size(); j++) {
                            String field2 = fields.get(j);
                            String key = field1.compareTo(field2) < 0 ? field1 + "|" + field2 : field2 + "|" + field1;
                            fieldCooccurrence.putIfAbsent(key, new HashSet<>());
                            fieldCooccurrence.get(key).add(asset.getAssetNumber());
                        }
                    }
                }
            }
        }

        List<Map<String, Object>> convergence = fieldCooccurrence.entrySet().stream()
                .map(entry -> {
                    String[] f = entry.getKey().split("\\|");
                    Map<String, Object> item = new HashMap<>();
                    item.put("field1", f[0]);
                    item.put("field2", f[1]);
                    item.put("overlapCount", entry.getValue().size());
                    item.put("strength", Math.min(100, entry.getValue().size() * 5));
                    return item;
                })
                .sorted((a, b) -> Integer.compare((Integer)b.get("overlapCount"), (Integer)a.get("overlapCount")))
                .limit(topN != null ? topN : 15)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", convergence);
        return result;
    }

    public Map<String, Object> getCompetitorAnalysis(String field, Integer topN) {
        List<IPAsset> assets = getAssetsForLandscape(field);

        Map<String, List<IPAsset>> assigneeMap = assets.stream()
                .filter(a -> a.getAssignee() != null && !a.getAssignee().isEmpty())
                .collect(Collectors.groupingBy(IPAsset::getAssignee));

        int currentYear = LocalDate.now().getYear();
        int lastYear = currentYear - 1;

        List<Map<String, Object>> competitors = assigneeMap.entrySet().stream()
                .map(entry -> {
                    String name = entry.getKey();
                    List<IPAsset> assigneeAssets = entry.getValue();

                    long total = assigneeAssets.size();
                    long active = assigneeAssets.stream()
                            .filter(a -> isStatusActive(a.getStatus()))
                            .count();

                    long thisYearCount = assigneeAssets.stream()
                            .filter(a -> a.getFilingDate() != null && a.getFilingDate().getYear() == currentYear)
                            .count();
                    long lastYearCount = assigneeAssets.stream()
                            .filter(a -> a.getFilingDate() != null && a.getFilingDate().getYear() == lastYear)
                            .count();

                    double growth;
                    if (lastYearCount == 0) {
                        growth = thisYearCount > 0 ? 100.0 : 0.0;
                    } else {
                        growth = ((double) (thisYearCount - lastYearCount) / lastYearCount) * 100.0;
                    }

                    Map<String, Object> item = new HashMap<>();
                    item.put("assignee", name);
                    item.put("patentCount", total);
                    item.put("activeCount", active);
                    item.put("growth", Math.round(growth * 100.0) / 100.0);
                    return item;
                })
                .sorted((a, b) -> Long.compare((Long)b.get("patentCount"), (Long)a.get("patentCount")))
                .limit(topN != null ? topN : 10)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", competitors);
        return result;
    }

    public Map<String, Object> getInnovationTrends(String field, Integer topN) {
        List<IPAsset> assets = getAssetsForLandscape(field);

        Map<Integer, Long> yearlyInnovations = new TreeMap<>();
        for (IPAsset asset : assets) {
            if (asset.getFilingDate() != null) {
                yearlyInnovations.merge(asset.getFilingDate().getYear(), 1L, Long::sum);
            }
        }

        List<Map<String, Object>> trends = new ArrayList<>();
        Long prevCount = null; 
        for (Map.Entry<Integer, Long> entry : yearlyInnovations.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("year", entry.getKey());
            item.put("innovations", entry.getValue());
            
            if (prevCount != null && prevCount > 0) {
                double growthRate = ((double)(entry.getValue() - prevCount) / prevCount) * 100.0;
                item.put("growthRate", Math.round(growthRate * 100.0) / 100.0);
            } else {
                item.put("growthRate", 0.0);
            }
            prevCount = entry.getValue();
            trends.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("data", trends);
        return result;
    }

    public Map<String, Object> getTopInventors(String field, Integer topN) {
        List<IPAsset> assets = getAssetsForLandscape(field);

        Map<String, Long> inventorCounts = assets.stream()
                .filter(a -> a.getInventor() != null && !a.getInventor().isEmpty())
                .collect(Collectors.groupingBy(IPAsset::getInventor, Collectors.counting()));

        List<Map<String, Object>> inventors = inventorCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", entry.getKey());
                    item.put("patentCount", entry.getValue());
                    return item;
                })
                .sorted((a, b) -> Long.compare((Long)b.get("patentCount"), (Long)a.get("patentCount")))
                .limit(topN != null ? topN : 10)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", inventors);
        return result;
    }

    public Map<String, Object> getLifecycleAnalysis(String field, Integer topN) {
        List<IPAsset> assets = getAssetsForLandscape(field);

        if (assets.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("avgLifespan", 0);
            empty.put("activePhase", 0);
            empty.put("maturityRate", 0);
            return empty;
        }

        double totalAgeInYears = 0;
        long activeCount = 0;
        int countWithDates = 0;

        for (IPAsset asset : assets) {
            if (asset.getFilingDate() != null) {
                long days = ChronoUnit.DAYS.between(asset.getFilingDate().toLocalDate(), LocalDate.now());
                totalAgeInYears += (days / 365.0);
                countWithDates++;
                if (isStatusActive(asset.getStatus())) activeCount++;
            }
        }

        double avgLifespan = countWithDates > 0 ? (totalAgeInYears / countWithDates) : 0.0;
        double maturityRate = (double) activeCount / assets.size() * 100.0;

        Map<String, Object> lifecycle = new HashMap<>();
        lifecycle.put("avgLifespan", Math.round(avgLifespan * 10.0) / 10.0);
        lifecycle.put("activePhase", Math.round((avgLifespan * 0.8) * 10.0) / 10.0);
        lifecycle.put("maturityRate", Math.round(maturityRate));
        return lifecycle;
    }

    public Map<String, Object> getAssetsByCategory(String category) {
        return getAssetsByCategory(category, null, null, null);
    }

    public Map<String, Object> getAssetsByCategory(String category, String dateRange, String type, String jurisdiction) {
        if (category != null && category.startsWith("Category:")) {
             return getAssetsByCategory(category.replace("Category:", "").trim(), dateRange, type, jurisdiction);
        }
        
        List<IPAsset> filteredAssets = getFilteredAssets(dateRange, type, jurisdiction);
        List<IPAsset> finalAssets = filteredAssets;
        
        if (category != null && !category.isEmpty()) {
             String search = category.toUpperCase();
             
             if (search.equals("ACTIVE") || search.equals("PENDING") || search.equals("EXPIRING")) {
                 finalAssets = filteredAssets.stream()
                    .filter(a -> {
                        if (search.equals("ACTIVE")) return isStatusActive(a.getStatus());
                        if (search.equals("PENDING")) return "PENDING".equalsIgnoreCase(a.getStatus());
                        if (search.equals("EXPIRING")) return isExpiringSoon(a);
                        return true;
                    }).collect(Collectors.toList());
             }
             else {
                 String searchLower = category.toLowerCase();
                 finalAssets = filteredAssets.stream()
                    .filter(a -> (a.getTitle() != null && a.getTitle().toLowerCase().contains(searchLower)) ||
                                 (a.getAssetClass() != null && (a.getAssetClass().toLowerCase().contains(searchLower) || getSmartCategoryName(a.getAssetClass()).toLowerCase().contains(searchLower))) ||
                                 (a.getAssignee() != null && a.getAssignee().toLowerCase().contains(searchLower)) ||
                                 (a.getInventor() != null && a.getInventor().toLowerCase().contains(searchLower)) ||
                                 (a.getDetails() != null && a.getDetails().toLowerCase().contains(searchLower))) 
                    .collect(Collectors.toList());
             }
        }

        List<Map<String, Object>> assetList = finalAssets.stream()
            .limit(100)
            .map(a -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", a.getId());
                m.put("assetNumber", a.getAssetNumber());
                m.put("title", a.getTitle());
                m.put("type", a.getType());
                m.put("assignee", a.getAssignee());
                m.put("filingDate", a.getFilingDate());
                m.put("status", a.getStatus());
                m.put("jurisdiction", a.getJurisdiction());
                m.put("details", a.getDetails()); 
                m.put("inventor", a.getInventor());
                return m;
            })
            .collect(Collectors.toList());

        return Map.of("data", assetList, "total", assetList.size());
    }

    private List<IPAsset> getFilteredAssets(String dateRange, String type, String jurisdiction) {
        List<IPAsset> assets = ipAssetRepository.findAll();
        LocalDate cutoff = null;
        
        if ("week".equalsIgnoreCase(dateRange)) {
            cutoff = LocalDate.now().minusWeeks(1);
        } else if ("month".equalsIgnoreCase(dateRange)) {
            cutoff = LocalDate.now().minusMonths(1);
        } else if ("quarter".equalsIgnoreCase(dateRange)) {
            cutoff = LocalDate.now().minusMonths(3);
        } else if ("year".equalsIgnoreCase(dateRange)) {
            cutoff = LocalDate.now().minusYears(1);
        }

        LocalDate finalCutoff = cutoff;
        
        return assets.stream()
            .filter(a -> finalCutoff == null || (a.getFilingDate() != null && !a.getFilingDate().toLocalDate().isBefore(finalCutoff)))
            .filter(a -> type == null || "all".equalsIgnoreCase(type) || (a.getType() != null && a.getType().equalsIgnoreCase(type)))
            .filter(a -> jurisdiction == null || "all".equalsIgnoreCase(jurisdiction) || (a.getJurisdiction() != null && a.getJurisdiction().equalsIgnoreCase(jurisdiction)))
            .collect(Collectors.toList());
    }

    private boolean isStatusActive(String status) {
        if (status == null) return false;
        String s = status.trim().toUpperCase();
        return s.equals("ACTIVE") || s.equals("GRANTED") || s.equals("REGISTERED") || s.equals("LIVE") || s.equals("PUBLISHED");
    }
    
    private boolean isExpiringSoon(IPAsset a) {
        if (a.getFilingDate() == null) return false;
        LocalDate expiry = a.getFilingDate().toLocalDate().plusYears(20);
        return expiry.isAfter(LocalDate.now()) && expiry.isBefore(LocalDate.now().plusMonths(6));
    }
}