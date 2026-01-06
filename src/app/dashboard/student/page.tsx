"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw, Menu, Bell, X, Home, User, Folder, HelpCircle, Users, LogOut, ChevronRight, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { dashboardService, StudentDashboardData, Opening } from '@/services/studentDashboardService';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [menuData, setMenuData] = useState<any>(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null); 
  const [applying, setApplying] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardResult = await dashboardService.getStudentHome();
      setData(dashboardResult);
      const menuResult = await dashboardService.getStudentMenu();
      setMenuData(menuResult);
    } catch (err: any) {
      console.error("Backend Error:", err);
      if (err.response && err.response.status === 403) {
          localStorage.clear();
          router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.clear(); 
    router.push('/login');
  };

  const handleNavigation = (path: string) => {
    setMenuOpen(false); 
    router.push(path);
  };

  const handleApply = async (openingId: string) => {
    try {
      setApplying(true);
      await dashboardService.applyToOpening(openingId);
      toast.success("Application Sent Successfully!");
      setSelectedOpening(null); 
      loadData(); 
    } catch (err) {
      toast.error("Failed to apply. You may have already applied.");
    } finally {
      setApplying(false);
    }
  };

  // Add this OUTSIDE and AFTER the StudentDashboard function

function MenuLink({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${active ? 'bg-red-50 text-[#8C1515]' : 'bg-gray-50 text-gray-700'}`}>
      <div className="flex items-center gap-3"><Icon size={18} strokeWidth={2.5} /><span>{label}</span></div>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}
  // Helper to filter 'All Openings'
  const filteredAllOpenings = data?.all_openings?.filter(op => {
      if (activeFilter === "All") return true;
      const searchStr = `${op.title} ${op.department} ${op.skills_required?.join(' ')}`.toLowerCase();
      return searchStr.includes(activeFilter.toLowerCase());
  });

  if (loading && !data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
      Loading Dashboard...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans">
      <Toaster position="top-center" />
      
        {/* --- SIDE MENU DRAWER --- */}
        <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}>
           <div className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
               {/* ... inside the SIDE MENU DRAWER div ... */}
               <div className="bg-[#8C1515] p-6 pt-12 pb-8 text-center relative">
               <div className="w-24 h-24 rounded-full bg-white mx-auto mb-3 p-1 border-2 border-white/20">
                  {/* ✅ FIX: Check for 'profile_picture' AND 'pic' to ensure image loads */}
                  <img 
                     src={menuData?.profile_picture || menuData?.pic || "https://avatar.iran.liara.run/public"} 
                     alt="Profile" 
                     className="w-full h-full rounded-full object-cover"
                  />
               </div>
               <h2 className="text-white font-black text-lg leading-tight mb-1">{menuData?.name}</h2>
               <p className="text-white/80 text-xs font-medium">{menuData?.department} | {menuData?.roll_no}</p>
               </div>
              <div className="py-2 px-4 space-y-2 mt-2">
                <MenuLink icon={Home} label="Home" onClick={() => handleNavigation('/dashboard/student')} active />
                <MenuLink icon={User} label="Profile" onClick={() => handleNavigation('/dashboard/student/profile')} />
                <MenuLink icon={Folder} label="Track Openings" onClick={() => handleNavigation('/dashboard/student/projects')} />
                <MenuLink icon={HelpCircle} label="Help & Support" onClick={() => handleNavigation('/dashboard/student/support')} />
                <MenuLink icon={Users} label="All Faculty" onClick={() => handleNavigation('/dashboard/student/all-faculty')} />
                
                <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors bg-red-50 text-[#8C1515] mt-4">
                   <span className="flex items-center gap-3"><LogOut size={16} /> Logout</span>
                </button>
              </div>
           </div>
        </div>

        {/* --- MAIN HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex justify-between items-start sticky top-0">
           <div>
             <button onClick={() => setMenuOpen(true)} className="mb-4">
                <Menu size={24} />
             </button>
             <h1 className="text-xl font-black tracking-tight leading-none">Welcome! <br/> {data?.user_info.name.split(' ')[0]}</h1>
             <p className="text-white/70 text-xs font-bold mt-1">{data?.user_info.department}</p>
           </div>
           
           <div className="flex gap-4 items-center mt-1">
              <button onClick={() => router.push('/dashboard/student/notifications')} className="relative p-1">
                 <Bell size={24} />
                 {data && data.unread_count > 0 && (
                   <div className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#8C1515] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#8C1515] shadow-sm animate-bounce">
                     {data.unread_count > 9 ? '9+' : data.unread_count}
                   </div>
                 )}
              </button>
           </div>
        </div>

        {/* --- DASHBOARD CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          
          {/* Recommended Section (CLEAN - No Tags) */}
          <div className="mt-6 px-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#8C1515] font-black text-lg">Recommended for You</h2>
                <button onClick={loadData} className="text-[#8C1515] text-xs font-black flex items-center gap-1">
                   <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>
            
            {data?.recommended_openings && data.recommended_openings.length > 0 ? (
               <div className="space-y-4">
                  {data.recommended_openings.map((opening) => (
                    <div key={opening.opening_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        
                        {/* Match Score Badge */}
                        <div className="absolute top-0 right-0 bg-[#FFF8E1] border-l border-b border-[#FFE082] px-3 py-1.5 rounded-bl-xl text-center">
                            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wide">Match</span>
                            <span className="block text-lg font-black text-[#D4AF37] leading-none">{opening.match_score}</span>
                        </div>

                        <div className="flex justify-between items-start mb-4 pr-16">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-100 shrink-0">
                                    <img src={opening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-black text-sm line-clamp-1">{opening.title}</h3>
                                    <p className="text-gray-500 text-xs font-bold">{opening.faculty_name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{opening.department}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setSelectedOpening(opening)} className="flex-1 bg-[#8C1515] text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform">
                                Apply Now
                            </button>
                        </div>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center h-32">
                  <p className="text-gray-400 text-xs font-bold">No specific recommendations yet.</p>
                  <p className="text-[10px] text-gray-300 mt-1">Try updating your skills profile.</p>
               </div>
            )}
          </div>

          {/* All Openings Section (WITH TAGS & VERTICAL LAYOUT) */}
          <div className="mt-8 px-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-[#8C1515] font-black text-lg">All Openings</h2>
                 <button onClick={loadData} className="text-[#8C1515] text-xs font-black flex items-center gap-1">
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
                 </button>
              </div>

              {/* Tag Filters */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                  {['All', 'AI', 'IoT', 'Python', 'React'].map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setActiveFilter(tag)}
                      className={`border px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${
                        activeFilter === tag 
                        ? 'bg-[#8C1515] text-white border-[#8C1515]' 
                        : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
             </div>

              {filteredAllOpenings && filteredAllOpenings.length > 0 ? (
                  /* --- CHANGED: Use Grid for Vertical Stacking --- */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                      {filteredAllOpenings.map((opening) => (
                        <div key={opening.opening_id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                 <img src={opening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                              </div>
                              <div className="overflow-hidden">
                                 <p className="text-xs font-bold text-gray-900 truncate">{opening.faculty_name}</p>
                                 <p className="text-[10px] font-bold text-gray-400 truncate">{opening.department}</p>
                              </div>
                           </div>
                           <h4 className="text-sm font-black text-gray-800 leading-tight mb-3 line-clamp-2">{opening.title}</h4>
                           <button onClick={() => setSelectedOpening(opening)} className="w-full border border-[#8C1515] text-[#8C1515] py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-red-50 transition-colors">
                              View Details
                           </button>
                        </div>
                      ))}
                  </div>
              ) : (
                  <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center">
                      <Folder size={32} className="text-gray-200 mb-2" />
                      <p className="text-gray-400 text-xs font-bold">No active openings found.</p>
                      <button onClick={loadData} className="mt-4 text-[#8C1515] text-[10px] font-black underline">Check Again</button>
                  </div>
              )}
          </div>
        </div>

        {/* --- DETAILS MODAL --- */}
        {selectedOpening && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full h-[85%] sm:h-auto sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                  
                  {/* Clean Header with Close Button */}
                  <div className="p-5 pb-0 flex justify-between items-start">
                     <div className="pr-10">
                        <p className="text-[#8C1515] font-black text-[10px] uppercase tracking-widest mb-1">Applying For</p>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedOpening.title}</h2>
                     </div>
                     <button 
                        onClick={() => setSelectedOpening(null)} 
                        className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
                     >
                        <X size={20} />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     
                     {/* Faculty Profile Section */}
                     <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-14 h-14 rounded-full bg-white overflow-hidden border-2 border-white shadow-sm shrink-0">
                           <img src={selectedOpening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-1">
                           <h4 className="font-black text-gray-900 text-sm">{selectedOpening.faculty_name}</h4>
                           <p className="text-xs font-bold text-gray-500">{selectedOpening.department}</p>
                        </div>
                        {selectedOpening.match_score && (
                             <div className="text-center bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                                 <span className="block text-[8px] font-bold text-gray-400 uppercase">Match</span>
                                 <span className="block text-lg font-black text-[#D4AF37] leading-none">{selectedOpening.match_score}</span>
                             </div>
                        )}
                     </div>

                     {/* Description */}
                     <div className="space-y-2">
                        <h4 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Briefcase size={16} className="text-[#8C1515]"/> Project Description</h4>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed bg-white">
                          {selectedOpening.description || "No detailed description provided."}
                        </p>
                     </div>

                     {/* Skills */}
                     <div className="space-y-2">
                        <h4 className="text-gray-900 font-bold text-sm flex items-center gap-2"><CheckCircle size={16} className="text-[#8C1515]"/> Requirements</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedOpening.skills_required && selectedOpening.skills_required.length > 0 ? (
                             selectedOpening.skills_required.map(s => (
                               <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200">{s}</span>
                             ))
                          ) : (
                             <span className="text-xs text-gray-400 italic">No specific skills listed.</span>
                          )}
                        </div>
                     </div>

                     {/* Deadline */}
                     <div className="flex items-center gap-3 py-3 border-t border-gray-100">
                        <Calendar className="text-orange-500" size={20} />
                        <div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase">Deadline</p>
                           <p className="text-sm font-black text-gray-800">{selectedOpening.deadline || "Open until filled"}</p>
                        </div>
                     </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-6 border-t border-gray-100 bg-white">
                     <button 
                        onClick={() => handleApply(selectedOpening.opening_id)}
                        disabled={applying}
                        className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2 hover:bg-[#7a1212]"
                     >
                        {applying ? "Sending..." : "Confirm Application"}
                     </button>
                  </div>

              </div>
          </div>
        )}
    </div>
  );
}