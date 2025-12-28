"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Eye, Trash2, X, CheckCircle, RefreshCw, Users, Calendar, Briefcase, GraduationCap, Mail, Phone, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyDashboardService, FacultyProject, ProjectStats, Applicant } from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<ProjectStats>({
    active_projects: 0, total_applicants: 0, total_shortlisted: 0
  });

  const [projects, setProjects] = useState<FacultyProject[]>([]);
  
  // List Modal State
  const [selectedProject, setSelectedProject] = useState<FacultyProject | null>(null);
  const [viewMode, setViewMode] = useState<'applicants' | 'shortlisted'>('applicants');
  const [studentList, setStudentList] = useState<Applicant[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Profile Modal State
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

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
      toast.error("Failed to load openings");
    } finally {
      setLoading(false);
    }
  };

  const openListModal = async (project: FacultyProject, mode: 'applicants' | 'shortlisted') => {
    setSelectedProject(project);
    setViewMode(mode);
    setLoadingList(true);
    setStudentList([]);

    try {
      let data = [];
      if (mode === 'applicants') {
        data = await facultyDashboardService.getProjectApplicants(project.id);
      } else {
        data = await facultyDashboardService.getProjectShortlisted(project.id);
      }
      setStudentList(data);
    } catch (error) {
      toast.error(`Failed to load ${mode}`);
    } finally {
      setLoadingList(false);
    }
  };

  // --- HANDLE STATUS CHANGE (Reject / Shortlist) ---
  const handleStatusAction = async (e: React.MouseEvent, studentId: string, status: 'Shortlisted' | 'Rejected') => {
    e.stopPropagation(); // Prevents clicking the row from opening the profile
    
    if (!selectedProject) return;

    try {
      // 1. Call Backend
      await facultyDashboardService.updateApplicantStatus(selectedProject.id, studentId, status);
      
      // 2. Show Success Message
      toast.success(status === 'Shortlisted' ? "Student Shortlisted" : "Student Rejected");
      
      // 3. UI UPDATE: Remove the student from the list IMMEDIATELY
      setStudentList((prevList) => prevList.filter((s) => s.student_id !== studentId));
      
      // 4. Refresh background stats (optional, keeps numbers sync)
      loadProjects(); 
    } catch (err) {
      toast.error("Action failed");
    }
  };

  // --- FETCH & OPEN PROFILE MODAL ---
  const handleViewProfile = async (studentId: string) => {
    setViewProfileId(studentId);
    setLoadingProfile(true);
    setProfileData(null);

    try {
       const { data } = await api.get(`/dashboard/faculty/student-profile/${studentId}`);
       setProfileData(data);
    } catch (error) {
       toast.error("Failed to load profile details");
       setViewProfileId(null);
    } finally {
       setLoadingProfile(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this opening?")) {
        // Add delete logic here if needed
        toast.success("Opening removed");
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* HEADER */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-lg font-black tracking-tight">My Openings</h1>
           </div>
           <div className="w-6"></div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-[#F2F2F2]">
           
           {/* STATS */}
           <div className="flex gap-3 overflow-x-auto px-4 py-6 scrollbar-hide">
              <div className="min-w-[130px] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-[#8C1515]">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Active</p>
                 <p className="text-3xl font-black text-[#8C1515] mt-1">{stats.active_projects}</p>
                 <p className="text-[9px] text-gray-400 font-bold mt-1">Projects Live</p>
              </div>
              <div className="min-w-[130px] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-[#D4AF37]">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Applicants</p>
                 <p className="text-3xl font-black text-[#D4AF37] mt-1">{stats.total_applicants}</p>
                 <p className="text-[9px] text-gray-400 font-bold mt-1">Total Interested</p>
              </div>
              <div className="min-w-[130px] bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-600">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Shortlisted</p>
                 <p className="text-3xl font-black text-green-600 mt-1">{stats.total_shortlisted}</p>
                 <p className="text-[9px] text-gray-400 font-bold mt-1">Candidates</p>
              </div>
           </div>

           {/* PROJECT LIST */}
           <div className="px-4 space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-green-100 text-green-700">{proj.status}</span>
                      <span className="bg-[#FFF0F0] text-[#8C1515] px-2 py-0.5 rounded-md text-[9px] font-black uppercase">{proj.domain}</span>
                   </div>
                   <h3 className="font-black text-gray-800 text-sm leading-tight mb-3 pr-8">{proj.title}</h3>
                   <div className="flex items-center gap-4 text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5"><Calendar size={12} /><span className="text-[10px] font-bold">{proj.posted_date}</span></div>
                      <div className="flex items-center gap-1.5 text-[#D4AF37]"><Users size={12} /><span className="text-[10px] font-bold">{proj.applicant_count} Applicants</span></div>
                   </div>
                   <div className="flex gap-2 border-t border-gray-50 pt-3">
                      <button onClick={() => openListModal(proj, 'applicants')} className="flex-1 flex items-center justify-center gap-2 bg-[#F9F9F9] text-gray-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-gray-100">
                          <Eye size={14} /> Applicants
                      </button>
                      <button onClick={() => openListModal(proj, 'shortlisted')} className="flex-1 flex items-center justify-center gap-2 bg-[#e6fffa] text-green-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-[#d1fae5] border border-green-100">
                          <CheckCircle size={14} /> Shortlisted ({proj.shortlisted_count})
                      </button>
                      <button onClick={() => handleDelete(proj.id)} className="w-10 flex items-center justify-center bg-[#FFF0F0] text-[#8C1515] rounded-xl hover:bg-red-100">
                          <Trash2 size={14} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
           <div className="h-20"></div>
        </div>

        {/* --- 1. APPLICANTS LIST MODAL --- */}
        {selectedProject && !viewProfileId && (
          <div className="absolute inset-0 bg-black/60 z-40 flex items-end animate-in fade-in duration-200">
            <div className="bg-white w-full h-[85%] rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
              
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {viewMode === 'applicants' ? 'Review Applicants' : 'Shortlisted Candidates'}
                   </p>
                   <h3 className="text-lg font-black text-[#8C1515] leading-tight mt-1 line-clamp-2">{selectedProject.title}</h3>
                 </div>
                 <button onClick={() => setSelectedProject(null)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                 {loadingList ? (
                    <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-gray-300"/></div>
                 ) : studentList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                       <Users size={32} className="mb-2 opacity-20" />
                       <p className="text-xs font-bold">No {viewMode} found.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {studentList.map((student) => (
                          <div 
                            key={student.student_id} 
                            onClick={() => handleViewProfile(student.student_id)}
                            className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col gap-3 cursor-pointer active:scale-[0.99] transition-transform hover:border-[#8C1515]"
                          >
                             {/* Student Header */}
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                   <img src={student.profile_picture || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="text-sm font-bold text-gray-800 truncate">{student.name}</h4>
                                   <p className="text-[10px] text-gray-500">{student.roll_no} • {student.department}</p>
                                </div>
                             </div>

                             {/* ACTION BUTTONS (Shortlist / Reject) */}
                             {viewMode === 'applicants' ? (
                               <div className="flex gap-2 pt-1 border-t border-gray-50 mt-1">
                                  <button 
                                    onClick={(e) => handleStatusAction(e, student.student_id, 'Rejected')}
                                    className="flex-1 bg-white border border-red-200 text-red-500 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-colors shadow-sm"
                                  >
                                    Reject
                                  </button>
                                  <button 
                                    onClick={(e) => handleStatusAction(e, student.student_id, 'Shortlisted')}
                                    className="flex-1 bg-[#8C1515] text-white py-2.5 rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-[#7a1212] transition-colors"
                                  >
                                    Shortlist
                                  </button>
                               </div>
                             ) : (
                               <div className="bg-green-50 text-green-700 py-1.5 rounded-lg text-center text-[10px] font-black uppercase w-full flex items-center justify-center gap-2">
                                  <CheckCircle size={12}/> Shortlisted Candidate
                               </div>
                             )}
                          </div>
                       ))}
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. FULL PROFILE DETAILS MODAL --- */}
        {viewProfileId && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-in fade-in duration-200">
               <div className="bg-white w-full h-[90%] rounded-t-[2.5rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl relative">
                  
                  {/* Modal Header */}
                  <div className="bg-[#8C1515] p-6 pb-12 relative shrink-0">
                     <button onClick={() => setViewProfileId(null)} className="absolute top-5 right-5 bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition-colors"><X size={18} /></button>
                     <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-widest mb-1">Applicant Profile</p>
                  </div>

                  {/* Profile Content */}
                  <div className="flex-1 overflow-y-auto bg-gray-50 -mt-6 rounded-t-[2rem] px-6 pt-0 pb-10">
                     {loadingProfile || !profileData ? (
                        <div className="flex justify-center mt-20"><RefreshCw className="animate-spin text-[#8C1515]" /></div>
                     ) : (
                        <div className="space-y-6 mt-0">
                           
                           {/* Avatar & Basic Info */}
                           <div className="text-center -mt-10 mb-2">
                              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-md mx-auto overflow-hidden">
                                 <img src={profileData.info.profile_picture || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                              </div>
                              <h2 className="text-xl font-black text-gray-900 mt-3">{profileData.info.name}</h2>
                              <p className="text-xs font-bold text-gray-500">{profileData.info.roll_no}</p>
                           </div>

                           {/* Contact & Dept */}
                           <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
                               <div className="flex items-center gap-3">
                                   <div className="bg-red-50 p-2 rounded-full text-[#8C1515]"><GraduationCap size={16}/></div>
                                   <div><p className="text-[10px] text-gray-400 font-bold uppercase">Department</p><p className="text-sm font-bold text-gray-800">{profileData.info.department}</p></div>
                               </div>
                               <div className="flex items-center gap-3">
                                   <div className="bg-red-50 p-2 rounded-full text-[#8C1515]"><Mail size={16}/></div>
                                   <div><p className="text-[10px] text-gray-400 font-bold uppercase">Email</p><p className="text-sm font-bold text-gray-800 break-all">{profileData.info.email}</p></div>
                               </div>
                               <div className="flex items-center gap-3">
                                   <div className="bg-red-50 p-2 rounded-full text-[#8C1515]"><Phone size={16}/></div>
                                   <div><p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p><p className="text-sm font-bold text-gray-800">{profileData.info.phone || "N/A"}</p></div>
                               </div>
                           </div>

                           {/* Skills */}
                           <div>
                              <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">Skills</h3>
                              <div className="flex flex-wrap gap-2">
                                 {profileData.info.skills.length > 0 ? profileData.info.skills.map((s: string) => (
                                    <span key={s} className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm">{s}</span>
                                 )) : <span className="text-xs text-gray-400 italic">No skills listed</span>}
                              </div>
                           </div>

                           {/* Projects */}
                           <div>
                              <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">Experience & Projects</h3>
                              <div className="space-y-3">
                                 {profileData.projects.length > 0 ? profileData.projects.map((p: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                       <h4 className="font-bold text-sm text-[#8C1515]">{p.title}</h4>
                                       <p className="text-[10px] font-bold text-gray-400 mt-0.5 mb-2">{p.duration}</p>
                                       <p className="text-xs text-gray-600 leading-relaxed">{p.description}</p>
                                    </div>
                                 )) : <div className="bg-white p-6 rounded-xl text-center text-gray-400 text-xs italic">No projects added yet.</div>}
                              </div>
                           </div>

                        </div>
                     )}
                  </div>
               </div>
            </div>
        )}

      </div>
    </div>
  );
}