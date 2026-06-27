package com.enterprise.scm.repository;

import com.enterprise.scm.domain.WarehouseRack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarehouseRackRepository extends JpaRepository<WarehouseRack, String> {
    List<WarehouseRack> findByZoneId(String zoneId);
}
