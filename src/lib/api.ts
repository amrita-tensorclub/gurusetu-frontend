/* --- Types & Interfaces --- */

export interface Department {
  id?: string;
  code: string;
  name: string;
}

export interface User {
  id?: string;
  email: string;
  username: string;
  role: 'student' | 'faculty' | 'admin';
  name: string;
  // Student specific
  roll_number?: string;
  year?: number;
  // Faculty specific
  employee_id?: string;
  designation?: string;
}

export interface AuthResponse {
  success?: boolean;
  user?: User;
  profile?: any;
  error?: string;
}

/* --- API Bridge --- */

const api = {
  auth: {
    login: async (emailOrRoll: string, password: string, role: string): Promise<AuthResponse> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrRoll, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
      } catch (error: any) {
        return { error: error.message };
      }
    },

    signup: async (formData: any): Promise<AuthResponse> => {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        return data;
      } catch (error: any) {
        return { error: error.message };
      }
    }
  },

  departments: {
    list: async () => {
      try {
        const res = await fetch('/api/departments');
        return await res.json();
      } catch (e) {
        return { departments: [] };
      }
    }
  },

  dashboard: {
    faculty: async (userId: string) => {
      try {
        const res = await fetch(`/api/dashboard/faculty?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        return await res.json();
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    student: async (userId: string) => {
      try {
        const res = await fetch(`/api/dashboard/student?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        return await res.json();
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  },

  student: {
    getApplications: async (studentId: string) => {
      try {
        const res = await fetch(`/api/student/applications?studentId=${studentId}`);
        return await res.json();
      } catch (e) {
        return { applications: [] };
      }
    },
    getMyProjects: async (studentId: string) => {
      try {
        const res = await fetch(`/api/student/projects?studentId=${studentId}`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        return await res.json();
      } catch (e) {
        console.error(e);
        return { personal: [], accepted: [] };
      }
    },
    getAllFaculty: async () => {
      try {
        const res = await fetch('/api/student/faculty-list');
        if (!res.ok) throw new Error('Failed to fetch faculty');
        return await res.json();
      } catch (e) {
        console.error(e);
        return { faculty: [] };
      }
    },
    getFacultyProfile: async (facultyId: string) => {
      try {
        const res = await fetch(`/api/student/faculty/details?id=${facultyId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        return await res.json();
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    updateProfile: async (studentId: string, data: any) => {
      try {
        const res = await fetch('/api/student/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, ...data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Update failed');
        return json;
      } catch (e: any) {
        return { error: e.message };
      }
    }
  },

  faculty: {
    // NEW: Get list of other faculty for collaboration
    getAllFaculty: async () => {
      try {
        const res = await fetch('/api/faculty/list'); // You'll need this route or reuse student's faculty list
        return await res.json();
      } catch (e) {
        return { faculty: [] };
      }
    },

    // NEW: Send a collaboration request
    sendCollaborationRequest: async (fromId: string, toId: string, projectTitle: string, message: string) => {
      try {
        const res = await fetch('/api/faculty/collaborations/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromId, toId, projectTitle, message }),
        });
        return await res.json();
      } catch (e: any) {
        return { error: e.message };
      }
    },

    // NEW: Get my sent/received collaboration requests
    getCollaborationRequests: async (facultyId: string) => {
      try {
        const res = await fetch(`/api/faculty/collaborations/requests?facultyId=${facultyId}`);
        return await res.json();
      } catch (e) {
        return { requests: [] };
      }
    },
    getMyProjects: async (facultyId: string) => {
      try {
        const res = await fetch(`/api/faculty/projects?facultyId=${facultyId}`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        return await res.json();
      } catch (error) {
        console.error(error);
        return { projects: [] };
      }
    },
    createProject: async (projectData: any) => {
      try {
        const res = await fetch('/api/faculty/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create project');
        return data;
      } catch (error: any) {
        return { error: error.message };
      }
    },
    closeProject: async (projectId: string) => {
      try {
        const res = await fetch(`/api/faculty/projects?projectId=${projectId}`, {
          method: 'DELETE',
        });
        return await res.json();
      } catch (e) {
        return { error: 'Failed to close project' };
      }
    },
    getApplications: async (facultyId: string) => {
      try {
        const res = await fetch(`/api/faculty/applications?facultyId=${facultyId}`);
        return await res.json();
      } catch (e) {
        return { applications: [] };
      }
    },
    updateApplicationStatus: async (projectId: string, studentId: string, status: 'accepted' | 'rejected') => {
      try {
        const res = await fetch('/api/faculty/applications/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, studentId, status }),
        });
        return await res.json();
      } catch (e) {
        return { error: 'Failed to update status' };
      }
    },
    updateProfile: async (facultyId: string, data: any) => {
      try {
        const res = await fetch('/api/faculty/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facultyId, ...data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Update failed');
        return json;
      } catch (e: any) {
        return { error: e.message };
      }
    },
    
    // ✅ THESE ARE THE MISSING FUNCTIONS CAUSING THE RED LINE
    getResearchPortfolio: async (facultyId: string) => {
      try {
        const res = await fetch(`/api/faculty/research?facultyId=${facultyId}`);
        return await res.json();
      } catch (e) {
        return { interests: '', openings: [], projects: [], papers: [] };
      }
    },
    addWork: async (facultyId: string, type: string, data: any) => {
      try {
        const res = await fetch('/api/faculty/research/work', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facultyId, type, ...data }),
        });
        return await res.json();
      } catch (e: any) {
        return { error: e.message };
      }
    },
    deleteItem: async (id: string, type: string) => {
      try {
        const res = await fetch(`/api/faculty/research/work?id=${id}&type=${type}`, {
          method: 'DELETE',
        });
        return await res.json();
      } catch (e) {
        return { error: 'Failed to delete' };
      }
    },
    toggleOpeningStatus: async (id: string, status: string) => {
      try {
        const res = await fetch('/api/faculty/research/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        });
        return await res.json();
      } catch (e) {
        return { error: 'Failed to update status' };
      }
    },
    getStudentProfile: async (studentId: string) => {
      try {
        const res = await fetch(`/api/faculty/student/details?id=${studentId}`);
        if (!res.ok) throw new Error('Failed to fetch student profile');
        return await res.json();
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  },

  projects: {
    apply: async (studentId: string, projectId: string) => {
      try {
        const res = await fetch('/api/projects/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, projectId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Application failed');
        return data;
      } catch (error: any) {
        return { error: error.message };
      }
    }
  }
};

export default api;