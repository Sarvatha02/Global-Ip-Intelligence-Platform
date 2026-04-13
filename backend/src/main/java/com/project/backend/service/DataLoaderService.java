package com.project.backend.service;

import com.project.backend.entity.IPAsset;
import com.project.backend.repository.IPAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime; // Import added for consistency
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class DataLoaderService implements CommandLineRunner {

    private final IPAssetRepository ipAssetRepository;

    @Override
    public void run(String... args) {
        if (ipAssetRepository.count() == 0) {
            loadSampleData();
        }
    }

    private void loadSampleData() {
        List<IPAsset> assets = new ArrayList<>();
        Random random = new Random();
        
        String[] assignees = {"Google LLC", "Microsoft Corporation", "Apple Inc", "Samsung Electronics", 
                              "IBM Corporation", "Intel Corporation", "Amazon Technologies", "Tesla Inc"};
        String[] inventors = {"John Smith", "Maria Garcia", "Wei Zhang", "Raj Patel", "Sarah Johnson"};
        String[] statuses = {"ACTIVE", "PENDING", "GRANTED", "EXPIRED"};
        String[] jurisdictions = {"US", "EP", "JP", "CN", "KR"};
        String[] classifications = {"G06F", "H04L", "A61K", "C07D", "H01L", "G06N", "H04W"};
        String[] types = {"PATENT", "TRADEMARK"};

        for (int i = 1; i <= 500; i++) {
            IPAsset asset = new IPAsset();
            asset.setAssetNumber("US" + (10000000 + i) + "B2");
            asset.setTitle("Innovation in " + classifications[random.nextInt(classifications.length)] + " Technology " + i);
            asset.setInventor(inventors[random.nextInt(inventors.length)]);
            asset.setAssignee(assignees[random.nextInt(assignees.length)]);
            
            // ✅ FIX 1: Create a random date (LocalDate) within the last 5 years
            LocalDate filingDate = LocalDate.now().minusDays(random.nextInt(5 * 365));

            // ✅ FIX 2: Use correct object 'asset' and convert LocalDate to LocalDateTime
            asset.setFilingDate(filingDate.atStartOfDay());
            
            asset.setPublicationDate(asset.getFilingDate().plusMonths(18));
            asset.setStatus(statuses[random.nextInt(statuses.length)]);
            asset.setJurisdiction(jurisdictions[random.nextInt(jurisdictions.length)]);
            asset.setClassification(classifications[random.nextInt(classifications.length)]);
            asset.setType(types[random.nextInt(types.length)]);
            asset.setAbstractText("This patent describes a novel approach to solving technical challenges in the field.");
            asset.setSource("SAMPLE");
            assets.add(asset);
        }

        ipAssetRepository.saveAll(assets);
        System.out.println("✅ Loaded " + assets.size() + " sample IP assets into database");
    }
}