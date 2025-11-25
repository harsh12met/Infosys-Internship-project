import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  _id: string;
  userId: string;
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'comment_added';
  title: string;
  message: string;
  taskTitle?: string;
  assignedBy?: string;
  fromUserName?: string;
  createdAt: Date;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  // Get notifications from backend
  getNotifications(userId: string): Observable<any> {
    const headers = { 'user-id': userId };
    return this.http.get(`${this.apiUrl}`, { headers });
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(userId: string): Observable<any> {
    const headers = { 'user-id': userId };
    return this.http.patch(`${this.apiUrl}/mark-all-read`, {}, { headers });
  }

  // Create notification when task is assigned
  createTaskAssignmentNotification(
    taskTitle: string,
    assignedToName: string,
    assignedToEmail: string
  ) {
    // Show browser notification if permissions granted
    this.showBrowserNotification(`New task assigned: ${taskTitle}`);

    console.log(
      `📧 Task "${taskTitle}" assigned to ${assignedToName} (${assignedToEmail})`
    );
  }

  private showBrowserNotification(message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Kanban Task Manager', {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } else if (
      'Notification' in window &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Kanban Task Manager', {
            body: message,
            icon: '/favicon.ico',
          });
        }
      });
    }
  }

  // Request notification permission
  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}
