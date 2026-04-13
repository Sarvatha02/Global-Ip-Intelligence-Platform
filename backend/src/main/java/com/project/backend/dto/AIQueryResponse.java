// AIQueryResponse.java - DTO
package com.project.backend.dto;

import java.time.LocalDateTime;

public class AIQueryResponse {
    private String query;
    private String response;
    private LocalDateTime timestamp;
    private Boolean contextUsed;
    private String error;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Boolean getContextUsed() { return contextUsed; }
    public void setContextUsed(Boolean contextUsed) { this.contextUsed = contextUsed; }
    
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}