"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw, Menu, Bell, X, Home, User, Folder, HelpCircle, Users, LogOut, ChevronRight, Briefcase, Calendar, CheckCircle, Filter } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState("All"); // Added for visual consistency

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

  if (loading && !data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
      Loading Dashboard...
    </div>
  );

  return (
    // --- MAIN CONTAINER (Matches Faculty Layout) ---
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans">
      <Toaster position="top-center" />
      
        {/* --- SIDE MENU DRAWER (Fixed Overlay) --- */}
        <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}>
           <div className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
              <div className="bg-[#8C1515] p-6 pt-12 pb-8 text-center relative">
                 <div className="w-24 h-24 rounded-full bg-white mx-auto mb-3 p-1 border-2 border-white/20">
                    <img src={menuData?.profile_picture || "https://avatar.iran.liara.run/public"} alt="Profile" className="w-full h-full rounded-full object-cover"/>
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

        {/* --- MAIN HEADER (Sticky - Matches Faculty) --- */}
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
          
          {/* Recommended Section */}
          <div className="mt-6 px-6">
            <h2 className="text-[#8C1515] font-black text-lg mb-4">Recommended for You</h2>
            
            {/* Visual Tags (Matching Faculty Design) */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
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

            {data?.recommended_openings && data.recommended_openings.length > 0 ? (
               <div className="space-y-4">
                  {data.recommended_openings.map((opening) => (
                    <div key={opening.opening_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                    <img src={opening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-black text-sm line-clamp-1">{opening.title}</h3>
                                    <p className="text-gray-500 text-xs font-bold">{opening.faculty_name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{opening.department}</p>
                                </div>
                            </div>
                            <div className="bg-[#FFF8E1] border border-[#FFE082] px-2 py-1 rounded-lg text-center shrink-0">
                                <span className="block text-[8px] font-bold text-gray-400 uppercase">Match</span>
                                <span className="block text-lg font-black text-[#D4AF37] leading-none">{opening.match_score}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setSelectedOpening(opening)} className="flex-1 bg-[#8C1515] text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md">
                                Apply Now
                            </button>
                        </div>
                    </div>
                  ))}
               </div>
            ) : (
                // --- EMPTY STATE CARD (Copied from Faculty) ---
                <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center h-32">
                   <p className="text-gray-400 text-xs font-bold">No specific recommendations yet.</p>
                   <p className="text-[10px] text-gray-300 mt-1">Try updating your skills profile.</p>
                </div>
            )}
          </div>

          {/* All Openings Section */}
          <div className="mt-8 px-6">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#8C1515] font-black text-lg">All Openings</h2>
                <button onClick={loadData} className="text-[#8C1515] text-xs font-black flex items-center gap-1">
                   <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
             </div>

             {data?.all_openings && data.all_openings.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {data.all_openings.map((opening) => (
                      <div key={opening.opening_id} className="min-w-[200px] max-w-[200px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0">
                               <img src={opening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                            </div>
                            <div className="overflow-hidden">
                               <p className="text-[10px] font-bold text-gray-900 truncate">{opening.faculty_name}</p>
                               <p className="text-[8px] font-bold text-gray-400 truncate">{opening.department}</p>
                            </div>
                         </div>
                         <h4 className="text-xs font-black text-gray-800 leading-tight mb-2 line-clamp-2 h-8">{opening.title}</h4>
                         <button onClick={() => setSelectedOpening(opening)} className="w-full border border-[#8C1515] text-[#8C1515] py-1.5 rounded-lg font-bold text-[9px] uppercase hover:bg-red-50">
                            View
                         </button>
                      </div>
                    ))}
                </div>
             ) : (
                // --- EMPTY STATE CARD (Copied from Faculty) ---
                <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center">
                    <Folder size={32} className="text-gray-200 mb-2" />
                    <p className="text-gray-400 text-xs font-bold">No active openings found.</p>
                    <button onClick={loadData} className="mt-4 text-[#8C1515] text-[10px] font-black underline">Check Again</button>
                </div>
             )}
          </div>
        </div>

        {/* --- DETAILS MODAL (Exact Faculty Style) --- */}
        {selectedOpening && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white w-full h-[85%] sm:h-[90%] sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                
                {/* Modal Header */}
                <div className="bg-[#8C1515] p-6 pb-8 relative shrink-0">
                   <button onClick={() => setSelectedOpening(null)} className="absolute top-5 right-5 bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition-colors"><X size={18} /></button>
                   <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-widest mb-2">Project Details</p>
                   <h2 className="text-white text-xl font-black leading-tight pr-8">{selectedOpening.title}</h2>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white -mt-4 rounded-t-[2rem]">
                   
                   <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                         <img src={selectedOpening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                      </div>
                      <div>
                         <h4 className="font-black text-gray-800 text-sm">{selectedOpening.faculty_name}</h4>
                         <p className="text-[10px] font-bold text-gray-400">{selectedOpening.department}</p>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <h4 className="text-[#8C1515] font-black text-xs uppercase tracking-widest flex items-center gap-2"><Briefcase size={14}/> Description</h4>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed">
                        {selectedOpening.description || "No detailed description provided."}
                      </p>
                   </div>

                   <div className="space-y-2">
                      <h4 className="text-[#8C1515] font-black text-xs uppercase tracking-widest flex items-center gap-2"><CheckCircle size={14}/> Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpening.skills_required && selectedOpening.skills_required.length > 0 ? (
                           selectedOpening.skills_required.map(s => (
                             <span key={s} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold">{s}</span>
                           ))
                        ) : (
                           <span className="text-[10px] text-gray-400 italic">No specific skills listed.</span>
                        )}
                      </div>
                   </div>

                   <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-3">
                      <Calendar className="text-orange-500" size={20} />
                      <div>
                         <p className="text-[10px] font-bold text-orange-400 uppercase">Application Deadline</p>
                         <p className="text-xs font-black text-gray-800">{selectedOpening.deadline || "Open until filled"}</p>
                      </div>
                   </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white">
                   <button 
                      onClick={() => handleApply(selectedOpening.opening_id)}
                      disabled={applying}
                      className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2"
                   >
                      {applying ? "Applying..." : "Confirm Application"}
                   </button>
                </div>

             </div>
          </div>
        )}
    </div>
  );
}

function MenuLink({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${active ? 'bg-red-50 text-[#8C1515]' : 'bg-gray-50 text-gray-700'}`}>
      <div className="flex items-center gap-3"><Icon size={18} strokeWidth={2.5} /><span>{label}</span></div>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}