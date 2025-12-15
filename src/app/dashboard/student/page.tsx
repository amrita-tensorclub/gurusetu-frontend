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

  // Enhanced interest-based matching algorithm
  const calculateMatchPercentage = (project: any, student: StudentData | null): number => {
    if (!student || !student.area_of_interest) {
      console.log('No student or student interests found');
      return 25; // Slightly higher base score
    }
    
    let matchScore = 25; // Start with slightly higher base score
    
    // Parse student interests from area_of_interest field (normalize to lowercase)
    const studentInterests = student.area_of_interest 
      ? student.area_of_interest.split(',').map((interest: string) => interest.trim().toLowerCase())
      : [];
    
    console.log('=== MATCHING DEBUG ===');
    console.log('Project ID:', project.id);
    console.log('Project Topic:', project.topic);
    console.log('Student interests:', studentInterests);
    
    if (studentInterests.length === 0) {
      console.log('No student interests found, returning low score');
      return 25;
    }
    
    // Get faculty data
    const faculty = project.faculty;
    
    // Check faculty area of interest match (normalize to lowercase)
    const facultyInterests = faculty?.area_of_interest 
      ? faculty.area_of_interest.split(',').map((i: string) => i.trim().toLowerCase())
      : [];
    
    // Check project tech_stack and description (normalize to lowercase)
    const projectTechStack = project.tech_stack 
      ? project.tech_stack.split(',').map((skill: string) => skill.trim().toLowerCase())
      : [];
    
    const projectDescription = (project.description || '').toLowerCase();
    const projectTitle = (project.topic || '').toLowerCase();
    
    console.log('Faculty interests:', facultyInterests);
    console.log('Project tech stack:', projectTechStack);
    console.log('Project description:', projectDescription.substring(0, 100) + '...');
    
    // Calculate interest match score
    let interestMatches = 0;
    const matchedInterests: string[] = [];
    
    studentInterests.forEach((studentInterest: string) => {
      let bestMatchScore = 0;
      let bestMatch = '';
      
      // Check against faculty interests (highest priority)
      facultyInterests.forEach((facultyInterest: string) => {
        // Exact match or very close match
        if (facultyInterest === studentInterest) {
          bestMatchScore = Math.max(bestMatchScore, 30);
          bestMatch = `Faculty exact: ${studentInterest}`;
        }
        // Substring match (more lenient)
        else if (facultyInterest.includes(studentInterest) || studentInterest.includes(facultyInterest)) {
          bestMatchScore = Math.max(bestMatchScore, 25);
          bestMatch = `Faculty contains: ${studentInterest} ↔ ${facultyInterest}`;
        }
        // Partial word match for technology names
        else if (studentInterest.length >= 3 && facultyInterest.length >= 3) {
          const words1 = studentInterest.split(/[\s-_]+/);
          const words2 = facultyInterest.split(/[\s-_]+/);
          for (const w1 of words1) {
            for (const w2 of words2) {
              if (w1.length >= 3 && w2.length >= 3 && (w1.includes(w2) || w2.includes(w1))) {
                bestMatchScore = Math.max(bestMatchScore, 20);
                bestMatch = `Faculty partial: ${w1} ↔ ${w2}`;
              }
            }
          }
        }
      });
      
      // Check against project tech stack (high priority)
      projectTechStack.forEach((techSkill: string) => {
        // Exact match
        if (techSkill === studentInterest) {
          bestMatchScore = Math.max(bestMatchScore, 25);
          bestMatch = `Tech exact: ${studentInterest}`;
        }
        // Substring match
        else if (techSkill.includes(studentInterest) || studentInterest.includes(techSkill)) {
          bestMatchScore = Math.max(bestMatchScore, 20);
          bestMatch = `Tech contains: ${studentInterest} ↔ ${techSkill}`;
        }
        // Word-level partial match for technologies
        else if (studentInterest.length >= 2 && techSkill.length >= 2) {
          const words1 = studentInterest.split(/[\s-_]+/);
          const words2 = techSkill.split(/[\s-_]+/);
          for (const w1 of words1) {
            for (const w2 of words2) {
              if (w1.length >= 2 && w2.length >= 2 && (w1.includes(w2) || w2.includes(w1))) {
                bestMatchScore = Math.max(bestMatchScore, 15);
                bestMatch = `Tech partial: ${w1} ↔ ${w2}`;
              }
            }
          }
        }
      });
      
      // Check against project title (medium priority)
      if (studentInterest.length >= 3) {
        if (projectTitle.includes(studentInterest)) {
          bestMatchScore = Math.max(bestMatchScore, 15);
          bestMatch = `Title: ${studentInterest}`;
        }
      }
      
      // Check against project description (lower priority)
      if (studentInterest.length >= 3) {
        if (projectDescription.includes(studentInterest)) {
          bestMatchScore = Math.max(bestMatchScore, 10);
          bestMatch = `Description: ${studentInterest}`;
        }
      }
      
      if (bestMatchScore > 0) {
        interestMatches += bestMatchScore;
        matchedInterests.push(bestMatch);
        console.log(`Interest "${studentInterest}" - best match: ${bestMatch} (${bestMatchScore} points)`);
      } else {
        console.log(`Interest "${studentInterest}" - no match found`);
      }
    });
    
    matchScore += Math.min(interestMatches, 60); // Increased cap to 60 points for interests
    
    // Department match bonus (small)
    if (faculty?.department_id === student.department_id) {
      matchScore += 5;
      console.log('Department match bonus added');
    }
    
    // Final score normalization
    matchScore = Math.max(20, Math.min(95, matchScore));
    
    console.log('Matched interests:', matchedInterests);
    console.log(`Final match score for "${project.topic}": ${Math.round(matchScore)}%`);
    console.log('=== END MATCHING DEBUG ===\n');
    
    return Math.round(matchScore);
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
            area_of_interest: null,
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
        area_of_interest: null,
        department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
        user: { email: userData.email || 'student@college.edu', username: userData.username || 'student' }
      });
    }
  };

  const loadProjects = async () => {
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.id) {
        console.log('No user ID found');
        return;
      }

      // Get fresh student data for matching
      const { data: currentStudent, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (studentError || !currentStudent) {
        console.log('No student data found for matching');
        return;
      }

      console.log('Current student for matching:', currentStudent);

      // Load project openings with faculty data
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
          // Calculate match percentage using fresh student data
          const matchPercentage = calculateMatchPercentage(opening, currentStudent);
          
          return {
            id: opening.id,
            faculty_id: opening.faculty_id,
            title: opening.topic,
            description: opening.description || '',
            requirements: opening.required_skills || '',
            duration: opening.expected_duration || '',
            status: opening.status,
            skills_required: opening.tech_stack ? opening.tech_stack.split(',').map((skill: string) => skill.trim()) : [],
            department_focus: (() => {
              const dept = opening.faculty?.department as any;
              if (Array.isArray(dept)) {
                return dept[0]?.name || 'General';
              }
              return dept?.name || 'General';
            })(),
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
              department: (() => {
                const dept = opening.faculty?.department as any;
                if (Array.isArray(dept)) {
                  return dept[0] || { id: '', name: 'General', code: 'GEN' };
                }
                return dept || { id: '', name: 'General', code: 'GEN' };
              })(),
              user: {
                id: (() => {
                  const user = opening.faculty?.user as any;
                  if (Array.isArray(user)) {
                    return user[0]?.id || '';
                  }
                  return user?.id || '';
                })(),
                email: (() => {
                  const user = opening.faculty?.user as any;
                  if (Array.isArray(user)) {
                    return user[0]?.email || '';
                  }
                  return user?.email || '';
                })(),
                username: (() => {
                  const user = opening.faculty?.user as any;
                  if (Array.isArray(user)) {
                    return user[0]?.username || '';
                  }
                  return user?.username || '';
                })(),
                full_name: opening.faculty?.name || 'Faculty Member'
              }
            }
          };
        });
        
        // Sort by match percentage and split into recommended and all
        projects.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
        
        console.log('\n=== PROJECT FILTERING ===');
        console.log('All projects with scores:');
        projects.forEach(p => {
          console.log(`- ${p.title}: ${p.match_percentage}%`);
        });
        
        // More lenient: Only projects with 50%+ match are "recommended"
        const recommendedThreshold = 50;
        const recommendedProjects = projects.filter(p => {
          const score = p.match_percentage || 0;
          const isRecommended = score >= recommendedThreshold;
          console.log(`Project "${p.title}" (${score}%) - Recommended: ${isRecommended}`);
          return isRecommended;
        });
        
        const allOtherProjects = projects; // All projects for "All Research Openings" section
        
        console.log(`\nFILTER RESULTS:`);
        console.log(`- Recommended projects (${recommendedThreshold}%+ match): ${recommendedProjects.length}`);
        console.log(`- Recommended project titles:`, recommendedProjects.map(p => p.title));
        console.log(`- All available projects: ${allOtherProjects.length}`);
        
        // If no recommendations, show message
        if (recommendedProjects.length === 0) {
          console.log('No projects meet recommendation threshold. Student may need to update interests.');
        }
        
        console.log('=== END PROJECT FILTERING ===\n');
        
        setRecommendedProjects(recommendedProjects);
        setAllProjects(allOtherProjects);
        
        // Debug logging for UI rendering
        console.log('Setting state:');
        console.log('- recommendedProjects:', recommendedProjects.length, recommendedProjects.map(p => p.title));
        console.log('- allProjects:', allOtherProjects.length, allOtherProjects.map(p => p.title));
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
            const matchPercentage = calculateMatchPercentage(opening, currentStudent);
            
            return {
              id: opening.id,
              faculty_id: opening.faculty_id,
              title: opening.topic,
              description: opening.description || '',
              requirements: opening.required_skills || '',
              duration: opening.expected_duration || '',
              status: opening.status,
              skills_required: opening.tech_stack ? opening.tech_stack.split(',').map((skill: string) => skill.trim()) : [],
              department_focus: (() => {
                const dept = faculty?.department as any;
                if (Array.isArray(dept)) {
                  return dept[0]?.name || 'General';
                }
                return dept?.name || 'General';
              })(),
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
                department: (() => {
                  const dept = faculty?.department as any;
                  if (Array.isArray(dept)) {
                    return dept[0] || { id: '', name: 'General', code: 'GEN' };
                  }
                  return dept || { id: '', name: 'General', code: 'GEN' };
                })(),
                user: {
                  id: (() => {
                    const user = faculty?.user as any;
                    if (Array.isArray(user)) {
                      return user[0]?.id || '';
                    }
                    return user?.id || '';
                  })(),
                  email: (() => {
                    const user = faculty?.user as any;
                    if (Array.isArray(user)) {
                      return user[0]?.email || '';
                    }
                    return user?.email || '';
                  })(),
                  username: (() => {
                    const user = faculty?.user as any;
                    if (Array.isArray(user)) {
                      return user[0]?.username || '';
                    }
                    return user?.username || '';
                  })(),
                  full_name: faculty?.name || 'Faculty Member'
                }
              }
            };
          });

          projects.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
          
          // Use lower threshold - projects with 50%+ match are "recommended"
          const recommendedThreshold = 50;
          const recommendedProjects = projects.filter(p => (p.match_percentage || 0) >= recommendedThreshold);
          const allOtherProjects = projects; // All projects for "All Research Openings" section
          
          console.log('Fallback - Recommended projects (50%+ match):', recommendedProjects.length);
          console.log('Fallback - All available projects:', allOtherProjects.length);
          
          setRecommendedProjects(recommendedProjects);
          setAllProjects(allOtherProjects);
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
          <div className="w-10 h-10 bg-[#8B1538] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {project.faculty.user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{project.faculty.user.full_name}</p>
            <p className="text-gray-600 text-xs">{project.faculty.department?.name}</p>
          </div>
        </div>
        
        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2">
          {project.skills_required.slice(0, 4).map((skill, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
            >
              {skill.charAt(0).toUpperCase() + skill.slice(1)}
            </span>
          ))}
          {project.skills_required.length > 4 && (
            <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
              +{project.skills_required.length - 4} more
            </span>
          )}
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
            {recommendedProjects.length > 0 ? (
              recommendedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isRecommended={true} />
              ))
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="text-blue-600 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Personalized Recommendations</h4>
                <p className="text-gray-600 mb-4">
                  {!studentData?.area_of_interest ? 
                    "Update your interests in your profile to get personalized project recommendations." :
                    "No projects currently match your interests. Try expanding your interests or check back later for new projects."
                  }
                </p>
                <Link 
                  href="/dashboard/student/interests"
                  className="inline-block bg-[#8B1538] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#7A1230] transition-colors"
                >
                  {!studentData?.area_of_interest ? "Add Your Interests" : "Update Interests"}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* All Research Openings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">All Research Openings</h3>
            
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