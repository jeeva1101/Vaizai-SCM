package com.enterprise.scm.service;

import com.enterprise.scm.domain.StockTransaction;
import com.enterprise.scm.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DemandForecaster {

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    public List<Map<String, Object>> forecastDemand(String sku, int stepsAhead) {
        List<StockTransaction> txs = stockTransactionRepository.findAll().stream()
                .filter(t -> t.getInventoryItem().getSku().equalsIgnoreCase(sku))
                .filter(t -> t.getTransactionType().equals("STOCK_OUT"))
                .sorted(Comparator.comparing(StockTransaction::getCreatedAt))
                .collect(Collectors.toList());

        // Simple Linear Regression: Y = a + bX
        // X = time indices (0, 1, 2, ...)
        // Y = quantity consumed
        int n = txs.size();
        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumX2 = 0;

        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += txs.get(i).getQuantity();
            sumXY += i * txs.get(i).getQuantity();
            sumX2 += i * i;
        }

        double slope = 0;
        double intercept = 100; // Base value default

        if (n > 1) {
            double denominator = (n * sumX2) - (sumX * sumX);
            if (denominator != 0) {
                slope = ((n * sumXY) - (sumX * sumY)) / denominator;
                intercept = ((sumY * sumX2) - (sumX * sumXY)) / denominator;
            } else {
                intercept = sumY / n;
            }
        } else if (n == 1) {
            intercept = txs.get(0).getQuantity();
        }

        List<Map<String, Object>> forecast = new ArrayList<>();
        Calendar cal = Calendar.getInstance();

        // Include last 3 actual records if available
        int actualToShow = Math.min(n, 3);
        for (int i = n - actualToShow; i < n; i++) {
            Map<String, Object> data = new HashMap<>();
            data.put("type", "ACTUAL");
            data.put("period", "Index " + i);
            data.put("quantity", txs.get(i).getQuantity());
            forecast.add(data);
        }

        // Project future steps
        for (int i = 1; i <= stepsAhead; i++) {
            int futureIndex = n + i;
            double projectedQty = intercept + (slope * futureIndex);
            
            // Add a cyclic seasonality factor (e.g. +15% in winter, -10% in spring)
            double seasonality = 1.0 + (0.15 * Math.sin(futureIndex * Math.PI / 6));
            long quantity = Math.max(0, Math.round(projectedQty * seasonality));

            cal.add(Calendar.MONTH, 1);
            String periodName = String.format("%tB %tY", cal, cal);

            Map<String, Object> data = new HashMap<>();
            data.put("type", "FORECASTED");
            data.put("period", periodName);
            data.put("quantity", quantity);
            forecast.add(data);
        }

        return forecast;
    }
}
