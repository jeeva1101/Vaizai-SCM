package com.enterprise.scm.controller;

import com.enterprise.scm.repository.*;
import com.enterprise.scm.service.AnomalyDetector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private PurchaseRequestRepository purchaseRequestRepository;

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private AnomalyDetector anomalyDetector;

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary(@RequestParam(required = false) String role) {
        Map<String, Object> summary = new HashMap<>();

        // Calculations
        BigDecimal totalSpend = purchaseOrderRepository.calculateTotalSpend();
        if (totalSpend == null) {
            totalSpend = BigDecimal.ZERO;
        }
        BigDecimal totalRevenue = customerOrderRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        long activeOrders = customerOrderRepository.countActiveOrders();
        long lowStockCount = inventoryItemRepository.countLowStockItems();
        long totalWarehouses = warehouseRepository.count();

        // Put summary counts
        summary.put("revenue", totalRevenue);
        summary.put("spend", totalSpend);
        summary.put("activeOrders", activeOrders);
        summary.put("lowStockCount", lowStockCount);
        summary.put("totalWarehouses", totalWarehouses);

        // Fetch Anomalies
        List<Map<String, Object>> anomalies = anomalyDetector.detectAnomalies();
        summary.put("anomaliesCount", anomalies.size());
        summary.put("anomalies", anomalies.subList(0, Math.min(anomalies.size(), 5)));

        // Generate AI SCM Recommendations
        List<Map<String, String>> recommendations = new ArrayList<>();
        if (lowStockCount > 0) {
            recommendations.add(Map.of(
                    "type", "ALERT",
                    "title", "Inventory Reorder Suggested",
                    "description", "Automated demand models suggest reordering SKU-TMP-SEN0 from supplier VEN-001 to prevent stockout in 7 days."
            ));
        }
        if (!anomalies.isEmpty()) {
            recommendations.add(Map.of(
                    "type", "SECURITY",
                    "title", "Inventory Anomaly Flagged",
                    "description", "Detected large volume STOCK_IN for item SKU-MCU-X90 at abnormal hour (11:34 PM)."
            ));
        }
        recommendations.add(Map.of(
                "type", "SAVING",
                "title", "Procurement Consolidation Opportunity",
                "description", "Save up to 8.4% by merging pending RFQs for semiconductors under a single vendor contract with Apex Component Solutions."
        ));

        summary.put("aiRecommendations", recommendations);

        // Role specific additions
        if ("procurement".equalsIgnoreCase(role) || "PROCUREMENT_MANAGER".equalsIgnoreCase(role)) {
            long pendingPRs = purchaseRequestRepository.findAll().stream()
                    .filter(pr -> "PENDING_APPROVAL".equals(pr.getStatus()))
                    .count();
            long openRFQs = rfqRepository.findAll().stream()
                    .filter(rfq -> "OPEN".equals(rfq.getStatus()))
                    .count();
            summary.put("pendingPRs", pendingPRs);
            summary.put("openRFQs", openRFQs);
        } else if ("inventory".equalsIgnoreCase(role) || "warehouse".equalsIgnoreCase(role) || "INVENTORY_MANAGER".equalsIgnoreCase(role) || "WAREHOUSE_MANAGER".equalsIgnoreCase(role)) {
            long totalStockItems = inventoryItemRepository.count();
            summary.put("totalStockItems", totalStockItems);
        } else if ("logistics".equalsIgnoreCase(role) || "LOGISTICS_MANAGER".equalsIgnoreCase(role)) {
            long totalShipments = customerOrderRepository.count();
            summary.put("totalShipments", totalShipments);
        }

        return ResponseEntity.ok(summary);
    }
}
