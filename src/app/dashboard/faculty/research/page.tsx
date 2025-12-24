'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function FacultyResearchExperience() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('faculty');
  
  const [interests, setInterests] = useState<string[]>([]);
  const [openings, setOpenings] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [showAddOpening, setShowAddOpening] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  
  // Types
  const [openingType, setOpeningType] = useState<'project' | 'research'>('project');
  const [workType, setWorkType] = useState<'project' | 'paper'>('project');
  
  // Forms
  const [newInterest, setNewInterest] = useState('');
  const [openingForm, setOpeningForm] = useState({
    topic: '', description: '', tech_stack: '', required_skills: '', expected_duration: '', max_students: 1
  });
  const [workForm, setWorkForm] = useState({
    title: '', description: '', tech_stack: '', collaborators: '', year: new Date().getFullYear(), publication_link: '', conference_or_journal: '', project_url: ''
  });

  const predefinedInterests = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Computer Vision',
    'Natural Language Processing', 'Robotics', 'Internet of Things', 'Blockchain',
    'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'Web Development',
    'Software Engineering', 'Database Systems', 'Networks', 'Embedded Systems'
  ];

  // Load Data
  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const data = await api.faculty.getResearchPortfolio((user as any).id);
      
      // Parse interests string to array
      if (data.interests) {
        setInterests(data.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i));
      }
      
      setOpenings(data.openings || []);
      setProjects(data.projects || []);
      setPapers(data.papers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions ---

  const handleUpdateInterests = async (newInterestsList: string[]) => {
    setInterests(newInterestsList);
    // Reuse profile update API for interests string
    await api.faculty.updateProfile((user as any).id, { area_of_interest: newInterestsList.join(', ') });
  };

  const addInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      handleUpdateInterests([...interests, interest]);
    }
  };

  const removeInterest = (interestToRemove: string) => {
    handleUpdateInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleAddOpening = async () => {
    const type = openingType === 'project' ? 'opening_project' : 'opening_research';
    const payload = {
        ...openingForm,
        status: 'open',
        created_at: new Date().toISOString()
    };
    
    await api.faculty.addWork((user as any).id, type as any, payload);
    setShowAddOpening(false);
    loadData();
    // Reset form
    setOpeningForm({ topic: '', description: '', tech_stack: '', required_skills: '', expected_duration: '', max_students: 1 });
  };

  const handleAddWork = async () => {
    let payload: any = {};
    
    if (workType === 'project') {
       payload = {
         title: workForm.title,
         description: workForm.description,
         tech_stack: workForm.tech_stack,
         collaborators: workForm.collaborators,
         year_completed: workForm.year,
         project_url: workForm.project_url
       };
    } else {
       payload = {
         paper_name: workForm.title, // Map title to paper_name
         publication_link: workForm.publication_link,
         conference_or_journal: workForm.conference_or_journal,
         co_authors: workForm.collaborators,
         year_published: workForm.year
       };
    }

    await api.faculty.addWork((user as any).id, workType, payload);
    setShowAddWork(false);
    loadData();
    // Reset form...
    setWorkForm({ title: '', description: '', tech_stack: '', collaborators: '', year: new Date().getFullYear(), publication_link: '', conference_or_journal: '', project_url: '' });
  };

  const handleDelete = async (id: string, type: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
        await api.faculty.deleteItem(id, type);
        loadData();
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      await api.faculty.toggleOpeningStatus(id, newStatus);
      loadData();
  };

  if (authLoading || isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#8B1538] text-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="hover:bg-white/20 p-1 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl font-bold">Research & Experience</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* 1. Domain Interests */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Domain Interests</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.map((interest) => (
              <span key={interest} className="inline-flex items-center px-3 py-1 rounded-full bg-[#8B1538] text-white text-sm">
                {interest}
                <button onClick={() => removeInterest(interest)} className="ml-2 hover:text-gray-200">×</button>
              </span>
            ))}
          </div>
          <button onClick={() => setShowAddInterest(true)} className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-gray-500 hover:border-[#8B1538] hover:text-[#8B1538] transition-colors">
            + Add Domain
          </button>
        </div>

        {/* 2. R&D Openings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current R&D Openings</h3>
          <div className="space-y-4">
            {openings.map((opening) => (
              <div key={opening.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{opening.topic}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{opening.type === 'project' ? 'Project' : 'Research'}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{opening.description}</p>
                        <div className="text-xs text-gray-500 mt-2 flex gap-4">
                            <span>Skills: {opening.required_skills}</span>
                            <span>Max Students: {opening.max_students}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${opening.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {opening.status}
                        </span>
                        <button onClick={() => toggleStatus(opening.id, opening.status)} className="text-blue-600 hover:underline text-xs">Toggle</button>
                        <button onClick={() => handleDelete(opening.id, opening.type)} className="text-red-600 hover:underline text-xs">Delete</button>
                    </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAddOpening(true)} className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-[#8B1538] hover:text-[#8B1538] transition-colors mt-4">
            + Post New Opening
          </button>
        </div>

        {/* 3. Previous Work & Publications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Previous Work & Publications</h3>
          
          <div className="space-y-4">
            {/* Papers */}
            {papers.map(p => (
                <div key={p.id} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between">
                        <h4 className="font-semibold text-gray-900">{p.paper_name}</h4>
                        <button onClick={() => handleDelete(p.id, 'paper')} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                    <p className="text-sm text-gray-600 italic">{p.conference_or_journal} ({p.year_published})</p>
                    <a href={p.publication_link} target="_blank" className="text-xs text-blue-600 hover:underline">View Publication</a>
                </div>
            ))}
            
            {/* Projects */}
            {projects.map(p => (
                <div key={p.id} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between">
                        <h4 className="font-semibold text-gray-900">{p.title}</h4>
                        <button onClick={() => handleDelete(p.id, 'project')} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                    <p className="text-sm text-gray-600">{p.description}</p>
                    <div className="text-xs text-gray-500 mt-1">Tech: {p.tech_stack} | Year: {p.year_completed}</div>
                </div>
            ))}
          </div>

          <button onClick={() => setShowAddWork(true)} className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-[#8B1538] hover:text-[#8B1538] transition-colors mt-4">
            + Add Work / Paper
          </button>
        </div>

      </main>

      {/* --- MODALS --- */}
      
      {/* 1. Add Interest */}
      {showAddInterest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Research Interest</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {predefinedInterests.filter(i => !interests.includes(i)).map(i => (
                    <button key={i} onClick={() => addInterest(i)} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">{i}</button>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 border rounded px-3 py-2" 
                    placeholder="Custom interest..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                />
                <button 
                    onClick={() => { if(newInterest) { addInterest(newInterest); setNewInterest(''); } }}
                    className="bg-[#8B1538] text-white px-4 rounded"
                >Add</button>
            </div>
            <button onClick={() => setShowAddInterest(false)} className="mt-4 text-gray-500 w-full text-center">Close</button>
          </div>
        </div>
      )}

      {/* 2. Add Opening */}
      {showAddOpening && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Post New Opening</h3>
            <div className="space-y-3">
                <div className="flex gap-4">
                    <label className="flex gap-2"><input type="radio" checked={openingType === 'project'} onChange={() => setOpeningType('project')} /> Project</label>
                    <label className="flex gap-2"><input type="radio" checked={openingType === 'research'} onChange={() => setOpeningType('research')} /> Research</label>
                </div>
                <input type="text" placeholder="Topic" className="w-full border rounded p-2" value={openingForm.topic} onChange={e => setOpeningForm({...openingForm, topic: e.target.value})} />
                <textarea placeholder="Description" className="w-full border rounded p-2" value={openingForm.description} onChange={e => setOpeningForm({...openingForm, description: e.target.value})} />
                <input type="text" placeholder="Required Skills" className="w-full border rounded p-2" value={openingForm.required_skills} onChange={e => setOpeningForm({...openingForm, required_skills: e.target.value})} />
                <div className="flex gap-2">
                    <input type="text" placeholder="Duration" className="w-1/2 border rounded p-2" value={openingForm.expected_duration} onChange={e => setOpeningForm({...openingForm, expected_duration: e.target.value})} />
                    <input type="number" placeholder="Max Students" className="w-1/2 border rounded p-2" value={openingForm.max_students} onChange={e => setOpeningForm({...openingForm, max_students: parseInt(e.target.value)})} />
                </div>
                <button onClick={handleAddOpening} className="w-full bg-[#8B1538] text-white py-2 rounded">Post</button>
                <button onClick={() => setShowAddOpening(false)} className="w-full border py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Work */}
      {showAddWork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Previous Work</h3>
            <div className="space-y-3">
                <div className="flex gap-4">
                    <label className="flex gap-2"><input type="radio" checked={workType === 'project'} onChange={() => setWorkType('project')} /> Project</label>
                    <label className="flex gap-2"><input type="radio" checked={workType === 'paper'} onChange={() => setWorkType('paper')} /> Paper</label>
                </div>
                <input type="text" placeholder="Title / Paper Name" className="w-full border rounded p-2" value={workForm.title} onChange={e => setWorkForm({...workForm, title: e.target.value})} />
                
                {workType === 'project' ? (
                    <>
                        <textarea placeholder="Description" className="w-full border rounded p-2" value={workForm.description} onChange={e => setWorkForm({...workForm, description: e.target.value})} />
                        <input type="text" placeholder="Tech Stack" className="w-full border rounded p-2" value={workForm.tech_stack} onChange={e => setWorkForm({...workForm, tech_stack: e.target.value})} />
                        <input type="url" placeholder="Project URL" className="w-full border rounded p-2" value={workForm.project_url} onChange={e => setWorkForm({...workForm, project_url: e.target.value})} />
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Conference / Journal" className="w-full border rounded p-2" value={workForm.conference_or_journal} onChange={e => setWorkForm({...workForm, conference_or_journal: e.target.value})} />
                        <input type="url" placeholder="Publication Link" className="w-full border rounded p-2" value={workForm.publication_link} onChange={e => setWorkForm({...workForm, publication_link: e.target.value})} />
                    </>
                )}
                
                <input type="text" placeholder="Collaborators / Co-authors" className="w-full border rounded p-2" value={workForm.collaborators} onChange={e => setWorkForm({...workForm, collaborators: e.target.value})} />
                <input type="number" placeholder="Year" className="w-full border rounded p-2" value={workForm.year} onChange={e => setWorkForm({...workForm, year: parseInt(e.target.value)})} />
                
                <button onClick={handleAddWork} className="w-full bg-[#8B1538] text-white py-2 rounded">Add</button>
                <button onClick={() => setShowAddWork(false)} className="w-full border py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}