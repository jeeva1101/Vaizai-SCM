package com.enterprise.scm.repository;

import com.enterprise.scm.domain.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {
    Optional<InventoryItem> findBySku(String sku);
    List<InventoryItem> findByOrganizationId(String organizationId);
    List<InventoryItem> findByStatus(String status);
    
    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.status = 'LOW_STOCK'")
    long countLowStockItems();
}
