// AIQueryHistory.java - Entity
package com.project.backend.entity;

// CHANGE THIS LINE from javax.persistence.* to jakarta.persistence.*
import jakarta.persistence.*; 
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_query_history")
public class AIQueryHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false, length = 1000)
    private String query;
    
    @Column(columnDefinition = "TEXT")
    private String response;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column
    private Integer tokensUsed;
    
    @Column
    private Long responseTimeMs;
    
    @Column
    private Boolean contextUsed;
    
    @Column(length = 500)
    private String errorMessage;

    public AIQueryHistory() {
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters remain the same...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Integer getTokensUsed() { return tokensUsed; }
    public void setTokensUsed(Integer tokensUsed) { this.tokensUsed = tokensUsed; }
    
    public Long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(Long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
    
    public Boolean getContextUsed() { return contextUsed; }
    public void setContextUsed(Boolean contextUsed) { this.contextUsed = contextUsed; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}