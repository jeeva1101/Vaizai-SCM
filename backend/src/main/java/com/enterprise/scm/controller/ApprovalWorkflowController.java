package com.enterprise.scm.controller;

import com.enterprise.scm.domain.ApprovalRule;
import com.enterprise.scm.domain.Organization;
import com.enterprise.scm.repository.OrganizationRepository;
import com.enterprise.scm.service.ApprovalWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/approvals")
public class ApprovalWorkflowController {

    @Autowired
    private ApprovalWorkflowService approvalWorkflowService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @GetMapping("/rules")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<List<ApprovalRule>> getRules() {
        Organization org = organizationRepository.findAll().stream().findFirst().orElse(null);
        String orgId = org != null ? org.getId() : "ORG-001";
        return ResponseEntity.ok(approvalWorkflowService.getRulesForModule(orgId, "PROCUREMENT"));
    }

    @PostMapping("/rules")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createRule(@RequestBody ApprovalRule rule) {
        try {
            Organization org = organizationRepository.findAll().stream().findFirst().orElse(null);
            rule.setOrganization(org);
            ApprovalRule saved = approvalWorkflowService.saveRule(rule);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/rules/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        try {
            approvalWorkflowService.deleteRule(id);
            return ResponseEntity.ok(Map.of("message", "Rule deleted"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/history/{refId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<?> getHistory(@PathVariable String refId) {
        return ResponseEntity.ok(approvalWorkflowService.getHistory(refId));
    }
}
