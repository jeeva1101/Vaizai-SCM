package com.enterprise.scm.controller;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.repository.*;
import com.enterprise.scm.service.InventoryService;
import com.enterprise.scm.service.LogisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
public class OrderController {

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private LogisticsService logisticsService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @GetMapping
    public ResponseEntity<?> getOrders() {
        return ResponseEntity.ok(customerOrderRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            String customerName = (String) body.get("customerName");
            String customerEmail = (String) body.get("customerEmail");
            List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

            Organization org = organizationRepository.findAll().stream().findFirst().orElse(null);
            
            BigDecimal totalAmount = BigDecimal.ZERO;
            
            CustomerOrder order = CustomerOrder.builder()
                    .id("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .customerName(customerName)
                    .customerEmail(customerEmail)
                    .organization(org)
                    .totalAmount(BigDecimal.ZERO)
                    .status("PENDING")
                    .build();

            CustomerOrder savedOrder = customerOrderRepository.save(order);

            for (Map<String, Object> itemData : items) {
                String itemId = (String) itemData.get("inventoryItemId");
                int quantity = Integer.parseInt(itemData.get("quantity").toString());

                InventoryItem invItem = inventoryItemRepository.findById(itemId)
                        .orElseThrow(() -> new RuntimeException("Inventory Item not found: " + itemId));

                // Reserve Stock (Deduct stock)
                inventoryService.stockOut(itemId, quantity, invItem.getBin().getId(), savedOrder.getId(), username);

                BigDecimal itemTotal = invItem.getUnitPrice().multiply(BigDecimal.valueOf(quantity));
                totalAmount = totalAmount.add(itemTotal);

                OrderItem orderItem = OrderItem.builder()
                        .order(savedOrder)
                        .inventoryItem(invItem)
                        .quantity(quantity)
                        .unitPrice(invItem.getUnitPrice())
                        .totalPrice(itemTotal)
                        .build();

                orderItemRepository.save(orderItem);
            }

            savedOrder.setTotalAmount(totalAmount);
            savedOrder.setStatus("APPROVED"); // Auto-approve order for convenience
            CustomerOrder finalOrder = customerOrderRepository.save(savedOrder);

            // Auto-spawn a shipment carrier tracking dispatch linked to the customer order
            try {
                logisticsService.createShipment(
                        finalOrder.getId(),
                        "FedEx Freight",
                        "FDX-" + (1000 + (int)(Math.random() * 9000)),
                        "Gordon Freeman",
                        "+19998887777",
                        "[[32.7767,-96.7970],[35.4676,-97.5164],[39.7392,-104.9903]]"
                );
            } catch (Exception ex) {
                System.err.println("Auto-shipment creation failed: " + ex.getMessage());
            }

            return ResponseEntity.ok(finalOrder);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable String orderId) {
        return ResponseEntity.ok(orderItemRepository.findByOrderId(orderId));
    }
}
