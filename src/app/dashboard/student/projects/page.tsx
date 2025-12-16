'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function StudentProjects() {
  const router = useRouter();
  const [personalProjects, setPersonalProjects] = useState([]);
  const [acceptedProjects, setAcceptedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'accepted'

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      
      // Get student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError || !studentData) {
        console.error('Error getting student data:', studentError);
        return;
      }

      // Load personal projects
      const { data: personalProjectsData, error: personalError } = await supabase
        .from('student_projects')
        .select('*')
        .eq('student_id', studentData.id)
        .order('year', { ascending: false });

      if (personalError) {
        console.error('Error loading personal projects:', personalError);
      } else {
        setPersonalProjects(personalProjectsData || []);
      }

      // Load accepted faculty project applications with better query
      const { data: acceptedAppsData, error: acceptedError } = await supabase
        .from('student_applications')
        .select(`
          id,
          status,
          applied_date,
          response_date,
          opening_type,
          project_opening_id
        `)
        .eq('student_id', studentData.id)
        .eq('status', 'accepted')
        .eq('opening_type', 'project')
        .order('response_date', { ascending: false });

      if (acceptedError) {
        console.error('Error loading accepted applications:', acceptedError);
      } else {
        // Get project details for each accepted application
        const projectsWithDetails = await Promise.all(
          (acceptedAppsData || []).map(async (app) => {
            const { data: projectData, error: projectError } = await supabase
              .from('faculty_project_openings')
              .select(`
                id,
                topic,
                description,
                tech_stack,
                expected_duration,
                faculty (
                  name,
                  designation,
                  departments (
                    name
                  )
                )
              `)
              .eq('id', app.project_opening_id)
              .single();

            if (projectError) {
              console.error('Error loading project details:', projectError);
              return null;
            }

            return {
              ...app,
              project: projectData
            };
          })
        );

        setAcceptedProjects(projectsWithDetails.filter(p => p !== null));
      }

    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">My Projects</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'bg-white text-[#8B1538] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Projects ({personalProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'accepted'
                  ? 'bg-white text-[#8B1538] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Faculty Projects ({acceptedProjects.length})
            </button>
          </div>
        </div>

        {/* Personal Projects Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {personalProjects.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Personal Projects Yet</h2>
                <p className="text-gray-600 mb-6">
                  Add your personal projects to showcase your work.
                </p>
              </div>
            ) : (
              personalProjects.map((project: any) => (
                <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      
                      {project.tech_stack && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Tech Stack: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {project.tech_stack.split(',').map((tech: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {project.year && <span>Year: {project.year}</span>}
                        {project.project_url && (
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800">
                            Live Demo
                          </a>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800">
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Accepted Faculty Projects Tab */}
        {activeTab === 'accepted' && (
          <div className="space-y-4">
            {acceptedProjects.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Accepted Projects Yet</h2>
                <p className="text-gray-600 mb-6">
                  Apply to faculty projects and get accepted to see them here!
                </p>
                <button 
                  onClick={() => router.push('/dashboard/student')}
                  className="bg-[#8B1538] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#7A1230] transition-colors"
                >
                  Explore Projects
                </button>
              </div>
            ) : (
              acceptedProjects.map((application: any) => {
                const project = application.project; // Updated to match new structure
                return (
                  <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.topic}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ACCEPTED
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Faculty: </span>
                            <span className="text-sm text-gray-900">{project.faculty.name}</span>
                            <span className="text-xs text-gray-500 block">{project.faculty.designation}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Department: </span>
                            <span className="text-sm text-gray-900">{project.faculty.departments.name}</span>
                          </div>
                        </div>
                        
                        {project.tech_stack && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">Tech Stack: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {project.tech_stack.split(',').map((tech: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Applied: {new Date(application.applied_date).toLocaleDateString()}</span>
                          <span>Accepted: {new Date(application.response_date).toLocaleDateString()}</span>
                          {project.expected_duration && <span>Duration: {project.expected_duration}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}