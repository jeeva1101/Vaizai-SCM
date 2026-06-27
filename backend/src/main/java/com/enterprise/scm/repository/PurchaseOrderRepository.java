package com.enterprise.scm.repository;

import com.enterprise.scm.domain.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {
    List<PurchaseOrder> findByVendorId(String vendorId);
    List<PurchaseOrder> findByStatus(String status);
    
    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE po.status != 'CANCELLED'")
    BigDecimal calculateTotalSpend();
}
