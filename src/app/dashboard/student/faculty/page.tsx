"use client";

import React, { useState } from 'react';
import { Search, MapPin, GraduationCap, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data (You can replace this with facultyService.getAllFaculty() later if needed)
const facultyList = [
  {
    id: "f1",
    name: "Dr. Rajesh Kumar",
    department: "Computer Science",
    specialization: "AI & Machine Learning",
    projects: 5,
    location: "Ettimadai",
    avatar: null
  },
  {
    id: "f2",
    name: "Prof. Meera Reddy",
    department: "Electrical & Electronics",
    specialization: "Renewable Energy & IoT",
    projects: 3,
    location: "Ettimadai",
    avatar: null
  },
  {
    id: "f3",
    name: "Dr. Anand Sharma",
    department: "Cybersecurity",
    specialization: "Blockchain & Fintech",
    projects: 4,
    location: "Amritapuri",
    avatar: null
  }
];

export default function FacultySearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    // --- Full Screen Mobile Container ---
    <div className="min-h-screen bg-[#F9F9F9] font-sans flex flex-col">
      
      {/* --- HEADER (Sticky) --- */}
      <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 space-y-4">
         
         {/* Title Row */}
         <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
               <ChevronLeft size={24} />
            </button>
            <div>
               <h1 className="text-xl font-black tracking-tight leading-none">Find Mentors</h1>
               <p className="text-white/60 text-[10px] font-bold mt-1">Discover professors & research leads</p>
            </div>
         </div>

         {/* Search Bar (Integrated in Header) */}
         <div className="flex gap-2">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                  type="text"
                  placeholder="Search faculty..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm font-bold text-gray-800 placeholder-gray-400 outline-none shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <button className="bg-[#6b1010] p-2.5 rounded-xl text-white border border-white/20 shadow-sm">
               <Filter size={18} />
            </button>
         </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="flex-1 p-4 pb-10 space-y-4 overflow-y-auto">
        
        {/* Faculty Grid (Single column on mobile) */}
        <div className="grid grid-cols-1 gap-4">
          {facultyList.map((faculty) => (
            <Link 
              key={faculty.id} 
              href={`/dashboard/student/faculty/${faculty.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-transform block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#8C1515] font-black text-lg border-2 border-white shadow-sm">
                      {faculty.name.split(' ')[1]?.[0] || faculty.name[0]}
                    </div>
                    <div>
                        <h3 className="font-black text-gray-800 text-sm leading-tight">
                        {faculty.name}
                        </h3>
                        <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider mt-0.5">
                        {faculty.department}
                        </p>
                    </div>
                </div>
                <div className="bg-red-50 text-[#8C1515] text-[9px] font-black px-2 py-1 rounded-lg uppercase border border-red-100">
                  {faculty.projects} Openings
                </div>
              </div>

              <div className="space-y-2 mb-4 pl-1">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <GraduationCap size={14} className="text-[#8C1515]" />
                  <span>{faculty.specialization}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <MapPin size={14} className="text-[#8C1515]" />
                  <span>{faculty.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[#8C1515] font-black text-xs uppercase tracking-wide">
                View Profile
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
        
      </div>
    </div>
  );
}