import api from "./api";

/* =========================
   Interfaces
========================= */

export interface InterestedFaculty {
  faculty_id: string;
  name: string;
  department: string;
  email: string;
  profile_picture?: string;
}

export interface CreateOpeningPayload {
  title: string;
  description: string;
  required_skills: string[];
  expected_duration: string;
  target_years: string[];
  min_cgpa: number;
  deadline: string; // YYYY-MM-DD
}
export interface ProjectStats {
  active_projects: number;
  total_applicants: number;
  total_shortlisted: number;
}

// frontend/src/services/facultyDashboardService.ts

export interface FacultyProject {
  id: string;
  title: string;
  status: string;
  domain?: string;
  posted_date: string;
  applicant_count: number;
  interest_count?: number;
  
  // ✅ ADD THIS LINE if it is missing
  collaboration_type?: string; 
}


export interface Applicant {
  student_id: string;
  name: string;
  department: string;
  batch?: string;
  profile_picture?: string;
  matched_skills?: string[];
  match_score?: string;
}

export interface OpeningData {
  title: string;
  description: string;
  required_skills: string[];
  expected_duration: string;
  target_years: string[];
  min_cgpa: string;
  deadline: string;
}

export interface WorkItem {
  title: string;
  type: string;
  year: string;
  outcome?: string;
  collaborators?: string;
}

// ... rest of your service code

export interface StudentListItem {
  student_id: string;
  name: string;
  department: string;
  batch: string;
  profile_picture?: string;
  skills: string[];
  
  // ✅ ADD THIS OPTIONAL FIELD
  similarity_score?: number; 
}

export interface RecommendedStudent {
  student_id: string;
  name: string;
  department: string;
  batch: string;
  profile_picture?: string;
  matched_skills: string[];
  match_score: string;
}

export interface FacultyCollaboration {
  faculty_id: string;
  faculty_name: string;
  faculty_dept: string;
  faculty_pic?: string;
  project_title: string;
  collaboration_type: string;
}

export interface FacultyDashboardData {
  user_info: { name: string; department: string; pic?: string };
  unread_count: number; // <--- ADDED THIS
  recommended_students: Applicant[];
  faculty_collaborations: any[];
  active_openings: any[];
}
export interface CollabProject {
  project_id: string;       // Backend sends 'project_id'
  faculty_id: string;
  faculty_name: string;
  department: string;
  title: string;
  description: string;
  collaboration_type: string;
  tags: string[];           // <--- This fixes the Red Line
  
  // Optional fields (Frontend uses them, but backend might not send them yet)
  faculty_pic?: string;     
  id?: string;              // Helper if you map project_id to id
}
export interface FacultyMenuData {
  name: string;
  employee_id: string;
  department: string;
  profile_picture?: string;
  menu_items: {
    label: string;
    route: string;
    icon: string;
  }[];
}

export interface StudentPublicProfile {
  info: {
    name: string;
    roll_no: string;
    department: string;
    batch: string;
    bio: string;
    email: string;
    phone: string;
    profile_picture?: string;
    skills: string[];
    interests: string[];
  };
  projects: {
    title: string;
    description: string;
    duration: string;
    tools: string[];
  }[];
}

export interface FacultyProfile {
  info: {
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    profile_picture?: string;
    
    // FIX: Added specific fields
    cabin_block: string;
    cabin_floor: string;
    cabin_number: string;
    
    ug_details: string[];
    pg_details: string[];
    phd_details: string[];
    
    interests: string[];
    availability_status: string;
  };
  schedule: string;
  openings: any[];
  previous_work: WorkItem[];
}

/* =========================
   Service
========================= */


export const facultyDashboardService = {
  // ---- Students ----
  getAllStudents: async (search?: string, department?: string, batch?: string): Promise<StudentListItem[]> => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (department) params.append("department", department);
      if (batch) params.append("batch", batch);

      const { data } = await api.get(
        `/dashboard/faculty/all-students?${params.toString()}`
      );
      return data;
    },

  getStudentProfile: async (
    studentId: string
  ): Promise<StudentPublicProfile> => {
    const { data } = await api.get(
      `/dashboard/faculty/student-profile/${studentId}`
    );
    return data;
  },

  shortlistStudent: async (studentId: string, openingId: string): Promise<any> => {
      // Passing openingId in the body
      const { data } = await api.post(`/dashboard/shortlist/${studentId}`, { opening_id: openingId });
      return data;
    },

  // ---- Faculty Dashboard ----
getFacultyHome: async (filter?: string) => {
    const url = filter ? `/dashboard/faculty/home?filter=${filter}` : '/dashboard/faculty/home';
    const { data } = await api.get(url);
    return data;
  },
  getFacultyMenu: async (): Promise<FacultyMenuData> => {
    const { data } = await api.get("/dashboard/faculty/menu");
    return data;
  },

// Inside src/services/facultyDashboardService.ts

  getCollaborations: async (search?: string, department?: string, collabType?: string): Promise<CollabProject[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (department) params.append("department", department);
    if (collabType) params.append("collab_type", collabType); // Note: Backend expects 'collab_type'

    const { data } = await api.get(
      `/dashboard/faculty/collaborations?${params.toString()}`
    );
    return data;
  },

  // ---- Faculty Profile ----
  getFacultyProfile: async (facultyId: string): Promise<FacultyProfile> => {
      const { data } = await api.get(`/dashboard/student/faculty-profile/${facultyId}`);
      return data;
    },

    updateFacultyProfile: async (profileData: any) => {
    const { data } = await api.put("/users/faculty/profile", profileData);
    return data;
  },

  // ---- Openings ----
  postOpening: async (opening: CreateOpeningPayload) => {
        const { data } = await api.post("/openings/", opening);
        return data;
    },

// frontend/src/services/facultyDashboardService.ts

deleteOpening: async (id: string) => {
    // This assumes your backend has this router mounted at /openings
    const { data } = await api.delete(`/openings/${id}`); 
    return data;
},
uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/users/upload-profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
getMyProjects: async (): Promise<{ stats: ProjectStats; projects: FacultyProject[] }> => {
    // ✅ NEW URL (Points to dashboard.py where we added the fix)
    const { data } = await api.get("/dashboard/faculty/projects");
    return data;
},

getProjectApplicants: async (projectId: string) => {
    const { data } = await api.get(`/dashboard/faculty/projects/${projectId}/applicants`);
    return data;
  },
getProjectShortlisted: async (projectId: string) => {
    const { data } = await api.get(`/dashboard/faculty/projects/${projectId}/shortlisted`);
    return data;
  },
  updateApplicantStatus: async (openingId: string, studentId: string, status: 'Shortlisted' | 'Rejected') => {
    const { data } = await api.put('/applications/status', {
        opening_id: openingId,
        student_id: studentId,
        status: status
    });
    return data;
  },
  getProjectInterests: async (projectId: string): Promise<InterestedFaculty[]> => {
    const { data } = await api.get(`/dashboard/faculty/projects/${projectId}/interests`);
    return data;
  },
  
};
