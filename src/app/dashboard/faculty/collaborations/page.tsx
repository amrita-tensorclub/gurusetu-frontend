"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Filter, Search, Bookmark, RefreshCw, X, MapPin, Mail, Calendar, Plus, BookOpen, Target, Clock, Users, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyDashboardService, CollabProject, FacultyProfile } from '@/services/facultyDashboardService';
import { notificationService } from '@/services/notificationService';
import toast, { Toaster } from 'react-hot-toast';

export default function CollaborationHub() {
  const router = useRouter();
  const [projects, setProjects] = useState<CollabProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState('');

  // --- State for Faculty Profile Modal ---
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<FacultyProfile | null>(null);

  // --- State for Create Opening Modal ---
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // ADDED: collaboration_type
  const [newOpening, setNewOpening] = useState({
    title: '',
    description: '',
    required_skills: '',
    expected_duration: '',
    deadline: '',
    collaboration_type: 'Joint Research' // Default value
  });

  useEffect(() => {
    loadProjects();
  }, [search]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await facultyDashboardService.getCollaborations(search);
      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const openProfile = async (id: string) => {
    setSelectedFacultyId(id);
    setProfileData(null);
    try {
      const data = await facultyDashboardService.getFacultyProfile(id);
      setProfileData(data);
    } catch (err) {
      toast.error("Failed to load profile");
      setSelectedFacultyId(null);
    }
  };

  const handleInterest = async (projectId: string) => {
    try {
      const res = await notificationService.expressInterest(projectId);
      toast.success(res.message);
    } catch (error) {
      toast.error("Failed to express interest");
    }
  };

// --- Handle Create Opening ---
  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
        const payload = {
            title: newOpening.title,
            description: newOpening.description,
            required_skills: newOpening.required_skills.split(',').map(s => s.trim()).filter(s => s),
            expected_duration: newOpening.expected_duration,
            deadline: newOpening.deadline,
            
            // ✅ CORRECT: Send this as a top-level field
            collaboration_type: newOpening.collaboration_type, 
            
            // ✅ Leave these empty for collaborations
            target_years: [], 
            min_cgpa: 0
        };

        await facultyDashboardService.postOpening(payload);
        toast.success("Collaboration Posted Successfully!");
        setCreateModalOpen(false);
        
        // Reset Form
        setNewOpening({ 
            title: '', 
            description: '', 
            required_skills: '', 
            expected_duration: '', 
            deadline: '', 
            collaboration_type: 'Joint Research' 
        });
        loadProjects(); 
    } catch (err: any) {
        toast.error("Failed to post collaboration");
        console.error(err);
    } finally {
        setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans relative">
      <Toaster position="top-center" />

        {/* --- HEADER (Sticky) --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0">
           <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-black tracking-tight flex-1 text-center mr-6">Collaboration Hub</h1>
              <button><Filter size={24} onClick={() => setIsFilterOpen(true)} /></button>
           </div>

           <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-xl flex items-center px-3 py-2.5 shadow-inner">
                 <Search size={16} className="text-gray-400 mr-2" />
                 <input 
                   placeholder="Search projects or faculty..." 
                   className="w-full text-xs font-bold text-gray-700 outline-none"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* --- CONTENT LIST --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide">
           
           <div className="flex justify-center py-2 text-[#8C1515]">
              <div className="bg-white p-2 rounded-full shadow-md cursor-pointer hover:rotate-180 transition-transform" onClick={loadProjects}>
                 <RefreshCw size={20} />
              </div>
           </div>

           {loading && <p className="text-center text-xs text-gray-400">Loading Hub...</p>}

           {projects.map((proj, idx) => (
             <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                
                <div 
                  onClick={() => openProfile(proj.faculty_id)} 
                  className="flex items-center gap-2 mb-3 cursor-pointer group"
                >
                   <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden group-hover:ring-2 ring-[#8C1515] transition-all">
                      <img src={proj.faculty_pic || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                   </div>
                   <p className="text-xs font-bold text-gray-800 group-hover:text-[#8C1515] transition-colors">
                      {proj.faculty_name}, <span className="text-gray-500">{proj.department}</span>
                   </p>
                </div>

                <h3 className="text-[#8C1515] font-black text-base leading-tight mb-2">
                  {proj.title}
                </h3>
                
                <div className="flex gap-1.5 mb-3 flex-wrap">
                   {(proj.tags || []).map(tag => (
                      <span key={tag} className="bg-[#FFF0F0] text-[#8C1515] px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">
                        {tag}
                      </span>
                   ))}
                </div>

                <p className="text-gray-600 text-[11px] font-medium leading-relaxed mb-4">
                   {proj.description}
                </p>

                <div className="flex items-center justify-between mt-2">
                   <span className="bg-[#FFF9E6] text-[#D4AF37] border border-[#D4AF37] px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide">
                      {proj.collaboration_type}
                   </span>
                   <Bookmark size={20} className="text-gray-300" />
                </div>

               <button 
               onClick={() => handleInterest(proj.project_id)} // <--- MUST be project_id
               className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform mt-4"
               >
               Express Interest
               </button>
             </div>
           ))}
           
           <div className="h-10"></div>
        </div>

        {/* --- FLOATING ACTION BUTTON (FAB) --- */}
        <button 
            onClick={() => setCreateModalOpen(true)}
            className="fixed bottom-6 right-6 bg-[#8C1515] text-white p-4 rounded-full shadow-2xl hover:bg-[#6b1010] active:scale-95 transition-all z-40 border-2 border-white"
        >
            <Plus size={28} strokeWidth={3} />
        </button>

        {/* --- POST COLLABORATION MODAL --- */}
        {isCreateModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full h-[85%] sm:h-auto sm:max-h-[85vh] sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
                    
                    {/* Header */}
                    <div className="bg-[#8C1515] p-6 rounded-t-[2rem] sm:rounded-t-3xl flex justify-between items-center shrink-0">
                        <h2 className="text-white text-xl font-black">Post Collaboration</h2>
                        <button onClick={() => setCreateModalOpen(false)} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30"><X size={20} /></button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <form id="create-opening-form" onSubmit={handleCreateOpening} className="space-y-6">
                            
                            {/* Project Title */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <BookOpen size={14}/> Research Title
                                </label>
                                <input 
                                    required 
                                    value={newOpening.title}
                                    onChange={(e) => setNewOpening({...newOpening, title: e.target.value})}
                                    placeholder="e.g. AI for Healthcare" 
                                    className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold text-gray-800 placeholder-gray-400 focus:border-[#8C1515] outline-none bg-transparent transition-colors"
                                />
                            </div>

                            {/* Collaboration Type (NEW) */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <Users size={14}/> Collaboration Type
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {['Seeking Co-PI', 'Joint Research', 'Mentorship', 'Grant Proposal'].map(type => (
                                        <button 
                                            key={type} 
                                            type="button"
                                            onClick={() => setNewOpening({...newOpening, collaboration_type: type})}
                                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                                                newOpening.collaboration_type === type 
                                                ? 'bg-[#8C1515] text-white border-[#8C1515] shadow-md transform scale-105' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <Target size={14}/> Scope of Work
                                </label>
                                <textarea 
                                    required 
                                    rows={4}
                                    value={newOpening.description}
                                    onChange={(e) => setNewOpening({...newOpening, description: e.target.value})}
                                    placeholder="Describe the research goals and role of the collaborator..." 
                                    className="w-full bg-gray-50 rounded-xl p-4 text-sm font-medium text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#8C1515]/20 outline-none resize-none"
                                />
                            </div>

                            {/* Row: Deadline & Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Calendar size={14}/> Valid Until
                                    </label>
                                    <div className="bg-gray-50 rounded-xl px-3 py-3 flex items-center">
                                        <input 
                                            required 
                                            type="date"
                                            value={newOpening.deadline}
                                            onChange={(e) => setNewOpening({...newOpening, deadline: e.target.value})}
                                            className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Clock size={14}/> Est. Duration
                                    </label>
                                    <div className="bg-gray-50 rounded-xl px-3 py-3">
                                        <input 
                                            value={newOpening.expected_duration}
                                            onChange={(e) => setNewOpening({...newOpening, expected_duration: e.target.value})}
                                            placeholder="e.g. 6 Months" 
                                            className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Expertise Required */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <Briefcase size={14}/> Expertise Required (Comma separated)
                                </label>
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <input 
                                        value={newOpening.required_skills}
                                        onChange={(e) => setNewOpening({...newOpening, required_skills: e.target.value})}
                                        placeholder="IoT, Embedded Systems, Machine Learning..." 
                                        className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none placeholder-gray-400"
                                    />
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-[2rem] sm:rounded-b-3xl">
                        <button 
                            type="submit" 
                            form="create-opening-form"
                            disabled={creating}
                            className="w-full bg-[#8C1515] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
                        >
                            {creating ? 'Publishing...' : 'Publish Collaboration'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- FILTER BOTTOM SHEET --- */}
        {isFilterOpen && (
           <div className="fixed inset-0 bg-black/60 z-40 flex items-end">
              <div className="bg-white w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-gray-800">Filter Hub</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Department</label>
                       <div className="flex gap-4">
                          {['CSE', 'ECE', 'ME', 'Civil'].map(d => (
                             <label key={d} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                <input type="checkbox" className="accent-[#8C1515] w-4 h-4" /> {d}
                             </label>
                          ))}
                       </div>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsFilterOpen(false)}
                   className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase mt-8 shadow-lg"
                 >
                   Apply Filters
                 </button>
              </div>
           </div>
        )}

        {/* --- FACULTY PROFILE POPUP --- */}
        {selectedFacultyId && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="relative h-40 bg-[#F9F9F9] flex justify-center items-end pb-0 border-b border-gray-100">
                 <button onClick={() => setSelectedFacultyId(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500 hover:bg-gray-100">
                    <X size={20} />
                 </button>
                 <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                    <img src={profileData?.info.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                 </div>
              </div>
              {profileData ? (
                 <div className="px-6 pt-12 pb-10 text-center">
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{profileData.info.name}</h2>
                    <p className="text-xs font-bold text-[#8C1515] mt-1">{profileData.info.designation}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{profileData.info.department}</p>
                    
                    <div className="flex justify-center flex-wrap gap-2 mt-3 mb-5">
                       {[...(profileData.info.phd_details || []), ...(profileData.info.pg_details || []), ...(profileData.info.ug_details || [])].map((q, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold">{q}</span>
                       ))}
                    </div>

                    <div className="space-y-2 mb-6">
                       <div className="border border-red-100 bg-red-50/50 rounded-xl p-3 flex items-center gap-3">
                          <Mail size={16} className="text-[#8C1515]" />
                          <span className="text-xs font-bold text-[#8C1515]">{profileData.info.email}</span>
                       </div>
                       <div className="border border-gray-100 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                          <MapPin size={16} className="text-gray-500" />
                          <div className="text-left">
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Cabin Location</p>
                             <p className="text-xs font-bold text-gray-700">
                               {profileData.info.cabin_block ? `${profileData.info.cabin_block}, Floor ${profileData.info.cabin_floor}, ${profileData.info.cabin_number}` : "Location not updated"}
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Research Interests</h3>
                       <div className="flex flex-wrap gap-2">
                          {profileData.info.interests?.map(int => (
                             <span key={int} className="border border-[#8C1515] text-[#8C1515] px-3 py-1.5 rounded-full text-[10px] font-bold">{int}</span>
                          ))}
                       </div>
                    </div>

                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Current Openings</h3>
                       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {profileData.openings?.length === 0 && <p className="text-xs text-gray-400">No current openings.</p>}
                          {profileData.openings?.map(op => (
                             <div key={op.id} className="min-w-[200px] bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{op.type}</p>
                                <h4 className="font-bold text-sm text-gray-800 leading-tight mb-2">{op.title}</h4>
                                <button className="text-[#8C1515] text-[10px] font-black underline">View Details</button>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="flex gap-3 mt-8">
                       <button className="flex-1 bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform">Navigate to Cabin</button>
                       <button className="flex-1 border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-xl font-black text-xs active:scale-95 transition-transform">Request Meeting</button>
                    </div>
                    <div className="h-10"></div>
                 </div>
              ) : (
                 <div className="flex justify-center items-center h-40">
                    <p className="text-xs font-bold text-gray-400 animate-pulse">Loading Profile...</p>
                 </div>
              )}
          </div>
        )}
    </div>
  );
}