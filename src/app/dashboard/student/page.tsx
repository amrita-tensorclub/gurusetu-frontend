"use client";

import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, AlertCircle, Menu, Bell, X, Home, User, Folder, HelpCircle, Users, LogOut, ChevronRight, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { dashboardService, StudentDashboardData, Opening } from '@/services/studentDashboardService';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [menuData, setMenuData] = useState<any>(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null); 
  const [applying, setApplying] = useState(false);

  // Define loadData outside useEffect so we can reuse it for Refresh button
  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardResult = await dashboardService.getStudentHome();
      setData(dashboardResult);
      const menuResult = await dashboardService.getStudentMenu();
      setMenuData(menuResult);
      setError(''); // Clear error on success
    } catch (err: any) {
      console.error("Backend Error:", err);
      // Auto-redirect if role is wrong
      if (err.response && err.response.status === 403) {
          localStorage.clear();
          router.push('/login');
          return;
      }
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.clear(); 
    toast.success("Logged out");
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
      loadData(); // Refresh list to update button state/remove item
    } catch (err) {
      toast.error("Failed to apply. You may have already applied.");
    } finally {
      setApplying(false);
    }
  };

  if (loading && !data) return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="animate-spin text-[#8C1515]" size={30} />
        <p className="text-sm font-bold text-gray-600">Syncing with Guru Setu...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center space-y-3">
        <AlertCircle className="mx-auto text-red-500" size={40} />
        <h3 className="text-lg font-black text-gray-800">Connection Failed</h3>
        <button onClick={loadData} className="bg-[#8C1515] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />
      
      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- SIDE MENU --- */}
        <div className={`absolute inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}>
           <div className={`absolute top-0 left-0 bottom-0 w-[80%] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
              <div className="bg-[#8C1515] p-6 pt-12 pb-8 text-center relative">
                 <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 text-white/80"><X size={20} /></button>
                 <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 p-1">
                    <img src={menuData?.profile_picture || "https://avatar.iran.liara.run/public"} alt="Profile" className="w-full h-full rounded-full object-cover"/>
                 </div>
                 <h2 className="text-white font-black text-lg leading-tight">{menuData?.name}</h2>
                 <p className="text-white/80 text-xs mt-1 font-medium">Roll No: {menuData?.roll_no}</p>
                 <p className="text-white/80 text-xs font-medium">Dept: {menuData?.department}</p>
              </div>
              <div className="p-2 py-4 space-y-1">
                <MenuLink icon={Home} label="Home" onClick={() => handleNavigation('/dashboard/student')} active />
                <MenuLink icon={User} label="Profile" onClick={() => handleNavigation('/dashboard/student/profile')} />
                <MenuLink icon={Folder} label="Track Openings" onClick={() => handleNavigation('/dashboard/student/projects')} />
                <MenuLink icon={HelpCircle} label="Help & Support" onClick={() => handleNavigation('/dashboard/student/support')} />
                <MenuLink icon={Users} label="All Faculty" onClick={() => handleNavigation('/dashboard/student/all-faculty')} />
                <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-[#8C1515] font-bold text-sm hover:bg-red-50 rounded-r-full transition-colors mt-4">
                  <LogOut size={20} /> Logout
                </button>
              </div>
           </div>
        </div>

        {/* --- MAIN HEADER --- */}
        <div className="bg-[#8C1515] text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-lg flex-shrink-0 z-10">
          <div className="flex justify-between items-start mb-4">
            <button onClick={() => setMenuOpen(true)}><Menu size={24} className="cursor-pointer" /></button>
            
            <div 
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative cursor-pointer hover:bg-white/30 transition-colors"
                onClick={() => router.push('/dashboard/student/notifications')}
            >
                <Bell size={20} />
                {data && data.unread_count > 0 && (
                   <div className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#8C1515] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#8C1515] shadow-sm animate-bounce">
                     {data.unread_count > 9 ? '9+' : data.unread_count}
                   </div>
                )}
            </div>
          </div>
          <div>
            <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-widest mb-1">Welcome Back</p>
            <h1 className="text-2xl font-black tracking-tight leading-none">{data?.user_info.name.split(' ')[0]}</h1>
            <p className="text-white/60 text-xs font-bold mt-1">({data?.user_info.roll_no})</p>
          </div>
        </div>

        {/* --- CONTENT SCROLL AREA --- */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          
          {/* Recommended Section */}
          <div className="mt-6 pl-6">
            <h2 className="text-gray-800 font-black text-lg mb-4 tracking-tight">Recommended for You</h2>
            
            {/* CHECK: Render Empty State if no data */}
            {data?.recommended_openings && data.recommended_openings.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-8 pr-6 scrollbar-hide">
                {data.recommended_openings.map((opening) => (
                    <div key={opening.opening_id} className="min-w-[260px] bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative flex-shrink-0">
                    <div className="absolute top-0 right-4 bg-[#D4AF37] text-white px-2 pt-3 pb-1.5 rounded-b-lg text-[10px] font-black text-center shadow-md leading-tight">{opening.match_score}<br/>Match</div>
                    <h3 className="font-black text-gray-800 text-sm pr-10 leading-snug mb-3 min-h-[40px] line-clamp-2">{opening.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden border border-gray-100"><img src={opening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/></div>
                        <div className="flex flex-col"><span className="text-[10px] font-black text-gray-800">{opening.faculty_name}</span><span className="text-[8px] font-bold text-gray-400">{opening.department}</span></div>
                    </div>
                    <button onClick={() => setSelectedOpening(opening)} className="w-full bg-[#8C1515] text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform">Apply Now</button>
                    </div>
                ))}
                </div>
            ) : (
                <div className="pr-6 mb-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center h-32">
                        <p className="text-gray-400 text-xs font-bold">No specific recommendations yet.</p>
                        <p className="text-[10px] text-gray-300 mt-1">Try updating your skills profile.</p>
                    </div>
                </div>
            )}
          </div>

          {/* All Openings Section */}
          <div className="px-6 mt-2">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-gray-800 font-black text-lg tracking-tight">All Openings</h2>
               {/* REFRESH BUTTON */}
               <div className="flex gap-2">
                   <button onClick={loadData} className="bg-gray-100 p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-[#8C1515] transition-colors" title="Refresh List">
                       <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                   </button>
                   <button className="bg-[#D4AF37] p-2 rounded-lg text-white shadow-sm hover:bg-[#b8962e]"><Filter size={14} /></button>
               </div>
            </div>
            
            <div className="space-y-4">
              {data?.all_openings && data.all_openings.length > 0 ? (
                  data.all_openings.map((opening) => (
                    <div key={opening.opening_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                        <h3 className="font-black text-gray-800 text-sm pr-8 leading-tight mb-2">{opening.title}</h3>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-gray-600">{opening.faculty_name}</span>
                            <span className="text-[9px] text-gray-300">•</span>
                            <span className="text-[9px] text-gray-400 font-semibold">{opening.department}</span>
                        </div>
                        <button onClick={() => setSelectedOpening(opening)} className="w-full border-2 border-[#8C1515] text-[#8C1515] py-2 rounded-lg font-black text-[10px] uppercase tracking-wider mt-2 hover:bg-red-50">View Details</button>
                    </div>
                  ))
              ) : (
                  // EMPTY STATE MESSAGE
                  <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center">
                      <Folder size={32} className="text-gray-200 mb-2" />
                      <p className="text-gray-400 text-xs font-bold">No active openings found.</p>
                      <button onClick={loadData} className="mt-4 text-[#8C1515] text-[10px] font-black underline">Check Again</button>
                  </div>
              )}
            </div>
          </div>
          <div className="h-10"></div>
        </div>

        {/* --- DETAILS MODAL --- */}
        {selectedOpening && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white w-full h-[85%] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                
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
                        {selectedOpening.description || "No detailed description provided for this project. Please contact the faculty for more information."}
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
                           <>
                             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold">Python</span>
                             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold">Research</span>
                           </>
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
    </div>
  );
}

function MenuLink({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-r-full transition-colors ${active ? 'bg-[#FFF0F0] text-[#8C1515]' : 'text-gray-600 hover:bg-gray-50'}`}>
      <div className="flex items-center gap-4"><Icon size={20} strokeWidth={active ? 2.5 : 2} /><span className={`text-sm ${active ? 'font-black' : 'font-bold'}`}>{label}</span></div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}