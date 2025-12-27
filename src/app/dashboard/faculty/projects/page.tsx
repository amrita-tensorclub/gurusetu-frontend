"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Users, Calendar, Edit2, Trash2, Eye, RefreshCw, X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyDashboardService, FacultyProject, ProjectStats, Applicant } from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<ProjectStats>({
    active_projects: 0,
    total_applicants: 0,
    interviews_set: 0
  });

  const [projects, setProjects] = useState<FacultyProject[]>([]);
  
  // State for Applicants Modal
  const [selectedProject, setSelectedProject] = useState<FacultyProject | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await facultyDashboardService.getMyProjects();
      setStats(data.stats);
      setProjects(data.projects);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicants = async (project: FacultyProject) => {
    setSelectedProject(project);
    setLoadingApplicants(true);
    try {
      const data = await facultyDashboardService.getProjectApplicants(project.id);
      setApplicants(data);
    } catch (error) {
      toast.error("Failed to load applicants");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this project?")) {
        setProjects(projects.filter(p => p.id !== id));
        toast.success("Project deleted");
        // await facultyDashboardService.deleteOpening(id); 
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- HEADER (FIXED: Removed Plus Button) --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-lg font-black tracking-tight">My Openings</h1>
           </div>
           
           {/* Plus Button Removed Here */}
           <div className="w-6"></div> {/* Spacer to keep title centered if needed, or remove */}
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-[#F2F2F2]">
           
           {/* 1. STATS ROW */}
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
           </div>

           {/* 2. PROJECT LIST HEADER */}
           <div className="px-6 flex justify-between items-end mb-2">
              <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest">Project List</h2>
              <button onClick={loadProjects} className="text-gray-400 hover:text-[#8C1515]">
                 <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
           </div>

           {/* 3. PROJECT CARDS */}
           <div className="px-4 space-y-3">
              {projects.length === 0 && !loading && (
                  <div className="text-center mt-10 p-5 bg-white rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-400 text-xs font-bold">No active projects found.</p>
                      <button onClick={() => router.push('/dashboard/faculty/profile/research')} className="text-[#8C1515] text-xs font-black mt-2 underline">Post One Now</button>
                  </div>
              )}
              
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
                   
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

                   {/* Action Buttons */}
                   <div className="flex gap-2 border-t border-gray-50 pt-3">
                      <button 
                        onClick={() => handleViewApplicants(proj)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#F9F9F9] text-gray-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-gray-100"
                      >
                         <Eye size={14} /> View Applicants
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

        {/* --- APPLICANTS MODAL OVERLAY --- */}
        {selectedProject && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-end animate-in fade-in duration-200">
            <div className="bg-white w-full h-[85%] rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Applicants for</p>
                   <h3 className="text-lg font-black text-[#8C1515] leading-tight mt-1 line-clamp-2">{selectedProject.title}</h3>
                 </div>
                 <button onClick={() => setSelectedProject(null)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                 {loadingApplicants ? (
                    <p className="text-center text-xs text-gray-400 mt-10">Loading applicants...</p>
                 ) : applicants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                       <Users size={32} className="mb-2 opacity-20" />
                       <p className="text-xs font-bold">No applicants yet.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {applicants.map((student) => (
                          <div 
                            key={student.student_id} 
                            onClick={() => router.push(`/dashboard/faculty/student-profile/${student.student_id}`)}
                            className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-[#8C1515] cursor-pointer group"
                          >
                             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {student.profile_picture ? (
                                   <img src={student.profile_picture} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center text-xs font-black text-gray-400">
                                      {student.name.charAt(0)}
                                   </div>
                                )}
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-800 truncate">{student.name}</h4>
                                <p className="text-[10px] text-gray-500 truncate">{student.roll_no} • {student.department}</p>
                             </div>

                             <ChevronRight size={16} className="text-gray-300 group-hover:text-[#8C1515]" />
                          </div>
                       ))}
                    </div>
                 )}
              </div>

            </div>
          </div>
        )}

        {/* Floating Add Button */}
        <div className="absolute bottom-6 right-6 z-10">
           <button 
             onClick={() => router.push('/dashboard/faculty/profile/research')}
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