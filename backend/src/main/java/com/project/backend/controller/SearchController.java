package com.project.backend.controller;

import com.project.backend.entity.IPAsset;
import com.project.backend.service.IPAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Search API", description = "Search Patents & Trademarks with Analytics")
public class SearchController {

    private final IPAssetService ipAssetService;

    public SearchController(IPAssetService ipAssetService) {
        this.ipAssetService = ipAssetService;
    }

    @GetMapping
    @Operation(summary = "Unified Search with API + DB Persistence")
    public Page<IPAsset> search(
            @RequestParam(name = "q", required = false, defaultValue = "") String keyword,
            @RequestParam(name = "source", required = false, defaultValue = "local") String source,
            @RequestParam(name = "type", required = false, defaultValue = "ALL") String type,
            @RequestParam(name = "jurisdictions", required = false) String jurisdictions,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "filingDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {

        System.out.println(
                ">>> SEARCH REQUEST | q=" + keyword +
                " | source=" + source +
                " | type=" + type +
                " | jurisdictions=" + jurisdictions +
                " | status=" + status +
                " | page=" + page +
                " | size=" + size
        );

        return ipAssetService.search(
                keyword,
                type,
                jurisdictions,
                status,
                source,
                page,
                size,
                sortBy,
                sortDirection
        );
    }

    @GetMapping("/analysis")
    @Operation(summary = "Fetch all IP assets for analytics dashboards")
    public List<IPAsset> getAnalysisData() {
        return ipAssetService.getAllAssetsForAnalysis();
    }
}