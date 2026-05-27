'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Notification } from '@/lib/notificationApi';
import { useToast } from '@/components/Toast';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  token: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ token }) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    loadNotifications,
  } = useNotifications(token, { autoLoad: true });

  const { addToast } = useToast();

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    addToast('Success', 'All notifications marked as read', 'success');
  };

  const handleDelete = (id: number) => {
    deleteNotification(id);
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all notifications? This cannot be undone.')) {
      await clearAll();
      addToast('Success', 'All notifications cleared', 'success');
    }
  };

  const handleRefresh = async () => {
    await loadNotifications();
    addToast('Success', 'Notifications refreshed', 'info');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      REGISTRATION: '✅',
      LOGIN: '🔐',
      APPLICATION_SUBMITTED: '📝',
      PAYMENT_SUCCESS: '✓',
      PAYMENT_FAILED: '✕',
      NOTICE_POSTED: '📌',
      NEW_POST: '💼',
      SHORTLISTED: '🎯',
      REJECTED: '❌',
      ADMIT_CARD_READY: '🎫',
      RESULT_PUBLISHED: '📊',
      BULK_MESSAGE: '📢',
    };
    return icons[type] || '📢';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
              disabled={loading}
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition"
              disabled={loading}
            >
              Clear all
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-2xl mb-4">⏳</div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-gray-600 font-semibold">No notifications</p>
          <p className="text-sm text-gray-500">
            You will receive notifications when there are updates to your applications, payments, or important announcements.
          </p>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              icon={getNotificationIcon(notification.type)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  icon: string;
  formatDate: (date: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  icon,
  formatDate,
}) => {
  return (
    <div
      className={`p-4 border rounded-lg transition cursor-pointer ${
        !notification.isRead
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      role="article"
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
              <p className="text-sm text-gray-700 mt-1 break-words">
                {notification.message}
              </p>
            </div>
            {!notification.isRead && (
              <span className="flex-shrink-0 mt-1 inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                New
              </span>
            )}
          </div>

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              {Object.entries(notification.metadata).map(([key, value]) => (
                <p key={key}>
                  <span className="font-semibold">{key}:</span> {String(value)}
                </p>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
            <span>{formatDate(notification.createdAt)}</span>
            <div className="flex gap-2">
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
