"use client";

import React, { useEffect, useState } from 'react';
import { Menu, Bell, ChevronRight, X, Mail, MapPin } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { 
  facultyDashboardService, 
  FacultyDashboardData, 
  StudentPublicProfile, 
  FacultyMenuData, 
  FacultyProfile 
} from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function FacultyDashboard() {
  const router = useRouter();
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [menuData, setMenuData] = useState<FacultyMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  
  // Modals
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentPublicProfile | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [shortlistStudentId, setShortlistStudentId] = useState<string | null>(null);

  useEffect(() => {
    loadData("All");
  }, []);

  const loadData = async (filter: string) => {
    setLoading(true);
    try {
      const res = await facultyDashboardService.getFacultyHome(filter);
      const menuRes = await facultyDashboardService.getFacultyMenu();
      setData(res);
      setMenuData(menuRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (tag: string) => {
    setActiveFilter(tag);
    loadData(tag);
  };

  // --- MENU ACTIONS ---
  const handleLogout = () => {
    localStorage.clear(); // Clear all data
    toast.success("Logged out successfully");
    router.push('/login'); // Ensure you have a /login page
  };

  const handleMenuClick = (route: string) => {
    if (route === '/logout') {
        handleLogout();
    } else {
        router.push(route);
    }
    setMenuOpen(false);
  };

  // --- SHORTLIST & PROFILE ACTIONS ---
  const handleShortlistClick = (studentId: string) => setShortlistStudentId(studentId);

  const confirmShortlist = async (openingId: string) => {
    if (!shortlistStudentId) return;
    try {
      await facultyDashboardService.shortlistStudent(shortlistStudentId, openingId);
      toast.success("Student Shortlisted Successfully!");
      setShortlistStudentId(null);
    } catch (err) {
      toast.error("Failed to shortlist");
    }
  };

  const openStudentProfile = async (id: string) => {
    setSelectedStudentId(id);
    setStudentProfile(null); 
    try {
      const profile = await facultyDashboardService.getStudentProfile(id);
      setStudentProfile(profile);
    } catch (err) {
      toast.error("Could not load student profile");
    }
  };

  const openFacultyProfile = async (id: string) => {
    setSelectedFacultyId(id);
    setFacultyProfile(null);
    try {
      const profile = await facultyDashboardService.getFacultyProfile(id);
      setFacultyProfile(profile);
    } catch (err) {
      toast.error("Could not load faculty profile");
    }
  };

  if (loading && !data) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- 1. SIDE MENU DRAWER (FIXED) --- */}
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
                 <div className="w-24 h-24 rounded-full bg-white mx-auto mb-3 p-1 border-2 border-white/20">
                    <img 
                      src={menuData?.profile_picture || "https://avatar.iran.liara.run/public/boy"} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                 </div>
                 <h2 className="text-white font-black text-lg leading-tight mb-1">{menuData?.name}</h2>
                 <p className="text-white/80 text-xs font-medium">{menuData?.department}</p>
              </div>
              
              {/* Menu List - UPDATED LOGIC */}
              <div className="py-2 px-4 space-y-2 mt-2">
                 {menuData?.menu_items.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleMenuClick(item.route)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                          item.label === 'Logout' 
                          ? 'bg-red-50 text-[#8C1515] hover:bg-red-100' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                       <span className="flex items-center gap-3">
                          {item.label}
                       </span>
                       <ChevronRight size={16} className="text-gray-400" />
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* --- 2. MAIN HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex justify-between items-start">
           <div>
             <button onClick={() => setMenuOpen(true)} className="mb-4">
                <Menu size={24} />
             </button>
             <h1 className="text-xl font-black tracking-tight leading-none">Welcome! <br/> {data?.user_info.name}</h1>
             <p className="text-white/70 text-xs font-bold mt-1">{data?.user_info.department}</p>
           </div>
           
           <div className="flex gap-4 items-center mt-1">
              <button onClick={() => router.push('/dashboard/faculty/notifications')}>
                 <Bell size={20} />
              </button>
           </div>
        </div>

        {/* --- 3. DASHBOARD CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
           
           {/* Recommended Students */}
           <div className="mt-6 px-6">
              <h2 className="text-[#8C1515] font-black text-lg mb-4">Recommended Students</h2>
              
              {/* Filter Chips */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                 {['All', 'AI', 'IoT', 'Python', 'React'].map(tag => (
                   <button 
                     key={tag} 
                     onClick={() => handleFilterClick(tag)}
                     className={`border px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${
                        activeFilter === tag 
                        ? 'bg-[#8C1515] text-white border-[#8C1515]' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-[#8C1515]'
                     }`}
                   >
                     {tag}
                   </button>
                 ))}
              </div>

              <div className="space-y-4">
                 {loading ? <p className="text-center text-xs text-gray-400">Loading...</p> : 
                  data?.recommended_students.map(student => (
                   <div key={student.student_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                      
                      {/* FIX: Alignment of Profile & Match Score */}
                      <div className="flex justify-between items-start mb-4">
                         <div 
                           onClick={() => openStudentProfile(student.student_id)}
                           className="flex gap-3 cursor-pointer group"
                         >
                            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden group-hover:ring-2 ring-[#8C1515] transition-all">
                              <img src={student.profile_picture || "https://avatar.iran.liara.run/public/girl"} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <h3 className="text-gray-900 font-black text-sm group-hover:text-[#8C1515] transition-colors">{student.name}</h3>
                               <p className="text-gray-500 text-xs font-bold">{student.department}, {student.batch}</p>
                            </div>
                         </div>
                         
                         {/* Match Score Badge */}
                         <div className="bg-[#FFF8E1] border border-[#FFE082] px-2 py-1 rounded-lg text-center">
                            <span className="block text-xs font-bold text-gray-400 uppercase">Match</span>
                            <span className="block text-lg font-black text-[#D4AF37] leading-none">{student.match_score}</span>
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                         {student.matched_skills.slice(0,3).map(skill => (
                           <span key={skill} className="bg-[#8C1515] text-white px-2 py-0.5 rounded-md text-[9px] font-bold">
                             {skill}
                           </span>
                         ))}
                      </div>
                      
                      <div className="flex gap-3">
                         <button 
                            onClick={() => openStudentProfile(student.student_id)}
                            className="flex-1 border-2 border-[#8C1515] text-[#8C1515] py-2.5 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-transform"
                         >
                           View Profile
                         </button>
                         <button 
                           onClick={() => handleShortlistClick(student.student_id)}
                           className="flex-1 bg-[#8C1515] text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform"
                         >
                           Shortlist
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Faculty Collaborations Preview */}
           <div className="mt-8 px-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-[#8C1515] font-black text-lg">Faculty Collaborations</h2>
                 <button 
                    onClick={() => router.push('/dashboard/faculty/collaborations')} 
                    className="text-[#8C1515] text-xs font-black flex items-center gap-1"
                 >
                   View All <ChevronRight size={14} />
                 </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                 {data?.faculty_collaborations.map(collab => (
                    <div key={collab.faculty_id + collab.project_title} className="min-w-[200px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                       <div 
                          onClick={() => openFacultyProfile(collab.faculty_id)}
                          className="flex items-center gap-2 mb-2 cursor-pointer group"
                       >
                          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden group-hover:ring-2 ring-[#8C1515] transition-all">
                             <img src={collab.faculty_pic || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-900 group-hover:text-[#8C1515] transition-colors">{collab.faculty_name}</p>
                             <p className="text-[8px] font-bold text-gray-400">{collab.faculty_dept}</p>
                          </div>
                       </div>
                       
                       <h4 className="text-xs font-black text-gray-800 leading-tight mb-1 line-clamp-2">{collab.project_title}</h4>
                       <p className="text-[9px] text-[#8C1515] font-bold">{collab.collaboration_type}</p>
                    </div>
                 ))}
              </div>
           </div>
           <div className="h-6"></div>
        </div>

        {/* --- 4. SHORTLIST MODAL (HALF PAGE) --- */}
        {shortlistStudentId && (
           <div className="absolute inset-0 bg-black/50 z-50 flex items-end animate-in fade-in duration-200">
              <div className="bg-white w-full h-[60%] rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <h3 className="text-lg font-black text-[#8C1515]">Shortlist Student</h3>
                       <p className="text-xs text-gray-500 font-bold">Select an opening to assign this student to.</p>
                    </div>
                    <button onClick={() => setShortlistStudentId(null)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {data?.active_openings && data.active_openings.length > 0 ? (
                        data.active_openings.map((op) => (
                           <button 
                              key={op.id}
                              onClick={() => confirmShortlist(op.id)}
                              className="w-full text-left bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#8C1515] hover:bg-white transition-all group"
                           >
                              <h4 className="font-bold text-sm text-gray-800 group-hover:text-[#8C1515]">{op.title}</h4>
                              <p className="text-[10px] text-gray-400 font-bold mt-1">Click to select</p>
                           </button>
                        ))
                    ) : (
                        <div className="text-center py-10">
                           <p className="text-gray-400 text-xs font-bold">No active openings found.</p>
                           <button 
                              onClick={() => router.push('/dashboard/faculty/projects')} 
                              className="mt-2 text-[#8C1515] text-xs font-black underline"
                           >
                              Create New Opening
                           </button>
                        </div>
                    )}
                 </div>
              </div>
           </div>
        )}

        {/* --- 5. STUDENT & FACULTY PROFILE OVERLAYS --- */}
        {selectedStudentId && (
          <div className="absolute inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="relative h-40 bg-[#FFF0F0] flex justify-center items-end pb-0 border-b border-gray-100">
                 <button onClick={() => setSelectedStudentId(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500">
                    <X size={20} />
                 </button>
                 <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                    <img src={studentProfile?.info.profile_picture || "https://avatar.iran.liara.run/public/girl"} className="w-full h-full object-cover" />
                 </div>
              </div>
              {studentProfile && (
                 <div className="px-6 pt-12 pb-10 text-center">
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{studentProfile.info.name}</h2>
                    <p className="text-xs font-bold text-[#8C1515] mt-1">{studentProfile.info.roll_no}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{studentProfile.info.department} | {studentProfile.info.batch}</p>
                    <p className="text-xs text-gray-600 mt-4 leading-relaxed px-4">{studentProfile.info.bio}</p>
                    
                    <div className="flex justify-center flex-wrap gap-2 mt-4 mb-6">
                       {studentProfile.info.skills.map(s => (
                          <span key={s} className="bg-[#8C1515] text-white px-2 py-1 rounded-md text-[10px] font-bold">{s}</span>
                       ))}
                    </div>

                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Projects</h3>
                       <div className="space-y-3">
                          {studentProfile.projects.map((proj, i) => (
                             <div key={i} className="bg-[#F9F9F9] p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-sm text-gray-900">{proj.title}</h4>
                                <p className="text-[10px] text-gray-500 font-bold mb-2">{proj.duration}</p>
                                <p className="text-xs text-gray-600 mb-2">{proj.description}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="h-10"></div>
                 </div>
              )}
          </div>
        )}

        {selectedFacultyId && (
           <div className="absolute inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="relative h-40 bg-[#F9F9F9] flex justify-center items-end pb-0 border-b border-gray-100">
                 <button onClick={() => setSelectedFacultyId(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500">
                    <X size={20} />
                 </button>
                 <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                    <img src={facultyProfile?.info.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                 </div>
              </div>
              {facultyProfile && (
                 <div className="px-6 pt-12 pb-10 text-center">
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{facultyProfile.info.name}</h2>
                    <p className="text-xs font-bold text-[#8C1515] mt-1">{facultyProfile.info.designation}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{facultyProfile.info.department}</p>
                    
                    <div className="flex justify-center flex-wrap gap-2 mt-3 mb-5">
                       {[...(facultyProfile.info.phd_details || []), ...(facultyProfile.info.pg_details || []), ...(facultyProfile.info.ug_details || [])].map((q, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold">{q}</span>
                       ))}
                    </div>

                    <div className="space-y-2 mb-6">
                       <div className="border border-red-100 bg-red-50/50 rounded-xl p-3 flex items-center gap-3">
                          <Mail size={16} className="text-[#8C1515]" />
                          <span className="text-xs font-bold text-[#8C1515]">{facultyProfile.info.email}</span>
                       </div>
                       <div className="border border-gray-100 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                          <MapPin size={16} className="text-gray-500" />
                          <div className="text-left">
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Cabin Location</p>
                             <p className="text-xs font-bold text-gray-700">
                                {facultyProfile.info.cabin_block ? 
                                   `${facultyProfile.info.cabin_block}, Floor ${facultyProfile.info.cabin_floor}, ${facultyProfile.info.cabin_number}` 
                                   : "Location not updated"}
                             </p>
                          </div>
                       </div>
                    </div>
                    <div className="h-10"></div>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
}