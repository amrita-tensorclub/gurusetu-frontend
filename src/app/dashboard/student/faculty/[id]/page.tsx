"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Globe, MapPin, ArrowRight } from 'lucide-react';

export default function FacultyDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Mock Data (Replace with API call later)
  const faculty = {
    name: "Dr. Rajesh Kumar",
    designation: "Associate Professor",
    department: "Computer Science (CSE)",
    image: null, 
    bio: "Specializing in Computer Vision and Deep Learning with a focus on medical diagnostic systems. Leading the 'AI-Med' research group with 12+ published IEEE papers.",
    location: "Ettimadai, AB-2",
    email: "r_kumar@amrita.edu",
    website: "aimed-lab.org",
    openings: [
        { id: 1, title: "AI-Driven Medical Imaging", tags: ["Deep Learning", "Healthcare"], type: "Research Project" },
        { id: 2, title: "NLP for Vernacular Languages", tags: ["NLP", "Transformers"], type: "Capstone" }
    ]
  };

  return (
    // --- Full Screen Mobile Container ---
    <div className="min-h-screen bg-[#F9F9F9] font-sans flex flex-col">
       
       {/* Header (Sticky) */}
       <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h1 className="text-xl font-black tracking-tight">Faculty Profile</h1>
       </div>

       {/* Scrollable Content */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10">
          
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
             {/* Decorative Background Blob */}
             <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-50 to-white"></div>
             
             <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-[#8C1515] text-3xl font-black border-4 border-white shadow-lg mb-4">
                    {faculty.name.split(' ')[1]?.[0] || 'F'}
                </div>
                
                <h2 className="text-xl font-black text-gray-800 leading-tight">{faculty.name}</h2>
                <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest mt-1">{faculty.designation}</p>
                <p className="text-gray-400 text-[10px] font-bold mt-0.5">{faculty.department}</p>

                <div className="mt-4 flex justify-center items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 py-2 px-4 rounded-full mx-auto w-fit">
                    <MapPin size={12} className="text-[#8C1515]"/> {faculty.location}
                </div>

                <p className="text-xs text-gray-500 mt-5 leading-relaxed font-medium px-2">
                    {faculty.bio}
                </p>

                <div className="flex justify-center gap-3 mt-6 border-t border-gray-50 pt-6">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-600 hover:bg-[#8C1515] hover:text-white transition-colors">
                        <Mail size={14} /> Email
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-600 hover:bg-[#8C1515] hover:text-white transition-colors">
                        <Globe size={14} /> Website
                    </button>
                </div>
             </div>
          </div>

          {/* Openings List */}
          <div>
             <h3 className="text-[#8C1515] font-black text-sm uppercase tracking-widest mb-4 pl-1">Active Openings</h3>
             <div className="space-y-4">
                {faculty.openings.map(op => (
                    <div key={op.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-transform">
                       <div className="absolute top-0 right-0 bg-[#8C1515] w-3 h-3 rounded-bl-xl opacity-80"></div>
                       
                       <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                         {op.type}
                       </p>
                       
                       <h4 className="font-black text-sm text-gray-800 mb-3 leading-snug pr-4">{op.title}</h4>
                       
                       <div className="flex gap-2 mb-4">
                          {op.tags.map(t => (
                            <span key={t} className="bg-gray-50 text-gray-500 px-2 py-1 rounded-md text-[9px] font-bold border border-gray-100">{t}</span>
                          ))}
                       </div>
                       
                       <button className="w-full border-2 border-[#8C1515] text-[#8C1515] py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                          View Details <ArrowRight size={12}/>
                       </button>
                    </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}