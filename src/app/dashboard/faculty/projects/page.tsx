"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Users, Calendar, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyProjectService, FacultyProject, ProjectStats } from '@/services/facultyProjectService';
import toast, { Toaster } from 'react-hot-toast';

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Mock Data (Replace with API call when backend is ready)
  const [stats, setStats] = useState<ProjectStats>({
    active_projects: 4,
    total_applicants: 28,
    interviews_set: 6
  });

  const [projects, setProjects] = useState<FacultyProject[]>([
    {
      id: '1',
      title: 'AI-Driven Medical Imaging for Early Diagnosis',
      status: 'Active',
      domain: 'AI/ML',
      posted_date: 'Dec 10, 2025',
      applicant_count: 12
    },
    {
      id: '2',
      title: 'NLP for Vernacular Languages',
      status: 'Draft',
      domain: 'NLP',
      posted_date: 'Dec 20, 2025',
      applicant_count: 0
    }
  ]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // UNCOMMENT THIS WHEN BACKEND GET ENDPOINT IS READY
      // const data = await facultyProjectService.getMyProjects();
      // setStats(data.stats);
      // setProjects(data.projects);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this project?")) {
        setProjects(projects.filter(p => p.id !== id));
        toast.success("Project deleted");
        // await facultyProjectService.deleteProject(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-lg font-black tracking-tight">My Projects</h1>
           </div>
           <button 
             onClick={() => router.push('/dashboard/faculty/projects/new')}
             className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
           >
              <Plus size={20} />
           </button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-[#F2F2F2]">
           
           {/* 1. STATS ROW (Horizontal Scroll) */}
           <div className="flex gap-3 overflow-x-auto px-4 py-6 scrollbar-hide">
              {/* Active Card */}
              <div className="min-w-[140px] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-[#8C1515]">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Active</p>
                 <p className="text-3xl font-black text-[#8C1515] mt-1">{stats.active_projects}</p>
                 <p className="text-[9px] text-gray-400 font-bold mt-1">Projects Live</p>
              </div>

              {/* Applicants Card */}
              <div className="min-w-[140px] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-[#D4AF37]">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Applicants</p>
                 <p className="text-3xl font-black text-[#D4AF37] mt-1">{stats.total_applicants}</p>
                 <p className="text-[9px] text-gray-400 font-bold mt-1">Total Students</p>
              </div>

               {/* Interviews Card */}
               <div className="min-w-[140px] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-600">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Interviews</p>
                 <p className="text-3xl font-black text-green-600 mt-1">{stats.interviews_set}</p>
                 <p className="text-[9px] text-gray-400 font-bold mt-1">Scheduled</p>
              </div>
           </div>

           {/* 2. PROJECT LIST HEADER */}
           <div className="px-6 flex justify-between items-end mb-2">
              <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest">Project List</h2>
              <button onClick={loadProjects} className="text-gray-400 hover:text-[#8C1515]">
                 <RefreshCw size={14} />
              </button>
           </div>

           {/* 3. PROJECT CARDS */}
           <div className="px-4 space-y-3">
              {loading && <p className="text-center text-xs text-gray-400 mt-10">Loading Projects...</p>}
              
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group">
                   
                   {/* Status Badges */}
                   <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          proj.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                          {proj.status}
                      </span>
                      <span className="bg-[#FFF0F0] text-[#8C1515] px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                          {proj.domain}
                      </span>
                   </div>

                   {/* Title */}
                   <h3 className="font-black text-gray-800 text-sm leading-tight mb-3 pr-8">
                      {proj.title}
                   </h3>

                   {/* Meta Data */}
                   <div className="flex items-center gap-4 text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5">
                         <Calendar size={12} />
                         <span className="text-[10px] font-bold">{proj.posted_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#D4AF37]">
                         <Users size={12} />
                         <span className="text-[10px] font-bold">{proj.applicant_count} Applicants</span>
                      </div>
                   </div>

                   {/* Action Buttons (Full Width on Mobile) */}
                   <div className="flex gap-2 border-t border-gray-50 pt-3">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-[#F9F9F9] text-gray-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-gray-100">
                         <Eye size={14} /> Applicants
                      </button>
                      <button className="w-10 flex items-center justify-center bg-[#F9F9F9] text-gray-600 rounded-xl hover:text-[#8C1515]">
                         <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(proj.id)}
                        className="w-10 flex items-center justify-center bg-[#FFF0F0] text-[#8C1515] rounded-xl hover:bg-red-100"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>

                </div>
              ))}
           </div>
           
           <div className="h-20"></div>
        </div>

        {/* Floating Add Button (Optional alternative to Header button) */}
        <div className="absolute bottom-6 right-6">
           <button 
             onClick={() => router.push('/dashboard/faculty/projects/new')}
             className="bg-[#8C1515] text-white p-4 rounded-full shadow-xl shadow-red-900/20 active:scale-90 transition-transform flex items-center gap-2 pr-6"
           >
              <Plus size={24} />
              <span className="text-xs font-black uppercase tracking-wider">New Project</span>
           </button>
        </div>

      </div>
    </div>
  );
}