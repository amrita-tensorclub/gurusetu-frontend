"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Filter, Search, Bookmark, RefreshCw, X, MapPin, Mail, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyDashboardService, CollabProject, FacultyProfile } from '@/services/facultyDashboardService';
import { notificationService } from '@/services/notificationService'; // Imported correctly at top
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

  // --- Open Profile Function ---
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

  // --- Handle Interest (Express Interest) ---
  const handleInterest = async (projectId: string) => {
    try {
      // Calls the notification service we built earlier
      const res = await notificationService.expressInterest(projectId);
      toast.success(res.message);
    } catch (error) {
      toast.error("Failed to express interest");
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10">
           <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-black tracking-tight flex-1 text-center mr-6">Collaboration Hub</h1>
              <button><Filter size={24} onClick={() => setIsFilterOpen(true)} /></button>
           </div>

           {/* Search Bar */}
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
              <button className="bg-white text-[#8C1515] px-3 rounded-xl border border-gray-200 font-bold text-xs">
                Filter
              </button>
           </div>
        </div>

        {/* --- CONTENT LIST --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide bg-[#F2F2F2]">
           
           <div className="flex justify-center py-2 text-[#8C1515]">
              <div className="bg-white p-2 rounded-full shadow-md cursor-pointer hover:rotate-180 transition-transform" onClick={loadProjects}>
                 <RefreshCw size={20} />
              </div>
           </div>

           {loading && <p className="text-center text-xs text-gray-400">Loading Hub...</p>}

           {projects.map((proj, idx) => (
             <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                
                {/* --- CLICKABLE FACULTY HEADER --- */}
                <div 
                  onClick={() => openProfile(proj.faculty_id)} 
                  className="flex items-center gap-2 mb-3 cursor-pointer group"
                >
                   <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden group-hover:ring-2 ring-[#8C1515] transition-all">
                      <img src="https://avatar.iran.liara.run/public/boy" className="w-full h-full object-cover" />
                   </div>
                   <p className="text-xs font-bold text-gray-800 group-hover:text-[#8C1515] transition-colors">
                      {proj.faculty_name}, <span className="text-gray-500">{proj.department}</span>
                   </p>
                </div>

                {/* Project Info */}
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

                {/* Badge & Action */}
                <div className="flex items-center justify-between mt-2">
                   <span className="bg-[#FFF9E6] text-[#D4AF37] border border-[#D4AF37] px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide">
                      {proj.collaboration_type}
                   </span>
                   <Bookmark size={20} className="text-gray-300" />
                </div>

                <button 
                  // Use project_id if available, otherwise fallback to title for now
                  // @ts-ignore (ignoring missing 'id' on interface for quick fix if backend structure varies)
                  onClick={() => handleInterest(proj.id || proj.title)} 
                  className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform mt-4"
                >
                  Express Interest
                </button>
             </div>
           ))}
           
           <div className="h-10"></div>
        </div>

        {/* --- FILTER BOTTOM SHEET --- */}
        {isFilterOpen && (
           <div className="absolute inset-0 bg-black/60 z-40 flex items-end">
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
          <div className="absolute inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
             
             {/* Modal Header */}
             <div className="relative h-40 bg-[#F9F9F9] flex justify-center items-end pb-0 border-b border-gray-100">
                <button 
                  onClick={() => setSelectedFacultyId(null)} 
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500 hover:bg-gray-100"
                >
                   <X size={20} />
                </button>
                <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                   <img 
                      src={profileData?.info.profile_picture || "https://avatar.iran.liara.run/public/boy"} 
                      className="w-full h-full object-cover" 
                   />
                </div>
             </div>

             {/* Profile Content */}
             {profileData ? (
                <div className="px-6 pt-12 pb-10 text-center">
                   
                   <h2 className="text-xl font-black text-gray-900 leading-tight">{profileData.info.name}</h2>
                   <p className="text-xs font-bold text-[#8C1515] mt-1">{profileData.info.designation}</p>
                   <p className="text-[10px] text-gray-400 font-bold">{profileData.info.department}</p>
                   
                   <div className="flex justify-center gap-2 mt-3 mb-5">
                      {profileData.info.qualifications.map((q, i) => (
                         <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold">
                            {q}
                         </span>
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
                            <p className="text-xs font-bold text-gray-700">{profileData.info.cabin_location}</p>
                         </div>
                      </div>
                   </div>

                   <div className="text-left mb-6">
                      <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Research Interests</h3>
                      <div className="flex flex-wrap gap-2">
                         {profileData.info.interests.map(int => (
                            <span key={int} className="border border-[#8C1515] text-[#8C1515] px-3 py-1.5 rounded-full text-[10px] font-bold">
                               {int}
                            </span>
                         ))}
                      </div>
                   </div>

                   <div className="text-left mb-6">
                      <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Current Openings</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                         {profileData.openings.length === 0 && <p className="text-xs text-gray-400">No current openings.</p>}
                         {profileData.openings.map(op => (
                            <div key={op.id} className="min-w-[200px] bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                               <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{op.type}</p>
                               <h4 className="font-bold text-sm text-gray-800 leading-tight mb-2">{op.title}</h4>
                               <button className="text-[#8C1515] text-[10px] font-black underline">View Details</button>
                            </div>
                         ))}
                      </div>
                   </div>
                   
                   <div className="flex gap-3 mt-8">
                      <button className="flex-1 bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform">
                         Navigate to Cabin
                      </button>
                      <button className="flex-1 border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-xl font-black text-xs active:scale-95 transition-transform">
                         Request Meeting
                      </button>
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
    </div>
  );
}