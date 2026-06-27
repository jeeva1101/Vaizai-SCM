package com.enterprise.scm.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(name = "spring.kafka.bootstrap-servers", matchIfMissing = false)
public class KafkaConfig {
    
    @Bean
    public NewTopic purchaseRequestCreatedTopic() {
        return TopicBuilder.name("purchase-request-created").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic purchaseOrderCreatedTopic() {
        return TopicBuilder.name("purchase-order-created").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic purchaseApprovedTopic() {
        return TopicBuilder.name("purchase-approved").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic vendorRegisteredTopic() {
        return TopicBuilder.name("vendor-registered").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic stockUpdatedTopic() {
        return TopicBuilder.name("stock-updated").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic stockTransferredTopic() {
        return TopicBuilder.name("stock-transferred").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic orderCreatedTopic() {
        return TopicBuilder.name("order-created").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic orderApprovedTopic() {
        return TopicBuilder.name("order-approved").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic orderShippedTopic() {
        return TopicBuilder.name("order-shipped").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic orderDeliveredTopic() {
        return TopicBuilder.name("order-delivered").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic shipmentCreatedTopic() {
        return TopicBuilder.name("shipment-created").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic shipmentDeliveredTopic() {
        return TopicBuilder.name("shipment-delivered").partitions(3).replicas(1).build();
    }
}
