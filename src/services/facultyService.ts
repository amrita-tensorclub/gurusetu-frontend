import api from './api';

export interface FacultySummary {
  faculty_id: string;
  name: string;
  department: string;
  designation: string;
  profile_picture?: string;
  domains: string[];
  status: string;
}

export interface FacultyInfo {
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  profile_picture?: string;
  
  // --- ADD THESE CABIN FIELDS ---
  cabin_block?: string;
  cabin_floor?: string;
  cabin_number?: string;
  
  // --- ENSURE THESE EXIST FOR QUALIFICATIONS ---
  ug_details?: string[];
  pg_details?: string[];
  phd_details?: string[];
  
  interests: string[];
  availability_status: string;
}

export interface ProjectOpening {
  id: string;
  title: string;
  type: string;
  description: string;
}

export interface PreviousWork {
  title: string;
  type: string;
  year: string;
  outcome?: string;
  collaborators?: string;
}

export interface FacultyProfile {
  info: FacultyInfo;
  schedule: string;
  openings: ProjectOpening[];
  previous_work: PreviousWork[];
}

export const facultyService = {
  getAllFaculty: async (search?: string, department?: string, domain?: string) => {
    const params: any = {};
    if (search) params.search = search;
    if (department) params.department = department;
    if (domain) params.domain = domain;

    const { data } = await api.get<FacultySummary[]>('/dashboard/student/all-faculty', { params });
    return data;
  },

  getFacultyProfile: async (id: string) => {
    const { data } = await api.get<FacultyProfile>(`/dashboard/student/faculty-profile/${id}`);
    return data;
  }
};