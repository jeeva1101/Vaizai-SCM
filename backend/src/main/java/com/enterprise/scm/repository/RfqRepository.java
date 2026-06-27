package com.enterprise.scm.repository;

import com.enterprise.scm.domain.Rfq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, String> {
    List<Rfq> findByStatus(String status);
}
