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
            
            // ✅ STEP 1: Find a working model dynamically
            if (cachedModelName == null) {
                cachedModelName = findAvailableModel();
                System.out.println("✅ Selected AI Model: " + cachedModelName);
            }
            
            // ✅ STEP 2: Call API with the found model
            String aiResponse = callGeminiAPI(prompt, cachedModelName);
            
            long endTime = System.currentTimeMillis();
            
            historyEntry.setResponse(aiResponse);
            historyEntry.setResponseTimeMs(endTime - startTime);
            
            response.setQuery(query);
            response.setResponse(aiResponse);
            response.setTimestamp(LocalDateTime.now());
            response.setContextUsed(true);
            
        } catch (Exception e) {
            historyEntry.setErrorMessage(e.getMessage());
            response.setError("AI Analysis failed: " + e.getMessage());
            // Clear cache if it failed, maybe model changed
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

    // 🔥 NEW FUNCTION: Asks Google which models are available
    private String findAvailableModel() {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + geminiApiKey.trim();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> map = mapper.readValue(response.getBody(), Map.class);
            List<Map<String, Object>> models = (List<Map<String, Object>>) map.get("models");
            
            // Look for flash first, then pro
            for (Map<String, Object> model : models) {
                String name = (String) model.get("name");
                List<String> methods = (List<String>) model.get("supportedGenerationMethods");
                
                // We need a model that supports 'generateContent'
                if (methods != null && methods.contains("generateContent")) {
                    // Prefer Flash (Faster/Cheaper)
                    if (name.contains("flash")) return name.replace("models/", "");
                }
            }
            
            // Fallback: If no flash, return any 'pro' model
            for (Map<String, Object> model : models) {
                String name = (String) model.get("name");
                List<String> methods = (List<String>) model.get("supportedGenerationMethods");
                if (methods != null && methods.contains("generateContent") && name.contains("gemini")) {
                    return name.replace("models/", "");
                }
            }
            
            throw new RuntimeException("No suitable Gemini model found for this API Key.");
            
        } catch (Exception e) {
            System.err.println("Failed to list models: " + e.getMessage());
            // Absolute fallback if listing fails
            return "gemini-1.5-flash"; 
        }
    }

    private String callGeminiAPI(String prompt, String modelName) {
        try {
            if (geminiApiKey == null || geminiApiKey.isEmpty()) {
                throw new RuntimeException("Gemini API key not configured");
            }
            
            // ✅ Uses the dynamic model name
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + geminiApiKey.trim();
            
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
            throw new RuntimeException("Gemini API Error (" + modelName + "): " + e.getMessage());
        }
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