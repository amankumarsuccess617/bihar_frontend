import { apiFetch, apiBase } from './api';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  smsMessage?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  skip: number;
  pages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface StatsResponse {
  total: number;
  unread: number;
  recent24h: number;
  byType: Array<{ type: string; count: number }>;
}

export interface BulkNotificationRequest {
  title: string;
  message: string;
  smsMessage?: string;
  filter?: Record<string, any>;
}

export interface BulkNotificationResponse {
  sent: number;
  total: number;
  message: string;
}

export const notificationApi = {
  /**
   * Get all notifications for the current user
   */
  async listNotifications(
    token: string,
    limit = 20,
    skip = 0
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
    return apiFetch(`/api/notifications?${params}`, {
      method: 'GET',
      token,
    });
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(token: string): Promise<UnreadCountResponse> {
    return apiFetch('/api/notifications/unread/count', {
      method: 'GET',
      token,
    });
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(token: string, id: number): Promise<Notification> {
    return apiFetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      token,
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(token: string): Promise<{ updated: number }> {
    return apiFetch('/api/notifications/read-all', {
      method: 'PUT',
      token,
    });
  },

  /**
   * Delete a notification
   */
  async deleteNotification(token: string, id: number): Promise<{ deleted: boolean }> {
    return apiFetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  /**
   * Clear all notifications
   */
  async clearAll(token: string): Promise<{ deleted: number }> {
    return apiFetch('/api/notifications/clear-all', {
      method: 'DELETE',
      token,
    });
  },

  /**
   * Get notification statistics (admin only)
   */
  async getStats(token: string): Promise<StatsResponse> {
    return apiFetch('/api/notifications/stats', {
      method: 'GET',
      token,
    });
  },

  /**
   * Send bulk notification (admin only)
   */
  async sendBulk(
    token: string,
    data: BulkNotificationRequest
  ): Promise<BulkNotificationResponse> {
    return apiFetch('/api/notifications/bulk', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },
};
