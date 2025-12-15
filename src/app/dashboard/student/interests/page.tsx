'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface StudentData {
  id: string;
  user_id: string;
  name: string;
  roll_number: string;
  area_of_interest: string;
  department: {
    name: string;
    code: string;
  };
}

interface StudentProject {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  project_url: string;
  github_url: string;
  year: number;
}

const PREDEFINED_INTERESTS = [
  'machine learning', 'artificial intelligence', 'data science', 'web development',
  'mobile development', 'iot', 'blockchain', 'cybersecurity', 'cloud computing',
  'devops', 'computer vision', 'natural language processing', 'robotics',
  'game development', 'ui/ux design', 'database management', 'network security',
  'software engineering', 'system design', 'react', 'python', 'javascript',
  'java', 'c++', 'node.js', 'flutter', 'react native', 'tensorflow', 'pytorch'
];

export default function StudentExperienceInterests() {
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState<StudentProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    project_url: '',
    github_url: '',
    year: new Date().getFullYear(),
    duration_from: '',
    duration_to: ''
  });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.id) {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            department:departments(name, code)
          `)
          .eq('user_id', userData.id)
          .single();

        if (data && !error) {
          setStudentData(data);
          // Parse interests from comma-separated string (normalize to lowercase)
          if (data.area_of_interest) {
            const normalizedInterests = data.area_of_interest.split(',').map((interest: string) => interest.trim().toLowerCase());
            setInterests(normalizedInterests);
          }
          loadStudentProjects(data.id);
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentProjects = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_projects')
        .select('*')
        .eq('student_id', studentId)
        .order('year', { ascending: false });

      if (data && !error) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const addInterest = (interest: string) => {
    if (interests.length < 10 && !interests.includes(interest) && interest.trim()) {
      // Normalize to lowercase for consistent matching
      const normalizedInterest = interest.trim().toLowerCase();
      setInterests([...interests, normalizedInterest]);
      setSearchQuery('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const saveInterests = async () => {
    if (!studentData) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({ area_of_interest: interests.join(', ') })
        .eq('id', studentData.id);

      if (error) {
        alert('Error saving interests: ' + error.message);
      } else {
        alert('Interests saved successfully!');
      }
    } catch (error) {
      console.error('Error saving interests:', error);
      alert('Failed to save interests');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) return;

    try {
      const projectData = {
        student_id: studentData.id,
        title: projectForm.title,
        description: projectForm.description,
        tech_stack: projectForm.tech_stack.toLowerCase(), // Normalize to lowercase
        project_url: projectForm.project_url || null,
        github_url: projectForm.github_url || null,
        year: projectForm.year
      };

      let result;
      if (editingProject) {
        result = await supabase
          .from('student_projects')
          .update(projectData)
          .eq('id', editingProject.id);
      } else {
        result = await supabase
          .from('student_projects')
          .insert(projectData);
      }

      if (result.error) {
        alert('Error saving project: ' + result.error.message);
      } else {
        alert(editingProject ? 'Project updated!' : 'Project added!');
        resetProjectForm();
        loadStudentProjects(studentData.id);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const editProject = (project: StudentProject) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack,
      project_url: project.project_url || '',
      github_url: project.github_url || '',
      year: project.year,
      duration_from: '',
      duration_to: ''
    });
    setShowAddProject(true);
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('student_projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        alert('Error deleting project: ' + error.message);
      } else {
        alert('Project deleted!');
        if (studentData) {
          loadStudentProjects(studentData.id);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      tech_stack: '',
      project_url: '',
      github_url: '',
      year: new Date().getFullYear(),
      duration_from: '',
      duration_to: ''
    });
    setEditingProject(null);
    setShowAddProject(false);
  };

  const filteredInterests = PREDEFINED_INTERESTS.filter(interest =>
    interest.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !interests.includes(interest.toLowerCase())
  );

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
            <button onClick={() => router.back()} className="p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Experience & Interests</h1>
          </div>
          <button onClick={() => router.push('/dashboard/student/profile')}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Areas of Interest */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Areas of Interest</h2>
          
          {/* Interest Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.map((interest, index) => (
              <div key={index} className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2">
                <span className="text-gray-900 text-sm">
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="ml-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600 mb-4">{interests.length}/10</div>

          {/* Add Interest Button */}
          <button
            onClick={() => setSearchQuery(searchQuery === '' ? 'search' : '')}
            className="w-full bg-[#8B1538] text-white py-3 rounded-lg font-medium hover:bg-[#7A1230] transition-colors flex items-center justify-center  text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Interest
          </button>

          {/* Search Box */}
          <div className="mt-4">
            <div className="relative">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2  text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                // placeholder="Search or add new..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() && !PREDEFINED_INTERESTS.includes(searchQuery.trim())) {
                    addInterest(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none  text-black"
              />
            </div>

            {/* Suggested Interests */}
            {searchQuery && (
              <div className="mt-2 space-y-1">
                {filteredInterests.slice(0, 3).map((interest) => (
                  <button
                    key={interest}
                    onClick={() => addInterest(interest)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </button>
                ))}
                {searchQuery.trim() && !PREDEFINED_INTERESTS.includes(searchQuery.trim()) && interests.length < 10 && (
                  <button
                    onClick={() => addInterest(searchQuery)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-[#8B1538] font-medium"
                  >
                    Add "{searchQuery}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Previous Projects */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Previous Projects</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 13h-2V7h2m0 10h-2v-2h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"/>
                </svg>
              </div>
              <p className="text-gray-600 mb-4">No projects added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{project.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editProject(project)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">Duration:</p>
                    <p className="text-sm text-gray-900">Year {project.year}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 font-medium mb-2">Brief Description (200 chars)</p>
                    <p className="text-sm text-gray-700">{project.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tech_stack.split(',').map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tech.trim().charAt(0).toUpperCase() + tech.trim().slice(1)}
                      </span>
                    ))}
                  </div>

                  {(project.project_url || project.github_url) && (
                    <div className="flex space-x-2">
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          View Project
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Project Button */}
          <button
            onClick={() => setShowAddProject(true)}
            className="w-full border-2 border-dashed border-[#8B1538] text-[#8B1538] py-4 rounded-xl font-medium hover:bg-[#8B1538] hover:text-white transition-colors mt-4 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Project
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={saveInterests}
          disabled={isSaving}
          className="w-full bg-[#8B1538] text-white py-4 rounded-lg font-semibold hover:bg-[#7A1230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Add/Edit Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button onClick={resetProjectForm} className="p-1 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2  text-black">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none  text-black"
                    placeholder="e.g., Smart Campus IoT System"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2  text-black">Year *</label>
                  <input
                    type="number"
                    required
                    min="2015"
                    max={new Date().getFullYear() + 1}
                    value={projectForm.year}
                    onChange={(e) => setProjectForm({ ...projectForm, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none  text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2  text-black">Description *</label>
                  <textarea
                    required
                    maxLength={200}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none resize-none"
                    placeholder="Brief description (max 200 chars)"
                  />
                  <div className="text-xs text-gray-500 mt-1  text-black">{projectForm.description.length}/200</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2  text-black">Tech Stack *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.tech_stack}
                    onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none"
                    placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2  text-black">Project URL</label>
                  <input
                    type="url"
                    value={projectForm.project_url}
                    onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none  text-black"
                    placeholder="https://yourproject.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2  text-black">GitHub URL</label>
                  <input
                    type="url"
                    value={projectForm.github_url}
                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetProjectForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#8B1538] text-white rounded-lg font-medium hover:bg-[#7A1230] transition-colors"
                  >
                    {editingProject ? 'Update' : 'Add Project'}
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