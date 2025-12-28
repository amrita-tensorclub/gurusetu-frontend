"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Search, Mail, X, Filter } from 'lucide-react'; 
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

  // --- Load Data ---
  useEffect(() => {
    loadStudents();
  }, [search]); // Auto-reload on search typing

  const loadStudents = async () => {
    setLoading(true);
    try {
      // Pass Search AND Filters to Service
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
    loadStudents(); // Reload data with new filters
    toast.success("Filters applied");
  };

  const clearFilters = () => {
    setSelectedDept('');
    setSelectedBatch('');
    setIsFilterOpen(false);
    // We need to trigger a reload, calling loadStudents directly here won't see the state update immediately
    // so we can just reload manually or set state and let an effect handle it. 
    // For simplicity, we just reset state and call API with empty strings.
    facultyDashboardService.getAllStudents(search, '', '').then(setStudents);
    toast.success("Filters cleared");
  };

  // --- Open Profile ---
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

  return (
    // --- CHANGED: Full Screen Mobile Layout ---
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans">
      <Toaster position="top-center" />

        {/* --- HEADER (Sticky) --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0">
           <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-black tracking-tight">All Students</h1>
           </div>

           {/* Search Bar */}
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
           
           {/* Active Filter Indicators */}
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
                {/* Profile Pic */}
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-[#8C1515] transition-colors">
                   <img 
                      src={student.profile_picture || "https://avatar.iran.liara.run/public"} 
                      className="w-full h-full object-cover" 
                   />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                   <h3 className="font-black text-sm text-gray-900 truncate group-hover:text-[#8C1515] transition-colors">
                      {student.name}
                   </h3>
                   <p className="text-[10px] text-gray-500 font-bold mb-1">
                      {student.department} • {student.batch}
                   </p>
                   
                   {/* Skills Tags */}
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

        {/* --- FILTER BOTTOM SHEET (Fixed Overlay) --- */}
        {isFilterOpen && (
           <div className="fixed inset-0 bg-black/60 z-40 flex items-end animate-in fade-in duration-200">
              <div className="bg-white w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2">
                    <h3 className="font-black text-lg text-gray-800">Filter Students</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
                 </div>
                 
                 <div className="space-y-6 pb-4">
                    {/* Department Filter */}
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

                    {/* Batch Filter */}
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
                    <button 
                       onClick={clearFilters}
                       className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-xs uppercase"
                    >
                       Clear
                    </button>
                    <button 
                       onClick={applyFilters}
                       className="flex-[2] bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg"
                    >
                       Apply Filters
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* --- STUDENT PROFILE MODAL (Fixed Overlay) --- */}
        {selectedStudentId && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
             <div className="bg-white w-full h-[85%] sm:h-[90%] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden relative animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl">
                {/* Modal Header */}
                <div className="bg-[#8C1515] h-32 relative flex-shrink-0">
                   <button onClick={() => setSelectedStudentId(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white hover:bg-white/30">
                      <X size={20} />
                   </button>
                </div>
                {/* Profile Picture */}
                <div className="-mt-12 flex justify-center mb-2">
                   <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                      <img src={studentProfile?.info.profile_picture || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover" />
                   </div>
                </div>
                {/* Scrollable Content */}
                {studentProfile ? (
                   <div className="flex-1 overflow-y-auto px-6 pb-8 text-center scrollbar-hide">
                      <h2 className="text-xl font-black text-gray-900 leading-tight">{studentProfile.info.name}</h2>
                      <p className="text-xs font-bold text-[#8C1515] mt-1">{studentProfile.info.roll_no}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{studentProfile.info.department} | {studentProfile.info.batch}</p>
                      <p className="text-xs text-gray-600 mt-4 leading-relaxed px-4 italic">"{studentProfile.info.bio}"</p>
                      <div className="flex justify-center flex-wrap gap-2 mt-4 mb-6">
                         {studentProfile.info.skills.map(s => (<span key={s} className="bg-red-50 text-[#8C1515] px-2 py-1 rounded-md text-[10px] font-bold">{s}</span>))}
                      </div>
                      <div className="text-left mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                         <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Projects</h3>
                         <div className="space-y-3">
                            {studentProfile.projects.length === 0 && <p className="text-xs text-gray-400">No projects added yet.</p>}
                            {studentProfile.projects.map((proj, i) => (
                               <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                  <h4 className="font-bold text-sm text-gray-900">{proj.title}</h4>
                                  <p className="text-[10px] text-gray-500 font-bold mb-1">{proj.duration}</p>
                                  <p className="text-xs text-gray-600 line-clamp-2">{proj.description}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="flex gap-2 justify-center mt-4">
                          <button className="flex items-center gap-2 bg-[#8C1515] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform"><Mail size={16} /> Contact Student</button>
                      </div>
                   </div>
                ) : (
                   <div className="flex justify-center items-center h-40"><p className="text-xs font-bold text-gray-400 animate-pulse">Loading Profile...</p></div>
                )}
             </div>
          </div>
        )}

    </div>
  );
}