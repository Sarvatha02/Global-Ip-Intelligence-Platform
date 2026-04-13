// AIQueryRequest.java - DTO
package com.project.backend.dto;

// 🔴 CHANGE THESE LINES to use jakarta instead of javax
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AIQueryRequest {
    
    @NotBlank(message = "Query cannot be empty")
    @Size(max = 500, message = "Query must be less than 500 characters")
    private String query;
    
    private String userId;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}