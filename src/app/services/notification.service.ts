import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'error';
  icon: string;
  message: string;
  time: string;
  read: boolean;
  email: string; // Nouveau champ pour l'e-mail de l'utilisateur
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSource = new BehaviorSubject<Notification[]>(this.loadNotificationsFromStorage());
  notifications$ = this.notificationsSource.asObservable();

  constructor() {}

  addNotification(notification: Notification) {
    const currentNotifications = this.notificationsSource.getValue();
    const updatedNotifications = [...currentNotifications, notification];
    this.notificationsSource.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  removeNotification(notificationId: number) {
    const currentNotifications = this.notificationsSource.getValue();
    const updatedNotifications = currentNotifications.filter(notif => notif.id !== notificationId);
    this.notificationsSource.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  markAsRead(notificationId: number) {
    const currentNotifications = this.notificationsSource.getValue();
    const updatedNotifications = currentNotifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    this.notificationsSource.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  removeNotificationsByEmail(email: string): void {
    const currentNotifications = this.notificationsSource.getValue();
    const updatedNotifications = currentNotifications.filter(notif => notif.email !== email);
    this.notificationsSource.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }
  

  private saveNotificationsToStorage(notifications: Notification[]) {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  private loadNotificationsFromStorage(): Notification[] {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  }
}