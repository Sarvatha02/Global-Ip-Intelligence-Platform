package com.project.backend.dto;

public class GeoLocationDTO {
    private String jurisdiction;
    private String jurisdictionName;
    private Long patentCount;
    private Long trademarkCount;
    private Long activeCount;
    private Long pendingCount;
    private Double latitude;
    private Double longitude;
    private Integer zoom;
    private int count; // For compatibility

    // --- CONSTRUCTORS ---
    public GeoLocationDTO() {}

    // ✅ Matching Constructor for GeoService
    public GeoLocationDTO(String jurisdiction, String jurisdictionName, Long patentCount, 
                          Long trademarkCount, Long activeCount, Long pendingCount, 
                          Double latitude, Double longitude, Integer zoom) {
        this.jurisdiction = jurisdiction;
        this.jurisdictionName = jurisdictionName;
        this.patentCount = patentCount;
        this.trademarkCount = trademarkCount;
        this.activeCount = activeCount;
        this.pendingCount = pendingCount;
        this.latitude = latitude;
        this.longitude = longitude;
        this.zoom = zoom;
    }

    // --- GETTERS & SETTERS ---
    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getJurisdictionName() { return jurisdictionName; }
    public void setJurisdictionName(String jurisdictionName) { this.jurisdictionName = jurisdictionName; }

    public Long getPatentCount() { return patentCount; }
    public void setPatentCount(Long patentCount) { this.patentCount = patentCount; }

    public Long getTrademarkCount() { return trademarkCount; }
    public void setTrademarkCount(Long trademarkCount) { this.trademarkCount = trademarkCount; }

    public Long getActiveCount() { return activeCount; }
    public void setActiveCount(Long activeCount) { this.activeCount = activeCount; }

    public Long getPendingCount() { return pendingCount; }
    public void setPendingCount(Long pendingCount) { this.pendingCount = pendingCount; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getZoom() { return zoom; }
    public void setZoom(Integer zoom) { this.zoom = zoom; }

    // Helper for IPAssetService
    public void setCount(int count) {
        this.count = count;
        this.patentCount = (long) count;
    }
    public int getCount() { return count; }
}