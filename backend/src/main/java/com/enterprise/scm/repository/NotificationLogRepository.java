package com.enterprise.scm.repository;

import com.enterprise.scm.domain.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByUserIdOrderByCreatedAtDesc(String userId);
    List<NotificationLog> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, boolean isRead);
}
