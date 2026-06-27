package com.enterprise.scm.repository;

import com.enterprise.scm.domain.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, String> {
    Optional<Vendor> findByUserId(String userId);
    List<Vendor> findByVerificationStatus(String status);
}
