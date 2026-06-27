package com.enterprise.scm.repository;

import com.enterprise.scm.domain.ShipmentMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShipmentMilestoneRepository extends JpaRepository<ShipmentMilestone, Long> {
    List<ShipmentMilestone> findByShipmentIdOrderByTimestampAsc(String shipmentId);
}
