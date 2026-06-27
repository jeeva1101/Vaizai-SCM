package com.enterprise.scm.repository;

import com.enterprise.scm.domain.WarehouseZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarehouseZoneRepository extends JpaRepository<WarehouseZone, String> {
    List<WarehouseZone> findByWarehouseId(String warehouseId);
}
