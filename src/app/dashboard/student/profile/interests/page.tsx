"use client";

import React, { useState } from 'react';
import { ChevronLeft, X, Plus, Calendar, Trash2, Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { userService, StudentProject } from '@/services/userService';
import toast, { Toaster } from 'react-hot-toast';

export default function ExperienceInterests() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- STATE: INTERESTS ---
  const [interests, setInterests] = useState<string[]>(['Machine Learning', 'IoT']);
  const [newInterest, setNewInterest] = useState('');

  // --- STATE: PROJECTS ---
  const [projects, setProjects] = useState<StudentProject[]>([]);
  
  // --- STATE: PROJECT MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<StudentProject>({
    title: '',
    from_date: '',
    to_date: '',
    description: '',
    tools: []
  });
  const [newTool, setNewTool] = useState('');

  // --- HANDLERS: INTERESTS ---
  const addInterest = () => {
    if (newInterest && !interests.includes(newInterest) && interests.length < 10) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };
  const removeInterest = (tag: string) => {
    setInterests(interests.filter(i => i !== tag));
  };

  // --- HANDLERS: PROJECTS ---
  const handleAddTool = () => {
    if (newTool && !currentProject.tools.includes(newTool)) {
      setCurrentProject({ ...currentProject, tools: [...currentProject.tools, newTool] });
      setNewTool('');
    }
  };

  const removeTool = (tool: string) => {
    setCurrentProject({
      ...currentProject,
      tools: currentProject.tools.filter(t => t !== tool)
    });
  };

  const saveLocalProject = () => {
    if (!currentProject.title || !currentProject.description) {
      toast.error("Title and Description are required");
      return;
    }
    setProjects([...projects, currentProject]);
    setIsModalOpen(false); // Close Modal
    // Reset Form
    setCurrentProject({ title: '', from_date: '', to_date: '', description: '', tools: [] });
  };

  const removeProject = (index: number) => {
    const updated = [...projects];
    updated.splice(index, 1);
    setProjects(updated);
  };

  // --- FINAL SAVE TO BACKEND ---
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      await userService.updateStudentProfile({
        interests: interests,
        // We accumulate all unique tools from projects into the 'skills' list
        skills: Array.from(new Set(projects.flatMap(p => p.tools))),
        projects: projects // <--- SENDING PROJECTS TO BACKEND
      });

      toast.success('Profile Completed Successfully!');
      setTimeout(() => router.push('/dashboard/student'), 1500);
    } catch (err) {
      toast.error('Failed to save profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- CHANGED: Full screen layout ---
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col relative pb-32">
      <Toaster position="top-center" />

        {/* Header */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-10 shadow-lg flex items-center gap-4 relative z-10 flex-shrink-0 sticky top-0">
            <button onClick={() => router.back()} className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">
            <ChevronLeft size={20} />
            </button>
            <div>
            <h1 className="text-xl font-black tracking-tight leading-none">Experience</h1>
            <p className="text-white/60 text-xs mt-1 font-bold">Step 2 of 2</p>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-6 pt-6 space-y-6">
            
            {/* 1. AREAS OF INTEREST */}
            <div className="bg-white rounded-[2rem] shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[#8C1515] font-black text-xs uppercase tracking-widest">Interests</h2>
                    <span className="text-[10px] font-bold text-gray-400">{interests.length}/10</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    {interests.map(tag => (
                    <span key={tag} className="bg-white border border-[#8C1515] text-[#8C1515] px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeInterest(tag)}><X size={10} strokeWidth={3} /></button>
                    </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add interest..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-[#8C1515]"
                    />
                    <button onClick={addInterest} className="bg-[#8C1515] text-white px-3 rounded-lg">
                    <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* 2. PREVIOUS PROJECTS LIST */}
            <div className="bg-white rounded-[2rem] shadow-sm p-5 border border-gray-100">
                <h2 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-4">Projects</h2>
                
                {projects.length === 0 && (
                    <p className="text-center text-xs text-gray-400 font-medium py-4">No projects added yet.</p>
                )}

                {projects.map((proj, idx) => (
                    <div key={idx} className="bg-[#FFFDFD] border border-gray-100 rounded-xl p-4 mb-3 relative">
                        <button onClick={() => removeProject(idx)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500">
                            <Trash2 size={14} />
                        </button>

                        <h3 className="font-black text-gray-800 text-sm mb-1 pr-6">{proj.title}</h3>
                        
                        <div className="flex items-center gap-2 mb-2">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                            {proj.from_date} - {proj.to_date}
                        </span>
                        </div>

                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mb-3 line-clamp-2">
                        {proj.description}
                        </p>

                        <div className="flex flex-wrap gap-1">
                        {proj.tools.map(t => (
                            <span key={t} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                            {t}
                            </span>
                        ))}
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full border-2 border-dashed border-[#8C1515] text-[#8C1515] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#FFF5F5] transition-colors"
                >
                    <Plus size={16} /> Add New Project
                </button>
            </div>
        </div>

        {/* Footer Button (Fixed Full Width) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
            <button 
            onClick={handleSaveAll}
            disabled={loading}
            className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {loading ? 'Saving...' : 'Save & Finish'}
                {!loading && <Check size={18} />}
            </button>
        </div>

        {/* --- MODAL: ADD PROJECT (Fixed Overlay) --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full h-[85%] sm:h-auto sm:mx-4 sm:rounded-3xl rounded-t-[2.5rem] p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                    
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-gray-800 tracking-tight">Add Project</h2>
                        <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-2 rounded-full">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 pb-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Project Title</label>
                            <input 
                                value={currentProject.title}
                                onChange={(e) => setCurrentProject({...currentProject, title: e.target.value})}
                                placeholder="e.g. Smart Campus IoT"
                                className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold text-gray-800 outline-none focus:border-[#8C1515]"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">From</label>
                                <input 
                                    type="text"
                                    placeholder="Jan 2024"
                                    value={currentProject.from_date}
                                    onChange={(e) => setCurrentProject({...currentProject, from_date: e.target.value})}
                                    className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold text-gray-800 outline-none focus:border-[#8C1515]"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">To</label>
                                <input 
                                    type="text"
                                    placeholder="May 2024"
                                    value={currentProject.to_date}
                                    onChange={(e) => setCurrentProject({...currentProject, to_date: e.target.value})}
                                    className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold text-gray-800 outline-none focus:border-[#8C1515]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                            <textarea 
                                value={currentProject.description}
                                onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                                placeholder="Briefly describe what you built..."
                                rows={3}
                                className="w-full border-2 border-gray-100 rounded-xl p-3 mt-1 text-xs font-medium text-gray-700 outline-none focus:border-[#8C1515] resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Tools & Tech</label>
                            <div className="flex gap-2 mt-1 mb-2">
                                <input 
                                    value={newTool}
                                    onChange={(e) => setNewTool(e.target.value)}
                                    placeholder="Add tool (e.g. Python)"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#8C1515]"
                                />
                                <button onClick={handleAddTool} className="bg-gray-800 text-white px-3 rounded-lg">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {currentProject.tools.map(t => (
                                    <span key={t} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold uppercase flex items-center gap-1">
                                        {t}
                                        <button onClick={() => removeTool(t)}><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={saveLocalProject}
                        className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                    >
                        Add Project
                    </button>
                </div>
            </div>
        )}

    </div>
  );
}