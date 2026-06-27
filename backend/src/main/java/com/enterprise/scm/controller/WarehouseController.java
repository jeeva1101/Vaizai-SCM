package com.enterprise.scm.controller;

import com.enterprise.scm.domain.Warehouse;
import com.enterprise.scm.domain.WarehouseBin;
import com.enterprise.scm.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/warehouses")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','WAREHOUSE_MANAGER','INVENTORY_MANAGER')")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<?> getWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @PostMapping
    public ResponseEntity<?> createWarehouse(@RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.createWarehouse(warehouse));
    }

    @GetMapping("/{whId}/zones")
    public ResponseEntity<?> getZones(@PathVariable String whId) {
        return ResponseEntity.ok(warehouseService.getZonesForWarehouse(whId));
    }

    @GetMapping("/{whId}/racks")
    public ResponseEntity<?> getRacks(@PathVariable String whId) {
        return ResponseEntity.ok(warehouseService.getRacksForWarehouse(whId));
    }

    @GetMapping("/{whId}/zones/{zoneId}/racks/{rackId}/shelves")
    public ResponseEntity<?> getShelves(@PathVariable String whId, @PathVariable String zoneId, @PathVariable String rackId) {
        return ResponseEntity.ok(warehouseService.getShelvesForRack(rackId));
    }

    @GetMapping("/shelves/{shelfId}/bins")
    public ResponseEntity<?> getBins(@PathVariable String shelfId) {
        return ResponseEntity.ok(warehouseService.getBinsForShelf(shelfId));
    }

    @GetMapping("/{whId}/utilization")
    public ResponseEntity<?> getUtilization(@PathVariable String whId) {
        try {
            return ResponseEntity.ok(Map.of("utilizationPercentage", warehouseService.getCapacityUtilization(whId)));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/bins/{binId}/status")
    public ResponseEntity<?> updateBinStatus(@PathVariable String binId, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            WarehouseBin updatedBin = warehouseService.updateBinStatus(binId, status);
            return ResponseEntity.ok(updatedBin);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/bins")
    public ResponseEntity<?> getAllBins() {
        return ResponseEntity.ok(warehouseService.getAllBins());
    }
}
