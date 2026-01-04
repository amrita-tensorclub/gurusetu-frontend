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
  
  // --- Filter State ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // --- Modal States ---
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<FacultyProfile | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newOpening, setNewOpening] = useState({
    title: '', description: '', required_skills: '',
    expected_duration: '', deadline: '', collaboration_type: 'Joint Research'
  });

  // --- Load Data ---
  useEffect(() => {
    loadProjects();
  }, [search]); // Auto-reload on search, filters are applied manually via button

  const loadProjects = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Pass the selected filters to the service
      const data = await facultyDashboardService.getCollaborations(search, selectedDept, selectedType);
      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    loadProjects();
    toast.success("Filters applied");
  };

  const clearFilters = () => {
    setSelectedDept('');
    setSelectedType('');
    setIsFilterOpen(false);
    // Reload with empty filters
    facultyDashboardService.getCollaborations(search, '', '').then(setProjects);
    toast.success("Filters cleared");
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
            collaboration_type: newOpening.collaboration_type, 
            target_years: [], 
            min_cgpa: 0
        };

        await facultyDashboardService.postOpening(payload);
        toast.success("Collaboration Posted Successfully!");
        setCreateModalOpen(false);
        setNewOpening({ 
            title: '', description: '', required_skills: '', 
            expected_duration: '', deadline: '', collaboration_type: 'Joint Research' 
        });
        loadProjects(); 
    } catch (err: any) {
        toast.error("Failed to post collaboration");
    } finally {
        setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans relative">
      <Toaster position="top-center" />

        {/* --- HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0">
           <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-black tracking-tight flex-1 text-center mr-6">Collaboration Hub</h1>
              <button 
                onClick={() => setIsFilterOpen(true)}
                className={`p-2 rounded-full transition-colors ${selectedDept || selectedType ? 'bg-white text-[#8C1515]' : 'bg-transparent text-white'}`}
              >
                <Filter size={24} />
              </button>
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
           
           {(selectedDept || selectedType) && (
               <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2">
                   {selectedDept && <span className="bg-[#e3f2fd] text-blue-800 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border border-blue-100">Dept: {selectedDept}</span>}
                   {selectedType && <span className="bg-[#fff3e0] text-orange-800 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border border-orange-100">Type: {selectedType}</span>}
               </div>
           )}

           <div className="flex justify-center py-2 text-[#8C1515]">
              <div className="bg-white p-2 rounded-full shadow-md cursor-pointer hover:rotate-180 transition-transform" onClick={loadProjects}>
                 <RefreshCw size={20} />
              </div>
           </div>

           {loading && <p className="text-center text-xs text-gray-400">Loading Hub...</p>}
           
           {!loading && projects.length === 0 && (
               <div className="text-center mt-10 opacity-50">
                   <p className="text-gray-400 text-sm font-bold">No collaborations found.</p>
                   <p className="text-xs text-gray-400">Try adjusting your filters.</p>
               </div>
           )}

           {projects.map((proj, idx) => (
             <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group hover:border-[#8C1515]/30 transition-colors">
                
                <div 
                  onClick={() => openProfile(proj.faculty_id)} 
                  className="flex items-center gap-3 mb-4 cursor-pointer"
                >
                   <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-gray-100 group-hover:ring-[#8C1515] transition-all">
                      <img src={proj.faculty_pic || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                   </div>
                   <div>
                       <p className="text-sm font-bold text-gray-900 group-hover:text-[#8C1515] transition-colors">{proj.faculty_name}</p>
                       <p className="text-[10px] text-gray-500 font-bold uppercase">{proj.department}</p>
                   </div>
                </div>

                <div className="mb-3">
                    <h3 className="text-[#8C1515] font-black text-lg leading-tight mb-2">
                    {proj.title}
                    </h3>
                    <div className="flex gap-1.5 flex-wrap">
                        {(proj.tags || []).map(tag => (
                            <span key={tag} className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold border border-gray-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="text-gray-600 text-xs font-medium leading-relaxed mb-4 line-clamp-3">
                   {proj.description}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                   <span className="bg-[#FFF9E6] text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide flex items-center gap-1">
                      <Users size={12} /> {proj.collaboration_type}
                   </span>
                   <button 
                    onClick={() => handleInterest(proj.project_id)}
                    className="bg-[#8C1515] text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase shadow-md active:scale-95 transition-transform"
                   >
                    Express Interest
                   </button>
                </div>
             </div>
           ))}
           <div className="h-10"></div>
        </div>

        {/* --- FLOATING ACTION BUTTON --- */}
        <button 
            onClick={() => setCreateModalOpen(true)}
            className="fixed bottom-6 right-6 bg-[#8C1515] text-white p-4 rounded-full shadow-2xl hover:bg-[#6b1010] active:scale-95 transition-all z-40 border-2 border-white"
        >
            <Plus size={28} strokeWidth={3} />
        </button>

        {/* --- POST COLLABORATION MODAL (Keep as is) --- */}
        {isCreateModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full h-[85%] sm:h-auto sm:max-h-[85vh] sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="bg-[#8C1515] p-6 rounded-t-[2rem] sm:rounded-t-3xl flex justify-between items-center shrink-0">
                        <h2 className="text-white text-xl font-black">Post Collaboration</h2>
                        <button onClick={() => setCreateModalOpen(false)} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30"><X size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <form id="create-opening-form" onSubmit={handleCreateOpening} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><BookOpen size={14}/> Research Title</label>
                                <input required value={newOpening.title} onChange={(e) => setNewOpening({...newOpening, title: e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold text-gray-800 focus:border-[#8C1515] outline-none" placeholder="e.g. AI for Healthcare" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Users size={14}/> Collaboration Type</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['Seeking Co-PI', 'Joint Research', 'Mentorship', 'Grant Proposal'].map(type => (
                                        <button key={type} type="button" onClick={() => setNewOpening({...newOpening, collaboration_type: type})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${newOpening.collaboration_type === type ? 'bg-[#8C1515] text-white border-[#8C1515]' : 'bg-white text-gray-600 border-gray-200'}`}>{type}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Target size={14}/> Scope of Work</label>
                                <textarea required rows={4} value={newOpening.description} onChange={(e) => setNewOpening({...newOpening, description: e.target.value})} className="w-full bg-gray-50 rounded-xl p-4 text-sm font-medium text-gray-700 outline-none resize-none" placeholder="Describe goals..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Calendar size={14}/> Valid Until</label>
                                    <div className="bg-gray-50 rounded-xl px-3 py-3"><input required type="date" value={newOpening.deadline} onChange={(e) => setNewOpening({...newOpening, deadline: e.target.value})} className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none" /></div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Clock size={14}/> Est. Duration</label>
                                    <div className="bg-gray-50 rounded-xl px-3 py-3"><input value={newOpening.expected_duration} onChange={(e) => setNewOpening({...newOpening, expected_duration: e.target.value})} className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none" placeholder="e.g. 6 Months" /></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Briefcase size={14}/> Expertise Required</label>
                                <div className="bg-gray-50 rounded-xl px-4 py-3"><input value={newOpening.required_skills} onChange={(e) => setNewOpening({...newOpening, required_skills: e.target.value})} className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none" placeholder="IoT, ML..." /></div>
                            </div>
                        </form>
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-white rounded-b-[2rem] sm:rounded-b-3xl">
                        <button type="submit" form="create-opening-form" disabled={creating} className="w-full bg-[#8C1515] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl">{creating ? 'Publishing...' : 'Publish Collaboration'}</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- IMPROVED FILTER MODAL --- */}
        {isFilterOpen && (
           <div className="fixed inset-0 bg-black/60 z-50 flex items-end animate-in fade-in duration-200">
              <div className="bg-white w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-gray-800">Filter Hub</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20}/></button>
                 </div>
                 
                 <div className="space-y-6">
                    {/* Collaboration Type Filter */}
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-wider">Collaboration Type</label>
                       <div className="flex flex-wrap gap-2">
                          {['Joint Research', 'Seeking Co-PI', 'Mentorship', 'Grant Proposal'].map(type => (
                             <button 
                                key={type}
                                onClick={() => setSelectedType(selectedType === type ? '' : type)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                    selectedType === type 
                                    ? 'bg-[#FFF9E6] text-[#D4AF37] border-[#D4AF37] shadow-sm' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                             >
                                {type}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-wider">Department</label>
                       <div className="flex flex-wrap gap-2">
                          {['CSE', 'ECE', 'ME', 'Civil', 'AI', 'EEE'].map(dept => (
                             <button 
                                key={dept}
                                onClick={() => setSelectedDept(selectedDept === dept ? '' : dept)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                    selectedDept === dept 
                                    ? 'bg-[#FFF0F0] text-[#8C1515] border-[#8C1515] shadow-sm' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                             >
                                {dept}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 mt-10">
                    <button 
                       onClick={clearFilters}
                       className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-black text-xs uppercase hover:bg-gray-200 transition-colors"
                    >
                       Clear
                    </button>
                    <button 
                       onClick={applyFilters}
                       className="flex-[2] bg-[#8C1515] text-white py-3.5 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-[#7a1212] transition-colors"
                    >
                       Apply Filters
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* --- FACULTY PROFILE POPUP (Keep as is) --- */}
        {selectedFacultyId && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <button onClick={() => setSelectedFacultyId(null)} className="absolute top-4 right-4 z-10 bg-black/20 p-2 rounded-full text-white hover:bg-black/30 backdrop-blur-sm"><X size={20} /></button>
                  <div className="h-32 bg-[#8C1515] shrink-0"></div>
                  <div className="px-6 relative flex-1 overflow-y-auto pb-8">
                     <div className="-mt-12 mb-4 flex justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden">
                           <img src={profileData?.info.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                        </div>
                     </div>
                     {profileData ? (
                        <div className="text-center">
                           <h2 className="text-xl font-black text-gray-900">{profileData.info.name}</h2>
                           <p className="text-xs font-bold text-[#8C1515] mt-1 uppercase tracking-wide">{profileData.info.designation} • {profileData.info.department}</p>
                           
                           <div className="flex justify-center flex-wrap gap-2 mt-4 mb-6">
                              {profileData.info.interests?.map(int => (
                                 <span key={int} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold">{int}</span>
                              ))}
                           </div>

                           <div className="space-y-3 text-left">
                              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                 <div className="bg-white p-2 rounded-full text-[#8C1515] shadow-sm"><Mail size={16}/></div>
                                 <div><p className="text-[9px] text-gray-400 font-bold uppercase">Email</p><p className="text-xs font-bold text-gray-800">{profileData.info.email}</p></div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                 <div className="bg-white p-2 rounded-full text-[#8C1515] shadow-sm"><MapPin size={16}/></div>
                                 <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Location</p>
                                    <p className="text-xs font-bold text-gray-800">{profileData.info.cabin_block ? `${profileData.info.cabin_block}, Floor ${profileData.info.cabin_floor}` : "Not Updated"}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="h-40 flex items-center justify-center"><p className="text-xs font-bold text-gray-400">Loading...</p></div>
                     )}
                  </div>
              </div>
          </div>
        )}
    </div>
  );
}