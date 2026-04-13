package com.project.backend.repository;

import com.project.backend.entity.IPAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IPAssetRepository extends JpaRepository<IPAsset, Integer> {

    boolean existsByAssetNumber(String assetNumber);
    Optional<IPAsset> findByAssetNumber(String assetNumber);

    @Query("SELECT p.status, COUNT(p) FROM IPAsset p GROUP BY p.status")
    List<Object[]> countByStatusGrouped();

    List<IPAsset> findByTitleContainingIgnoreCase(String keyword);
    List<IPAsset> findByType(String type);
    List<IPAsset> findByStatus(String status);
    List<IPAsset> findByJurisdiction(String jurisdiction);
    List<IPAsset> findByAssigneeContaining(String assignee);
    List<IPAsset> findByInventorContaining(String inventor);
    List<IPAsset> findByAssetClassContaining(String assetClass);
    List<IPAsset> findTop10ByOrderByLastUpdatedDesc();

    List<IPAsset> findByTitleContainingIgnoreCaseOrDetailsContainingIgnoreCase(String title, String details);
    List<IPAsset> findByTypeAndTitleContainingIgnoreCaseOrDetailsContainingIgnoreCase(String type, String title, String details);

    @Query("SELECT i FROM IPAsset i WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(i.details) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<IPAsset> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT i FROM IPAsset i WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.assetNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(i.assignee) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:type = 'ALL' OR i.type = :type) " +
           "AND (:source = 'all' OR i.apiSource = :source) " +
           "AND (:jurisdictions IS NULL OR :jurisdictions = '' OR i.jurisdiction LIKE %:jurisdictions%) " +
           "AND (:status IS NULL OR :status = '' OR i.status = :status)")
    Page<IPAsset> searchAssets(
            @Param("keyword") String keyword,
            @Param("type") String type,
            @Param("jurisdictions") String jurisdictions,
            @Param("status") String status,
            @Param("source") String source,
            Pageable pageable
    );

    @Query("SELECT i FROM IPAsset i WHERE (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND (:assignee IS NULL OR LOWER(i.assignee) LIKE LOWER(CONCAT('%', :assignee, '%'))) AND (:inventor IS NULL OR LOWER(i.inventor) LIKE LOWER(CONCAT('%', :inventor, '%'))) AND (:jurisdiction IS NULL OR LOWER(i.jurisdiction) = LOWER(:jurisdiction))")
    List<IPAsset> advancedSearch(
            @Param("keyword") String keyword,
            @Param("assignee") String assignee,
            @Param("inventor") String inventor,
            @Param("jurisdiction") String jurisdiction
    );

    @Query("SELECT a.jurisdiction, COUNT(a) FROM IPAsset a WHERE (:keyword IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) GROUP BY a.jurisdiction")
    List<Object[]> getJurisdictionCounts(@Param("keyword") String keyword);

    @Query("SELECT a FROM IPAsset a WHERE FUNCTION('YEAR', a.filingDate) = :year")
    List<IPAsset> findByFilingDateYear(@Param("year") int year);

    @Query("SELECT a FROM IPAsset a WHERE FUNCTION('YEAR', a.filingDate) = :year AND FUNCTION('QUARTER', a.filingDate) = :quarter")
    List<IPAsset> findByFilingDateQuarter(@Param("year") int year, @Param("quarter") int quarter);
}