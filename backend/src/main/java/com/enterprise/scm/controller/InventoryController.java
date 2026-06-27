package com.enterprise.scm.controller;

import com.enterprise.scm.domain.InventoryItem;
import com.enterprise.scm.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_MANAGER','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> getInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_MANAGER','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> getItemById(@PathVariable String id) {
        return inventoryService.getAllInventory().stream()
                .filter(item -> item.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ResponseEntity<?> createItem(@RequestBody InventoryItem item) {
        try {
            InventoryItem created = inventoryService.createItem(item);
            return ResponseEntity.ok(created);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<?> getTransactions() {
        return ResponseEntity.ok(inventoryService.getTransactions());
    }

    @PostMapping("/stock-in")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<?> stockIn(@RequestBody Map<String, Object> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            String itemId = (String) body.get("inventoryItemId");
            int quantity = Integer.parseInt(body.get("quantity").toString());
            String binId = (String) body.get("destinationBinId");
            String referenceId = (String) body.get("referenceId");

            InventoryItem item = inventoryService.stockIn(itemId, quantity, binId, referenceId, username);
            return ResponseEntity.ok(item);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/stock-out")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<?> stockOut(@RequestBody Map<String, Object> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            String itemId = (String) body.get("inventoryItemId");
            int quantity = Integer.parseInt(body.get("quantity").toString());
            String binId = (String) body.get("sourceBinId");
            String referenceId = (String) body.get("referenceId");

            InventoryItem item = inventoryService.stockOut(itemId, quantity, binId, referenceId, username);
            return ResponseEntity.ok(item);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<?> transferStock(@RequestBody Map<String, Object> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            String itemId = (String) body.get("inventoryItemId");
            int quantity = Integer.parseInt(body.get("quantity").toString());
            String sourceBinId = (String) body.get("sourceBinId");
            String destBinId = (String) body.get("destinationBinId");

            InventoryItem item = inventoryService.transferStock(itemId, quantity, sourceBinId, destBinId, username);
            return ResponseEntity.ok(item);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
