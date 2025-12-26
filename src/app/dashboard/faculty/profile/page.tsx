"use client";

import React from 'react';
import { Camera, Mail, Clock, MapPin, Edit2, ChevronRight, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function FacultyProfilePage() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20 shadow-sm border-x border-gray-100 font-sans">
      {/* Header Bar */}
      <div className="bg-[#8C1515] text-white p-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <ChevronRight className="rotate-180 cursor-pointer" onClick={() => window.history.back()} />
          <h1 className="text-lg font-bold">Faculty Profile</h1>
        </div>
        <Edit2 size={18} className="cursor-pointer" />
      </div>

      <div className="p-6 space-y-7">
        {/* Avatar with Floating Camera Button */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img src="/faculty-placeholder.jpg" alt="Dr. Rajesh Kumar" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 text-[#8C1515]">
            <Camera size={16} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Dr. Rajesh Kumar</h2>
        </div>

        {/* Floating Label Form Fields */}
        <div className="space-y-5">
           <div className="relative border-2 border-gray-100 rounded-2xl p-4 focus-within:border-[#8C1515] transition-all bg-gray-50/20">
            <label className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Designation</label>
            <select className="w-full bg-transparent outline-none text-sm font-bold text-gray-700 appearance-none">
              <option>Assistant Professor</option>
            </select>
          </div>

          <div className="relative border-2 border-gray-100 rounded-2xl p-4 flex items-center bg-gray-50/20">
            <label className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
            <input className="w-full bg-transparent outline-none text-sm font-bold text-gray-700" defaultValue="rajesh.kumar@amrita.edu" />
            <Mail size={18} className="text-[#8C1515]" />
          </div>
          
          {/* Cabin Location Component */}
          <div className="bg-[#8C1515]/5 rounded-3xl p-5 border border-[#8C1515]/10">
            <div className="flex items-center gap-2 mb-4 text-[#8C1515]">
              <MapPin size={18} />
              <span className="font-bold text-xs uppercase tracking-wider">Cabin Location</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Block', 'Floor', 'Number'].map((label, i) => (
                <div key={label} className="relative border-2 border-white rounded-xl p-3 bg-white shadow-sm">
                  <label className="absolute -top-2 left-2 bg-white px-1 text-[8px] font-black text-gray-400 uppercase">{label}</label>
                  <input defaultValue={i === 0 ? 'B' : i === 1 ? '2' : 'B-205'} className="w-full text-xs font-bold outline-none" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#8C1515]/20 mt-4 active:scale-95 transition-all">
          Save Changes
        </button>
        
        <Link href="/dashboard/faculty/profile/research" className="flex items-center justify-center gap-2 text-[#8C1515] font-black text-[11px] uppercase tracking-widest mt-6">
          Next: Add Research Details →
        </Link>
      </div>
    </div>
  );
}