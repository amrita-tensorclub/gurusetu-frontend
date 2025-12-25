"use client";

import React from 'react';
import { ChevronRight, Check, Plus, Edit3, Trash2, X } from 'lucide-react';

export default function ResearchExperiencePage() {
  const domains = ["Artificial Intelligence", "Robotics", "Embedded Systems", "Data Science", "Machine Learning"];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20 font-sans">
      <div className="bg-[#8C1515] text-white p-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <ChevronRight className="rotate-180 cursor-pointer" />
          <h1 className="text-lg font-bold tracking-tight">Research & Experience</h1>
        </div>
        <Check size={22} className="cursor-pointer font-bold" />
      </div>

      <div className="p-6 space-y-9">
        {/* Domain Interests Tags */}
        <div className="space-y-5">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Domain Interests</h2>
          <div className="flex flex-wrap gap-2">
            {domains.map(domain => (
              <span key={domain} className="bg-[#8C1515] text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-sm uppercase tracking-wider">
                {domain} <X size={14} className="cursor-pointer opacity-70" />
              </span>
            ))}
            <span className="text-gray-400 text-xs font-black pt-2 ml-1 tracking-tighter">5/8</span>
          </div>
          <button className="w-full border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8C1515]/5 transition-colors">
            <Plus size={18} /> Add Domain
          </button>
        </div>

        {/* Current R&D Openings - Matching the Nested Box Design */}
        <div className="space-y-5">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Current R&D Openings</h2>
          <div className="border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 p-5 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ChevronRight className="rotate-90 text-gray-600" size={20} strokeWidth={3} />
                <span className="font-black text-xs text-gray-800 uppercase tracking-tight">AI-Driven Healthcare...</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#D4AF37] text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">7 Applicants</span>
                <Edit3 size={18} className="text-[#8C1515] cursor-pointer" />
                <Trash2 size={18} className="text-[#8C1515] cursor-pointer" />
              </div>
            </div>
            {/* Expanded Content Area */}
            <div className="p-6 space-y-5 bg-white">
              <div>
                <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-2">Project Title</p>
                <p className="font-bold text-gray-800 text-sm">Smart Campus IoT Network</p>
              </div>
              <div>
                <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-2">Description (300 chars)</p>
                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 text-xs leading-relaxed font-medium text-gray-600">
                  Develop an IoT network for real-time energy monitoring across campus buildings using ESP32 sensors and cloud platform.
                </div>
                <p className="text-right text-[9px] font-black text-gray-300 mt-2 uppercase tracking-tighter">150/300</p>
              </div>
            </div>
          </div>
          <button className="w-full border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8C1515]/5 transition-colors">
            <Plus size={18} /> Post New Opening
          </button>
        </div>

        {/* Timeline-style Publications Section */}
        <div className="space-y-6">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Previous Work & Publications</h2>
          <div className="space-y-8 relative ml-3 border-l-2 border-[#8C1515]/20 pl-7">
            {[2023, 2022].map((year) => (
              <div key={year} className="relative">
                <div className="absolute -left-[35px] top-1.5 w-3.5 h-3.5 bg-[#8C1515] rounded-full border-[3px] border-white shadow-sm shadow-[#8C1515]/40" />
                <div className="flex justify-between items-start gap-4">
                  <p className="text-xs font-bold text-gray-800 leading-snug">
                    <span className="text-gray-400 font-black mr-3 tracking-tighter">{year}</span> 
                    {year === 2023 ? "Efficient Energy Management in Smart Buildings (Publication)" : "Secure Data Sharing using Blockchain (Project)"}
                  </p>
                  <div className="flex gap-3 pt-1">
                     <Edit3 size={15} className="text-[#8C1515] cursor-pointer" />
                     <Trash2 size={15} className="text-[#8C1515] cursor-pointer" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-medium mt-2 leading-relaxed">
                  Collaborators: Dr. A. Sharma, Mr. P. Verma, Prof. M. Reddy
                </p>
              </div>
            ))}
          </div>
          <button className="w-full border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:bg-[#8C1515]/5 transition-colors">
            <Plus size={18} /> Add Work
          </button>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 bg-[#8C1515] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#8C1515]/40 active:scale-95 transition-all z-30">
          Save All
        </button>
      </div>
    </div>
  );
}