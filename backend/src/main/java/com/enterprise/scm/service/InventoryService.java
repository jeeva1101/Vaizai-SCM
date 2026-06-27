package com.enterprise.scm.service;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InventoryService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private WarehouseBinRepository warehouseBinRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private NotificationService notificationService;

    public InventoryItem stockIn(String itemId, int quantity, String binId, String referenceId, String performerUsername) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory Item not found"));
        WarehouseBin bin = warehouseBinRepository.findById(binId)
                .orElseThrow(() -> new RuntimeException("Bin not found"));
        User performer = userRepository.findByUsername(performerUsername).orElse(null);

        item.setQuantity(item.getQuantity() + quantity);
        item.setBin(bin);
        
        // Update bin status
        bin.setStatus(bin.getStatus().equals("EMPTY") ? "PARTIAL" : bin.getStatus());
        warehouseBinRepository.save(bin);

        InventoryItem savedItem = inventoryItemRepository.save(item);

        // Record stock transaction
        StockTransaction tx = StockTransaction.builder()
                .inventoryItem(savedItem)
                .transactionType("STOCK_IN")
                .quantity(quantity)
                .destinationBin(bin)
                .referenceId(referenceId)
                .performedBy(performer)
                .build();
        stockTransactionRepository.save(tx);

        System.out.println("\n📥 [STOCK IN] Item: " + item.getName() + " (ID: " + itemId + ") | Qty: +" + quantity + " | Bin: " + bin.getBinNumber() + " | Performed by: " + (performerUsername != null ? performerUsername : "system"));

        eventPublisher.publish("stock-updated", savedItem.getId(), "Stock In: +" + quantity + " units of " + item.getName());

        return savedItem;
    }

    public InventoryItem stockOut(String itemId, int quantity, String binId, String referenceId, String performerUsername) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory Item not found"));
        WarehouseBin bin = warehouseBinRepository.findById(binId)
                .orElseThrow(() -> new RuntimeException("Bin not found"));
        User performer = userRepository.findByUsername(performerUsername).orElse(null);

        if (item.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock available for " + item.getName());
        }

        item.setQuantity(item.getQuantity() - quantity);
        
        if (item.getQuantity() == 0) {
            bin.setStatus("EMPTY");
            warehouseBinRepository.save(bin);
        }

        InventoryItem savedItem = inventoryItemRepository.save(item);

        StockTransaction tx = StockTransaction.builder()
                .inventoryItem(savedItem)
                .transactionType("STOCK_OUT")
                .quantity(quantity)
                .sourceBin(bin)
                .referenceId(referenceId)
                .performedBy(performer)
                .build();
        stockTransactionRepository.save(tx);

        System.out.println("\n📤 [STOCK OUT] Item: " + item.getName() + " (ID: " + itemId + ") | Qty: -" + quantity + " | Bin: " + bin.getBinNumber() + " | Performed by: " + (performerUsername != null ? performerUsername : "system"));

        eventPublisher.publish("stock-updated", savedItem.getId(), "Stock Out: -" + quantity + " units of " + item.getName());

        // Check Low Stock Alerts
        if (savedItem.getQuantity() <= savedItem.getReorderLevel()) {
            notificationService.createNotification(
                    performerUsername != null ? performerUsername : "admin",
                    "Low Stock Alert",
                    "Item " + savedItem.getName() + " is below reorder point! Current: " + savedItem.getQuantity(),
                    "STOCK_ALERT"
            );
        }

        return savedItem;
    }

    public InventoryItem transferStock(String itemId, int quantity, String sourceBinId, String destBinId, String performerUsername) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory Item not found"));
        WarehouseBin sourceBin = warehouseBinRepository.findById(sourceBinId)
                .orElseThrow(() -> new RuntimeException("Source bin not found"));
        WarehouseBin destBin = warehouseBinRepository.findById(destBinId)
                .orElseThrow(() -> new RuntimeException("Destination bin not found"));
        User performer = userRepository.findByUsername(performerUsername).orElse(null);

        if (item.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock to transfer");
        }

        // Subtract from source, add to destination (simplified since item represents total count in database)
        // In a complex ERP, items would be split by bins, but here we update bin pointer or quantity
        item.setBin(destBin);
        InventoryItem savedItem = inventoryItemRepository.save(item);

        StockTransaction tx = StockTransaction.builder()
                .inventoryItem(savedItem)
                .transactionType("TRANSFER")
                .quantity(quantity)
                .sourceBin(sourceBin)
                .destinationBin(destBin)
                .performedBy(performer)
                .build();
        stockTransactionRepository.save(tx);

        System.out.println("\n🔄 [STOCK TRANSFER] Item: " + item.getName() + " (ID: " + itemId + ") | Qty: " + quantity + " | Source: " + sourceBin.getBinNumber() + " -> Dest: " + destBin.getBinNumber() + " | Performed by: " + (performerUsername != null ? performerUsername : "system"));

        eventPublisher.publish("stock-transferred", savedItem.getId(), "Stock transferred from " + sourceBin.getBinNumber() + " to " + destBin.getBinNumber());

        return savedItem;
    }

    public List<InventoryItem> getAllInventory() {
        return inventoryItemRepository.findAll();
    }

    public List<StockTransaction> getTransactions() {
        return stockTransactionRepository.findAll();
    }

    public InventoryItem createItem(InventoryItem item) {
        if (item.getId() == null) {
            item.setId("INV-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (item.getStatus() == null) {
            item.setStatus("IN_STOCK");
        }
        return inventoryItemRepository.save(item);
    }
}
