"use client";

import React from 'react';
import { ChevronLeft, Check, Plus, Edit2, Trash2, X, Calendar } from 'lucide-react';

export default function StudentExperiencePage() {
  const interests = ["Machine Learning", "IoT", "Blockchain", "Data Science", "Cybersecurity", "Artificial Intelligence"];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20 font-sans shadow-sm border-x border-gray-100">
      <div className="bg-[#8C1515] text-white p-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <ChevronLeft className="cursor-pointer" onClick={() => window.history.back()} />
          <h1 className="text-lg font-bold tracking-tight text-white">Experience & Interests</h1>
        </div>
        <Check size={22} className="cursor-pointer" />
      </div>

      <div className="p-6 space-y-8">
        {/* Interests Grid */}
        <div className="space-y-4">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Areas of Interest</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map(item => (
              <span key={item} className="border border-[#8C1515] text-[#8C1515] px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 uppercase tracking-wider">
                {item} <X size={14} className="opacity-70" />
              </span>
            ))}
            <span className="text-gray-400 text-xs font-black pt-2 ml-1">6/10</span>
          </div>
          <button className="w-full bg-[#8C1515] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#8C1515]/10">
            <Plus size={18} /> Add Interest
          </button>
        </div>

        {/* Previous Projects Card */}
        <div className="space-y-5">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Previous Projects</h2>
          
          <div className="border border-gray-100 rounded-[2rem] p-6 bg-white shadow-sm space-y-5 relative">
            <div className="flex justify-between items-start">
              <h3 className="font-black text-gray-800 text-sm tracking-tight">Smart Campus IoT System</h3>
              <div className="flex gap-3">
                <Edit2 size={18} className="text-[#8C1515] cursor-pointer" />
                <Trash2 size={18} className="text-[#8C1515] cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative flex-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black text-gray-300 uppercase tracking-widest">Duration</label>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-700">
                    <span>From [Jan 2024]</span>
                    <Calendar size={14} className="text-gray-300" />
                  </div>
               </div>
               <span className="text-[10px] font-black text-gray-300 uppercase">To</span>
               <div className="relative flex-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-700">
                    <span>[May 2024]</span>
                    <Calendar size={14} className="text-gray-300" />
                  </div>
               </div>
            </div>

            <div className="relative border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <label className="absolute -top-2 left-4 bg-white px-1 text-[8px] font-black text-gray-300 uppercase tracking-widest">Brief Description (200 chars)</label>
              <p className="text-[10px] font-bold text-gray-600 leading-relaxed">
                Developed an IoT network for real-time energy monitoring across campus buildings using ESP32 sensors and cloud platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
               {["ESP32", "AWS IoT", "Python", "React"].map(tag => (
                 <span key={tag} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-gray-200 flex items-center gap-2">
                   {tag} <X size={10} />
                 </span>
               ))}
               <button className="bg-gray-50 text-gray-300 px-3 py-1 rounded-full text-[8px] font-black border border-dashed border-gray-200">+ Add Tool</button>
            </div>
          </div>

          {/* Dotted border button matching image_b4897d.jpg */}
          <button className="w-full border-2 border-dashed border-[#8C1515]/30 text-[#8C1515] py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8C1515]/5 transition-all">
            <Plus size={18} /> Add New Project
          </button>
        </div>

        <div className="flex flex-col items-center pt-4">
           <img src="/illustration-student.png" alt="Empty" className="w-32 opacity-80" />
           <p className="text-[10px] font-black text-gray-300 uppercase mt-2">No projects added yet</p>
        </div>

        <button className="fixed bottom-8 right-8 bg-[#8C1515] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all z-30">
          Save
        </button>
      </div>
    </div>
  );
}