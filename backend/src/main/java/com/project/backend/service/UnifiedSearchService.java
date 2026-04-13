package com.project.backend.service;

import com.project.backend.dto.PatentDTO;
import com.project.backend.entity.IPAsset;
import com.project.backend.repository.IPAssetRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UnifiedSearchService {

    private final IPAssetRepository repository;
    private final ExternalIPService externalIPService;

    public UnifiedSearchService(IPAssetRepository repository,
                                ExternalIPService externalIPService) {
        this.repository = repository;
        this.externalIPService = externalIPService;
    }

    /**
     * source:
     *  local   -> DB only
     *  api     -> SerpAPI only
     *  global  -> DB + API
     *  both    -> DB + API
     */
    public List<PatentDTO> search(String keyword, String source, String type) {

        List<PatentDTO> results = new ArrayList<>();

        String mode = (source == null) ? "global" : source.trim().toLowerCase();

        // 🔹 LOCAL DATABASE
        if (mode.equals("local") || mode.equals("global") || mode.equals("both")) {
            System.out.println(">>> 📦 FETCHING LOCAL DB DATA");
            results.addAll(searchFromDatabase(keyword));
        }

        // 🔹 EXTERNAL API (SAFE)
        if (mode.equals("api") || mode.equals("serpapi") || mode.equals("global") || mode.equals("both")) {
            try {
                System.out.println(">>> 🌐 FETCHING API DATA");
                results.addAll(externalIPService.searchSerpApi(keyword));
            } catch (Exception e) {
                System.err.println(">>> ❌ SERP API FAILED");
                e.printStackTrace();
            }
        }

        // 🔹 TYPE FILTER
        if (type != null && !"ALL".equalsIgnoreCase(type)) {
            results = results.stream()
                    .filter(dto ->
                            dto.getType() != null &&
                            dto.getType().equalsIgnoreCase(type)
                    )
                    .collect(Collectors.toList());
        }

        System.out.println(">>> ✅ TOTAL RESULTS RETURNED: " + results.size());

        return results;
    }

    // ================= LOCAL DB SEARCH =================

    private List<PatentDTO> searchFromDatabase(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<IPAsset> assets = repository.searchByKeyword(keyword);
        List<PatentDTO> results = new ArrayList<>();

        for (IPAsset ip : assets) {

            PatentDTO dto = new PatentDTO();

            dto.setId(String.valueOf(ip.getId()));
            dto.setTitle(ip.getTitle());
            dto.setAbstractText(ip.getDetails());
            dto.setAssignee(ip.getAssignee());
            dto.setStatus(ip.getStatus());
            dto.setType(ip.getType());
            dto.setSource("LOCAL_DB");
            dto.setJurisdiction(ip.getJurisdiction());

            dto.setFilingDate(
                    ip.getFilingDate() != null
                            ? ip.getFilingDate().toString()
                            : "N/A"
            );

            // Placeholder images
            if ("TRADEMARK".equalsIgnoreCase(ip.getType())) {
                dto.setImageUrl("https://via.placeholder.com/150/0000FF/FFFFFF?text=TM");
            } else {
                dto.setImageUrl("https://via.placeholder.com/150?text=PATENT");
            }

            results.add(dto);
        }

        return results;
    }
}
