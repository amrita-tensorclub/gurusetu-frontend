'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StudentNavigationMenu from '@/components/StudentNavigationMenu';

interface StudentData {
  id: string;
  name: string;
  roll_number: string;
  year: number;
  department_id: string;
  bio: string | null;
  phone_number: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
  user: {
    email: string;
    username: string;
  };
}

interface Faculty {
  id: string;
  designation: string;
  department_id: string;
  phone_number: string;
  office_hours: string;
  cabin_block: string;
  cabin_floor: number;
  cabin_number: string;
  ug_details: string;
  pg_details: string;
  phd_details: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  user: {
    id: string;
    email: string;
    username: string;
    full_name: string;
  };
}

interface ResearchProject {
  id: string;
  faculty_id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  status: string;
  skills_required: string[];
  department_focus: string;
  match_percentage?: number;
  faculty: Faculty;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [recommendedProjects, setRecommendedProjects] = useState<ResearchProject[]>([]);
  const [allProjects, setAllProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadStudentData();
    loadProjects();
  }, []);

  const loadStudentData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      
      if (userData.id) {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            department:departments(id, name, code),
            user:users(email, username)
          `)
          .eq('user_id', userData.id)
          .single();

        if (data && !error) {
          setStudentData(data);
        } else {
          // Fallback data
          const fallbackData = {
            id: '1',
            name: 'Priya Sharma',
            roll_number: 'AM.EN.U4CSE22051',
            year: 3,
            department_id: '1',
            bio: null,
            phone_number: null,
            department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
            user: { email: 'priya.sharma@amrita.edu', username: 'priya.sharma' }
          };
          setStudentData(fallbackData);
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      // Use fallback data
      const fallbackData = {
        id: '1',
        name: 'Priya Sharma',
        roll_number: 'AM.EN.U4CSE22051',
        year: 3,
        department_id: '1',
        bio: null,
        phone_number: null,
        department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
        user: { email: 'priya.sharma@amrita.edu', username: 'priya.sharma' }
      };
      setStudentData(fallbackData);
    }
  };

  const loadProjects = async () => {
    try {
      const { data: facultyData, error } = await supabase
        .from('faculty')
        .select(`
          *,
          department:departments(id, name, code),
          user:users(id, email, username, full_name)
        `);

      if (facultyData && !error) {
        // Create mock research projects based on faculty data
        const projects: ResearchProject[] = [];
        
        facultyData.forEach((faculty, index) => {
          const projectTitles = [
            'AI-Driven Medical Imaging for Early Diagnosis',
            'Smart Grid Optimization using IoT',
            'Cybersecurity in Fintech Applications',
            'Sustainable Materials for Construction',
            'Robotics for Disaster Response',
            'Machine Learning in Agriculture',
            'Blockchain for Supply Chain',
            'Neural Networks in Healthcare'
          ];
          
          const descriptions = [
            'Develop deep learning models to analyze medical scans for early disease detection',
            'Implement IoT sensors for real-time monitoring and control of smart grid systems',
            'Researching secure transaction protocols using blockchain technology',
            'Researching sustainable unit materials and plants for construction industry',
            'Developing autonomous robots for emergency response and disaster management',
            'Applying ML algorithms to optimize crop yield and farming practices',
            'Creating secure blockchain solutions for transparent supply chains',
            'Building neural networks for medical diagnosis and treatment planning'
          ];
          
          const skillSets = [
            ['Machine Learning', 'Healthcare AI', 'Python', 'TensorFlow'],
            ['IoT', 'Renewable Energy', 'Smart Systems', 'Energy Management'],
            ['Cybersecurity', 'Blockchain', 'Fintech', 'Cryptography'],
            ['Materials Science', 'Sustainability', 'Construction', 'Research'],
            ['Robotics', 'Autonomous Systems', 'Emergency Response', 'AI'],
            ['Machine Learning', 'Agriculture', 'Data Analytics', 'IoT'],
            ['Blockchain', 'Supply Chain', 'Distributed Systems', 'Security'],
            ['Neural Networks', 'Healthcare', 'Deep Learning', 'Medical AI']
          ];
          
          const matchPercentages = [92, 88, 85, 87, 85, 90, 83, 89];
          
          if (index < projectTitles.length) {
            projects.push({
              id: `proj_${faculty.id}_${index}`,
              faculty_id: faculty.id,
              title: projectTitles[index],
              description: descriptions[index],
              requirements: 'Strong programming skills and interest in research',
              duration: '6-12 months',
              status: 'open',
              skills_required: skillSets[index],
              department_focus: faculty.department?.name || 'General',
              match_percentage: matchPercentages[index],
              faculty: faculty
            });
          }
        });
        
        // Sort by match percentage and split
        projects.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
        setRecommendedProjects(projects.slice(0, 2));
        setAllProjects(projects.slice(2));
      } else {
        // Fallback projects data
        const fallbackProjects = [
          {
            id: '1',
            faculty_id: '1',
            title: 'AI-Driven Medical Imaging for Early Diagnosis',
            description: 'Develop deep learning models to analyze medical scans for early disease detection',
            requirements: 'Strong programming skills',
            duration: '6 months',
            status: 'open',
            skills_required: ['Machine Learning', 'Healthcare AI'],
            department_focus: 'Computer Science & Engineering',
            match_percentage: 92,
            faculty: {
              id: '1',
              designation: 'Professor',
              department_id: '1',
              phone_number: '',
              office_hours: '',
              cabin_block: '',
              cabin_floor: 1,
              cabin_number: '',
              ug_details: '',
              pg_details: '',
              phd_details: '',
              department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
              user: { id: '1', email: 'rajesh.kumar@amrita.edu', username: 'rajesh.kumar', full_name: 'Dr. Rajesh Kumar' }
            }
          }
        ];
        setRecommendedProjects(fallbackProjects);
        setAllProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ProjectCard = ({ project, isRecommended = false }: { project: ResearchProject; isRecommended?: boolean }) => (
    <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4 mb-4 relative">
      {/* Match Badge */}
      {isRecommended && project.match_percentage && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {project.match_percentage}% Match
        </div>
      )}
      
      {/* Project Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight">{project.title}</h3>
        
        {/* Faculty Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
              alt={project.faculty.user.full_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{project.faculty.user.full_name}</p>
            <p className="text-gray-600 text-xs">{project.faculty.department?.name}</p>
          </div>
        </div>
        
        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2">
          {project.skills_required.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {project.description}
        </p>
        
        {/* Apply Button */}
        <button className="w-full bg-[#8B1538] text-white py-3 rounded-lg font-semibold hover:bg-[#7A1230] transition-colors">
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Menu */}
      <StudentNavigationMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
      />
      
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Guru Setu</h1>
          </div>
          <Link href="/dashboard/student/profile" className="p-1">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#8B1538] font-bold text-sm">P</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#8B1538] mb-4">
            Welcome! {studentData.name} ({studentData.roll_number})
          </h2>
        </div>

        {/* Recommended for You */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
          </div>
          
          <div className="space-y-4">
            {recommendedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isRecommended={true} />
            ))}
          </div>
        </div>

        {/* All Research Openings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">All Research Openings</h3>
            <button className="bg-yellow-500 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {allProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}