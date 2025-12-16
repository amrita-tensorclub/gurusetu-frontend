'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ProjectOpening {
  id: string;
  faculty_id: string;
  topic: string;
  description: string;
  tech_stack: string;
  required_skills: string;
  expected_duration: string;
  max_students: number;
  status: 'open' | 'closed';
  application_count?: number;
  accepted_count?: number;
}

interface StudentApplication {
  id: string;
  student_id: string;
  project_opening_id: string;
  opening_type: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  application_message: string;
  applied_date: string;
  response_date?: string;
  student: {
    id: string;
    name: string;
    roll_number: string;
    year: number;
    area_of_interest: string;
    bio?: string;
    phone_number?: string;
    resume_url?: string;
    department: {
      name: string;
      code: string;
    };
    user: {
      email: string;
    };
  };
}

interface FacultyProfile {
  id: string;
  name: string;
  designation: string;
  department: {
    name: string;
    code: string;
  };
}

export default function FacultyProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOpening[]>([]);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectOpening | null>(null);
  const [showApplications, setShowApplications] = useState<string | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentApplication | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedProjectForRequests, setSelectedProjectForRequests] = useState<ProjectOpening | null>(null);
  const [showAcceptedStudentsModal, setShowAcceptedStudentsModal] = useState(false);
  const [selectedProjectForAccepted, setSelectedProjectForAccepted] = useState<ProjectOpening | null>(null);
  const [acceptedStudents, setAcceptedStudents] = useState<StudentApplication[]>([]);
  const [profileSource, setProfileSource] = useState<'accepted' | 'applications' | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    tech_stack: '',
    required_skills: '',
    expected_duration: '',
    max_students: 1,
    status: 'open' as 'open' | 'closed' | 'in_progress'
  });

  useEffect(() => {
    loadFacultyData();
    loadProjects();
  }, []);

  const loadFacultyData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.id) {
        const { data, error } = await supabase
          .from('faculty')
          .select(`
            id, name, designation,
            department:departments(name, code)
          `)
          .eq('user_id', userData.id)
          .single();

        if (data && !error) {
          setFacultyProfile({
            ...data,
            department: Array.isArray(data.department) ? data.department[0] : data.department
          });
        }
      }
    } catch (error) {
      console.error('Error loading faculty profile:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.id) {
        // First get faculty ID
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty')
          .select('id')
          .eq('user_id', userData.id)
          .single();

        if (facultyData && !facultyError) {
          const { data: projectsData, error: projectsError } = await supabase
            .from('faculty_project_openings')
            .select('*')
            .eq('faculty_id', facultyData.id);

          if (projectsData && !projectsError) {
            // Get application counts for each project
            const projectsWithCounts = await Promise.all(
              projectsData.map(async (project) => {
                // Get pending applications count
                const { count: pendingCount } = await supabase
                  .from('student_applications')
                  .select('*', { count: 'exact', head: true })
                  .eq('project_opening_id', project.id)
                  .eq('opening_type', 'project')
                  .eq('status', 'pending');
                
                // Get accepted applications count
                const { count: acceptedCount } = await supabase
                  .from('student_applications')
                  .select('*', { count: 'exact', head: true })
                  .eq('project_opening_id', project.id)
                  .eq('opening_type', 'project')
                  .eq('status', 'accepted');
                
                return {
                  ...project,
                  application_count: pendingCount || 0,
                  accepted_count: acceptedCount || 0
                };
              })
            );
            
            setProjects(projectsWithCounts);
          }
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (facultyError || !facultyData) {
        alert('Error: Faculty profile not found');
        return;
      }

      const projectData = {
        ...formData,
        tech_stack: formData.tech_stack.toLowerCase(), // Normalize to lowercase
        required_skills: formData.required_skills.toLowerCase(), // Normalize to lowercase
        faculty_id: facultyData.id,
      };

      let result;
      if (editingProject) {
        // Update existing project
        result = await supabase
          .from('faculty_project_openings')
          .update(projectData)
          .eq('id', editingProject.id);
      } else {
        // Create new project
        result = await supabase
          .from('faculty_project_openings')
          .insert(projectData);
      }

      if (result.error) {
        alert('Error saving project: ' + result.error.message);
      } else {
        alert(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
        resetForm();
        loadProjects();
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('An error occurred while saving the project');
    }
  };

  const handleEdit = (project: ProjectOpening) => {
    setEditingProject(project);
    setFormData({
      topic: project.topic,
      description: project.description,
      tech_stack: project.tech_stack,
      required_skills: project.required_skills,
      expected_duration: project.expected_duration,
      max_students: project.max_students,
      status: project.status
    });
    setShowAddForm(true);
  };

  const loadApplications = async (projectId: string) => {
    setLoadingApplications(true);
    try {
      const { data, error } = await supabase
        .from('student_applications')
        .select(`
          id,
          student_id,
          status,
          application_message,
          applied_date,
          student:students(
            id,
            name,
            roll_number,
            year,
            area_of_interest,
            department:departments(name, code),
            user:users(email)
          )
        `)
        .eq('project_opening_id', projectId)
        .eq('opening_type', 'project')
        .order('applied_date', { ascending: false });

      if (data && !error) {
        setApplications(data as any);
      } else {
        console.error('Error loading applications:', error);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleShowApplications = (projectId: string) => {
    setShowApplications(projectId);
    loadApplications(projectId);
  };

  const handleCloseApplications = () => {
    setShowApplications(null);
    setApplications([]);
    setSelectedStudent(null);
  };

  const handleStudentClick = (application: StudentApplication) => {
     setProfileSource('accepted');
  setShowAcceptedStudentsModal(false); // CLOSE accepted modal
  setSelectedStudent(application); 
    
  };

  const handleCloseStudentDetails = () => {
  setSelectedStudent(null);

  // If opened from accepted students, reopen that modal
  if (profileSource === 'accepted' && selectedProjectForAccepted) {
    setShowAcceptedStudentsModal(true);
  }

  setProfileSource(null);
};


  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('student_applications')
        .update({ 
          status: 'accepted',
          response_date: new Date().toISOString(),
          faculty_response_message: 'Application accepted'
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error accepting application:', error);
        alert('Failed to accept application. Please try again.');
        return;
      }

      alert('Application accepted successfully!');
      
      // Refresh all data
      await loadProjects(); // This will update the counts
      
      // Refresh current modals if open
      if (selectedStudent?.project_opening_id) {
        loadApplications(selectedStudent.project_opening_id);
      }
      if (selectedProjectForRequests) {
        loadApplications(selectedProjectForRequests.id);
      }
      if (selectedProjectForAccepted) {
        loadAcceptedStudents(selectedProjectForAccepted.id);
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Failed to accept application. Please try again.');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('student_applications')
        .update({ 
          status: 'rejected',
          response_date: new Date().toISOString(),
          faculty_response_message: 'Application rejected'
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error rejecting application:', error);
        alert('Failed to reject application. Please try again.');
        return;
      }

      alert('Application rejected successfully!');
      
      // Refresh all data
      await loadProjects(); // This will update the counts
      
      // Refresh current modals if open
      if (showApplications) {
        await loadApplications(showApplications);
      }
      if (selectedProjectForRequests) {
        loadApplications(selectedProjectForRequests.id);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    }
  };

  const handleShowRequests = (project: ProjectOpening) => {
    setSelectedProjectForRequests(project);
    setShowRequestsModal(true);
    loadApplications(project.id);
  };

  const handleShowAcceptedStudents = (project: any) => {
    setSelectedProjectForAccepted(project);
    loadAcceptedStudents(project.id);
    setShowAcceptedStudentsModal(true);
  };

  const loadAcceptedStudents = async (projectId: string) => {
    try {
      setLoadingApplications(true);
      const { data, error } = await supabase
        .from('student_applications')
        .select(`
          *,
          student:students (
            id,
            name,
            roll_number,
            year,
            area_of_interest,
            bio,
            resume_url,
            phone_number,
            department:departments (
              name,
              code
            ),
            user:users (
              email
            )
          )
        `)
        .eq('project_opening_id', projectId)
        .eq('opening_type', 'project')
        .eq('status', 'accepted');

      if (error) {
        console.error('Error loading accepted students:', error);
        return;
      }

      setAcceptedStudents(data || []);
    } catch (error) {
      console.error('Error loading accepted students:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      description: '',
      tech_stack: '',
      required_skills: '',
      expected_duration: '',
      max_students: 1,
      status: 'open'
    });
    setEditingProject(null);
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  function handleDelete(id: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-gray-50 placeholder-gray-500">
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
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-white text-[#8B1538] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            + Add Project
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Faculty Info */}
        {facultyProfile && (
          <div className="bg-white rounded-xl p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900">{facultyProfile.name}</h2>
            <p className="text-gray-600">{facultyProfile.designation}</p>
            <p className="text-gray-500">{facultyProfile.department?.name}</p>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first research project opening</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#8B1538] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7A1230] transition-colors"
              >
                Create Project
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{project.topic}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-3 leading-relaxed">{project.description}</p>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600 font-medium">Tech Stack:</span>
                    {project.tech_stack.split(',').map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                        {tech.trim().charAt(0).toUpperCase() + tech.trim().slice(1)}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Duration:</span>
                      <span className="ml-2 text-gray-900">{project.expected_duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Max Students:</span>
                      <span className="ml-2 text-gray-900">{project.max_students}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-600 font-medium">Required Skills:</span>
                      <p className="text-sm text-gray-900 mt-1">{project.required_skills}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600 font-bold">Students: </span>
                      <button 
                        onClick={() => handleShowAcceptedStudents(project)}
                        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                      >
                        {(project as any).accepted_count || 0}
                      </button>
                      <span className="text-gray-600"> / {project.max_students}</span>
                    </div>
                    <div className="flex gap-2">
                      {(project.application_count || 0) > 0 && (
                        <button 
                          onClick={() => handleShowRequests(project)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Requests ({project.application_count || 0})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Topic *</label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none text-black"
                    placeholder="e.g., AI-Powered Medical Diagnosis System"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none resize-none text-black"
                    placeholder="Describe the project objectives, methodology, and expected outcomes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tech Stack *</label>
                  <input
                    type="text"
                    required
                    value={formData.tech_stack}
                    onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none text-black"
                    placeholder="e.g., Python, TensorFlow, React, Node.js (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills *</label>
                  <input
                    type="text"
                    required
                    value={formData.required_skills}
                    onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none text-black"
                    placeholder="e.g., Machine Learning, Data Science, Programming"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                    <input
                      type="text"
                      required
                      value={formData.expected_duration}
                      onChange={(e) => setFormData({ ...formData, expected_duration: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none text-black"
                      placeholder="e.g., 6-8 months"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Students *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'open' | 'closed' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none text-black"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#8B1538] text-white rounded-lg font-medium hover:bg-[#7A1230] transition-colors text-black"
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Student Applications</h2>
                <button 
                  onClick={handleCloseApplications}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {loadingApplications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600">Students haven't applied to this project yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {applications.map((application) => (
                    <div 
                      key={application.id} 
                      onClick={() => handleStudentClick(application)}
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="w-10 h-10 bg-[#8B1538] rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {application.student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{application.student.name}</h3>
                              <p className="text-sm text-gray-600">{application.student.roll_number} • Year {application.student.year}</p>
                              <p className="text-xs text-gray-500">{application.student.department?.name}</p>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-600">Interests: </span>
                            <span className="text-xs text-gray-800">{application.student.area_of_interest || 'Not specified'}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Applied: {new Date(application.applied_date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {application.status.toUpperCase()}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal - Full Profile View */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
                <button 
                  onClick={handleCloseStudentDetails}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-8">
                {/* Student Header with Profile Picture Area */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#8B1538] to-[#6B1127] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold">
                        {selectedStudent.student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.student.name}</h3>
                      <p className="text-lg text-gray-600 mb-2">{selectedStudent.student.roll_number}</p>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          Year {selectedStudent.student.year}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {selectedStudent.student.department?.name}
                        </span>
                        {selectedStudent.status === 'accepted' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            ✓ Accepted Student
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Academic Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Student ID</label>
                        <p className="text-base text-gray-900">{selectedStudent.student.roll_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Year</label>
                        <p className="text-base text-gray-900">Year {selectedStudent.student.year}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="text-base text-gray-900">{selectedStudent.student.department?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department Code</label>
                        <p className="text-base text-gray-900">{selectedStudent.student.department?.code}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <p className="text-base text-blue-600">{selectedStudent.student.user?.email}</p>
                      </div>
                      {selectedStudent.student.bio && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bio</label>
                          <p className="text-base text-gray-900">{selectedStudent.student.bio}</p>
                        </div>
                      )}
                      {selectedStudent.student.resume_url && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Resume</label>
                          <a 
                            href={selectedStudent.student.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Resume →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Areas of Interest */}
                {selectedStudent.student.area_of_interest && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Areas of Interest & Skills
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedStudent.student.area_of_interest.split(',').map((interest, index) => (
                        <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Information */}
                <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Application Information
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Application Status</label>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedStudent.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        selectedStudent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedStudent.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedStudent.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applied Date</label>
                      <p className="text-base text-gray-900 mt-1">{new Date(selectedStudent.applied_date).toLocaleDateString()}</p>
                    </div>
                    {selectedStudent.response_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Response Date</label>
                        <p className="text-base text-gray-900 mt-1">{new Date(selectedStudent.response_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedStudent.application_message && (
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-500 block mb-2">Application Message</label>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-900 leading-relaxed">{selectedStudent.application_message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Only show for pending applications */}
                {selectedStudent.status === 'pending' && (
                  <div className="bg-white border-t border-gray-200 p-6">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleAcceptApplication(selectedStudent.id)}
                        className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Accept Application
                      </button>
                      <button 
                        onClick={() => handleRejectApplication(selectedStudent.id)}
                        className="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Reject Application
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                        Send Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Modal */}
      {showRequestsModal && selectedProjectForRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Applications for: {selectedProjectForRequests.topic}
                </h2>
                <button 
                  onClick={() => setShowRequestsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingApplications ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No applications yet for this project.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{application.student.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {application.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {application.student.roll_number} • Year {application.student.year} • {application.student.department.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">{application.student.user.email}</p>
                          {application.application_message && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Application Message:</p>
                              <p className="text-sm text-gray-700">{application.application_message}</p>
                            </div>
                          )}
                          {application.student.area_of_interest && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Areas of Interest:</p>
                              <p className="text-sm text-gray-700">{application.student.area_of_interest}</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">Applied: {new Date(application.applied_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                          <button 
                            onClick={() => handleAcceptApplication(application.id)}
                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRejectApplication(application.id)}
                            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => setSelectedStudent(application)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accepted Students Modal */}
      {showAcceptedStudentsModal && selectedProjectForAccepted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Accepted Students: {selectedProjectForAccepted.topic}
                </h2>
                <button 
                  onClick={() => setShowAcceptedStudentsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingApplications ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading accepted students...</p>
                </div>
              ) : acceptedStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No students accepted yet for this project.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {acceptedStudents.map((application) => (
                    <div 
                      key={application.id} 
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedStudent(application)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{application.student.name}</h3>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ACCEPTED
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {application.student.roll_number} • Year {application.student.year} • {application.student.department.name}
                          </p>
                          <p className="text-sm text-blue-600 mb-2">{application.student.user.email}</p>
                          {application.student.phone_number && (
                            <p className="text-sm text-gray-600 mb-2">📞 {application.student.phone_number}</p>
                          )}
                          {application.student.area_of_interest && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Areas of Interest:</p>
                              <p className="text-sm text-gray-700">{application.student.area_of_interest}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Accepted: {application.response_date ? new Date(application.response_date).toLocaleDateString() : 'N/A'}</span>
                            <span>Applied: {new Date(application.applied_date).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-3">
                  <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileSource('accepted');
                    setShowAcceptedStudentsModal(false);
                    setSelectedStudent(application);
                  }}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  Click to view full profile →
                </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}