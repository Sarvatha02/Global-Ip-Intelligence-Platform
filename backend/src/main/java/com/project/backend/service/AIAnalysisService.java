package com.project.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.project.backend.repository.*;
import com.project.backend.entity.*;
import com.project.backend.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AIAnalysisService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private FilingRepository filingRepository;
    
    @Autowired
    private IPAssetRepository ipAssetRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FilingTrackerRepository filingTrackerRepository;
    
    @Autowired
    private AIQueryHistoryRepository aiQueryHistoryRepository;
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    
    @Value("${ai.rate.limit.per.hour:20}")
    private int rateLimitPerHour;
    
    @Value("${ai.max.query.length:500}")
    private int maxQueryLength;
    
    // Cache the working model name so we don't search every time
    private String cachedModelName = null;

    public AIQueryResponse analyzeWithGemini(String query, String userId) {
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Query cannot be empty");
        }
        
        checkRateLimit(userId);
        
        AIQueryHistory historyEntry = new AIQueryHistory();
        historyEntry.setUserId(userId);
        historyEntry.setQuery(query);
        historyEntry.setContextUsed(true);
        historyEntry.setTimestamp(LocalDateTime.now());
        
        long startTime = System.currentTimeMillis();
        AIQueryResponse response = new AIQueryResponse();
        
        try {
            String contextData = gatherContextData(userId);
            String prompt = buildPrompt(query, contextData);
            
            // ✅ GET ALL POSSIBLE MODELS
            List<String> availableModels = getAllAvailableModels();
            String lastError = "";
            boolean success = false;
            
            // ✅ TRY EACH MODEL UNTIL ONE WORKS
            for (String modelName : availableModels) {
                try {
                    System.out.println("🤖 Attempting AI with: " + modelName);
                    String aiResponse = callGeminiAPI(prompt, modelName);
                    
                    long endTime = System.currentTimeMillis();
                    historyEntry.setResponse(aiResponse);
                    historyEntry.setResponseTimeMs(endTime - startTime);
                    
                    response.setQuery(query);
                    response.setResponse(aiResponse);
                    response.setTimestamp(LocalDateTime.now());
                    response.setContextUsed(true);
                    
                    cachedModelName = modelName; // Save the one that actually worked
                    success = true;
                    break; 
                } catch (Exception e) {
                    System.err.println("❌ Model " + modelName + " failed: " + e.getMessage());
                    lastError = e.getMessage();
                }
            }
            
            if (!success) {
                throw new RuntimeException("All available Gemini models failed. Last error: " + lastError);
            }
            
        } catch (Exception e) {
            historyEntry.setErrorMessage(e.getMessage());
            response.setError("AI Analysis failed: " + e.getMessage());
            cachedModelName = null;
        } finally {
            try {
                aiQueryHistoryRepository.save(historyEntry);
            } catch (Exception e) {
                System.err.println("Failed to save AI history: " + e.getMessage());
            }
        }
        
        return response;
    }

    private List<String> getAllAvailableModels() {
        List<String> models = new ArrayList<>();
        try {
            // Try to list models from API
            models.addAll(fetchModelNamesFromAPI("https://generativelanguage.googleapis.com/v1beta/models?key="));
        } catch (Exception e) {
            System.err.println("Could not fetch models from API: " + e.getMessage());
        }
        
        // Always include known hardcoded models as fallbacks (with the 'models/' prefix)
        // Order: 1.5 Flash -> 1.5 Pro -> 2.0 Flash -> Pro
        String[] defaults = {"models/gemini-1.5-flash", "models/gemini-1.5-flash-latest", "models/gemini-1.5-pro", "models/gemini-pro", "models/gemini-2.0-flash-exp"};
        for (String d : defaults) {
            if (!models.contains(d)) models.add(d);
        }
        
        // If we have a cached one that worked before, move it to the top
        if (cachedModelName != null && models.contains(cachedModelName)) {
            models.remove(cachedModelName);
            models.add(0, cachedModelName);
        }
        
        return models;
    }

    private List<String> fetchModelNamesFromAPI(String url) {
        List<String> names = new ArrayList<>();
        try {
            String fullUrl = url + geminiApiKey.trim();
            ResponseEntity<String> response = restTemplate.getForEntity(fullUrl, String.class);
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> map = mapper.readValue(response.getBody(), Map.class);
            List<Map<String, Object>> modelsList = (List<Map<String, Object>>) map.get("models");
            
            if (modelsList != null) {
                for (Map<String, Object> m : modelsList) {
                    String name = (String) m.get("name");
                    List<String> methods = (List<String>) m.get("supportedGenerationMethods");
                    if (methods != null && methods.contains("generateContent")) {
                        names.add(name);
                    }
                }
            }
            // Sort to prefer 1.5 versions
            names.sort((a, b) -> {
                if (a.contains("1.5") && !b.contains("1.5")) return -1;
                if (b.contains("1.5") && !a.contains("1.5")) return 1;
                return a.compareTo(b);
            });
        } catch (Exception e) {
            // Silent fail
        }
        return names;
    }

    private String callGeminiAPI(String prompt, String fullModelName) {
        // fullModelName is already like "models/gemini-1.5-flash"
        String[] versions = {"v1beta", "v1"};
        Exception lastException = null;

        for (String version : versions) {
            try {
                if (geminiApiKey == null || geminiApiKey.isEmpty()) {
                    throw new RuntimeException("Gemini API key not configured");
                }
                
                // URL structure: https://generativelanguage.googleapis.com/{version}/{modelName}:generateContent
                String url = "https://generativelanguage.googleapis.com/" + version + "/" + fullModelName + ":generateContent?key=" + geminiApiKey.trim();
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                Map<String, Object> requestBody = new HashMap<>();
                List<Map<String, Object>> contents = new ArrayList<>();
                Map<String, Object> content = new HashMap<>();
                List<Map<String, String>> parts = new ArrayList<>();
                Map<String, String> part = new HashMap<>();
                part.put("text", prompt);
                parts.add(part);
                content.put("parts", parts);
                contents.add(content);
                requestBody.put("contents", contents);
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
                
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> responseMap = mapper.readValue(response.getBody(), Map.class);
                
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
                    if (partsList != null && !partsList.isEmpty()) {
                        return (String) partsList.get(0).get("text");
                    }
                }
                return "No response generated.";
                
            } catch (Exception e) {
                lastException = e;
                // If it's a 404, try the next version
                if (e.getMessage().contains("404")) {
                    continue;
                }
                // For other errors (like 429 quota), throw so the outer loop can try the NEXT model
                throw e;
            }
        }
        throw new RuntimeException(lastException.getMessage());
    }
    
    private void checkRateLimit(String userId) {
        try {
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            long recentQueries = aiQueryHistoryRepository.countRecentQueries(userId, oneHourAgo);
            if (recentQueries >= rateLimitPerHour) {
                throw new IllegalArgumentException("Rate limit exceeded.");
            }
        } catch (Exception e) {
            System.err.println("Rate limit check warning: " + e.getMessage());
        }
    }
    
    @Cacheable(value = "contextData", key = "#userId")
    private String gatherContextData(String userId) {
        StringBuilder context = new StringBuilder();
        try {
            var filings = filingRepository.findAll();
            context.append("Total Filings: ").append(filings.size()).append("\n");
            
            var ipAssets = ipAssetRepository.findAll();
            context.append("Total IP Assets: ").append(ipAssets.size()).append("\n");
            
            if (!ipAssets.isEmpty()) {
                context.append("Sample Assets: ");
                ipAssets.stream().limit(5).forEach(asset -> 
                    context.append(asset.getTitle()).append(", ")
                );
            }
        } catch (Exception e) {
            context.append("Context Error: ").append(e.getMessage());
        }
        return context.toString();
    }
    
    private String buildPrompt(String query, String contextData) {
        return "You are an IP expert.\nCONTEXT:\n" + contextData + "\n\nUSER QUESTION: " + query + "\n\nAnswer concisely.";
    }
    
    public List<AIQueryHistory> getHistory(String userId) {
        return aiQueryHistoryRepository.findTop20ByUserIdOrderByTimestampDesc(userId);
    }
    
    public void deleteQuery(Long queryId, String userId) {
        aiQueryHistoryRepository.deleteById(queryId);
    }
}