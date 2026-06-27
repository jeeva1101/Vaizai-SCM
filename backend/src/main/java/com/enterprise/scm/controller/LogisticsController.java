package com.enterprise.scm.controller;

import com.enterprise.scm.domain.Shipment;
import com.enterprise.scm.service.LogisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/logistics")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
public class LogisticsController {

    @Autowired
    private LogisticsService logisticsService;

    @GetMapping("/shipments")
    public ResponseEntity<List<Shipment>> getShipments() {
        return ResponseEntity.ok(logisticsService.getAllShipments());
    }

    @PostMapping("/shipments")
    public ResponseEntity<?> createShipment(@RequestBody Map<String, String> body) {
        try {
            String orderId = body.get("orderId");
            String carrier = body.get("carrier");
            String vehicleNumber = body.get("vehicleNumber");
            String driverName = body.get("driverName");
            String driverPhone = body.get("driverPhone");
            String routePath = body.get("routePath");

            Shipment shp = logisticsService.createShipment(orderId, carrier, vehicleNumber, driverName, driverPhone, routePath);
            return ResponseEntity.ok(shp);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/shipments/{shpId}/milestones")
    public ResponseEntity<?> addMilestone(@PathVariable String shpId, @RequestBody Map<String, Object> body) {
        try {
            String status = (String) body.get("status");
            String location = (String) body.get("location");
            BigDecimal latitude = new BigDecimal(body.get("latitude").toString());
            BigDecimal longitude = new BigDecimal(body.get("longitude").toString());
            String description = (String) body.get("description");

            Shipment shp = logisticsService.addMilestone(shpId, status, location, latitude, longitude, description);
            return ResponseEntity.ok(shp);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/shipments/{shpId}/milestones")
    public ResponseEntity<?> getMilestones(@PathVariable String shpId) {
        return ResponseEntity.ok(logisticsService.getShipmentMilestones(shpId));
    }
}
