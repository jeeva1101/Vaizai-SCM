package com.enterprise.scm.service;

import com.enterprise.scm.domain.StockTransaction;
import com.enterprise.scm.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnomalyDetector {

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    public List<Map<String, Object>> detectAnomalies() {
        List<StockTransaction> txs = stockTransactionRepository.findAll();
        List<Map<String, Object>> anomalies = new ArrayList<>();

        if (txs.isEmpty()) return anomalies;

        // Calculate average transaction quantities per item type
        Map<String, Double> averages = txs.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getInventoryItem().getSku(),
                        Collectors.averagingDouble(StockTransaction::getQuantity)
                ));

        for (StockTransaction tx : txs) {
            double avg = averages.getOrDefault(tx.getInventoryItem().getSku(), 0.0);
            double score = 0.0;
            List<String> reasons = new ArrayList<>();

            // 1. Transaction volume anomaly (e.g. quantity > 4x average)
            if (avg > 0 && tx.getQuantity() > (avg * 4)) {
                score += 0.5;
                reasons.add("Spike in quantity: " + tx.getQuantity() + " units (average: " + String.format("%.1f", avg) + ")");
            }

            // 2. Out-of-hours operation anomaly (e.g. between 10 PM and 5 AM)
            LocalTime time = tx.getCreatedAt().toLocalTime();
            if (time.isAfter(LocalTime.of(22, 0)) || time.isBefore(LocalTime.of(5, 0))) {
                score += 0.3;
                reasons.add("Action performed during off-hours: " + time);
            }

            // If score exceeds a threshold, register it
            if (score > 0.2) {
                Map<String, Object> record = new HashMap<>();
                record.put("transactionId", tx.getId());
                record.put("sku", tx.getInventoryItem().getSku());
                record.put("itemName", tx.getInventoryItem().getName());
                record.put("performedBy", tx.getPerformedBy() != null ? tx.getPerformedBy().getUsername() : "SYSTEM");
                record.put("timestamp", tx.getCreatedAt().toString());
                record.put("quantity", tx.getQuantity());
                record.put("anomalyScore", Math.min(1.0, score));
                record.put("indicators", reasons);
                anomalies.add(record);
            }
        }

        return anomalies;
    }
}
