'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { notificationApi, Notification, UnreadCountResponse } from '@/lib/notificationApi';
import { useToast } from '@/components/Toast';

interface UseNotificationsOptions {
  pollInterval?: number; // ms, default 30000 (30s)
  autoLoad?: boolean;
}

export const useNotifications = (
  token: string | null,
  options: UseNotificationsOptions = {}
) => {
  const { pollInterval = 30000, autoLoad = true } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { addToast } = useToast();

  const loadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await notificationApi.listNotifications(token, 50, 0);
      setNotifications(data.notifications);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(message);
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const data = await notificationApi.getUnreadCount(token);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, [token]);

  const markAsRead = useCallback(
    async (id: number) => {
      if (!token) return;

      try {
        await notificationApi.markAsRead(token, id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to mark as read';
        addToast('Error', message, 'error');
        console.error('Failed to mark as read:', err);
      }
    },
    [token, addToast]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await notificationApi.markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all as read';
      addToast('Error', message, 'error');
      console.error('Failed to mark all as read:', err);
    }
  }, [token, addToast]);

  const deleteNotification = useCallback(
    async (id: number) => {
      if (!token) return;

      try {
        await notificationApi.deleteNotification(token, id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete';
        addToast('Error', message, 'error');
        console.error('Failed to delete:', err);
      }
    },
    [token, addToast]
  );

  const clearAll = useCallback(async () => {
    if (!token) return;

    try {
      await notificationApi.clearAll(token);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear';
      addToast('Error', message, 'error');
      console.error('Failed to clear:', err);
    }
  }, [token, addToast]);

  // Auto-load on mount and start polling
  useEffect(() => {
    if (!autoLoad || !token) return;

    loadNotifications();
    loadUnreadCount();

    // Set up polling
    pollTimerRef.current = setInterval(() => {
      loadUnreadCount();
    }, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [token, autoLoad, pollInterval, loadNotifications, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};
