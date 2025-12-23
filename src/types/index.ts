// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  avatar?: string;
  phone?: string;
  department?: string;
  year?: number;
  bio?: string;
}

// Student specific types
export interface Student extends User {
  role: 'student';
  year: number;
  cgpa?: number;
  interests: string[];
  skills: string[];
  projects: Project[];
  researchPapers?: string[];
  achievements?: string[];
}

// Faculty specific types
export interface Faculty extends User {
  role: 'faculty';
  designation: string;
  qualification: string[];
  experience: number;
  researchAreas: string[];
  publications: Publication[];
  currentProjects: Project[];
  cabinLocation: CabinLocation;
  availability: boolean;
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  domain: string[];
  techStack: string[];
  duration: string;
  requirements: string[];
  status: 'open' | 'in-progress' | 'completed';
  facultyId?: string;
  studentId?: string;
  createdAt: Date;
}

// Research publication
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  abstract?: string;
}

// Campus location
export interface CabinLocation {
  building: string;
  floor: number;
  room: string;
  block?: string;
}

// Recommendation system
export interface Recommendation {
  id: string;
  facultyId: string;
  studentId: string;
  matchScore: number;
  reasons: string[];
  sharedInterests: string[];
  suggestedProjects?: Project[];
  createdAt: Date;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
}