package com.project.backend.dto;

import java.time.LocalDate;

public class FilingDTO {

    private Integer ipAssetId;
    private LocalDate filingDate;
    private String description;

    // ===== Getters and Setters =====
    public Integer getIpAssetId() {
        return ipAssetId;
    }

    public void setIpAssetId(Integer ipAssetId) {
        this.ipAssetId = ipAssetId;
    }

    public LocalDate getFilingDate() {
        return filingDate;
    }

    public void setFilingDate(LocalDate filingDate) {
        this.filingDate = filingDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
