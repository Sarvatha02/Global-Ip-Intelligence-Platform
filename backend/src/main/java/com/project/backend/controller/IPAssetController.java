package com.project.backend.controller;

import com.project.backend.entity.IPAsset;
import com.project.backend.service.IPAssetService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; 

@RestController
@RequestMapping("/api/ipassets")
public class IPAssetController {

    private final IPAssetService ipAssetService;

    public IPAssetController(IPAssetService ipAssetService) {
        this.ipAssetService = ipAssetService;
    }

    @PostMapping("/sync")
    public ResponseEntity<List<IPAsset>> syncAssets(@RequestBody List<IPAsset> assets) {
        if (assets == null || assets.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        List<IPAsset> savedAssets = ipAssetService.saveOrUpdateAll(assets);
        return ResponseEntity.ok(savedAssets); 
    }

    @PostMapping
    public ResponseEntity<IPAsset> create(@RequestBody IPAsset asset) {
        return ResponseEntity.ok(ipAssetService.createAsset(asset));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<IPAsset>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(required = false) String jurisdictions,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "all") String source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastUpdated") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        return ResponseEntity.ok(ipAssetService.search(
            keyword, 
            type, 
            jurisdictions, 
            status, 
            source, 
            page, 
            size, 
            sortBy, 
            sortDirection
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IPAsset> getById(@PathVariable Integer id) {
        return ipAssetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<IPAsset> update(@PathVariable Integer id, @RequestBody IPAsset asset) {
        return ResponseEntity.ok(ipAssetService.updateAsset(id, asset));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        ipAssetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}