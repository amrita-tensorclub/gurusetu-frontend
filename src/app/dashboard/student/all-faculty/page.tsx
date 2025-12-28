"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, MapPin, Mail, ChevronRight, X, Calendar, ArrowUpRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyService, FacultySummary, FacultyProfile } from '@/services/facultyService';
import toast, { Toaster } from 'react-hot-toast';

export default function AllFacultyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState<FacultySummary[]>([]);
  const [search, setSearch] = useState('');
  
  // --- STATES FOR MODALS ---
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<FacultyProfile | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Define departments list
  const departments = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI&DS', 'IT', 'BME', 'CSBS'];

  // Load List
  useEffect(() => {
    loadFaculty();
  }, [search, activeFilter]);

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const dept = activeFilter === 'All' ? undefined : activeFilter;
      const data = await facultyService.getAllFaculty(search, dept);
      setFacultyList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load Details when a card is clicked
  const openProfile = async (id: string) => {
    setSelectedFacultyId(id);
    setProfileData(null); // Clear previous data
    try {
      const data = await facultyService.getFacultyProfile(id);
      setProfileData(data);
    } catch (err) {
      toast.error("Failed to load profile");
      setSelectedFacultyId(null);
    }
  };

  // Helper to safely combine qualifications
  const getQualifications = (info: any) => {
    if (!info) return [];
    return [
      ...(info.phd_details || []),
      ...(info.pg_details || []),
      ...(info.ug_details || [])
    ];
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10">
           <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-black tracking-tight">All Faculty</h1>
              {/* Removed top right Search icon here */}
           </div>

           {/* Search Bar */}
           <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-xl flex items-center px-3 py-2.5">
                 <Search size={16} className="text-gray-400 mr-2" />
                 <input 
                   placeholder="Search faculty..." 
                   className="w-full text-sm font-bold text-gray-700 outline-none"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="bg-[#6b1010] text-white px-4 rounded-xl flex items-center gap-2 text-xs font-bold border border-white/20"
              >
                <Filter size={14} /> Filter
              </button>
           </div>
        </div>

        {/* --- FACULTY LIST --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 scrollbar-hide bg-[#F2F2F2]">
           {loading && <p className="text-center text-gray-400 text-xs mt-10">Loading Faculty...</p>}
           
           {!loading && facultyList.map((fac) => (
             <div 
               key={fac.faculty_id} 
               onClick={() => openProfile(fac.faculty_id)}
               className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative active:scale-[0.98] transition-transform cursor-pointer"
             >
                <div className="flex items-start gap-3">
                   <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={fac.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-[#8C1515] font-black text-sm leading-tight">{fac.name}</h3>
                      <p className="text-gray-500 text-[10px] font-bold">{fac.department} Dept.</p>
                      
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {fac.domains.slice(0, 2).map(d => (
                           <span key={d} className="bg-[#8C1515] text-white px-2 py-0.5 rounded-full text-[8px] font-bold">
                             {d}
                           </span>
                        ))}
                      </div>
                   </div>
                   <ChevronDown size={16} className="text-gray-300 mt-1" />
                </div>

                {/* Status Dot */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
                   <div className={`w-2 h-2 rounded-full ${fac.status === 'Available' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                   <span className="text-[10px] font-bold text-gray-400">{fac.status}</span>
                </div>
             </div>
           ))}
           <div className="h-10"></div>
        </div>

        {/* --- FILTER BOTTOM SHEET --- */}
        {isFilterOpen && (
           <div className="absolute inset-0 bg-black/60 z-40 flex items-end">
              <div className="bg-white w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-gray-800">Filter By</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Department</label>
                       <div className="flex flex-wrap gap-2">
                          {departments.map(dept => (
                             <button 
                               key={dept}
                               onClick={() => setActiveFilter(dept)}
                               className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                                 activeFilter === dept ? 'bg-[#8C1515] text-white border-[#8C1515]' : 'bg-white text-gray-600 border-gray-200'
                               }`}
                             >
                               {dept}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => setIsFilterOpen(false)}
                   className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase mt-8 shadow-lg"
                 >
                   Apply Filters
                 </button>
              </div>
           </div>
        )}

        {/* --- DETAIL PROFILE MODAL (FULL SCREEN OVERLAY) --- */}
        {selectedFacultyId && (
          <div className="absolute inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              
              {/* Modal Header */}
              <div className="relative h-40 bg-[#F9F9F9] flex justify-center items-end pb-0 border-b border-gray-100">
                 <button 
                   onClick={() => setSelectedFacultyId(null)} 
                   className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500"
                 >
                    <X size={20} />
                 </button>
                 <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                    <img 
                       src={profileData?.info.profile_picture || "https://avatar.iran.liara.run/public/boy"} 
                       className="w-full h-full object-cover" 
                    />
                 </div>
              </div>

              {/* Profile Content */}
              {profileData ? (
                 <div className="px-6 pt-12 pb-10 text-center">
                    
                    {/* Name & Title */}
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{profileData.info.name}</h2>
                    <p className="text-xs font-bold text-[#8C1515] mt-1">{profileData.info.designation}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{profileData.info.department}</p>
                    
                    {/* Tags (Qualifications) */}
                    <div className="flex justify-center flex-wrap gap-2 mt-3 mb-5">
                       {getQualifications(profileData.info).map((q, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold">
                             {q}
                          </span>
                       ))}
                    </div>

                    {/* Contact Info Cards */}
                    <div className="space-y-2 mb-6">
                       <div className="border border-red-100 bg-red-50/50 rounded-xl p-3 flex items-center gap-3">
                          <Mail size={16} className="text-[#8C1515]" />
                          <span className="text-xs font-bold text-[#8C1515]">{profileData.info.email}</span>
                       </div>
                       <div className="border border-gray-100 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                          <MapPin size={16} className="text-gray-500" />
                          <div className="text-left">
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Cabin Location</p>
                             <p className="text-xs font-bold text-gray-700">
                               {profileData.info.cabin_block || ""} {profileData.info.cabin_floor ? `, Floor ${profileData.info.cabin_floor}` : ""} {profileData.info.cabin_number || ""}
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Research Interests */}
                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Research Interests</h3>
                       <div className="flex flex-wrap gap-2">
                          {profileData.info.interests.map(int => (
                             <span key={int} className="border border-[#8C1515] text-[#8C1515] px-3 py-1.5 rounded-full text-[10px] font-bold">
                                {int}
                             </span>
                          ))}
                       </div>
                    </div>

                    {/* Current Openings */}
                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Current Openings</h3>
                       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {profileData.openings.length === 0 && <p className="text-xs text-gray-400">No current openings.</p>}
                          {profileData.openings.map(op => (
                             <div key={op.id} className="min-w-[200px] bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{op.type}</p>
                                <h4 className="font-bold text-sm text-gray-800 leading-tight mb-2">{op.title}</h4>
                                <button className="text-[#8C1515] text-[10px] font-black underline">View Details</button>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    {/* Previous Work */}
                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Previous Work</h3>
                       <div className="space-y-3">
                          {profileData.previous_work.map((work, i) => (
                             <div key={i} className="flex gap-3 items-start">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                <div>
                                   <p className="text-xs font-bold text-gray-800 leading-tight">{work.title}</p>
                                   <p className="text-[10px] text-gray-400 font-medium">({work.type})</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="h-10"></div>
                 </div>
              ) : (
                 <div className="flex justify-center items-center h-40">
                    <p className="text-xs font-bold text-gray-400 animate-pulse">Loading Profile...</p>
                 </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}