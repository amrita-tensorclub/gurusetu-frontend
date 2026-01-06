"use client";

import React, { useEffect, useState } from 'react';
import { Menu, Bell, ChevronRight, X, Folder, Mail, BookOpen, Briefcase, LogOut, Send, Calendar, Copy } from 'lucide-react';
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
  
  // Shortlist State
  const [shortlistStudentId, setShortlistStudentId] = useState<string | null>(null);
  const [activeOpenings, setActiveOpenings] = useState<any[]>([]); // Stores ONLY student openings
  
  // Collaboration Modal State
  const [selectedCollab, setSelectedCollab] = useState<any | null>(null);
  const [expressingInterest, setExpressingInterest] = useState(false);

  useEffect(() => {
    loadData("All");
  }, []);

  const loadData = async (filter: string) => {
    setLoading(true);
    try {
      const res = await facultyDashboardService.getFacultyHome(filter);
      const menuRes = await facultyDashboardService.getFacultyMenu();
      
      // ✅ STRICT FILTERING for Shortlist Modal
      const projectsRes = await facultyDashboardService.getMyProjects();
      
      console.log("RAW PROJECTS:", projectsRes.projects); // DEBUG: Check console

      const activeOps = projectsRes.projects.filter(p => {
          // 1. Must be Active
          const isActive = p.status === 'Active';
          
          // 2. Must NOT be a collaboration
          // We check specifically if collaboration_type is falsy (null, undefined, or "")
          const isNotCollab = !p.collaboration_type; 

          return isActive && isNotCollab;
      });

      console.log("FILTERED STUDENT OPENINGS:", activeOps); // DEBUG: Check console

      setData(res);
      setMenuData(menuRes);
      setActiveOpenings(activeOps); 
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

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  const handleMenuClick = (route: string) => {
    if (route === '/logout') {
        handleLogout();
    } else {
        router.push(route);
    }
    setMenuOpen(false);
  };

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

  const handleExpressInterest = async (projectId: string) => {
      setExpressingInterest(true);
      try {
          await facultyDashboardService.expressInterest(projectId);
          toast.success("Interest expressed! Owner notified.");
          setSelectedCollab(null);
      } catch (err: any) {
          toast.error(err.response?.data?.detail || "Failed to express interest");
      } finally {
          setExpressingInterest(false);
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
              <div className="bg-[#8C1515] p-6 pt-12 pb-8 text-center relative">
                <div className="w-24 h-24 rounded-full bg-white mx-auto mb-3 p-1 border-2 border-white/20">
                  <img 
                    src={menuData?.profile_picture || (menuData as any)?.pic || "https://avatar.iran.liara.run/public/boy"} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <h2 className="text-white font-black text-lg leading-tight mb-1">{menuData?.name}</h2>
                <p className="text-white/80 text-xs font-medium">{menuData?.department}</p>
              </div>
              <div className="py-2 px-4 space-y-2 mt-2">
                 {menuData?.menu_items.map((item, idx) => (
                    <button key={idx} onClick={() => handleMenuClick(item.route)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${item.label === 'Logout' ? 'bg-red-50 text-[#8C1515]' : 'bg-gray-50 text-gray-700'}`}>
                        <span className="flex items-center gap-3">{item.label}</span>
                        {item.label === 'Logout' ? <LogOut size={16} /> : <ChevronRight size={16} className="text-gray-400" />}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* --- HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex justify-between items-start sticky top-0">
           <div>
             <button onClick={() => setMenuOpen(true)} className="mb-4"><Menu size={24} /></button>
             <h1 className="text-xl font-black tracking-tight leading-none">Welcome! <br/> {data?.user_info.name}</h1>
             <p className="text-white/70 text-xs font-bold mt-1">{data?.user_info.department}</p>
           </div>
           <div className="flex gap-4 items-center mt-1">
              <button onClick={() => router.push('/dashboard/faculty/notifications')} className="relative p-1">
                 <Bell size={24} />
                 {data && data.unread_count > 0 && (
                   <div className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#8C1515] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#8C1515] shadow-sm animate-bounce">{data.unread_count > 9 ? '9+' : data.unread_count}</div>
                 )}
              </button>
           </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
           
           {/* Recommended Students */}
           <div className="mt-6 px-6">
              <h2 className="text-[#8C1515] font-black text-lg mb-4">Recommended Students</h2>
              
              {data?.recommended_students && data.recommended_students.length > 0 ? (
                <div className="space-y-4">
                    {data.recommended_students.map(student => (
                      <div key={student.student_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div onClick={() => openStudentProfile(student.student_id)} className="flex gap-3 cursor-pointer">
                              <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                <img src={student.profile_picture || "https://avatar.iran.liara.run/public/girl"} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <h3 className="text-gray-900 font-black text-sm">{student.name}</h3>
                                 <p className="text-gray-500 text-xs font-bold">{student.department}, {student.batch || 'Batch N/A'}</p>
                              </div>
                            </div>
                            <div className="bg-[#FFF8E1] border border-[#FFE082] px-2 py-1 rounded-lg text-center">
                               <span className="block text-[8px] font-bold text-gray-400 uppercase">Match</span>
                               <span className="block text-lg font-black text-[#D4AF37] leading-none">{student.match_score}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {(student.matched_skills || []).slice(0,3).map(skill => (
                              <span key={skill} className="bg-[#8C1515] text-white px-2 py-0.5 rounded-md text-[9px] font-bold">{skill}</span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => openStudentProfile(student.student_id)} className="flex-1 border-2 border-[#8C1515] text-[#8C1515] py-2.5 rounded-xl font-black text-[10px] uppercase">View Profile</button>
                            <button onClick={() => handleShortlistClick(student.student_id)} className="flex-1 bg-[#8C1515] text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md">Shortlist</button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center h-32">
                   <p className="text-gray-400 text-xs font-bold">No specific recommendations yet.</p>
                   <p className="text-[10px] text-gray-300 mt-1">Try updating your domain interests.</p>
                </div>
              )}
           </div>

           {/* Faculty Collaborations */}
           <div className="mt-8 px-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-[#8C1515] font-black text-lg">Faculty Collaborations</h2>
                 <button onClick={() => router.push('/dashboard/faculty/collaborations')} className="text-[#8C1515] text-xs font-black flex items-center gap-1">View All <ChevronRight size={14} /></button>
              </div>
              
              {data?.faculty_collaborations && data.faculty_collaborations.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {data.faculty_collaborations.map(collab => (
                      <div 
                        key={collab.faculty_id + collab.project_title} 
                        onClick={() => setSelectedCollab(collab)}
                        className="min-w-[280px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#8C1515] transition-colors"
                      >
                         <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
                               <img src={collab.faculty_pic || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                               <p className="text-[10px] font-bold text-gray-900 truncate">{collab.faculty_name}</p>
                               <p className="text-[8px] font-bold text-gray-400 truncate">{collab.faculty_dept}</p>
                            </div>
                         </div>
                         <h4 className="text-sm font-black text-gray-800 leading-tight mb-1 line-clamp-2">{collab.project_title}</h4>
                         <span className="inline-block mt-2 bg-[#FFF9E6] text-[#D4AF37] px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            {collab.collaboration_type}
                         </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center">
                    <Folder size={32} className="text-gray-200 mb-2" />
                    <p className="text-gray-400 text-xs font-bold">No collaborations found.</p>
                    <button onClick={() => loadData(activeFilter)} className="mt-4 text-[#8C1515] text-[10px] font-black underline">Check Again</button>
                </div>
              )}
           </div>
        </div>

        {/* --- SHORTLIST MODAL --- */}
        {shortlistStudentId && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in duration-200">
              <div className="bg-white w-full h-[60%] rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <h3 className="text-lg font-black text-[#8C1515]">Shortlist Student</h3>
                       <p className="text-xs text-gray-500 font-bold">Select an opening to assign this student to.</p>
                    </div>
                    <button onClick={() => setShortlistStudentId(null)} className="bg-gray-100 p-2 rounded-full text-gray-500"><X size={20} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-3">
                    {/* ✅ UPDATED: Use filtered activeOpenings here */}
                    {activeOpenings.length > 0 ? (
                        activeOpenings.map((op) => (
                           <button key={op.id} onClick={() => confirmShortlist(op.id)} className="w-full text-left bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#8C1515] transition-all">
                              <h4 className="font-bold text-sm text-gray-800">{op.title}</h4>
                              {/* DEBUG VISUAL: This helps you identify what the system thinks this project is */}
                              <p className="text-[10px] text-gray-400 font-bold mt-1">
                                {op.collaboration_type ? `[${op.collaboration_type}]` : "(Student Project)"}
                              </p>
                           </button>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-sm font-bold">No active student openings found.</p>
                            <button onClick={() => router.push('/dashboard/faculty/profile/research')} className="text-[#8C1515] text-xs font-black underline mt-2">Create One Now</button>
                        </div>
                    )}
                 </div>
              </div>
           </div>
        )}

        {/* --- COLLABORATION DETAILS MODAL --- */}
        {selectedCollab && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full h-[90vh] sm:h-[85vh] sm:max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom duration-300">
                    <button 
                        onClick={() => setSelectedCollab(null)} 
                        className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-8 pt-10">
                        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden shrink-0">
                                <img src={selectedCollab.faculty_pic || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" alt="Profile"/>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">{selectedCollab.faculty_name}</h2>
                                        <p className="text-[#8C1515] font-bold text-sm tracking-wide">{selectedCollab.faculty_dept}</p>
                                    </div>
                                    <span className="bg-[#FFF9E6] text-[#D4AF37] border border-[#FFE082] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {selectedCollab.collaboration_type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Project Title</p>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">{selectedCollab.project_title}</h3>
                        </div>

                        <div className="pl-4 border-l-4 border-gray-200 mb-8">
                            <p className="text-sm text-gray-500 italic font-medium">
                                "{selectedCollab.description || "No detailed description provided for this project."}"
                            </p>
                        </div>

                        {selectedCollab.skills && selectedCollab.skills.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BookOpen size={16} /> Skills & Topics
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCollab.skills.map((s: string) => (
                                        <span key={s} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-3 mb-20">
                            <Calendar className="text-orange-500" size={20} />
                            <div>
                                <p className="text-[10px] font-bold text-orange-400 uppercase">Deadline</p>
                                <p className="text-xs font-black text-gray-800">{selectedCollab.deadline || "Open until filled"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-white absolute bottom-0 left-0 right-0">
                       <button 
                          onClick={() => handleExpressInterest(selectedCollab.project_id || selectedCollab.id)}
                          disabled={expressingInterest}
                          className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2 hover:bg-[#7a1212]"
                       >
                          {expressingInterest ? "Sending..." : "Express Interest"} <Send size={16}/>
                       </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- STUDENT PROFILE MODAL --- */}
        {selectedStudentId && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full h-[90vh] sm:h-[85vh] sm:max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom duration-300">
              <button onClick={() => setSelectedStudentId(null)} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10"><X size={20} /></button>
              <div className="flex-1 overflow-y-auto p-8 pt-10">
                {studentProfile ? (
                  <>
                    <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
                      <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden shrink-0">
                          <img src={studentProfile.info.profile_picture || "https://avatar.iran.liara.run/public/girl"} className="w-full h-full object-cover" alt="Profile"/>
                      </div>
                      <div className="flex-1 w-full">
                          <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">{studentProfile.info.name}</h2>
                                <p className="text-[#8C1515] font-bold text-sm tracking-wide">{studentProfile.info.roll_no}</p>
                            </div>
                            <span className="hidden sm:inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">{studentProfile.info.batch || "BATCH 2026"}</span>
                          </div>
                          <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-wide">{studentProfile.info.department}</p>
                          <span className="sm:hidden inline-block mt-3 bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">{studentProfile.info.batch || "BATCH 2026"}</span>
                      </div>
                    </div>
                    <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-xl p-4 flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8C1515] shadow-sm"><Mail size={18} /></div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Student Email</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{studentProfile.info.email}</p>
                        </div>
                        <Copy size={16} className="text-gray-400" />
                    </div>
                    <div className="pl-4 border-l-4 border-gray-200 mb-8"><p className="text-sm text-gray-500 italic font-medium">"{studentProfile.info.bio || "No bio added."}"</p></div>
                    <div className="mb-8">
                        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><BookOpen size={16} /> Skills & Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                            {studentProfile.info.skills && studentProfile.info.skills.length > 0 ? (
                                studentProfile.info.skills.map(s => (<span key={s} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">{s}</span>))
                            ) : (<p className="text-sm text-gray-400 italic">No skills listed.</p>)}
                        </div>
                    </div>
                    <div className="mb-20">
                        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={16} /> Recent Projects</h4>
                        {studentProfile.projects && studentProfile.projects.length > 0 ? (
                            <div className="space-y-3">
                                {studentProfile.projects.map((proj, i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <h4 className="font-bold text-sm text-gray-900">{proj.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (<div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center bg-gray-50/50"><p className="text-sm text-gray-400 font-medium">No projects added yet.</p></div>)}
                    </div>
                  </>
                ) : (
                    <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8C1515]"></div></div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-white absolute bottom-0 left-0 right-0">
                 <button onClick={() => { setShortlistStudentId(selectedStudentId); setSelectedStudentId(null); }} className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform hover:bg-[#7a1212]">Shortlist Student</button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}