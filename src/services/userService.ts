import api from './api';

// --- NEW: Project Interface matches Python Pydantic Model ---
export interface StudentProject {
  title: string;
  from_date: string;
  to_date: string;
  description: string;
  tools: string[];
}

// Updated Profile Data Interface
export interface StudentProfileData {
  name?: string;
  phone?: string;
  department?: string;
  bio?: string;
  batch?: string;
  profile_picture?: string;
  interests?: string[]; 
  skills?: string[];    
  projects?: StudentProject[]; // <--- ADDED THIS
}

export const userService = {
  // GET: Fetch current profile
  getProfile: async () => {
    // Note: We are using the menu endpoint for basic info. 
    // To fetch existing projects, you would need a dedicated GET /profile endpoint 
    // in your backend later. For now, this gets basic user info.
    const response = await api.get('/dashboard/student/menu');
    return response.data;
  },

  // PUT: Update Profile (Now sends projects too!)
  updateStudentProfile: async (data: StudentProfileData) => {
    const response = await api.put('/users/student/profile', data);
    return response.data;
  }
};