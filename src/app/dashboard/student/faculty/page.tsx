"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, GraduationCap, ChevronLeft, ChevronRight, Filter, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyService } from '@/services/facultyService';
import toast, { Toaster } from 'react-hot-toast';

export default function FacultySearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Real Data ---
  const loadFaculty = async () => {
    setLoading(true);
    try {
      const data = await facultyService.getAllFaculty(); 
      // Ensure backend returns: id, name, department, designation, status, status_source, cabin_number
      setFacultyList(data);
      toast.success("Directory Updated");
    } catch (error) {
      console.error("Failed to load faculty", error);
      toast.error("Could not load faculty data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  // --- 2. Filter Logic ---
  const filteredList = facultyList.filter(f => 
    (f.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.cabin_number || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans flex flex-col">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 space-y-4">
         <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-xl font-black tracking-tight leading-none">Find Mentors</h1>
               <p className="text-white/60 text-[10px] font-bold mt-1">Discover professors & research leads</p>
            </div>
            <button onClick={loadFaculty} className="ml-auto p-2 bg-white/10 rounded-full hover:bg-white/20">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
         </div>

         {/* Search */}
         <div className="flex gap-2">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                  type="text"
                  placeholder="Search faculty, cabin..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm font-bold text-gray-800 placeholder-gray-400 outline-none shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
               />
            </div>
         </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 pb-10 space-y-4 overflow-y-auto">
        
        {loading && (
            <div className="flex justify-center mt-10">
                <p className="text-gray-400 text-xs font-bold animate-pulse">Loading Directory...</p>
            </div>
        )}

        {!loading && filteredList.length === 0 && (
            <div className="text-center mt-10 text-gray-400 text-xs font-bold">No faculty found.</div>
        )}

        {/* List Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((faculty) => (
            <a 
              key={faculty.id} 
              href={`/dashboard/student/faculty/${faculty.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-transform block relative overflow-hidden group"
            >
              {/* Status Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  faculty.status === 'Available' ? 'bg-green-500' : 
                  faculty.status === 'Busy' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>

              <div className="flex items-start justify-between mb-3 pl-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#8C1515] font-black text-lg border-2 border-white shadow-sm overflow-hidden">
                      {faculty.profile_picture ? <img src={faculty.profile_picture} alt="profile" className="w-full h-full object-cover"/> : (faculty.name ? faculty.name[0] : "F")}
                    </div>
                    <div>
                        <h3 className="font-black text-gray-800 text-sm leading-tight group-hover:text-[#8C1515] transition-colors">
                        {faculty.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                        {faculty.department} • {faculty.designation}
                        </p>
                    </div>
                </div>
                
                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase flex items-center gap-1 ${
                    faculty.status === 'Available' ? 'bg-green-50 text-green-700 border-green-100' : 
                    faculty.status === 'Busy' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                }`}>
                  {faculty.status === 'Available' ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {faculty.status || 'Unknown'}
                </div>
              </div>

              <div className="space-y-2 mb-4 pl-3">
                {faculty.cabin_number && (
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <MapPin size={14} className="text-[#8C1515]" />
                    <span>Cabin: {faculty.cabin_number}</span>
                    </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[#8C1515] font-black text-xs uppercase tracking-wide pl-2">
                View Locator & Status
                <ChevronRight size={16} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}