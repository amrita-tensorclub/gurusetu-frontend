import api from "./api";

/* =========================
   Interfaces
========================= */
export interface ProjectStats {
  active_projects: number;
  total_applicants: number;
  interviews_set: number;
  total_shortlisted: number; // <--- ADD THIS LINE TO FIX THE RED LINE
}

export interface FacultyProject {
  id: string;
  title: string;
  status: string;
  domain: string;
  posted_date: string;
  applicant_count: number;
  shortlisted_count: number; // <--- Ensure this is also here
}
export interface Applicant {
  student_id: string;
  name: string;
  roll_no: string;
  department: string;
  profile_picture?: string;
  applied_date: string;
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
  user_info: {
    name: string;
    department: string;
    pic?: string;
  };
  recommended_students: RecommendedStudent[];
  faculty_collaborations: FacultyCollaboration[];
  active_openings: { id: string; title: string }[]; // <-- Added this
}

export interface CollabProject {
  faculty_id: string;
  faculty_name: string;
  department: string;
  title: string;
  description: string;
  collaboration_type: string;
  tags: string[];
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
  getFacultyHome: async (filter?: string): Promise<FacultyDashboardData> => {
      const url = filter ? `/dashboard/faculty/home?filter=${filter}` : "/dashboard/faculty/home";
      const { data } = await api.get(url);
      return data;
    },

  getFacultyMenu: async (): Promise<FacultyMenuData> => {
    const { data } = await api.get("/dashboard/faculty/menu");
    return data;
  },

  getCollaborations: async (search?: string): Promise<CollabProject[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);

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
  postOpening: async (opening: any) => {
      const { data } = await api.post("/openings/", opening);
      return data;
    },

  deleteOpening: async (openingId: string): Promise<any> => {
    const { data } = await api.delete(`/openings/${openingId}`);
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
    const { data } = await api.get("/faculty-projects/my-projects");
    return data;
  },

getProjectApplicants: async (projectId: string): Promise<Applicant[]> => {
    const { data } = await api.get(`/faculty-projects/my-projects/${projectId}/applicants`);
    return data;
  },
  getProjectShortlisted: async (projectId: string): Promise<Applicant[]> => {
    const { data } = await api.get(`/faculty-projects/my-projects/${projectId}/shortlisted`);
    return data;
  },
};
