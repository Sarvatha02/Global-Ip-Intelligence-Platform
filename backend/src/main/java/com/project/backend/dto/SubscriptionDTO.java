package com.project.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubscriptionDTO {
    private Integer id;
    private Integer userId;
    private Integer ipAssetId;
    private String assetTitle; // For displaying in the UI
    private LocalDateTime createdAt;
}