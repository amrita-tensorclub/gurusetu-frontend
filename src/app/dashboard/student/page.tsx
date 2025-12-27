"use client";

import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, AlertCircle, Menu, Bell, X, Home, User, Folder, HelpCircle, Users, LogOut, ChevronRight } from 'lucide-react';
import { dashboardService, StudentDashboardData } from '@/services/dashboardService';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardResult = await dashboardService.getStudentHome();
        setData(dashboardResult);
        const menuResult = await dashboardService.getStudentMenu();
        setMenuData(menuResult);
      } catch (err) {
        console.error("Backend Error:", err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // --- NEW: Navigation Handler ---
  const handleNavigation = (path: string) => {
    setMenuOpen(false); // Close the drawer
    router.push(path);  // Navigate to the page
  };

  if (loading) return (
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
        <button onClick={() => window.location.reload()} className="bg-[#8C1515] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      
      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- SIDE MENU OVERLAY (Sliding Drawer) --- */}
        <div 
          className={`absolute inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMenuOpen(false)} 
        >
           <div 
             className={`absolute top-0 left-0 bottom-0 w-[80%] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
             onClick={(e) => e.stopPropagation()} 
           >
              {/* Drawer Header */}
              <div className="bg-[#8C1515] p-6 pt-12 pb-8 text-center relative">
                 <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 text-white/80">
                   <X size={20} />
                 </button>
                 <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 p-1">
                    <img 
                      src={menuData?.profile_picture || "https://avatar.iran.liara.run/public"} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                 </div>
                 <h2 className="text-white font-black text-lg leading-tight">{menuData?.name}</h2>
                 <p className="text-white/80 text-xs mt-1 font-medium">Roll No: {menuData?.roll_no}</p>
                 <p className="text-white/80 text-xs font-medium">Department: {menuData?.department}</p>
              </div>

              {/* --- UPDATED MENU LINKS --- */}
              <div className="p-2 py-4 space-y-1">
                <MenuLink 
                    icon={Home} 
                    label="Home" 
                    onClick={() => handleNavigation('/dashboard/student')} 
                    active 
                />
                <MenuLink 
                    icon={User} 
                    label="Profile" 
                    onClick={() => handleNavigation('/dashboard/student/profile')} 
                />
                <MenuLink 
                    icon={Folder} 
                    label="My Openings" 
                    onClick={() => handleNavigation('/dashboard/student/projects')} 
                />
                <MenuLink 
                    icon={HelpCircle} 
                    label="Help & Support" 
                    onClick={() => handleNavigation('/dashboard/student/support')} 
                />
                <MenuLink 
                    icon={Users} 
                    label="All Faculty" 
                    onClick={() => handleNavigation('/dashboard/student/all-faculty')} 
                />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 text-[#8C1515] font-bold text-sm hover:bg-red-50 rounded-r-full transition-colors mt-4"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
           </div>
        </div>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <div className="bg-[#8C1515] text-white pt-12 pb-6 px-6 rounded-b-[2rem] shadow-lg flex-shrink-0 z-10">
          <div className="flex justify-between items-start mb-4">
            <button onClick={() => setMenuOpen(true)}>
              <Menu size={24} className="cursor-pointer" />
            </button>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
               <Bell size={18} />
            </div>
          </div>
          <div>
            <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-widest mb-1">Welcome Back</p>
            <h1 className="text-2xl font-black tracking-tight leading-none">
              {data?.user_info.name.split(' ')[0]} 
            </h1>
            <p className="text-white/60 text-xs font-bold mt-1">
              ({data?.user_info.roll_no})
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          {/* Recommended Section */}
          <div className="mt-6 pl-6">
            <h2 className="text-gray-800 font-black text-lg mb-4 tracking-tight">Recommended for You</h2>
            <div className="flex gap-4 overflow-x-auto pb-8 pr-6 scrollbar-hide">
              {data?.recommended_openings.map((opening) => (
                <div key={opening.opening_id} className="min-w-[260px] bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative flex-shrink-0">
                  <div className="absolute top-0 right-4 bg-[#D4AF37] text-white px-2 pt-3 pb-1.5 rounded-b-lg text-[10px] font-black text-center shadow-md leading-tight">
                    {opening.match_score}<br/>Match
                  </div>
                  <h3 className="font-black text-gray-800 text-sm pr-10 leading-snug mb-3 min-h-[40px] line-clamp-2">
                    {opening.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                     <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                       <img src={opening.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-800">{opening.faculty_name}</span>
                        <span className="text-[8px] font-bold text-gray-400">{opening.department}</span>
                     </div>
                  </div>
                  <button className="w-full bg-[#8C1515] text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* All Openings Section */}
          <div className="px-6 mt-2">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-gray-800 font-black text-lg tracking-tight">All Openings</h2>
               <button className="bg-[#D4AF37] p-2 rounded-lg text-white shadow-sm hover:bg-[#b8962e]">
                 <Filter size={14} />
               </button>
            </div>
            <div className="space-y-4">
              {data?.all_openings.map((opening) => (
                <div key={opening.opening_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                   <h3 className="font-black text-gray-800 text-sm pr-8 leading-tight mb-2">{opening.title}</h3>
                   <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-gray-600">{opening.faculty_name}</span>
                      <span className="text-[9px] text-gray-300">•</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{opening.department}</span>
                   </div>
                   <button className="w-full border-2 border-[#8C1515] text-[#8C1515] py-2 rounded-lg font-black text-[10px] uppercase tracking-wider mt-2">
                     View Details
                   </button>
                </div>
              ))}
            </div>
          </div>
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}

// --- UPDATED HELPER COMPONENT ---
// Added onClick to the interface and button
function MenuLink({ 
    icon: Icon, 
    label, 
    active = false, 
    onClick 
}: { 
    icon: any, 
    label: string, 
    active?: boolean, 
    onClick?: () => void 
}) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center justify-between p-4 rounded-r-full transition-colors ${active ? 'bg-[#FFF0F0] text-[#8C1515]' : 'text-gray-600 hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-4">
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className={`text-sm ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}