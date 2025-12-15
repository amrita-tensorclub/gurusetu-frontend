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
  }, []);

  useEffect(() => {
    if (studentData) {
      loadProjects();
    }
  }, [studentData]);

  // Calculate match percentage between student and project
  const calculateMatchPercentage = (project: any, student: StudentData | null): number => {
    if (!student) return 50; // Default match if no student data
    
    let matchScore = 50; // Base score
    
    // Department match bonus
    if (project.faculty?.department_id === student.department_id) {
      matchScore += 20;
    }
    
    // Interest overlap (if available)
    if (student.bio && project.description) {
      const studentInterests = student.bio.toLowerCase().split(' ');
      const projectKeywords = project.description.toLowerCase().split(' ');
      const overlap = studentInterests.filter(interest => 
        projectKeywords.some((keyword: string) => keyword.includes(interest) || interest.includes(keyword))
      ).length;
      matchScore += Math.min(20, overlap * 5);
    }
    
    // Random variation for demo purposes
    matchScore += Math.random() * 20 - 10;
    
    return Math.min(100, Math.max(60, Math.round(matchScore)));
  };

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
          console.error('Error loading student data:', error);
          console.log('User data:', userData);
          // Create a basic placeholder if student not found
          setStudentData({
            id: userData.id || 'temp_id',
            name: userData.name || userData.username || 'Student',
            roll_number: userData.roll_number || 'Unknown',
            year: 3,
            department_id: '1',
            bio: null,
            phone_number: null,
            department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
            user: { email: userData.email || 'student@college.edu', username: userData.username || 'student' }
          });
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      // Set basic user data from localStorage if available
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setStudentData({
        id: userData.id || 'temp_id',
        name: userData.name || userData.username || 'Student',
        roll_number: userData.roll_number || 'Unknown',
        year: 3,
        department_id: '1',
        bio: null,
        phone_number: null,
        department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
        user: { email: userData.email || 'student@college.edu', username: userData.username || 'student' }
      });
    }
  };

  const loadProjects = async () => {
    try {
      // First, try to load project openings with faculty data
      const { data: projectOpenings, error } = await supabase
        .from('faculty_project_openings')
        .select(`
          *,
          faculty!inner (
            id,
            name,
            designation,
            department_id,
            area_of_interest,
            department:departments(id, name, code),
            user:users(id, email, username, role)
          )
        `)
        .eq('status', 'open');

      if (projectOpenings && !error && projectOpenings.length > 0) {
        console.log('Loaded project openings:', projectOpenings);
        // Transform database format to match component interface
        const projects: ResearchProject[] = projectOpenings.map((opening) => {
          // Calculate match percentage based on student interests (basic algorithm)
          const matchPercentage = calculateMatchPercentage(opening, studentData);
          
          return {
            id: opening.id,
            faculty_id: opening.faculty_id,
            title: opening.topic,
            description: opening.description || '',
            requirements: opening.required_skills || '',
            duration: opening.expected_duration || '',
            status: opening.status,
            skills_required: opening.tech_stack ? opening.tech_stack.split(',').map((skill: string) => skill.trim()) : [],
            department_focus: opening.faculty?.department?.name || 'General',
            match_percentage: matchPercentage,
            faculty: {
              id: opening.faculty?.id || '',
              designation: opening.faculty?.designation || 'Faculty',
              department_id: opening.faculty?.department_id || '',
              phone_number: '',
              office_hours: '',
              cabin_block: '',
              cabin_floor: 1,
              cabin_number: '',
              ug_details: '',
              pg_details: '',
              phd_details: '',
              department: opening.faculty?.department || { id: '', name: 'General', code: 'GEN' },
              user: {
                id: opening.faculty?.user?.id || '',
                email: opening.faculty?.user?.email || '',
                username: opening.faculty?.user?.username || '',
                full_name: opening.faculty?.name || 'Faculty Member'
              }
            }
          };
        });
        
        // Sort by match percentage and split into recommended and all
        projects.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
        const recommendedCount = Math.min(3, projects.length);
        setRecommendedProjects(projects.slice(0, recommendedCount));
        setAllProjects(projects.slice(recommendedCount));
      } else {
        // Fallback: Try to load projects without joins
        console.log('Trying fallback query without joins...');
        const { data: simpleProjects, error: simpleError } = await supabase
          .from('faculty_project_openings')
          .select('*')
          .eq('status', 'open');

        if (simpleProjects && !simpleError && simpleProjects.length > 0) {
          console.log('Loaded simple projects:', simpleProjects);
          
          // Get faculty data separately
          const facultyIds = simpleProjects.map(p => p.faculty_id);
          const { data: facultyData, error: facultyError } = await supabase
            .from('faculty')
            .select(`
              id,
              name,
              designation,
              department_id,
              area_of_interest,
              department:departments(id, name, code),
              user:users(id, email, username, role)
            `)
            .in('id', facultyIds);

          const projects: ResearchProject[] = simpleProjects.map((opening) => {
            const faculty = facultyData?.find(f => f.id === opening.faculty_id);
            const matchPercentage = calculateMatchPercentage(opening, studentData);
            
            return {
              id: opening.id,
              faculty_id: opening.faculty_id,
              title: opening.topic,
              description: opening.description || '',
              requirements: opening.required_skills || '',
              duration: opening.expected_duration || '',
              status: opening.status,
              skills_required: opening.tech_stack ? opening.tech_stack.split(',').map((skill: string) => skill.trim()) : [],
              department_focus: faculty?.department?.name || 'General',
              match_percentage: matchPercentage,
              faculty: {
                id: faculty?.id || '',
                designation: faculty?.designation || 'Faculty',
                department_id: faculty?.department_id || '',
                phone_number: '',
                office_hours: '',
                cabin_block: '',
                cabin_floor: 1,
                cabin_number: '',
                ug_details: '',
                pg_details: '',
                phd_details: '',
                department: faculty?.department || { id: '', name: 'General', code: 'GEN' },
                user: {
                  id: faculty?.user?.id || '',
                  email: faculty?.user?.email || '',
                  username: faculty?.user?.username || '',
                  full_name: faculty?.name || 'Faculty Member'
                }
              }
            };
          });

          projects.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
          const recommendedCount = Math.min(3, projects.length);
          setRecommendedProjects(projects.slice(0, recommendedCount));
          setAllProjects(projects.slice(recommendedCount));
        } else {
          console.error('Error loading projects:', error || simpleError);
          setRecommendedProjects([]);
          setAllProjects([]);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setRecommendedProjects([]);
      setAllProjects([]);
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
      {/* {isRecommended && project.match_percentage && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {project.match_percentage}% Match
        </div>
      )} */}
      
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