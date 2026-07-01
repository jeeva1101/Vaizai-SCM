package com.enterprise.scm.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey key;
    private final long jwtExpirationInMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:}") String jwtSecret,
            @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationInMs) {
        this.jwtExpirationInMs = jwtExpirationInMs;
        SecretKey tempKey = null;
        if (jwtSecret != null && !jwtSecret.trim().isEmpty()) {
            try {
                byte[] keyBytes = Decoders.BASE64.decode(jwtSecret.trim());
                if (keyBytes.length >= 32) {
                    tempKey = Keys.hmacShaKeyFor(keyBytes);
                } else {
                    tempKey = Keys.hmacShaKeyFor(getSha256Bytes(jwtSecret.trim()));
                }
            } catch (Exception e) {
                try {
                    tempKey = Keys.hmacShaKeyFor(getSha256Bytes(jwtSecret.trim()));
                } catch (Exception ex) {
                    logger.error("Failed to derive key from secret: {}", ex.getMessage());
                }
            }
        }

        if (tempKey == null) {
            logger.warn("JWT secret is null, empty, or invalid. Generating a secure random key for this session.");
            tempKey = Jwts.SIG.HS256.key().build();
        }
        this.key = tempKey;
    }

    private static byte[] getSha256Bytes(String input) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            return digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .issuedAt(new Date())
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
