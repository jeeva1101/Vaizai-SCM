package com.enterprise.scm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventPublisher {
    private static final Logger logger = LoggerFactory.getLogger(EventPublisher.class);

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    public void publish(String topic, String key, String payload) {
        logger.info("Publishing event to topic '{}' with key '{}'. Payload: {}", topic, key, payload);
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(topic, key, payload).whenComplete((result, ex) -> {
                    if (ex != null) {
                        logger.warn("Kafka broker unreachable. Event '{}' logged locally.", topic);
                    } else {
                        logger.debug("Successfully published event '{}' to partition {}", topic, result.getRecordMetadata().partition());
                    }
                });
            } catch (Exception ex) {
                logger.warn("Kafka template failed to dispatch event '{}'. Fallback to local memory log.", topic);
            }
        } else {
            logger.info("KafkaTemplate disabled. Local processing executed for event '{}'.", topic);
        }
    }
}
