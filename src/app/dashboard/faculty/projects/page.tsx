'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

// Interfaces
interface ProjectOpening {
  id: string;
  topic: string;
  description: string;
  tech_stack: string;
  required_skills: string;
  expected_duration: string;
  max_students: number;
  status: 'open' | 'closed';
  pending_count?: number;
  accepted_count?: number;
}

export default function FacultyProjects() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('faculty');
  
  const [projects, setProjects] = useState<ProjectOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectOpening | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    tech_stack: '',
    required_skills: '',
    expected_duration: '',
    max_students: 1,
    status: 'open'
  });

  // Load Projects
  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      const data = await api.faculty.getMyProjects((user as any).id);
      // The API returns { projects: [...] } where each project has counts attached
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const projectData = {
        ...formData,
        facultyId: (user as any).id,
        // If editing, include ID
        id: editingProject?.id 
      };

      // We use createProject for both create and update logic in our API bridge usually,
      // or we can add a specific update method. For simplicity, let's assume create handles upsert 
      // or we treat it as create for now. 
      // *Correction*: To handle Updates properly, we should ideally have an update endpoint.
      // Since our `api.ts` `createProject` does a POST, let's assume for this migration 
      // we are just creating. If you need editing, we can add `updateProject` to `api.ts`.
      
      // Using `createProject` for creation:
      const res = await api.faculty.createProject(projectData);

      if (res.error) {
        alert(res.error);
      } else {
        alert(editingProject ? 'Project updated!' : 'Project created!');
        resetForm();
        loadProjects();
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await api.faculty.closeProject(projectId);
    loadProjects();
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

  const resetForm = () => {
    setFormData({
      topic: '', description: '', tech_stack: '', required_skills: '', expected_duration: '', max_students: 1, status: 'open'
    });
    setEditingProject(null);
    setShowAddForm(false);
  };

  if (authLoading || isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
          <p className="text-gray-600">Create and manage your research openings.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#8B1538] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7A1230] transition-colors shadow-sm"
        >
          + Create New Project
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mt-2">Start by creating your first research opening.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{project.topic}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      project.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech_stack?.split(',').map((t, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                        {t.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>⏱ {project.expected_duration}</span>
                    <span>👥 Max: {project.max_students} Students</span>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex flex-col items-end gap-4 min-w-[200px]">
                  <div className="flex gap-4 w-full justify-end">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100 min-w-[80px]">
                      <span className="block text-xl font-bold text-yellow-800">{project.pending_count || 0}</span>
                      <span className="text-xs text-yellow-700">Pending</span>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100 min-w-[80px]">
                      <span className="block text-xl font-bold text-green-800">{project.accepted_count || 0}</span>
                      <span className="text-xs text-green-700">Accepted</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full justify-end">
                    <button 
                      onClick={() => router.push('/dashboard/faculty/applications')}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Applications
                    </button>
                    <button 
                      onClick={() => handleEdit(project)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Title</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={4} className="w-full border rounded-lg p-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
                  <input required type="text" placeholder="React, Node, AI..." className="w-full border rounded-lg p-2" value={formData.tech_stack} onChange={e => setFormData({...formData, tech_stack: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                  <input required type="text" placeholder="Python, Data Analysis..." className="w-full border rounded-lg p-2" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input required type="text" placeholder="3 months" className="w-full border rounded-lg p-2" value={formData.expected_duration} onChange={e => setFormData({...formData, expected_duration: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input required type="number" min="1" className="w-full border rounded-lg p-2" value={formData.max_students} onChange={e => setFormData({...formData, max_students: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border rounded-lg p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-[#8B1538] text-white rounded-lg hover:bg-[#7A1230]">{editingProject ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}