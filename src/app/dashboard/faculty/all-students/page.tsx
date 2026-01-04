"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Search, Mail, X, Filter, GraduationCap, Calendar, Briefcase, Copy, User } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { 
  facultyDashboardService, 
  StudentListItem, 
  StudentPublicProfile 
} from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function AllStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // --- Filter State ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');

  // --- Modal State ---
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentPublicProfile | null>(null);

  useEffect(() => {
    loadStudents();
  }, [search]); 

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await facultyDashboardService.getAllStudents(search, selectedDept, selectedBatch);
      setStudents(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    loadStudents();
    toast.success("Filters applied");
  };

  const clearFilters = () => {
    setSelectedDept('');
    setSelectedBatch('');
    setIsFilterOpen(false);
    facultyDashboardService.getAllStudents(search, '', '').then(setStudents);
    toast.success("Filters cleared");
  };

  const openProfile = async (id: string) => {
    setSelectedStudentId(id);
    setStudentProfile(null);
    try {
      const profile = await facultyDashboardService.getStudentProfile(id);
      setStudentProfile(profile);
    } catch (err) {
      toast.error("Could not load profile");
      setSelectedStudentId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Email copied!");
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans">
      <Toaster position="top-center" />

        {/* --- HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0">
           <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-black tracking-tight">All Students</h1>
           </div>

           <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-xl flex items-center px-3 py-2.5 shadow-inner">
                 <Search size={16} className="text-gray-400 mr-2" />
                 <input 
                   placeholder="Search name or skill..." 
                   className="w-full text-xs font-bold text-gray-700 outline-none"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => setIsFilterOpen(true)}
                className={`p-2.5 rounded-xl border border-white/20 text-white transition-colors ${
                    (selectedDept || selectedBatch) ? 'bg-white text-[#8C1515]' : 'bg-white/10'
                }`}
              >
                 <Filter size={16} />
              </button>
           </div>
        </div>

        {/* --- STUDENTS LIST --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 scrollbar-hide">
           
           {(selectedDept || selectedBatch) && (
               <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide">
                   {selectedDept && <span className="text-[10px] bg-[#e3f2fd] text-blue-700 px-2 py-1 rounded-md font-bold whitespace-nowrap">Dept: {selectedDept}</span>}
                   {selectedBatch && <span className="text-[10px] bg-[#fff3e0] text-orange-700 px-2 py-1 rounded-md font-bold whitespace-nowrap">Batch: {selectedBatch}</span>}
               </div>
           )}

           {loading && <p className="text-center text-xs text-gray-400 mt-10">Loading...</p>}
           
           {!loading && students.length === 0 && (
              <div className="text-center mt-10 opacity-50">
                 <p className="text-gray-400 text-xs font-bold">No students found.</p>
              </div>
           )}

           {students.map((student) => (
             <div 
               key={student.student_id} 
               onClick={() => openProfile(student.student_id)}
               className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center active:scale-95 transition-transform cursor-pointer group"
             >
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-[#8C1515] transition-colors">
                   <img src={student.profile_picture || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                   <h3 className="font-black text-sm text-gray-900 truncate group-hover:text-[#8C1515] transition-colors">
                      {student.name}
                   </h3>
                   <p className="text-[10px] text-gray-500 font-bold mb-1">
                      {student.department} • {student.batch}
                   </p>
                   
                   <div className="flex gap-1 flex-wrap">
                      {student.skills.slice(0, 2).map(s => (
                         <span key={s} className="bg-[#FFF0F0] text-[#8C1515] px-1.5 py-0.5 rounded text-[8px] font-bold">
                            {s}
                         </span>
                      ))}
                      {student.skills.length > 2 && (
                         <span className="text-[8px] text-gray-400 font-bold self-center">
                            +{student.skills.length - 2}
                         </span>
                      )}
                   </div>
                </div>
             </div>
           ))}
           <div className="h-10"></div>
        </div>

        {/* --- FILTER MODAL --- */}
        {isFilterOpen && (
           <div className="fixed inset-0 bg-black/60 z-40 flex items-end animate-in fade-in duration-200">
              <div className="bg-white w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2">
                    <h3 className="font-black text-lg text-gray-800">Filter Students</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
                 </div>
                 
                 <div className="space-y-6 pb-4">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Department</label>
                       <div className="flex flex-wrap gap-2">
                          {['CSE', 'ECE', 'ME', 'Civil', 'AI', 'EEE'].map(dept => (
                             <button 
                                key={dept}
                                onClick={() => setSelectedDept(selectedDept === dept ? '' : dept)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    selectedDept === dept 
                                    ? 'bg-[#8C1515] text-white shadow-md' 
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                             >
                                {dept}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Batch</label>
                       <div className="flex flex-wrap gap-2">
                          {['2023', '2024', '2025', '2026'].map(batch => (
                             <button 
                                key={batch}
                                onClick={() => setSelectedBatch(selectedBatch === batch ? '' : batch)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    selectedBatch === batch 
                                    ? 'bg-[#8C1515] text-white shadow-md' 
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                             >
                                {batch}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 mt-8 sticky bottom-0 bg-white pt-2">
                    <button onClick={clearFilters} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-xs uppercase">
                       Clear
                    </button>
                    <button onClick={applyFilters} className="flex-[2] bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg">
                       Apply Filters
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* --- STUDENT PROFILE MODAL --- */}
        {selectedStudentId && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
             
             {/* Modal Container - NO RED HEADER */}
             <div className="bg-white w-full h-[85vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-t-[2rem] sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 relative flex flex-col">
                
                {/* Close Button - Updated to Gray for visibility on White */}
                <button 
                    onClick={() => setSelectedStudentId(null)} 
                    className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide bg-white p-6 pt-12">
                    {studentProfile ? (
                        <>
                            {/* Avatar - Sits normally at top */}
                            <div className="mb-4 mt-2">
                                <div className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-md overflow-hidden bg-gray-50">
                                     {studentProfile.info.profile_picture ? (
                                        <img src={studentProfile.info.profile_picture} className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                            <User size={32}/>
                                        </div>
                                     )}
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 leading-none mb-1 text-left">{studentProfile.info.name}</h2>
                                        <p className="text-sm font-bold text-[#8C1515] text-left">{studentProfile.info.roll_no}</p>
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                        Batch {studentProfile.info.batch}
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mt-2 text-left">{studentProfile.info.department}</p>
                                
                                {/* Email Display */}
                                <div 
                                    onClick={() => copyToClipboard(studentProfile.info.email)}
                                    className="flex items-center gap-3 mt-5 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 w-full cursor-pointer hover:bg-gray-100 hover:border-[#8C1515]/30 transition-all active:scale-[0.99]"
                                >
                                    <div className="bg-red-50 p-2 rounded-full text-[#8C1515]">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Student Email</p>
                                        <p className="font-bold text-gray-800 break-all">{studentProfile.info.email || "No email provided"}</p>
                                    </div>
                                    <Copy size={16} className="text-gray-400" />
                                </div>
                            </div>

                            {/* Bio */}
                            {studentProfile.info.bio && (
                                <div className="mb-6">
                                     <p className="text-sm text-gray-600 italic leading-relaxed border-l-4 border-gray-200 pl-3 text-left">
                                        "{studentProfile.info.bio}"
                                     </p>
                                </div>
                            )}

                            {/* Skills */}
                            <div className="mb-6 text-left">
                                <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <GraduationCap size={14}/> Skills & Expertise
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                     {studentProfile.info.skills.map(s => (
                                         <span key={s} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold">
                                            {s}
                                         </span>
                                     ))}
                                     {studentProfile.info.skills.length === 0 && <span className="text-xs text-gray-400 italic">No skills listed.</span>}
                                </div>
                            </div>

                            {/* Projects */}
                            <div className="text-left">
                                <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Briefcase size={14}/> Recent Projects
                                </h3>
                                <div className="space-y-3">
                                    {studentProfile.projects.length === 0 ? (
                                        <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                                            <p className="text-xs text-gray-400 font-medium">No projects added yet.</p>
                                        </div>
                                    ) : (
                                        studentProfile.projects.map((proj, i) => (
                                            <div key={i} className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-[#8C1515]/30 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#8C1515] transition-colors line-clamp-1">{proj.title}</h4>
                                                    <div className="flex items-center gap-1 text-[9px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-bold whitespace-nowrap border border-gray-100">
                                                        <Calendar size={10} /> {proj.duration}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{proj.description}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                           <div className="w-8 h-8 border-2 border-gray-200 border-t-[#8C1515] rounded-full animate-spin mb-3"></div>
                           <p className="text-xs font-bold">Loading Profile...</p>
                        </div>
                    )}
                </div>
             </div>
          </div>
        )}
    </div>
  );
}