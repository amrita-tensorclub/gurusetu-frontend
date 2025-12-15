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
            setProjects(projectsData);
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

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('faculty_project_openings')
        .delete()
        .eq('id', projectId);

      if (error) {
        alert('Error deleting project: ' + error.message);
      } else {
        alert('Project deleted successfully!');
        loadProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('An error occurred while deleting the project');
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

                  <div>
                    <span className="text-xs text-gray-600 font-medium">Required Skills:</span>
                    <p className="text-sm text-gray-900 mt-1">{project.required_skills}</p>
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
    </div>
  );
}