import api from './api';

// ... (Keep existing ProjectCreate, PublicationItem, StudentProfileData interfaces) ...
export interface ApplicationItem {
  id: string;
  title: string;
  faculty_name: string;
  department: string;
  faculty_pic?: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected';
  applied_date: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  date: string;
}

export interface ProjectCreate {
  title: string;
  description: string;
  duration?: string; // <--- Add this line (Optional field)
  from_date: string;
  to_date: string;
  tools: string[];
}

export interface PublicationItem {
  title: string;
  year: string;
  publisher?: string;
  link?: string;
}

export interface StudentProfileData {
  name: string;
  phone: string;
  email?: string;
  department: string;
  batch: string;
  bio: string;
  profile_picture?: string;
  skills: string[];
  interests: string[];
  projects: ProjectCreate[];
  publications: PublicationItem[];
}

export interface Opening {
  opening_id: string;
  title: string;
  description?: string;
  faculty_name: string;
  faculty_pic?: string;
  department: string;
  match_score?: string; // Updated to match string format "85%"
  skills_required?: string[]; 
  deadline?: string;
  type?: string;
}

export interface StudentDashboardData {
  user_info: { name: string; roll_no: string; };
  unread_count: number; // <--- ADDED THIS FIELD
  recommended_openings: Opening[];
  all_openings: Opening[];
}

export const dashboardService = {
  getStudentHome: async () => { 
      const { data } = await api.get('/dashboard/student/home'); 
      return data; 
  },
  getStudentMenu: async () => { const { data } = await api.get('/dashboard/student/menu'); return data; },

  getStudentFullProfile: async (userId: string) => {
    const { data } = await api.get(`/users/student/profile/${userId}`);
    return data;
  },

  updateStudentProfile: async (data: StudentProfileData) => {
    const { data: res } = await api.put('/users/student/profile', data);
    return res;
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/users/upload-profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },

  applyToOpening: async (openingId: string) => {
    const { data } = await api.post(`/applications/apply/${openingId}`);
    return data;
  },
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },

  markNotificationRead: async (notifId: string) => {
    const { data } = await api.put(`/notifications/${notifId}/read`);
    return data;
  },
  getStudentApplications: async () => {
    const { data } = await api.get('/dashboard/student/applications');
    return data;
  }
};