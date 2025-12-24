'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // ✅ New API Bridge
import { useAuth } from '@/hooks/useAuth'; // ✅ Auth Hook

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
  'Machine Learning', 'Artificial Intelligence', 'Data Science', 'Web Development',
  'Mobile Development', 'IoT', 'Blockchain', 'Cybersecurity', 'Cloud Computing',
  'DevOps', 'Computer Vision', 'Natural Language Processing', 'Robotics',
  'Game Development', 'UI/UX Design', 'Database Management', 'Network Security',
  'Software Engineering', 'System Design', 'React', 'Python', 'JavaScript',
  'Java', 'C++', 'Node.js', 'Flutter', 'React Native', 'TensorFlow', 'PyTorch'
];

export default function StudentExperienceInterests() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('student');
  
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
  });

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        // 1. Get Profile (Interests)
        const dashboardData = await api.dashboard.student((user as any).id);
        if (dashboardData && dashboardData.student) {
          const s = dashboardData.student;
          setStudentData(s);
          
          if (s.area_of_interest) {
            setInterests(s.area_of_interest.split(',').map((i: string) => i.trim()).filter((i:string) => i));
          }
          
          // 2. Get Projects
          // We assume 'getMyProjects' returns both personal and accepted. Here we just want personal.
          const projectData = await api.student.getMyProjects(s.id);
          if (projectData && projectData.personal) {
            setProjects(projectData.personal);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) loadData();
  }, [user, authLoading]);

  // --- Handlers ---

  const addInterest = (interest: string) => {
    const normalized = interest.trim();
    if (interests.length < 10 && !interests.includes(normalized) && normalized) {
      setInterests([...interests, normalized]);
      setSearchQuery('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const saveInterests = async () => {
    if (!studentData) return;
    setIsSaving(true);
    
    // Reuse profile update API
    const result = await api.student.updateProfile(studentData.id, {
        area_of_interest: interests.join(', ')
    });

    if (result.error) {
      alert('Error saving interests: ' + result.error);
    } else {
      alert('Interests saved successfully!');
    }
    setIsSaving(false);
  };

  // Project Management (Using generic 'addWork' style logic or separate endpoint)
  // Since we didn't add a specific "addStudentProject" to API yet, let's assume we implement one 
  // or use a generic creation endpoint. For now, I'll simulate it or you can add `addProject` to api.ts
  
  // NOTE: You might need to add `addProject` to src/lib/api.ts under student section if not there.
  // Assuming it exists or we add it now:
  
  /* Add this to src/lib/api.ts -> student:
     addProject: async (studentId: string, projectData: any) => { ... }
     deleteProject: async (projectId: string) => { ... }
  */

  // Implementing using fetch directly for now if missing in API bridge, 
  // or better, assuming we add it. I will use a direct fetch pattern here consistent with API bridge
  // to save you editing api.ts again immediately, but ideally update api.ts.

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) return;

    const payload = {
        studentId: studentData.id,
        ...projectForm,
        id: editingProject?.id // Include ID if editing
    };

    try {
        const url = editingProject ? '/api/student/projects/update' : '/api/student/projects/create';
        // Note: You need to ensure these backend routes exist or use a generic one
        // For migration speed, let's assume a generic '/api/student/projects/manage' route
        
        const res = await fetch('/api/student/projects/manage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ ...payload, action: editingProject ? 'update' : 'create' })
        });
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        alert(editingProject ? 'Project updated!' : 'Project added!');
        resetProjectForm();
        
        // Refresh List
        const freshData = await api.student.getMyProjects(studentData.id);
        if(freshData.personal) setProjects(freshData.personal);

    } catch (error: any) {
        alert('Failed to save project: ' + error.message);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch('/api/student/projects/manage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: projectId, action: 'delete' })
        });
        const freshData = await api.student.getMyProjects(studentData?.id || '');
        if(freshData.personal) setProjects(freshData.personal);
    } catch (e) {
        alert('Failed to delete');
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
    });
    setShowAddProject(true);
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '', description: '', tech_stack: '', project_url: '', github_url: '', year: new Date().getFullYear(),
    });
    setEditingProject(null);
    setShowAddProject(false);
  };

  const filteredInterests = PREDEFINED_INTERESTS.filter(interest =>
    interest.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !interests.includes(interest) // Simple check, might need normalization
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/20 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl font-bold">Experience & Interests</h1>
          </div>
          <button onClick={() => router.push('/dashboard/student/profile')} className="hover:bg-white/20 p-1 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
        
        {/* 1. Areas of Interest */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Areas of Interest</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.map((interest, index) => (
              <div key={index} className="flex items-center bg-[#8B1538]/10 border border-[#8B1538]/20 rounded-full px-4 py-2">
                <span className="text-[#8B1538] text-sm font-medium">
                  {interest}
                </span>
                <button onClick={() => removeInterest(interest)} className="ml-2 w-5 h-5 flex items-center justify-center hover:bg-[#8B1538]/20 rounded-full text-[#8B1538]">×</button>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-500 mb-4">{interests.length}/10 Interests selected</div>

          {/* Search Box */}
          <div className="relative">
            <input 
                type="text" 
                placeholder="Search or add custom interest..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) addInterest(searchQuery);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] outline-none"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          {/* Suggestions */}
          {searchQuery && (
             <div className="mt-2 border rounded-lg bg-white shadow-lg absolute z-10 w-full max-w-md">
                {filteredInterests.slice(0, 5).map(i => (
                    <button key={i} onClick={() => addInterest(i)} className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-0">{i}</button>
                ))}
                {searchQuery && !filteredInterests.includes(searchQuery) && (
                    <button onClick={() => addInterest(searchQuery)} className="w-full text-left px-4 py-2 text-[#8B1538] font-bold hover:bg-gray-50">Add "{searchQuery}"</button>
                )}
             </div>
          )}

          <button onClick={saveInterests} disabled={isSaving} className="mt-4 w-full bg-[#8B1538] text-white py-3 rounded-lg font-medium hover:bg-[#7A1230] transition-colors disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Interests'}
          </button>
        </div>

        {/* 2. Previous Projects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-900">Previous Projects</h2>
             <button onClick={() => setShowAddProject(true)} className="text-[#8B1538] text-sm font-bold hover:underline">+ Add New</button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              No personal projects added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{project.year}</p>
                        <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {project.tech_stack?.split(',').map((t, i) => (
                                <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{t.trim()}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => editProject(project)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => deleteProject(project.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <input required placeholder="Project Title" className="w-full border rounded p-2" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    <textarea required placeholder="Description" className="w-full border rounded p-2" rows={3} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                    <input required placeholder="Tech Stack (comma separated)" className="w-full border rounded p-2" value={projectForm.tech_stack} onChange={e => setProjectForm({...projectForm, tech_stack: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Year" className="border rounded p-2" value={projectForm.year} onChange={e => setProjectForm({...projectForm, year: parseInt(e.target.value)})} />
                        <input type="url" placeholder="GitHub URL" className="border rounded p-2" value={projectForm.github_url} onChange={e => setProjectForm({...projectForm, github_url: e.target.value})} />
                    </div>
                    <input type="url" placeholder="Live Demo URL (Optional)" className="w-full border rounded p-2" value={projectForm.project_url} onChange={e => setProjectForm({...projectForm, project_url: e.target.value})} />
                    
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={resetProjectForm} className="flex-1 border py-2 rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="flex-1 bg-[#8B1538] text-white py-2 rounded hover:bg-[#7A1230]">{editingProject ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}