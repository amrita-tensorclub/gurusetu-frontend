"use client";

import React, { useState } from 'react';
import { Search, MapPin, GraduationCap, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';

// Mock data based on your UI requirements
const facultyList = [
  {
    id: "f1",
    name: "Dr. Rajesh Kumar",
    department: "Computer Science & Engineering",
    specialization: "Artificial Intelligence & ML",
    projects: 5,
    location: "Ettimadai Campus",
    avatar: null
  },
  {
    id: "f2",
    name: "Prof. Meera Reddy",
    department: "Electrical & Electronics",
    specialization: "Renewable Energy & IoT",
    projects: 3,
    location: "Ettimadai Campus",
    avatar: null
  },
  {
    id: "f3",
    name: "Dr. Anand Sharma",
    department: "Cybersecurity",
    specialization: "Blockchain & Fintech",
    projects: 4,
    location: "Amritapuri Campus",
    avatar: null
  }
];

export default function FacultySearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Find Faculty Mentors</h1>
        <p className="text-gray-500 text-sm">Discover professors and research leads across departments.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name or research area..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:border-[#8C1515] outline-none transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:bg-gray-50 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facultyList.map((faculty) => (
          <Link 
            key={faculty.id} 
            href={`/dashboard/student/faculty/${faculty.id}`}
            className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-lg transition-all group active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-[#8C1515] font-bold text-xl border-2 border-gray-50">
                {faculty.name.charAt(4)}
              </div>
              <div className="bg-[#8C1515]/10 text-[#8C1515] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {faculty.projects} Openings
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#8C1515] transition-colors">
                {faculty.name}
              </h3>
              <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                {faculty.department}
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <GraduationCap size={14} className="text-[#8C1515]" />
                <span>{faculty.specialization}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <MapPin size={14} className="text-[#8C1515]" />
                <span>{faculty.location}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[#8C1515] font-bold text-sm">
              View Profile
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}