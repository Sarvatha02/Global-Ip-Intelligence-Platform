package com.project.backend.service;

import com.project.backend.entity.Filing;
import com.project.backend.entity.IPAsset;
import com.project.backend.repository.FilingRepository;
import com.project.backend.repository.IPAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FilingService {

    @Autowired
    private FilingRepository filingRepository;

    @Autowired
    private IPAssetRepository ipAssetRepository;

    public Filing createFiling(Integer ipAssetId, Filing filingRequest) {

        IPAsset ipAsset = ipAssetRepository.findById(ipAssetId)
                .orElseThrow(() -> new RuntimeException("IP Asset not found"));

        filingRequest.setIpAsset(ipAsset);

        return filingRepository.save(filingRequest);
    }
}
