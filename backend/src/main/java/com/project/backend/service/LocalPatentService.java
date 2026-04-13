package com.project.backend.service;

import com.project.backend.dto.SearchRequestDTO;
import com.project.backend.dto.SearchResponseDTO;
import com.project.backend.entity.IPAsset;
import com.project.backend.repository.IPAssetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocalPatentService {

    private final IPAssetRepository repository;

    public LocalPatentService(IPAssetRepository repository) {
        this.repository = repository;
    }

    public List<SearchResponseDTO> search(SearchRequestDTO request) {

        // Call advancedSearch directly on the repository
        List<IPAsset> assets = repository.advancedSearch(
                request.getKeyword(),
                request.getAssignee(),
                request.getInventor(),
                request.getJurisdiction()
        );

        // Map the IPAsset entities to SearchResponseDTO
        return assets.stream().map(ip -> {
            SearchResponseDTO dto = new SearchResponseDTO();
            dto.setId(ip.getId());
            dto.setType(ip.getType());
            dto.setAssetNumber(ip.getAssetNumber());
            dto.setTitle(ip.getTitle());
            dto.setAssignee(ip.getAssignee());
            dto.setInventor(ip.getInventor());
            dto.setJurisdiction(ip.getJurisdiction());
            dto.setStatus(ip.getStatus());
            dto.setFilingDate(ip.getFilingDate());
            dto.setSource("DATABASE");
            return dto;
        }).collect(Collectors.toList());
    }
}
