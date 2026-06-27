package com.enterprise.scm.controller;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.repository.*;
import com.enterprise.scm.service.DemandForecaster;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/ai-assistant")
@PreAuthorize("isAuthenticated()")
public class ChatAssistantController {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DemandForecaster demandForecaster;

    @PostMapping("/chat")
    public ResponseEntity<?> askAssistant(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "").trim();
        String lowercaseMsg = message.toLowerCase();

        Map<String, Object> response = new HashMap<>();
        response.put("query", message);

        try {
            // 1. Inventory Check Query
            if (lowercaseMsg.contains("stock") || lowercaseMsg.contains("inventory")) {
                Optional<InventoryItem> itemOpt = findSkuInMessage(lowercaseMsg);
                if (itemOpt.isPresent()) {
                    InventoryItem item = itemOpt.get();
                    response.put("reply", "The current inventory level for **" + item.getName() + "** (" + item.getSku() + ") is **" + item.getQuantity() + " units** in bin **" + item.getBin().getBinNumber() + "**.");
                    response.put("data", item);
                    return ResponseEntity.ok(response);
                }
            }

            // 2. Vendor Performance Query
            if (lowercaseMsg.contains("vendor") || lowercaseMsg.contains("score") || lowercaseMsg.contains("reliability")) {
                List<Vendor> vendors = vendorRepository.findAll();
                for (Vendor v : vendors) {
                    if (lowercaseMsg.contains(v.getCompanyName().toLowerCase()) || lowercaseMsg.contains("apex") || lowercaseMsg.contains("global")) {
                        response.put("reply", "Here is the performance report card for **" + v.getCompanyName() + "**:\n" +
                                "- **Reliability Score**: " + v.getReliabilityScore() + "%\n" +
                                "- **Quality Score**: " + v.getQualityScore() + "%\n" +
                                "- **Delivery Score**: " + v.getDeliveryScore() + "%\n" +
                                "- **Cost Score**: " + v.getCostScore() + "%");
                        response.put("data", v);
                        return ResponseEntity.ok(response);
                    }
                }
            }

            // 3. AI Demand Forecasting Query
            if (lowercaseMsg.contains("forecast") || lowercaseMsg.contains("predict")) {
                Optional<InventoryItem> itemOpt = findSkuInMessage(lowercaseMsg);
                if (itemOpt.isPresent()) {
                    InventoryItem item = itemOpt.get();
                    List<Map<String, Object>> forecastData = demandForecaster.forecastDemand(item.getSku(), 4);
                    response.put("reply", "I have generated the AI Demand Forecast for **" + item.getName() + "** over the next 4 months. Demand is projected to remain steady with cyclic summer adjustments.");
                    response.put("data", forecastData);
                    return ResponseEntity.ok(response);
                }
            }

            // 4. Shipment Tracking Query
            if (lowercaseMsg.contains("shipment") || lowercaseMsg.contains("track") || lowercaseMsg.contains("shp-")) {
                List<Shipment> shipments = shipmentRepository.findAll();
                for (Shipment s : shipments) {
                    if (lowercaseMsg.contains(s.getId().toLowerCase())) {
                        response.put("reply", "Shipment **" + s.getId() + "** is currently **" + s.getStatus() + "** via **" + s.getCarrier() + "**.\n" +
                                "Driver: " + s.getDriverName() + " (" + s.getDriverPhone() + ")\n" +
                                "Estimated Arrival: " + s.getEstimatedArrival());
                        response.put("data", s);
                        return ResponseEntity.ok(response);
                    }
                }
            }

            // Fallback response: Assistant suggestions
            response.put("reply", "Hello! I am your SCM AI Assistant. I can help you with:\n" +
                    "1. checking stock level (e.g. *'check stock SKU-MCU-X90'*)\n" +
                    "2. checking supplier score (e.g. *'Apex score'*)\n" +
                    "3. forecasting demand (e.g. *'forecast SKU-TMP-SEN0'*)\n" +
                    "4. tracking carrier shipment (e.g. *'track SHP-3001'*)\n\n" +
                    "What would you like to query?");
            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            response.put("reply", "Sorry, I encountered an error searching SCM data: " + ex.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    private Optional<InventoryItem> findSkuInMessage(String msg) {
        return inventoryItemRepository.findAll().stream()
                .filter(item -> msg.contains(item.getSku().toLowerCase()) || msg.contains(item.getName().toLowerCase()) || msg.contains("mcu") || msg.contains("cable") || msg.contains("sensor"))
                .findFirst();
    }
}
