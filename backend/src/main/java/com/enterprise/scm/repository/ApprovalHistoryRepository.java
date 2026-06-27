package com.enterprise.scm.repository;

import com.enterprise.scm.domain.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Long> {
    List<ApprovalHistory> findByReferenceIdOrderByTimestampAsc(String referenceId);
}
