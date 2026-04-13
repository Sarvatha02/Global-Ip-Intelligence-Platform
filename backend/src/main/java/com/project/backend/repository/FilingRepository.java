package com.project.backend.repository;

import com.project.backend.entity.Filing;
import com.project.backend.entity.IPAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FilingRepository extends JpaRepository<Filing, Integer> {
    List<Filing> findByIpAsset(IPAsset asset);   // ✅ Add this line
}
