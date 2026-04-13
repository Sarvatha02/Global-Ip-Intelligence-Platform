package com.project.backend.service;

import com.project.backend.dto.GeoLocationDTO;
import com.project.backend.entity.IPAsset;
import com.project.backend.repository.IPAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeoService {

    @Autowired
    private IPAssetRepository ipAssetRepository;

    private static final Map<String, double[]> JURISDICTION_COORDS = new HashMap<>() {{
        put("US", new double[]{37.0902, -95.7129, 4});
        put("IN", new double[]{20.5937, 78.9629, 5});
        put("EP", new double[]{50.8503, 4.3517, 5});
        put("CN", new double[]{35.8617, 104.1954, 4});
    }};

    private static final Map<String, String> JURISDICTION_NAMES = new HashMap<>() {{
        put("US", "United States");
        put("IN", "India");
        put("EP", "Europe");
        put("CN", "China");
    }};

    public Map<String, Object> getGlobalStats() {
        List<IPAsset> all = ipAssetRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        
        // Added null checks to prevent Stream crashes
        stats.put("totalPatents", all.stream().filter(a -> a.getType() != null && "PATENT".equalsIgnoreCase(a.getType())).count());
        stats.put("totalTrademarks", all.stream().filter(a -> a.getType() != null && "TRADEMARK".equalsIgnoreCase(a.getType())).count());
        stats.put("totalJurisdictions", all.stream().map(IPAsset::getJurisdiction).filter(Objects::nonNull).distinct().count());
        return stats;
    }

    public List<GeoLocationDTO> getGeoDistribution(String ipType, String status) {
        List<IPAsset> assets = (ipType != null && !"ALL".equalsIgnoreCase(ipType)) 
                ? ipAssetRepository.findByType(ipType.toUpperCase()) 
                : ipAssetRepository.findAll();

        if (status != null && !status.isEmpty()) {
            assets = assets.stream()
                .filter(a -> a.getStatus() != null && a.getStatus().toUpperCase().contains(status.toUpperCase()))
                .collect(Collectors.toList());
        }
        return processGeoData(assets);
    }

    public List<GeoLocationDTO> getGeoDistributionByKeyword(String keyword, String ipType) {
        List<IPAsset> assets = (ipType != null && !"ALL".equalsIgnoreCase(ipType))
                ? ipAssetRepository.findByTypeAndTitleContainingIgnoreCaseOrDetailsContainingIgnoreCase(ipType.toUpperCase(), keyword, keyword)
                : ipAssetRepository.findByTitleContainingIgnoreCaseOrDetailsContainingIgnoreCase(keyword, keyword);
        return processGeoData(assets);
    }

    private List<GeoLocationDTO> processGeoData(List<IPAsset> assets) {
        Map<String, List<IPAsset>> grouped = assets.stream()
                .filter(a -> a.getJurisdiction() != null)
                .collect(Collectors.groupingBy(IPAsset::getJurisdiction));

        List<GeoLocationDTO> geoData = new ArrayList<>();
        for (Map.Entry<String, List<IPAsset>> entry : grouped.entrySet()) {
            String code = entry.getKey();
            List<IPAsset> list = entry.getValue();
            double[] c = JURISDICTION_COORDS.getOrDefault(code, new double[]{0.0, 0.0, 2});

            geoData.add(new GeoLocationDTO(
                code, JURISDICTION_NAMES.getOrDefault(code, code),
                list.stream().filter(a -> "PATENT".equalsIgnoreCase(a.getType())).count(),
                list.stream().filter(a -> "TRADEMARK".equalsIgnoreCase(a.getType())).count(),
                list.stream().filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus())).count(),
                list.stream().filter(a -> "PENDING".equalsIgnoreCase(a.getStatus())).count(),
                c[0], c[1], (int) c[2]
            ));
        }
        return geoData;
    }
}