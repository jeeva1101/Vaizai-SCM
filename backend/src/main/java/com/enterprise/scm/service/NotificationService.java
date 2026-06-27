package com.enterprise.scm.service;

import com.enterprise.scm.domain.NotificationLog;
import com.enterprise.scm.domain.User;
import com.enterprise.scm.repository.NotificationLogRepository;
import com.enterprise.scm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private UserRepository userRepository;

    public NotificationLog createNotification(String username, String title, String message, String type) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return null;

        NotificationLog log = NotificationLog.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        return notificationLogRepository.save(log);
    }

    public List<NotificationLog> getUserNotifications(String username) {
        return userRepository.findByUsername(username)
                .map(user -> notificationLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId()))
                .orElse(Collections.emptyList());
    }

    public List<NotificationLog> getUnreadNotifications(String username) {
        return userRepository.findByUsername(username)
                .map(user -> notificationLogRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(user.getId(), false))
                .orElse(Collections.emptyList());
    }

    public void markAsRead(Long id) {
        notificationLogRepository.findById(id).ifPresent(log -> {
            log.setIsRead(true);
            notificationLogRepository.save(log);
        });
    }

    public void markAllAsRead(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            List<NotificationLog> unread = notificationLogRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(user.getId(), false);
            unread.forEach(log -> log.setIsRead(true));
            notificationLogRepository.saveAll(unread);
        });
    }
}
