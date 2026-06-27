package com.enterprise.scm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    
    private final long capacity;
    private final long refillTokens;
    private final long refillPeriodSeconds;

    public RateLimiterService(
            @Value("${app.rate-limit.capacity:100}") long capacity,
            @Value("${app.rate-limit.refill-tokens:10}") long refillTokens,
            @Value("${app.rate-limit.refill-period-seconds:1}") long refillPeriodSeconds) {
        this.capacity = capacity;
        this.refillTokens = refillTokens;
        this.refillPeriodSeconds = refillPeriodSeconds;
    }

    public boolean tryConsume(String key) {
        TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(capacity, refillTokens, refillPeriodSeconds));
        return bucket.tryConsume(1);
    }

    private static class TokenBucket {
        private final long capacity;
        private final long refillTokens;
        private final long refillPeriodNanos;
        private double tokens;
        private long lastRefillNanos;

        public TokenBucket(long capacity, long refillTokens, long refillPeriodSeconds) {
            this.capacity = capacity;
            this.refillTokens = refillTokens;
            this.refillPeriodNanos = refillPeriodSeconds * 1_000_000_000L;
            this.tokens = capacity;
            this.lastRefillNanos = System.nanoTime();
        }

        public synchronized boolean tryConsume(int numTokens) {
            refill();
            if (tokens >= numTokens) {
                tokens -= numTokens;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.nanoTime();
            long elapsedNanos = now - lastRefillNanos;
            if (elapsedNanos > 0) {
                double tokensToAdd = ((double) elapsedNanos / refillPeriodNanos) * refillTokens;
                tokens = Math.min(capacity, tokens + tokensToAdd);
                lastRefillNanos = now;
            }
        }
    }
}
