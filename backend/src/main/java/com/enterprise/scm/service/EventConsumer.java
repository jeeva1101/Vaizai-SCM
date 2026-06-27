package com.enterprise.scm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "spring.kafka.bootstrap-servers", matchIfMissing = false)
public class EventConsumer {
    private static final Logger logger = LoggerFactory.getLogger(EventConsumer.class);

    @Autowired
    private NotificationService notificationService;

    @KafkaListener(topics = "purchase-request-created", groupId = "scm-group")
    public void consumePurchaseRequestCreated(String message) {
        logger.info("Consumed purchase-request-created event: {}", message);
        // Process downstream effects, e.g. broadcast to WebSocket
    }

    @KafkaListener(topics = "purchase-approved", groupId = "scm-group")
    public void consumePurchaseApproved(String message) {
        logger.info("Consumed purchase-approved event: {}", message);
    }

    @KafkaListener(topics = "stock-updated", groupId = "scm-group")
    public void consumeStockUpdated(String message) {
        logger.info("Consumed stock-updated event: {}", message);
    }

    @KafkaListener(topics = "order-created", groupId = "scm-group")
    public void consumeOrderCreated(String message) {
        logger.info("Consumed order-created event: {}", message);
    }

    @KafkaListener(topics = "shipment-created", groupId = "scm-group")
    public void consumeShipmentCreated(String message) {
        logger.info("Consumed shipment-created event: {}", message);
    }
}
