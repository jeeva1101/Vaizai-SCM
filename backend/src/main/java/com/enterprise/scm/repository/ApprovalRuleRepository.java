package com.enterprise.scm.repository;

import com.enterprise.scm.domain.ApprovalRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApprovalRuleRepository extends JpaRepository<ApprovalRule, Long> {
    List<ApprovalRule> findByOrganizationIdAndModuleOrderBySequenceOrderAsc(String organizationId, String module);
}
