package com.enterprise.scm.service;

import com.enterprise.scm.config.JwtTokenProvider;
import com.enterprise.scm.config.RateLimiterService;
import com.enterprise.scm.domain.AuditLog;
import com.enterprise.scm.domain.User;
import com.enterprise.scm.repository.AuditLogRepository;
import com.enterprise.scm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private RateLimiterService rateLimiterService;

    public String authenticateUser(String username, String password, String ipAddress, String deviceInfo) {
        // Apply rate limit
        if (!rateLimiterService.tryConsume("LIMIT_" + username)) {
            throw new RuntimeException("Too many login attempts. Please try again later.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        System.out.println("\n✅ [USER LOGIN] User '" + username + "' logged in successfully from IP: " + ipAddress);

        // Audit Log
        userRepository.findByUsername(username).ifPresent(user -> {
            AuditLog log = AuditLog.builder()
                    .organization(user.getOrganization())
                    .user(user)
                    .action("USER_LOGIN")
                    .details("User logged in successfully via API token request.")
                    .ipAddress(ipAddress)
                    .deviceInfo(deviceInfo)
                    .build();
            auditLogRepository.save(log);
        });

        return jwt;
    }

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setStatus("ACTIVE"); // Auto-verify for local dev convenience
        User saved = userRepository.save(user);
        System.out.println("\n✅ [USER REGISTERED] New user '" + saved.getUsername() + "' (" + saved.getRole() + ") registered successfully.");
        return saved;
    }

    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
