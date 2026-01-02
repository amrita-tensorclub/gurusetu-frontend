export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  department: string;
  roll_no?: string;     // MUST HAVE THIS FOR STUDENTS
  employee_id?: string; // MUST HAVE THIS FOR FACULTY
}
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'student' | 'faculty';
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  department: string;
  roll_no?: string;     // Optional: only for students
  employee_id?: string; // Optional: only for faculty
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Ongoing' | 'Completed';
  techStack: string[];
}

export interface Faculty {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  profile_picture?: string;
  // --- NEW FIELDS FOR LOCATOR ---
  status?: 'Available' | 'Busy' | 'In Class' | 'Away';
  status_source?: 'Manual' | 'Timetable' | 'AI Prediction' | 'Student-QR';
  cabin_number?: string;
  coordinates?: {
    top: number;
    left: number;
  };
}