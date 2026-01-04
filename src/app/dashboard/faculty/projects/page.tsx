"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Eye, Trash2, X, CheckCircle, RefreshCw, Users, Calendar, Briefcase, Mail, Phone, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyDashboardService, FacultyProject, ProjectStats, Applicant, InterestedFaculty } from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Stats state is kept for data integrity but not displayed
  const [stats, setStats] = useState<ProjectStats>({
    active_projects: 0, total_applicants: 0, total_shortlisted: 0
  });

  const [projects, setProjects] = useState<FacultyProject[]>([]);
  
  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState<'student' | 'collaboration'>('student');

  // List Modal State
  const [selectedProject, setSelectedProject] = useState<FacultyProject | null>(null);
  const [viewMode, setViewMode] = useState<'applicants' | 'shortlisted' | 'interests'>('applicants');
  const [studentList, setStudentList] = useState<Applicant[]>([]);
  const [facultyList, setFacultyList] = useState<InterestedFaculty[]>([]);
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

  // Filter projects based on the active tab
  const displayedProjects = projects.filter(p => {
    if (activeTab === 'student') return !p.collaboration_type; // No collab type = Student Project
    return p.collaboration_type; // Has collab type = Collaboration
  });

  const openListModal = async (project: FacultyProject, mode: 'applicants' | 'shortlisted' | 'interests') => {
    setSelectedProject(project);
    setViewMode(mode);
    setLoadingList(true);
    setStudentList([]);
    setFacultyList([]);

    try {
      if (mode === 'interests') {
          const data = await facultyDashboardService.getProjectInterests(project.id);
          setFacultyList(data);
      } else if (mode === 'applicants') {
          const data = await facultyDashboardService.getProjectApplicants(project.id);
          setStudentList(data);
      } else {
          const data = await facultyDashboardService.getProjectShortlisted(project.id);
          setStudentList(data);
      }
    } catch (error) {
      toast.error(`Failed to load ${mode}`);
    } finally {
      setLoadingList(false);
    }
  };

  const handleStatusAction = async (e: React.MouseEvent, studentId: string, status: 'Shortlisted' | 'Rejected') => {
    e.stopPropagation(); 
    if (!selectedProject) return;

    try {
      await facultyDashboardService.updateApplicantStatus(selectedProject.id, studentId, status);
      toast.success(status === 'Shortlisted' ? "Student Shortlisted" : "Student Rejected");
      setStudentList((prevList) => prevList.filter((s) => s.student_id !== studentId));
      loadProjects(); 
    } catch (err) {
      toast.error("Action failed");
    }
  };

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
        try {
            await facultyDashboardService.deleteOpening(id);
            toast.success("Opening removed");
            loadProjects();
        } catch (err) {
            toast.error("Delete failed");
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans">
      <Toaster position="top-center" />

        {/* HEADER */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-black tracking-tight">My Openings</h1>
           </div>
        </div>

        {/* TABS MENU */}
        <div className="px-4 mt-6 mb-2">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                <button 
                    onClick={() => setActiveTab('student')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'student' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    Student Openings
                </button>
                <button 
                    onClick={() => setActiveTab('collaboration')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${activeTab === 'collaboration' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    Collaborations
                </button>
            </div>
        </div>

        {/* CONTENT LIST */}
        <div className="flex-1 overflow-y-auto pb-24 px-4 space-y-3">
           {loading ? (
             <p className="text-center text-xs text-gray-400 mt-10">Loading...</p>
           ) : displayedProjects.length === 0 ? (
             <div className="text-center mt-10">
                 <p className="text-gray-400 text-sm font-bold">No {activeTab} openings found.</p>
                 <p className="text-gray-300 text-xs mt-1">Post a new one to get started.</p>
             </div>
           ) : (
             displayedProjects.map((proj) => (
                <div key={proj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-green-100 text-green-700">{proj.status}</span>
                      {proj.collaboration_type ? (
                          <span className="bg-[#FFF9E6] text-[#D4AF37] px-2 py-0.5 rounded-md text-[9px] font-black uppercase">{proj.collaboration_type}</span>
                      ) : (
                          <span className="bg-[#FFF0F0] text-[#8C1515] px-2 py-0.5 rounded-md text-[9px] font-black uppercase">{proj.domain || "Student Project"}</span>
                      )}
                   </div>

                   <h3 className="font-black text-gray-800 text-sm leading-tight mb-3 pr-8">{proj.title}</h3>
                   
                   <div className="flex items-center gap-4 text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5"><Calendar size={12} /><span className="text-[10px] font-bold">{proj.posted_date}</span></div>
                      
                      {/* Conditional Stats Display */}
                      {activeTab === 'student' ? (
                          <div className="flex items-center gap-1.5 text-[#D4AF37]"><Users size={12} /><span className="text-[10px] font-bold">{proj.applicant_count} Applicants</span></div>
                      ) : (
                          <div className="flex items-center gap-1.5 text-[#D4AF37]"><Briefcase size={12} /><span className="text-[10px] font-bold">{proj.interest_count || 0} Faculty Interested</span></div>
                      )}
                   </div>
                   
                   <div className="flex gap-2 border-t border-gray-50 pt-3">
                      
                      {/* Buttons for STUDENT TAB */}
                      {activeTab === 'student' && (
                        <>
                           <button onClick={() => openListModal(proj, 'applicants')} className="flex-1 flex items-center justify-center gap-2 bg-[#F9F9F9] text-gray-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-gray-100">
                              <Eye size={14} /> Applicants
                           </button>
                           <button onClick={() => openListModal(proj, 'shortlisted')} className="flex-1 flex items-center justify-center gap-2 bg-[#e6fffa] text-green-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-[#d1fae5] border border-green-100">
                              <CheckCircle size={14} /> Shortlisted
                           </button>
                        </>
                      )}

                      {/* Buttons for COLLABORATION TAB */}
                      {activeTab === 'collaboration' && (
                        <button onClick={() => openListModal(proj, 'interests')} className="flex-1 flex items-center justify-center gap-2 bg-[#FFF9E6] text-[#D4AF37] py-2.5 rounded-xl text-[10px] font-bold hover:bg-yellow-100 border border-yellow-100">
                            <Briefcase size={14} /> View Interested Faculty
                        </button>
                      )}

                      <button onClick={() => handleDelete(proj.id)} className="w-10 flex items-center justify-center bg-[#FFF0F0] text-[#8C1515] rounded-xl hover:bg-red-100">
                          <Trash2 size={14} />
                      </button>
                   </div>
                </div>
             ))
           )}
           <div className="h-10"></div>
        </div>

        {/* --- LIST MODAL --- */}
        {selectedProject && !viewProfileId && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-end animate-in fade-in duration-200">
            <div className="bg-white w-full h-[85%] rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
              
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {viewMode === 'applicants' ? 'Review Applicants' : viewMode === 'interests' ? 'Interested Faculty' : 'Shortlisted Candidates'}
                   </p>
                   <h3 className="text-lg font-black text-[#8C1515] leading-tight mt-1 line-clamp-2">{selectedProject.title}</h3>
                 </div>
                 <button onClick={() => setSelectedProject(null)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                 {loadingList ? (
                    <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-gray-300"/></div>
                 ) : (
                    <>
                        {/* --- STUDENT LIST RENDER --- */}
                        {viewMode !== 'interests' && (
                            studentList.length === 0 ? (
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
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                    <img src={student.profile_picture || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-800 truncate">{student.name}</h4>
                                                    <p className="text-[10px] text-gray-500">{student.roll_no} • {student.department}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Actions for Applicants */}
                                            {viewMode === 'applicants' && (
                                                <div className="flex gap-2 pt-1 border-t border-gray-50 mt-1">
                                                    <button onClick={(e) => handleStatusAction(e, student.student_id, 'Rejected')} className="flex-1 bg-white border border-red-200 text-red-500 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm">Reject</button>
                                                    <button onClick={(e) => handleStatusAction(e, student.student_id, 'Shortlisted')} className="flex-1 bg-[#8C1515] text-white py-2.5 rounded-xl text-[10px] font-black uppercase shadow-md">Shortlist</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* --- FACULTY LIST RENDER --- */}
                        {viewMode === 'interests' && (
                            facultyList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                    <Briefcase size={32} className="mb-2 opacity-20" />
                                    <p className="text-xs font-bold">No interested faculty yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {facultyList.map((faculty) => (
                                        <div key={faculty.faculty_id} className="bg-white border border-yellow-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-yellow-200">
                                                    <img src={faculty.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800">{faculty.name}</h4>
                                                    <p className="text-[10px] text-gray-500">{faculty.department}</p>
                                                </div>
                                            </div>
                                            <a href={`mailto:${faculty.email}`} className="bg-yellow-50 text-[#D4AF37] p-2 rounded-lg border border-yellow-200 hover:bg-yellow-100">
                                                <Mail size={16}/>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* --- STUDENT PROFILE MODAL --- */}
        {viewProfileId && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-end animate-in fade-in duration-200">
               <div className="bg-white w-full h-[90%] rounded-t-[2.5rem] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl relative">
                 
                 <div className="bg-[#8C1515] p-6 pb-12 relative shrink-0">
                     <button onClick={() => setViewProfileId(null)} className="absolute top-5 right-5 bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition-colors"><X size={18} /></button>
                     <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-widest mb-1">Applicant Profile</p>
                 </div>

                 <div className="flex-1 overflow-y-auto bg-gray-50 -mt-6 rounded-t-[2rem] px-6 pb-10">
                     {loadingProfile || !profileData ? (
                        <div className="flex justify-center mt-20"><RefreshCw className="animate-spin text-[#8C1515]" /></div>
                     ) : (
                        <div className="space-y-6 mt-0">
                           <div className="text-center -mt-10 mb-2">
                              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-md mx-auto overflow-hidden">
                                 <img src={profileData.info.profile_picture || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover"/>
                              </div>
                              <h2 className="text-xl font-black text-gray-900 mt-3">{profileData.info.name}</h2>
                              <p className="text-xs font-bold text-gray-500">{profileData.info.roll_no}</p>
                           </div>

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
                        </div>
                     )}
                 </div>
               </div>
            </div>
        )}

    </div>
  );
}