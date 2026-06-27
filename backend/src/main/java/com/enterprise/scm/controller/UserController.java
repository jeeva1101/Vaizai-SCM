package com.enterprise.scm.controller;

import com.enterprise.scm.domain.AuditLog;
import com.enterprise.scm.domain.Department;
import com.enterprise.scm.domain.User;
import com.enterprise.scm.repository.AuditLogRepository;
import com.enterprise.scm.repository.DepartmentRepository;
import com.enterprise.scm.repository.NotificationLogRepository;
import com.enterprise.scm.repository.UserRepository;
import com.enterprise.scm.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AuthService authService;

    /** List all platform users — SUPER_ADMIN only */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /** Create a new user — SUPER_ADMIN only */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User registered = authService.registerUser(user);
            return ResponseEntity.ok(registered);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    /** Change a user's role — SUPER_ADMIN only */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            user.setRole(body.get("role"));
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Lock / Unlock a user — SUPER_ADMIN only */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            user.setStatus(body.get("status"));
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Fetch all audit logs — SUPER_ADMIN only */
    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }

    /** Fetch all departments — SUPER_ADMIN only */
    @GetMapping("/departments")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    /** Fetch notifications for the currently logged-in user */
    @GetMapping("/me/notifications")
    public ResponseEntity<?> getMyNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).map(user ->
            ResponseEntity.ok(notificationLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId()))
        ).orElse(ResponseEntity.notFound().build());
    }

    /** Mark a notification as read */
    @PutMapping("/me/notifications/{notifId}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long notifId) {
        return notificationLogRepository.findById(notifId).map(n -> {
            n.setIsRead(true);
            return ResponseEntity.ok(notificationLogRepository.save(n));
        }).orElse(ResponseEntity.notFound().build());
    }
}
