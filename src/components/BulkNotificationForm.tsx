'use client';

import { useState } from 'react';
import { notificationApi } from '@/lib/notificationApi';
import { useToast } from '@/components/Toast';

interface BulkNotificationFormProps {
  token: string;
}

export const BulkNotificationForm: React.FC<BulkNotificationFormProps> = ({ token }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    smsMessage: '',
    filterRole: 'CANDIDATE',
    filterActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      addToast('Error', 'Title and message are required', 'error');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        message: formData.message,
        smsMessage: formData.smsMessage || formData.message.substring(0, 160),
        filter: {
          role: formData.filterRole,
          isActive: formData.filterActive,
        },
      };

      const result = await notificationApi.sendBulk(token, payload);

      addToast(
        'Success',
        `Notification sent to ${result.sent} user${result.sent !== 1 ? 's' : ''}`,
        'success'
      );

      // Reset form
      setFormData({
        title: '',
        message: '',
        smsMessage: '',
        filterRole: 'CANDIDATE',
        filterActive: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send notification';
      addToast('Error', message, 'error');
      console.error('Error sending bulk notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-6">Send Bulk Notification</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Notification title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100
          </p>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Notification message"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.message.length} characters
          </p>
        </div>

        {/* SMS Message */}
        <div>
          <label htmlFor="smsMessage" className="block text-sm font-medium text-gray-700 mb-2">
            SMS Message (optional)
          </label>
          <textarea
            id="smsMessage"
            name="smsMessage"
            value={formData.smsMessage}
            onChange={handleChange}
            placeholder="Leave empty to use message text (max 160 chars)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.smsMessage.length}/160
            {formData.smsMessage.length > 160 && (
              <span className="text-red-600"> (Exceeds limit!)</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Send To</h3>

          <div className="space-y-3">
            {/* Role Filter */}
            <div>
              <label htmlFor="filterRole" className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <select
                id="filterRole"
                name="filterRole"
                value={formData.filterRole}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="CANDIDATE">Candidates</option>
                <option value="RECRUITER">Recruiters</option>
                <option value="ADMIN">Admins</option>
                <option value="">All Users</option>
              </select>
            </div>

            {/* Active Filter */}
            <div className="flex items-center">
              <input
                id="filterActive"
                type="checkbox"
                name="filterActive"
                checked={formData.filterActive}
                onChange={handleChange}
                className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="filterActive" className="ml-2 text-sm text-gray-700">
                Send only to active users
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
          <button
            type="reset"
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            Clear
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
          <p className="font-semibold">Note:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Notifications will be sent via Email and SMS</li>
            <li>SMS message must be under 160 characters</li>
            <li>Emails will use the message text</li>
            <li>All users matching the filters will be notified</li>
          </ul>
        </div>
      </form>
    </div>
  );
};
