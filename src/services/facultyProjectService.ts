import api from './api';

export interface ProjectStats {
  active_projects: number;
  total_applicants: number;
  interviews_set: number;
}

export interface FacultyProject {
  id: string;
  title: string;
  status: 'Active' | 'Draft' | 'Closed';
  domain: string; // e.g. "AI/ML", "NLP"
  posted_date: string;
  applicant_count: number;
}

export interface FacultyProjectsResponse {
  stats: ProjectStats;
  projects: FacultyProject[];
}

export const facultyProjectService = {
  // Matches @router.get("/") in your faculty_projects.py
  getMyProjects: async (): Promise<FacultyProjectsResponse> => {
    // Since I don't have your GET code, I'm assuming it returns this structure.
    // If your backend returns a list directly, we can adjust this.
    const { data } = await api.get('/faculty/projects'); 
    return data;
  },

  deleteProject: async (id: string) => {
    const { data } = await api.delete(`/faculty/projects/${id}`);
    return data;
  }
};