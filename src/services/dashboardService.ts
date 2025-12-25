import api from './api';

// 1. Define Types matching your Python Backend Response exactly
export interface StudentDashboardData {
  user_info: {
    name: string;
    roll_no: string;
  };
  recommended_openings: Array<{
    opening_id: string;
    title: string;
    faculty_id: string;
    faculty_name: string;
    department: string;
    faculty_pic?: string;
    skills: string[];
    match_score: string; // e.g. "92%"
  }>;
  all_openings: Array<{
    opening_id: string;
    title: string;
    faculty_id: string;
    faculty_name: string;
    department: string;
    skills: string[];
  }>;
}

export const dashboardService = {
  // Matches Python: @router.get("/student/home")
  getStudentHome: async (): Promise<StudentDashboardData> => {
    const { data } = await api.get('/dashboard/student/home');
    return data;
  },

  // Matches Python: @router.get("/student/menu")
  getStudentMenu: async () => {
    const { data } = await api.get('/dashboard/student/menu');
    return data;
  }
};