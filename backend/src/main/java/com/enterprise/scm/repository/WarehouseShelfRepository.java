package com.enterprise.scm.repository;

import com.enterprise.scm.domain.WarehouseShelf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarehouseShelfRepository extends JpaRepository<WarehouseShelf, String> {
    List<WarehouseShelf> findByRackId(String rackId);
}
