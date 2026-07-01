import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string; // INFO, ALERT, APPROVAL_REQUEST, STOCK_ALERT
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private http = inject(HttpClient);

  loadNotifications() {
    this.http.get<Notification[]>(`${environment.apiUrl}/users/me/notifications`).subscribe({
      next: (notifs) => {
        this.notifications.set(notifs);
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  addNotification(title: string, message: string, type: string) {
    const newNotif: Notification = {
      id: Math.floor(Math.random() * 100000),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.update(prev => [newNotif, ...prev]);
  }

  markAsRead(id: number) {
    this.http.put<any>(`${environment.apiUrl}/users/me/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      },
      error: (err) => console.error('Failed to mark notification read', err)
    });
  }

  markAllAsRead() {
    const unread = this.notifications().filter(n => !n.isRead);
    unread.forEach(n => this.markAsRead(n.id));
  }

  getUnreadCount() {
    return this.notifications().filter(n => !n.isRead).length;
  }
}
