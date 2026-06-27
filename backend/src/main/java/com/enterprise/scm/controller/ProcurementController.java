package com.enterprise.scm.controller;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.service.ProcurementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/procurement")
public class ProcurementController {

    @Autowired
    private ProcurementService procurementService;

    @PostMapping("/requests")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> createPurchaseRequest(@RequestBody PurchaseRequest pr) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            PurchaseRequest created = procurementService.createPurchaseRequest(pr, username);
            return ResponseEntity.ok(created);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/requests/{prId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> deletePurchaseRequest(@PathVariable String prId) {
        try {
            procurementService.deletePurchaseRequest(prId);
            return ResponseEntity.ok(Map.of("message", "Purchase request deleted successfully"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/requests/{prId}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> approvePurchaseRequest(@PathVariable String prId, @RequestBody Map<String, String> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String remarks = body.getOrDefault("remarks", "Approved");
        try {
            PurchaseRequest approved = procurementService.approvePurchaseRequest(prId, username, remarks);
            return ResponseEntity.ok(approved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/rfqs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> createRfq(@RequestBody Map<String, Object> body) {
        try {
            String prId = (String) body.get("purchaseRequestId");
            String title = (String) body.get("title");
            String description = (String) body.get("description");
            LocalDateTime deadline = LocalDateTime.parse((String) body.get("deadline"));

            Rfq rfq = procurementService.createRfq(prId, title, description, deadline);
            return ResponseEntity.ok(rfq);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/quotations")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER','VENDOR')")
    public ResponseEntity<?> submitQuotation(@RequestBody Map<String, Object> body) {
        try {
            String rfqId = (String) body.get("rfqId");
            String vendorId = (String) body.get("vendorId");
            BigDecimal unitPrice = new BigDecimal(body.get("unitPrice").toString());
            int leadDays = Integer.parseInt(body.get("deliveryLeadDays").toString());
            String remarks = (String) body.get("remarks");

            Quotation q = procurementService.submitQuotation(rfqId, vendorId, unitPrice, leadDays, remarks);
            return ResponseEntity.ok(q);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/quotations/{quoteId}/select")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> selectQuotation(@PathVariable String quoteId) {
        try {
            PurchaseOrder po = procurementService.selectQuotation(quoteId);
            return ResponseEntity.ok(po);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> getRequests() {
        return ResponseEntity.ok(procurementService.getPurchaseRequests());
    }

    @GetMapping("/rfqs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER','VENDOR')")
    public ResponseEntity<?> getRfqs() {
        return ResponseEntity.ok(procurementService.getRfqs());
    }

    @GetMapping("/rfqs/{rfqId}/quotations")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER','VENDOR')")
    public ResponseEntity<?> getQuotations(@PathVariable String rfqId) {
        return ResponseEntity.ok(procurementService.getQuotationsForRfq(rfqId));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER','INVENTORY_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<?> getOrders() {
        return ResponseEntity.ok(procurementService.getPurchaseOrders());
    }

    @PostMapping("/orders/{poId}/accept")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER','VENDOR')")
    public ResponseEntity<?> acceptPurchaseOrder(@PathVariable String poId) {
        try {
            PurchaseOrder po = procurementService.acceptPurchaseOrder(poId);
            return ResponseEntity.ok(po);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
