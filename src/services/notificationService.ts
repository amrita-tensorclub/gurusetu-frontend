import api from './api';

export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  date: string;
  trigger_id?: string;   // ID of the person who triggered it
  trigger_role?: string; // Their role (student/faculty)
}

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const { data } = await api.get('/dashboard/notifications');
    return data;
  },
  markRead: async (id: string) => {
    const { data } = await api.put(`/dashboard/notifications/${id}/read`);
    return data;
  },
  expressInterest: async (projectId: string) => {
    const { data } = await api.post(`/dashboard/express-interest/${projectId}`);
    return data;
  }
};