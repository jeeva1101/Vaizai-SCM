package com.enterprise.scm.service;

import com.enterprise.scm.domain.*;
import com.enterprise.scm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ApprovalWorkflowService {

    @Autowired
    private ApprovalRuleRepository approvalRuleRepository;

    @Autowired
    private ApprovalHistoryRepository approvalHistoryRepository;

    public List<ApprovalRule> getRulesForModule(String organizationId, String module) {
        return approvalRuleRepository.findByOrganizationIdAndModuleOrderBySequenceOrderAsc(organizationId, module);
    }

    public ApprovalRule saveRule(ApprovalRule rule) {
        return approvalRuleRepository.save(rule);
    }

    public List<ApprovalHistory> getHistory(String referenceId) {
        return approvalHistoryRepository.findByReferenceIdOrderByTimestampAsc(referenceId);
    }

    public boolean requiresApproval(String orgId, String module, BigDecimal amount, String currentRole) {
        List<ApprovalRule> rules = approvalRuleRepository.findByOrganizationIdAndModuleOrderBySequenceOrderAsc(orgId, module);
        
        for (ApprovalRule rule : rules) {
            // Check if amount is in range
            boolean amountMatch = (amount.compareTo(rule.getMinAmount()) >= 0) &&
                    (rule.getMaxAmount() == null || amount.compareTo(rule.getMaxAmount()) <= 0);

            if (amountMatch) {
                // If the user's role is below the required role, it requires higher level approvals
                if (rule.getRequiredRole().equals(currentRole)) {
                    return false; // Direct authority matches
                }
                return true;
            }
        }
        return false;
    }

    public void deleteRule(Long ruleId) {
        approvalRuleRepository.deleteById(ruleId);
    }
}
