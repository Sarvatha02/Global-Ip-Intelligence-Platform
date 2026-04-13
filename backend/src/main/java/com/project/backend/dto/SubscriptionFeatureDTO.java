package com.project.backend.dto;

import java.util.Map;

public class SubscriptionFeatureDTO {
    private String planType;
    private Map<String, Boolean> features;

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }
    public Map<String, Boolean> getFeatures() { return features; }
    public void setFeatures(Map<String, Boolean> features) { this.features = features; }

    public static class Builder {
        private SubscriptionFeatureDTO dto = new SubscriptionFeatureDTO();
        public Builder planType(String v) { dto.planType = v; return this; }
        public Builder features(Map<String, Boolean> v) { dto.features = v; return this; }
        public SubscriptionFeatureDTO build() { return dto; }
    }
    public static Builder builder() { return new Builder(); }
}