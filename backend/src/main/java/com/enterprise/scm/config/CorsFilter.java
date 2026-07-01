package com.enterprise.scm.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Global CORS filter that runs before Spring Security.
 * Handles OPTIONS preflight requests immediately without involving the security chain.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter extends OncePerRequestFilter {

    private static final List<String> DEFAULT_ALLOWED_PATTERNS = Arrays.asList(
            "http://localhost",
            "https://localhost",
            "https://vaizai-scm.vercel.app"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String origin = request.getHeader("Origin");

        if (origin != null && isAllowedOrigin(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else if (origin != null && isVercelDomain(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            // Fallback: allow any origin in development or if not set in env
            String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
            if (allowedOriginsEnv == null || allowedOriginsEnv.trim().isEmpty()) {
                if (origin != null) {
                    response.setHeader("Access-Control-Allow-Origin", origin);
                }
            }
        }

        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Expose-Headers", "Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        // Handle OPTIONS preflight - respond immediately with 200
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedOrigin(String origin) {
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        if (allowedOriginsEnv != null && !allowedOriginsEnv.trim().isEmpty()) {
            for (String allowed : allowedOriginsEnv.split(",")) {
                if (origin.equals(allowed.trim())) {
                    return true;
                }
            }
        }
        return DEFAULT_ALLOWED_PATTERNS.stream().anyMatch(origin::startsWith);
    }

    private boolean isVercelDomain(String origin) {
        return origin.endsWith(".vercel.app");
    }
}
