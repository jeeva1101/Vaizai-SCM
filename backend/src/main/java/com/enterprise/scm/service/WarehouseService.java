package com.enterprise.scm.service;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseZoneRepository warehouseZoneRepository;

    @Autowired
    private WarehouseBinRepository warehouseBinRepository;

    @Autowired
    private WarehouseRackRepository warehouseRackRepository;

    @Autowired
    private WarehouseShelfRepository warehouseShelfRepository;

    public Warehouse createWarehouse(Warehouse warehouse) {
        if (warehouse.getId() == null) {
            warehouse.setId("WH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public List<WarehouseZone> getZonesForWarehouse(String warehouseId) {
        return warehouseZoneRepository.findByWarehouseId(warehouseId);
    }

    public List<WarehouseBin> getBinsForShelf(String shelfId) {
        return warehouseBinRepository.findByShelfId(shelfId);
    }

    public BigDecimal getCapacityUtilization(String warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        if (warehouse.getCapacityCubicMeters().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return warehouse.getUsedCapacityCubicMeters()
                .multiply(BigDecimal.valueOf(100))
                .divide(warehouse.getCapacityCubicMeters(), 2, RoundingMode.HALF_UP);
    }

    public List<WarehouseRack> getRacksForWarehouse(String warehouseId) {
        List<WarehouseZone> zones = warehouseZoneRepository.findByWarehouseId(warehouseId);
        List<String> zoneIds = zones.stream().map(WarehouseZone::getId).toList();
        return warehouseRackRepository.findAll().stream()
                .filter(r -> r.getZone() != null && zoneIds.contains(r.getZone().getId()))
                .toList();
    }

    public List<WarehouseShelf> getShelvesForRack(String rackId) {
        return warehouseShelfRepository.findByRackId(rackId);
    }

    public WarehouseBin updateBinStatus(String binId, String status) {
        WarehouseBin bin = warehouseBinRepository.findById(binId)
                .orElseThrow(() -> new RuntimeException("Bin not found"));
        bin.setStatus(status);
        return warehouseBinRepository.save(bin);
    }

    public List<WarehouseBin> getAllBins() {
        return warehouseBinRepository.findAll();
    }
}
