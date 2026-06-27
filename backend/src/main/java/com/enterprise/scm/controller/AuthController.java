package com.enterprise.scm.controller;

import com.enterprise.scm.domain.User;
import com.enterprise.scm.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        try {
            String jwt = authService.authenticateUser(
                    username, 
                    password, 
                    request.getRemoteAddr(), 
                    request.getHeader("User-Agent")
            );

            Map<String, String> response = new HashMap<>();
            response.put("token", jwt);
            response.put("username", username);
            
            // Fetch roles and profile details
            authService.findUserByUsername(username).ifPresent(user -> {
                response.put("role", user.getRole());
                response.put("fullName", user.getFullName());
                response.put("organizationId", user.getOrganization() != null ? user.getOrganization().getId() : "");
            });

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registered = authService.registerUser(user);
            return ResponseEntity.ok(registered);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return authService.findUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
