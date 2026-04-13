package com.project.backend.service;

import com.project.backend.dto.PatentDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
public class ExternalIPService {

    private final RestTemplate restTemplate;

    // ✅ READ KEY FROM application.properties (Secure)
    @Value("${app.serpapi.key}")
    private String serpApiKey;

    public ExternalIPService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<PatentDTO> searchSerpApi(String keyword) {

        List<PatentDTO> results = new ArrayList<>();
        String query = (keyword != null && !keyword.isBlank()) ? keyword : "technology";

        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://serpapi.com/search.json")
                    .queryParam("engine", "google_patents")
                    .queryParam("q", query)
                    .queryParam("api_key", serpApiKey) // Using injected key
                    .build()
                    .toUriString();

            Map<?, ?> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("organic_results")) {
                return results;
            }

            List<Map<String, Object>> items =
                    (List<Map<String, Object>>) response.get("organic_results");

            for (Map<String, Object> item : items) {

                PatentDTO dto = new PatentDTO();

                String pubNum = (String) item.getOrDefault("publication_number", UUID.randomUUID().toString());

                dto.setId(pubNum);
                dto.setAssetNumber(pubNum);
                dto.setType("PATENT"); // SERPAPI = Patents only
                dto.setTitle((String) item.getOrDefault("title", "No Title"));
                dto.setAbstractText((String) item.getOrDefault("snippet", "No abstract available"));

                dto.setImageUrl(
                        (String) item.getOrDefault(
                                "thumbnail",
                                "https://upload.wikimedia.org/wikipedia/commons/e/e6/Google_Patents_logo.png"
                        )
                );

                dto.setExternalUrl(
                        item.get("pdf") != null
                                ? (String) item.get("pdf")
                                : (String) item.get("link")
                );

                Object inventorObj = item.get("inventor");
                if (inventorObj instanceof List<?>) {
                    dto.setInventor(String.join(", ", (List<String>) inventorObj));
                } else {
                    dto.setInventor((String) inventorObj);
                }

                dto.setAssignee((String) item.getOrDefault("assignee", "Unknown Assignee"));

                dto.setFilingDate(
                        (String) item.getOrDefault(
                                "filing_date",
                                item.get("publication_date")
                        )
                );

                dto.setJurisdiction(
                        pubNum.length() >= 2
                                ? pubNum.substring(0, 2).toUpperCase()
                                : "GLOBAL"
                );

                dto.setStatus("ACTIVE");
                dto.setSource("SERP_API");

                results.add(dto);
            }

        } catch (Exception e) {
            System.err.println("SERP API ERROR: " + e.getMessage());
        }

        return results;
    }
}