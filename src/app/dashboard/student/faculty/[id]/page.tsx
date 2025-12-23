'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FacultyProfile {
  id: string;
  user_id: string;
  name: string;
  employee_id: string;
  department_id: string;
  designation: string;
  cabin_block: string;
  cabin_floor: number;
  cabin_number: string;
  area_of_interest: string;
  office_hours: string;
  pg_details: string;
  phd_details: string;
  phone_number: string;
  ug_details: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

interface ProjectOpening {
  id: string;
  topic: string;
  description: string;
  tech_stack: string;
  required_skills: string;
  expected_duration: string;
  max_students: number;
  status: string;
}

interface ResearchPaper {
  id: string;
  paper_name: string;
  publication_link: string;
  conference_or_journal: string;
  year_published: number;
  co_authors: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  year_completed: number;
  collaborators: string;
  project_url: string;
}

interface Qualification {
  id: string;
  degree_type: string;
  degree_name: string;
  institution: string;
  year_of_completion: number;
}

export default function FacultyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;
  
  const [faculty, setFaculty] = useState<FacultyProfile | null>(null);
  const [openings, setOpenings] = useState<ProjectOpening[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (facultyId) {
      loadFacultyProfile();
    }
  }, [facultyId]);

  const loadFacultyProfile = async () => {
    try {
      // Load faculty basic info
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select(`
          *,
          department:departments(id, name, code),
          user:users(id, email, username, role)
        `)
        .eq('id', facultyId)
        .single();

      if (facultyData && !facultyError) {
        setFaculty(facultyData);
      }

      // Load project openings
      const { data: openingsData, error: openingsError } = await supabase
        .from('faculty_project_openings')
        .select('*')
        .eq('faculty_id', facultyId)
        .eq('status', 'open');

      if (openingsData && !openingsError) {
        setOpenings(openingsData);
      }

      // Load research papers
      const { data: papersData, error: papersError } = await supabase
        .from('faculty_research_papers')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('year_published', { ascending: false });

      if (papersData && !papersError) {
        setPapers(papersData);
      }

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('faculty_projects')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('year_completed', { ascending: false });

      if (projectsData && !projectsError) {
        setProjects(projectsData);
      }

      // Load qualifications
      const { data: qualificationsData, error: qualificationsError } = await supabase
        .from('faculty_qualifications')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('year_of_completion', { ascending: false });

      if (qualificationsData && !qualificationsError) {
        setQualifications(qualificationsData);
      }

    } catch (error) {
      console.error('Error loading faculty profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResearchInterests = () => {
    if (!faculty?.area_of_interest) return [];
    return faculty.area_of_interest.split(',').map(interest => interest.trim());
  };

  const formatCabinLocation = () => {
    if (!faculty) return '';
    const parts = [];
    if (faculty.cabin_block) parts.push(`Block ${faculty.cabin_block}`);
    if (faculty.cabin_floor) parts.push(`Floor ${faculty.cabin_floor}`);
    if (faculty.cabin_number) parts.push(`Cabin ${faculty.cabin_number}`);
    return parts.join(', ');
  };

  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Faculty Not Found</h2>
          <button 
            onClick={() => router.back()}
            className="text-[#8B1538] font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 text-center">
          <button 
            onClick={() => router.back()}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Profile Photo */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-400">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face" 
              alt={faculty.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Basic Info */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{faculty.name}</h1>
          <p className="text-gray-600 mb-1">{faculty.designation}</p>
          <p className="text-gray-600 text-sm mb-4">Department of {faculty.department?.name}</p>

          {/* Education */}
          <div className="flex justify-center space-x-4 mb-4">
            {qualifications.length > 0 ? (
              qualifications.slice(0, 2).map((qual, index) => (
                <span key={index} className="text-sm text-gray-600">
                  {qual.degree_type} in {qual.degree_name}
                </span>
              ))
            ) : (
              <>
                {faculty.phd_details && (
                  <span className="text-sm text-gray-600">{faculty.phd_details}</span>
                )}
                {faculty.pg_details && (
                  <span className="text-sm text-gray-600">{faculty.pg_details}</span>
                )}
              </>
            )}
          </div>

          {/* Email */}
          <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full mb-4">
            <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-700">{faculty.user.email}</span>
          </div>

          {/* Cabin Location */}
          {formatCabinLocation() && (
            <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full">
              <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-700">{formatCabinLocation()}</span>
            </div>
          )}
        </div>

        {/* Research Interests */}
        {getResearchInterests().length > 0 && (
          <div className="px-6 mb-6">
            <h2 className="text-lg font-bold text-[#8B1538] mb-3">Research Interests</h2>
            <div className="flex flex-wrap gap-2">
              {getResearchInterests().slice(0, 3).map((interest, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 border-2 border-[#8B1538] text-[#8B1538] rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current Openings */}
        {openings.length > 0 && (
          <div className="px-6 mb-6">
            <h2 className="text-lg font-bold text-[#8B1538] mb-3">Current Openings</h2>
            <div className="space-y-3">
              {openings.slice(0, 3).map((opening) => (
                <div key={opening.id} className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{opening.topic}</h3>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{opening.description}</p>
                  <button className="text-[#8B1538] text-xs font-medium mt-2">View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Work */}
        {(papers.length > 0 || projects.length > 0) && (
          <div className="px-6 mb-6">
            <h2 className="text-lg font-bold text-[#8B1538] mb-3">Previous Work</h2>
            <div className="space-y-2">
              {papers.slice(0, 2).map((paper) => (
                <div key={paper.id} className="text-sm">
                  <span className="text-gray-900 font-medium">{paper.year_published}:</span>
                  <span className="text-gray-700 ml-1">{paper.paper_name}</span>
                  <span className="text-gray-500 ml-1">({paper.conference_or_journal})</span>
                </div>
              ))}
              {projects.slice(0, 2).map((project) => (
                <div key={project.id} className="text-sm">
                  <span className="text-gray-900 font-medium">{project.year_completed}:</span>
                  <span className="text-gray-700 ml-1">{project.title}</span>
                  <span className="text-gray-500 ml-1">(Project)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="px-6 mb-6">
          <h2 className="text-lg font-bold text-[#8B1538] mb-3">Availability</h2>
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span className="text-green-600 font-medium">Available Now</span>
          </div>
          
          {/* Weekly Schedule */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-gray-600 mb-1">{day}</div>
                <div className="text-xs text-gray-900 font-medium">
                  {day === 'Sat' || day === 'Sun' ? '' : '10-12'}
                </div>
                {day !== 'Sat' && day !== 'Sun' && (
                  <div className="text-xs text-gray-900">
                    {index < 2 ? '2-4' : index < 4 ? '11-1' : '3-5'}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {faculty.office_hours && (
            <div className="text-sm text-gray-600">
              <strong>Office Hours:</strong> {faculty.office_hours}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="space-y-3">
            <button className="w-full bg-[#8B1538] text-white py-4 rounded-lg font-semibold hover:bg-[#7A1230] transition-colors">
              Navigate to Cabin
            </button>
            <button className="w-full border-2 border-[#8B1538] text-[#8B1538] py-3 rounded-lg font-semibold hover:bg-[#8B1538] hover:text-white transition-colors">
              Request Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}