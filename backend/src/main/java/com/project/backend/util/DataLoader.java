package com.project.backend.util;



import com.project.backend.entity.IPAsset;

import com.project.backend.repository.IPAssetRepository;

import jakarta.annotation.PostConstruct;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

import java.util.ArrayList;

import java.util.List;

import java.util.Random;



@Component

public class DataLoader {



    private final IPAssetRepository ipAssetRepository;



    public DataLoader(IPAssetRepository ipAssetRepository) {

        this.ipAssetRepository = ipAssetRepository;

    }



    @PostConstruct

    public void loadData() {

        // ✅ 1. CHECK IF DATA EXISTS

        long count = ipAssetRepository.count();

        if (count > 0) {

            System.out.println("⚡ Database already populated with " + count + " records. Skipping seed.");

            return; // EXIT - Do not insert duplicates

        }



        System.out.println("🌱 Database empty. Seeding 60+ Real-World Patents & Trademarks...");



        List<IPAsset> assets = new ArrayList<>();



        // --- 1. TECHNOLOGY PATENTS (Active & Pending) ---

        assets.add(create("PATENT", "US105001", "PageRank Algorithm", "Method for node ranking in a linked database.", "Google LLC", "Larry Page", "US", "ACTIVE", "G06F17/30"));

        assets.add(create("PATENT", "US2023001", "Quantum Computing Processor", "Superconducting qubit architecture for error correction.", "IBM", "Jay Gambetta", "US", "PENDING", "G06N10/00"));

        assets.add(create("PATENT", "US998877", "Slide to Unlock", "Touch screen device unlocking mechanism.", "Apple Inc.", "Steve Jobs", "US", "EXPIRED", "G06F3/0488"));

        assets.add(create("PATENT", "US112233", "Neuralink Brain Interface", "High bandwidth brain-machine interface threads.", "Neuralink Corp", "Elon Musk", "US", "ACTIVE", "A61B5/04"));

        assets.add(create("PATENT", "JP2022-55", "Solid State Battery", "High capacity sulfide-based solid electrolyte.", "Toyota Motor Corp", "Koji Sato", "JP", "PENDING", "H01M10/0562"));

        assets.add(create("PATENT", "KR10-2023", "Foldable Display Panel", "OLED display with zero-gap hinge mechanism.", "Samsung Electronics", "Han Jong-hee", "KR", "ACTIVE", "G09F9/30"));

        assets.add(create("PATENT", "US888888", "Hyperloop Transportation", "High-speed capsule transportation system in vacuum tubes.", "Hyperloop One", "Josh Giegel", "US", "ABANDONED", "B61B13/10"));

        assets.add(create("PATENT", "EP300400", "5G Network Slicing", "Dynamic network resource allocation method.", "Ericsson", "Borje Ekholm", "EP", "ACTIVE", "H04W48/18"));

        assets.add(create("PATENT", "CN112233", "AI Facial Recognition", "Real-time crowd monitoring and identification system.", "SenseTime", "Xu Li", "CN", "ACTIVE", "G06K9/00"));

        assets.add(create("PATENT", "US600100", "One-Click Buying", "Method and system for placing a purchase order via a communications network.", "Amazon.com", "Jeff Bezos", "US", "EXPIRED", "G06Q30/06"));



        // --- 2. PHARMA & BIOTECH (High Value) ---

        assets.add(create("PATENT", "US900500", "CRISPR-Cas9 Gene Editing", "Method for altering genome sequences in eukaryotic cells.", "Broad Institute", "Feng Zhang", "US", "ACTIVE", "C12N15/10"));

        assets.add(create("PATENT", "EP500600", "mRNA Vaccine Platform", "Lipid nanoparticle delivery system for mRNA vaccines.", "BioNTech SE", "Ugur Sahin", "EP", "ACTIVE", "A61K39/00"));

        assets.add(create("PATENT", "US777777", "Viagra Composition", "Sildenafil citrate for treatment of erectile dysfunction.", "Pfizer", "Peter Dunn", "US", "EXPIRED", "A61K31/519"));

        assets.add(create("PATENT", "IN2023-99", "Cost-Effective Insulin", "Recombinant DNA method for mass production of insulin.", "Biocon", "Kiran Mazumdar-Shaw", "IN", "PENDING", "C07K14/62"));

        assets.add(create("PATENT", "US300200", "Monoclonal Antibody Therapy", "Cancer treatment targeting PD-1 inhibitors.", "Merck & Co.", "Rob Davis", "US", "ACTIVE", "C07K16/28"));



        // --- 3. AUTOMOTIVE & ENERGY ---

        assets.add(create("PATENT", "US100400", "Tesla Electric Motor", "Liquid cooled AC induction motor for EVs.", "Tesla Inc.", "JB Straubel", "US", "ACTIVE", "H02K9/19"));

        assets.add(create("PATENT", "DE102022", "Hydrogen Fuel Cell Stack", "Proton exchange membrane fuel cell with enhanced durability.", "BMW Group", "Oliver Zipse", "DE", "PENDING", "H01M8/10"));

        assets.add(create("PATENT", "US550550", "Regenerative Braking System", "Energy recovery mechanism for hybrid vehicles.", "Ford Global", "Jim Farley", "US", "ACTIVE", "B60L7/10"));

        assets.add(create("PATENT", "JP400500", "Hybrid Synergy Drive", "Power split device for internal combustion and electric motors.", "Toyota", "Akio Toyoda", "JP", "ACTIVE", "B60K6/445"));

        assets.add(create("PATENT", "CN888999", "Sodium-Ion Battery", "Low-cost energy storage for grid applications.", "CATL", "Robin Zeng", "CN", "ACTIVE", "H01M10/054"));



        // --- 4. FAMOUS TRADEMARKS (Registered & Active) ---

        assets.add(create("TRADEMARK", "TM-US-001", "Coca-Cola", "Distinctive cursive script text logo.", "The Coca-Cola Company", "John Pemberton", "US", "RENEWED", "Class 32"));

        assets.add(create("TRADEMARK", "TM-US-002", "Nike Swoosh", "Abstract checkmark design.", "Nike Inc.", "Carolyn Davidson", "US", "REGISTERED", "Class 25"));

        assets.add(create("TRADEMARK", "TM-US-003", "Apple Logo", "Bitten apple silhouette.", "Apple Inc.", "Rob Janoff", "US", "REGISTERED", "Class 9"));

        assets.add(create("TRADEMARK", "TM-US-004", "McDonald's Arches", "Golden M symbol.", "McDonald's Corp", "Ray Kroc", "US", "REGISTERED", "Class 43"));

        assets.add(create("TRADEMARK", "TM-FR-005", "Louis Vuitton Monogram", "Interlocking LV with floral pattern.", "LVMH", "Georges Vuitton", "EP", "REGISTERED", "Class 18"));

        assets.add(create("TRADEMARK", "TM-JP-006", "Nintendo", "Kanji characters and red box logo.", "Nintendo Co.", "Fusajiro Yamauchi", "JP", "ACTIVE", "Class 28"));

        assets.add(create("TRADEMARK", "TM-DE-007", "Mercedes Star", "Three-pointed star in a circle.", "Mercedes-Benz Group", "Gottlieb Daimler", "DE", "REGISTERED", "Class 12"));

        assets.add(create("TRADEMARK", "TM-IT-008", "Ferrari Prancing Horse", "Black horse on yellow shield.", "Ferrari S.p.A.", "Enzo Ferrari", "IT", "REGISTERED", "Class 12"));

        assets.add(create("TRADEMARK", "TM-US-009", "Mickey Mouse", "Character likeness and ears silhouette.", "Disney", "Walt Disney", "US", "ACTIVE", "Class 41"));

        assets.add(create("TRADEMARK", "TM-GB-010", "Burberry Check", "Distinctive tartan pattern.", "Burberry Group", "Thomas Burberry", "UK", "REGISTERED", "Class 25"));



        // --- 5. SOFTWARE & INTERNET TRADEMARKS ---

        assets.add(create("TRADEMARK", "TM-US-011", "Google", "Multi-colored wordmark.", "Google LLC", "Ruth Kedar", "US", "REGISTERED", "Class 42"));

        assets.add(create("TRADEMARK", "TM-US-012", "Twitter Bird", "Blue bird silhouette (Legacy).", "X Corp", "Jack Dorsey", "US", "ABANDONED", "Class 38"));

        assets.add(create("TRADEMARK", "TM-CN-013", "TikTok", "Musical note with glitch effect.", "ByteDance", "Zhang Yiming", "CN", "REGISTERED", "Class 41"));

        assets.add(create("TRADEMARK", "TM-US-014", "Bitcoin", "Orange circle with B symbol.", "Open Source", "Satoshi Nakamoto", "US", "REJECTED", "Class 36"));

        assets.add(create("TRADEMARK", "TM-US-015", "Netflix", "Red N ribbon animation.", "Netflix Inc.", "Reed Hastings", "US", "ACTIVE", "Class 41"));



        // --- 6. INDIAN IP ASSETS ---

        assets.add(create("PATENT", "IN100200", "Covaxin Vaccine", "Inactivated virus-based COVID-19 vaccine.", "Bharat Biotech", "Krishna Ella", "IN", "ACTIVE", "A61K39/12"));

        assets.add(create("PATENT", "IN300400", "Nano Urea", "Liquid nano fertilizer for enhanced crop yield.", "IFFCO", "U.S. Awasthi", "IN", "PENDING", "C05C9/00"));

        assets.add(create("TRADEMARK", "TM-IN-001", "Tata Salt", "Desh Ka Namak tagline.", "Tata Consumer", "Tata Group", "IN", "ACTIVE", "Class 30"));

        assets.add(create("TRADEMARK", "TM-IN-002", "Amul Girl", "Cartoon mascot in polka dot dress.", "GCMMF", "Eustace Fernandes", "IN", "REGISTERED", "Class 29"));

        assets.add(create("TRADEMARK", "TM-IN-003", "Reliance Jio", "Jio logo in circle.", "Reliance Industries", "Mukesh Ambani", "IN", "REGISTERED", "Class 38"));



        // --- 7. CONSUMER GOODS & OTHERS ---

        assets.add(create("PATENT", "US444555", "Gore-Tex Fabric", "Waterproof breathable membrane.", "W.L. Gore", "Robert Gore", "US", "ACTIVE", "D06N3/00"));

        assets.add(create("PATENT", "US222333", "Dyson Cyclone Vacuum", "Bagless dust separation technology.", "Dyson Ltd", "James Dyson", "UK", "ACTIVE", "A47L9/16"));

        assets.add(create("PATENT", "US111000", "Post-It Note Glue", "Microsphere adhesive pressure sensitive.", "3M Company", "Spencer Silver", "US", "EXPIRED", "C09J7/00"));

        assets.add(create("TRADEMARK", "TM-US-020", "Lego Brick", "Stud configuration on toy bricks.", "The LEGO Group", "Ole Kirk Christiansen", "DK", "REGISTERED", "Class 28"));

        assets.add(create("TRADEMARK", "TM-CH-021", "Rolex Crown", "Five-pointed crown logo.", "Rolex SA", "Hans Wilsdorf", "CH", "REGISTERED", "Class 14"));



        // ... Add 20 more random filler entries to ensure volume

        for (int i = 1; i <= 20; i++) {

            assets.add(create("PATENT", "GEN-US-" + (800000 + i), "Genetic Modification Method " + i,

                "Advanced gene splicing technique for agriculture.", "Monsanto", "Scientist " + i, "US", "ACTIVE", "C12N15/82"));

        }



        ipAssetRepository.saveAll(assets);

        System.out.println("✅ Successfully Seeded " + assets.size() + " Records into Database.");

    }



    private IPAsset create(String type, String number, String title, String details,

                           String assignee, String inventor, String jurisdiction, String status, String ipcCode) {

        IPAsset ip = new IPAsset();

        ip.setType(type); // "PATENT" or "TRADEMARK"

        ip.setAssetNumber(number);

        ip.setTitle(title);

        ip.setDetails(details);

        ip.setAssignee(assignee);

        ip.setInventor(inventor);

        ip.setJurisdiction(jurisdiction);

        ip.setStatus(status);

        ip.setAssetClass(ipcCode); // Using IPC/Nice Class code here

       

        // Randomize dates slightly for realism

        Random rand = new Random();

        int yearsAgo = rand.nextInt(15); // 0 to 14 years ago

        ip.setFilingDate(LocalDateTime.now().minusYears(yearsAgo).minusDays(rand.nextInt(365)));

        ip.setApiSource("LOCAL");

        ip.setLastUpdated(LocalDateTime.now());



        return ip;

    }

}