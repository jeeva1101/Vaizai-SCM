package com.enterprise.scm.repository;

import com.enterprise.scm.domain.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, String> {
    List<CustomerOrder> findByOrganizationId(String organizationId);
    List<CustomerOrder> findByStatus(String status);
    
    @Query("SELECT SUM(co.totalAmount) FROM CustomerOrder co WHERE co.status = 'DELIVERED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(co) FROM CustomerOrder co WHERE co.status = 'PENDING' OR co.status = 'APPROVED' OR co.status = 'PROCESSING'")
    long countActiveOrders();
}
