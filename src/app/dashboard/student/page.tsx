'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api'; 
import { useAuth } from '@/hooks/useAuth';

// Interfaces
interface StudentData {
  id: string;
  name: string;
  roll_number: string;
  year: number;
  department_id: string;
  bio: string | null;
  phone_number: string | null;
  area_of_interest: string | null;
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
  topic?: string; 
  tech_stack?: string;
  faculty: {
    id: string;
    designation: string;
    department_id: string;
    area_of_interest?: string;
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
  };
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth('student');
  
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [recommendedProjects, setRecommendedProjects] = useState<ResearchProject[]>([]);
  const [allProjects, setAllProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedProjects, setAppliedProjects] = useState<Set<string>>(new Set());
  const [applicationStatuses, setApplicationStatuses] = useState<{[key: string]: string}>({});
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const dashboardData = await api.dashboard.student((user as any).id); 
        
        if (dashboardData && dashboardData.student) {
          setStudentData(dashboardData.student);
          
          // Process Projects
          const rawProjects = dashboardData.projects || [];
          
          const projects: ResearchProject[] = rawProjects.map((opening: any) => {
            const matchPercentage = calculateMatchPercentage(opening, dashboardData.student);
            
            return {
              id: opening.id,
              faculty_id: opening.faculty_id || opening.faculty.id,
              title: opening.title || opening.topic,
              topic: opening.topic,
              tech_stack: opening.tech_stack,
              description: opening.description || '',
              requirements: opening.required_skills || '',
              duration: opening.expected_duration || '',
              status: opening.status,
              skills_required: opening.skills_required || [],
              department_focus: opening.faculty?.department?.name || 'General',
              match_percentage: matchPercentage,
              faculty: opening.faculty
            };
          });

          // Sort and Filter
          projects.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
          const recommendedThreshold = 50;
          setRecommendedProjects(projects.filter(p => (p.match_percentage || 0) >= recommendedThreshold));
          setAllProjects(projects);

          // Fetch Application Status
          const appData = await api.student.getApplications(dashboardData.student.id);
          if (appData && appData.applications) {
            const appliedIds = new Set(appData.applications.map((app: any) => app.project_opening_id));
            const statuses = appData.applications.reduce((acc: any, app: any) => {
              acc[app.project_opening_id] = app.status;
              return acc;
            }, {});
            setAppliedProjects(appliedIds as Set<string>);
            setApplicationStatuses(statuses);
          }
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  // Apply Handler
  const handleApplyToProject = async (projectId: string) => {
    if (!studentData || isApplying) return;
    setIsApplying(projectId);
    
    const result = await api.projects.apply(studentData.id, projectId);
    
    if (result.error) {
       if (result.error.includes('Already applied')) {
         alert('You have already applied to this project!');
       } else {
         alert('Failed to submit application. Please try again.');
       }
    } else {
       alert('Application submitted successfully!');
       setAppliedProjects(prev => new Set([...prev, projectId]));
       setApplicationStatuses(prev => ({ ...prev, [projectId]: 'pending' }));
    }
    
    setIsApplying(null);
  };

  // Matching Logic
  const calculateMatchPercentage = (project: any, student: StudentData | null): number => {
    if (!student || !student.area_of_interest) return 25;
    
    let matchScore = 25;
    const studentInterests = student.area_of_interest.split(',').map(i => i.trim().toLowerCase());
    if (studentInterests.length === 0) return 25;
    
    const faculty = project.faculty;
    const facultyInterests = faculty?.area_of_interest ? faculty.area_of_interest.split(',').map((i:any) => i.trim().toLowerCase()) : [];
    
    const projectTechStack = project.skills_required 
      ? project.skills_required.map((s:string) => s.toLowerCase())
      : (project.tech_stack ? project.tech_stack.split(',').map((s: string) => s.trim().toLowerCase()) : []);
    
    const projectDescription = (project.description || '').toLowerCase();
    const projectTitle = (project.title || project.topic || '').toLowerCase();
    
    let interestMatches = 0;
    
    studentInterests.forEach((studentInterest: string) => {
      let bestMatchScore = 0;
      facultyInterests.forEach((facultyInterest: string) => {
        if (facultyInterest === studentInterest) bestMatchScore = Math.max(bestMatchScore, 30);
        else if (facultyInterest.includes(studentInterest) || studentInterest.includes(facultyInterest)) bestMatchScore = Math.max(bestMatchScore, 25);
      });
      projectTechStack.forEach((techSkill: string) => {
        if (techSkill === studentInterest) bestMatchScore = Math.max(bestMatchScore, 25);
        else if (techSkill.includes(studentInterest) || studentInterest.includes(techSkill)) bestMatchScore = Math.max(bestMatchScore, 20);
      });
      if (studentInterest.length >= 3) {
        if (projectTitle.includes(studentInterest)) bestMatchScore = Math.max(bestMatchScore, 15);
        if (projectDescription.includes(studentInterest)) bestMatchScore = Math.max(bestMatchScore, 10);
      }
      if (bestMatchScore > 0) interestMatches += bestMatchScore;
    });
    
    matchScore += Math.min(interestMatches, 60); 
    if (faculty?.department_id === student.department_id) matchScore += 5;
    
    return Math.max(20, Math.min(95, matchScore));
  };

  if (isLoading || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ProjectCard = ({ project, isRecommended = false }: { project: ResearchProject; isRecommended?: boolean }) => {
    const hasApplied = appliedProjects.has(project.id);
    const applicationStatus = applicationStatuses[project.id];
    const isCurrentlyApplying = isApplying === project.id;
    
    const getButtonText = () => {
      if (isCurrentlyApplying) return 'Applying...';
      if (applicationStatus === 'accepted') return 'Accepted ✓';
      if (applicationStatus === 'rejected') return 'Rejected ✗';
      if (applicationStatus === 'pending') return 'Applied (Pending)';
      if (hasApplied) return 'Applied ✓';
      return 'Apply';
    };
    
    const getButtonStyle = () => {
      if (applicationStatus === 'accepted') return 'bg-green-100 text-green-700 border-2 border-green-300 cursor-not-allowed';
      if (applicationStatus === 'rejected') return 'bg-red-100 text-red-700 border-2 border-red-300 cursor-not-allowed';
      if (applicationStatus === 'pending') return 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 cursor-not-allowed';
      if (hasApplied) return 'bg-gray-100 text-gray-700 border-2 border-gray-300 cursor-not-allowed';
      if (isCurrentlyApplying) return 'bg-gray-100 text-gray-500 cursor-not-allowed';
      return 'bg-[#8B1538] text-white hover:bg-[#7A1230]';
    };
    
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4 relative hover:shadow-md transition-shadow">
        {isRecommended && <div className="absolute top-0 right-0 bg-[#8B1538] text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">Recommended</div>}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{project.title}</h3>
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = `/dashboard/student/faculty/${project.faculty_id}`}>
            <div className="w-8 h-8 bg-[#8B1538] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {project.faculty.user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm hover:underline">{project.faculty.user.full_name}</p>
              <p className="text-gray-500 text-xs">{project.faculty.department?.name}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {project.skills_required?.slice(0, 4).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{project.description}</p>
          
          <button 
            onClick={() => handleApplyToProject(project.id)}
            disabled={hasApplied || isCurrentlyApplying}
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${getButtonStyle()}`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-8 bg-gradient-to-r from-[#8B1538] to-[#6d102b] rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-1">
          Welcome back, {studentData.name.split(' ')[0]}!
        </h2>
        <p className="opacity-90 text-sm">Roll Number: {studentData.roll_number}</p>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-[#8B1538]">★</span> Recommended for You
        </h3>
        <div className="space-y-4">
          {recommendedProjects.length > 0 ? (
            recommendedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isRecommended={true} />
            ))
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
              <p className="text-gray-600 mb-4">
                {!studentData?.area_of_interest ? 
                  "Update your interests profile to get personalized project recommendations." :
                  "No matched projects found right now. Try updating your skills!"
                }
              </p>
              <Link href="/dashboard/student/profile" className="inline-block bg-[#8B1538] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#7A1230] transition-colors">
                Update Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">All Research Openings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {allProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}