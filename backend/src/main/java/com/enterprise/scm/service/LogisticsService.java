package com.enterprise.scm.service;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class LogisticsService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentMilestoneRepository shipmentMilestoneRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private EventPublisher eventPublisher;

    public Shipment createShipment(String orderId, String carrier, String vehicleNumber, String driverName, String driverPhone, String routePath) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Customer Order not found"));

        Shipment shipment = Shipment.builder()
                .id("SHP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .order(order)
                .carrier(carrier)
                .vehicleNumber(vehicleNumber)
                .driverName(driverName)
                .driverPhone(driverPhone)
                .routePath(routePath)
                .status("CREATED")
                .estimatedArrival(LocalDateTime.now().plusDays(3))
                .build();

        Shipment savedShipment = shipmentRepository.save(shipment);

        System.out.println("\n🚚 [SHIPMENT CREATED] Shipment " + savedShipment.getId() + " created for Customer Order: " + orderId + " | Carrier: " + carrier + " | Driver: " + driverName + " (" + driverPhone + ")");

        order.setStatus("SHIPPED");
        customerOrderRepository.save(order);

        // First milestone
        addMilestone(savedShipment.getId(), "CREATED", "Origin Facility", BigDecimal.ZERO, BigDecimal.ZERO, "Shipment packed and vehicle assigned.");

        eventPublisher.publish("shipment-created", savedShipment.getId(), "Shipment dispatched for order: " + orderId);

        return savedShipment;
    }

    public Shipment addMilestone(String shipmentId, String status, String location, BigDecimal latitude, BigDecimal longitude, String description) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        ShipmentMilestone milestone = ShipmentMilestone.builder()
                .shipment(shipment)
                .status(status)
                .location(location)
                .latitude(latitude)
                .longitude(longitude)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        shipmentMilestoneRepository.save(milestone);

        shipment.setStatus(status);
        System.out.println("\n📍 [SHIPMENT MILESTONE] Shipment " + shipmentId + " status updated to " + status + " at " + location + ". Info: " + description);
        if (status.equals("DELIVERED")) {
            shipment.setActualArrival(LocalDateTime.now());
            shipment.getOrder().setStatus("DELIVERED");
            customerOrderRepository.save(shipment.getOrder());
            eventPublisher.publish("order-delivered", shipment.getOrder().getId(), "Order delivered safely.");
        }

        return shipmentRepository.save(shipment);
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public List<ShipmentMilestone> getShipmentMilestones(String shipmentId) {
        return shipmentMilestoneRepository.findByShipmentIdOrderByTimestampAsc(shipmentId);
    }
}
