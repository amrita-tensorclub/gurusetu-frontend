import api from './api';

export interface FacultySummary {
  faculty_id: string;
  name: string;
  department: string;
  designation: string;
  profile_picture?: string;
  domains: string[];
  status: 'Available' | 'Busy' | 'Offline';
}

export interface FacultyProfile {
  info: {
    name: string;
    designation: string;
    department: string;
    email: string;
    profile_picture?: string;
    qualifications: string[];
    cabin_location: string;
    interests: string[];
    availability_status: string;
  };
  schedule: string;
  openings: Array<{ id: string; title: string; type: string; description: string }>;
  previous_work: Array<{ title: string; type: string; year: string; outcome: string }>;
}

export const facultyService = {
  getAllFaculty: async (search?: string, department?: string) => {
    const params = new URLSearchParams();
    if(search) params.append('search', search);
    if(department) params.append('department', department);
    
    const { data } = await api.get(`/dashboard/student/all-faculty?${params.toString()}`);
    return data;
  },
  
  getFacultyProfile: async (id: string) => {
    const { data } = await api.get(`/dashboard/student/faculty-profile/${id}`);
    return data;
  }
};