package com.enterprise.scm.repository;

import com.enterprise.scm.domain.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, String> {
    List<Quotation> findByRfqId(String rfqId);
    List<Quotation> findByVendorId(String vendorId);
}
