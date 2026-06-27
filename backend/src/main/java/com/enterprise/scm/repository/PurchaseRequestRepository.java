package com.enterprise.scm.repository;

import com.enterprise.scm.domain.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, String> {
    List<PurchaseRequest> findByOrganizationId(String organizationId);
    List<PurchaseRequest> findByStatus(String status);
    List<PurchaseRequest> findByRequesterId(String requesterId);
}
