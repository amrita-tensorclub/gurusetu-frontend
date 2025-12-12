import { Student, Faculty, Project, Recommendation } from '@/types';

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@example.com',
    role: 'student',
    department: 'Computer Science',
    year: 3,
    cgpa: 8.5,
    avatar: '',
    phone: '+91 9876543210',
    bio: 'Passionate about AI/ML and web development. Looking for research opportunities in machine learning.',
    interests: ['Machine Learning', 'Web Development', 'Data Science', 'Computer Vision'],
    skills: ['Python', 'JavaScript', 'React', 'TensorFlow', 'Node.js'],
    projects: [
      {
        id: 'p1',
        title: 'E-commerce Recommendation System',
        description: 'Built a collaborative filtering system for product recommendations',
        domain: ['Machine Learning', 'Web Development'],
        techStack: ['Python', 'Flask', 'React', 'Scikit-learn'],
        duration: '3 months',
        requirements: ['Python', 'Machine Learning'],
        status: 'completed',
        studentId: '1',
        createdAt: new Date('2024-08-01')
      }
    ],
    researchPapers: [],
    achievements: ['Winner - College Hackathon 2024', 'Dean\'s List 2023']
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'student',
    department: 'Electronics',
    year: 4,
    cgpa: 9.1,
    interests: ['IoT', 'Embedded Systems', 'Robotics', 'AI'],
    skills: ['C++', 'Arduino', 'Python', 'PCB Design'],
    projects: [],
    achievements: ['Best Project Award 2023']
  }
];

// Mock Faculty Data
export const mockFaculty: Faculty[] = [
  {
    id: 'f1',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@university.edu',
    role: 'faculty',
    department: 'Computer Science',
    designation: 'Associate Professor',
    qualification: ['PhD in Computer Science', 'M.Tech in AI'],
    experience: 12,
    avatar: '',
    phone: '+91 9876543211',
    bio: 'Research focus on Machine Learning, Natural Language Processing, and Deep Learning applications.',
    researchAreas: ['Machine Learning', 'Natural Language Processing', 'Deep Learning', 'Computer Vision'],
    publications: [
      {
        id: 'pub1',
        title: 'Deep Learning Approaches for Sentiment Analysis',
        authors: ['Dr. Rajesh Kumar', 'Dr. Anita Sharma'],
        journal: 'IEEE Transactions on Neural Networks',
        year: 2023,
        doi: '10.1109/example.2023',
        abstract: 'This paper presents novel approaches for sentiment analysis using deep learning...'
      }
    ],
    currentProjects: [
      {
        id: 'fp1',
        title: 'AI-Powered Healthcare Diagnostics',
        description: 'Developing machine learning models for early disease detection using medical imaging',
        domain: ['Machine Learning', 'Healthcare', 'Computer Vision'],
        techStack: ['Python', 'TensorFlow', 'OpenCV', 'Medical Imaging'],
        duration: '6 months',
        requirements: ['Strong Python skills', 'Experience with ML frameworks', 'Interest in healthcare applications'],
        status: 'open',
        facultyId: 'f1',
        createdAt: new Date('2024-11-01')
      },
      {
        id: 'fp2',
        title: 'Intelligent Traffic Management System',
        description: 'Creating an AI system for optimizing traffic flow in smart cities',
        domain: ['Machine Learning', 'IoT', 'Smart Cities'],
        techStack: ['Python', 'Computer Vision', 'IoT Sensors', 'Real-time Analytics'],
        duration: '8 months',
        requirements: ['Machine Learning knowledge', 'IoT experience preferred'],
        status: 'open',
        facultyId: 'f1',
        createdAt: new Date('2024-10-15')
      }
    ],
    cabinLocation: {
      building: 'Academic Block A',
      floor: 3,
      room: 'A301',
      block: 'Computer Science Department'
    },
    availability: true
  },
  {
    id: 'f2',
    name: 'Dr. Meera Gupta',
    email: 'meera.gupta@university.edu',
    role: 'faculty',
    department: 'Electronics',
    designation: 'Professor',
    qualification: ['PhD in Electronics Engineering', 'M.Tech in VLSI'],
    experience: 15,
    researchAreas: ['IoT', 'Embedded Systems', 'VLSI Design', 'Robotics'],
    publications: [],
    currentProjects: [
      {
        id: 'fp3',
        title: 'Smart Agriculture IoT Platform',
        description: 'Developing IoT solutions for precision agriculture and crop monitoring',
        domain: ['IoT', 'Agriculture', 'Embedded Systems'],
        techStack: ['Arduino', 'Raspberry Pi', 'Sensors', 'Cloud Platform'],
        duration: '5 months',
        requirements: ['Electronics background', 'Programming skills', 'Interest in agriculture tech'],
        status: 'open',
        facultyId: 'f2',
        createdAt: new Date('2024-09-20')
      }
    ],
    cabinLocation: {
      building: 'Academic Block B',
      floor: 2,
      room: 'B205',
      block: 'Electronics Department'
    },
    availability: true
  },
  {
    id: 'f3',
    name: 'Prof. Vikram Singh',
    email: 'vikram.singh@university.edu',
    role: 'faculty',
    department: 'Mechanical',
    designation: 'Assistant Professor',
    qualification: ['PhD in Mechanical Engineering', 'M.Tech in Robotics'],
    experience: 8,
    researchAreas: ['Robotics', 'Automation', 'AI in Manufacturing', 'Mechatronics'],
    publications: [],
    currentProjects: [],
    cabinLocation: {
      building: 'Academic Block C',
      floor: 1,
      room: 'C108',
      block: 'Mechanical Department'
    },
    availability: false
  }
];

// Mock Recommendations
export const mockRecommendations: Recommendation[] = [
  {
    id: 'r1',
    facultyId: 'f1',
    studentId: '1',
    matchScore: 92,
    reasons: [
      'Strong overlap in Machine Learning interests',
      'Previous project experience in ML',
      'Excellent academic performance',
      'Relevant technical skills match'
    ],
    sharedInterests: ['Machine Learning', 'Python', 'Data Science'],
    suggestedProjects: [mockFaculty[0].currentProjects[0]],
    createdAt: new Date('2024-12-10')
  },
  {
    id: 'r2',
    facultyId: 'f2',
    studentId: '2',
    matchScore: 88,
    reasons: [
      'Perfect match in IoT and Embedded Systems',
      'Strong electronics background',
      'Interest in practical applications'
    ],
    sharedInterests: ['IoT', 'Embedded Systems'],
    suggestedProjects: [mockFaculty[1].currentProjects[0]],
    createdAt: new Date('2024-12-09')
  }
];

// Utility functions
export const getFacultyById = (id: string): Faculty | undefined => {
  return mockFaculty.find(faculty => faculty.id === id);
};

export const getStudentById = (id: string): Student | undefined => {
  return mockStudents.find(student => student.id === id);
};

export const getProjectById = (id: string): Project | undefined => {
  const allProjects = [...mockFaculty.flatMap(f => f.currentProjects)];
  return allProjects.find(project => project.id === id);
};

export const getRecommendationsForStudent = (studentId: string): Recommendation[] => {
  return mockRecommendations.filter(rec => rec.studentId === studentId);
};

export const searchFaculty = (query: string, department?: string): Faculty[] => {
  return mockFaculty.filter(faculty => {
    const matchesQuery = faculty.name.toLowerCase().includes(query.toLowerCase()) ||
                        faculty.researchAreas.some(area => area.toLowerCase().includes(query.toLowerCase()));
    const matchesDepartment = !department || faculty.department === department;
    return matchesQuery && matchesDepartment;
  });
};