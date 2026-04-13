package com.project.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Integer id;
    private String message;
    private String type;
    private LocalDateTime timestamp;
    private Integer ipAssetId;
}