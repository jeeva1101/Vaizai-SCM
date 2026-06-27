package com.enterprise.scm.repository;

import com.enterprise.scm.domain.WarehouseBin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarehouseBinRepository extends JpaRepository<WarehouseBin, String> {
    List<WarehouseBin> findByShelfId(String shelfId);
}
