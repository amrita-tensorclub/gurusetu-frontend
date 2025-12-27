"use client";

import React, { useState } from 'react';
import { Camera, Mail, Clock, MapPin, Edit2, ChevronRight, Plus, X, Phone, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function FacultyProfilePage() {
  // Local state for dynamic tags
  const [ugTags, setUgTags] = useState(['B.Tech in CSE, Amrita Vishwa Vidyapeetham, 2010']);
  const [pgTags, setPgTags] = useState(['M.Tech in CS, IIT Madras, 2012']);
  const [phdTags, setPhdTags] = useState(['PhD in AI, IISc Bangalore, 2018']);

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

      <div className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img src="/faculty-placeholder.jpg" alt="Dr. Rajesh Kumar" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-0 right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-100 text-[#8C1515]">
                    <Camera size={14} />
                </button>
            </div>
            <h2 className="text-xl font-black text-gray-800 mt-3">Dr. Rajesh Kumar</h2>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <FloatingInput label="Designation" defaultValue="Assistant Professor" icon={<ChevronDown size={16} />} />
          <FloatingInput label="Department" defaultValue="Computer Science & Engineering" icon={<ChevronDown size={16} />} />
          
          <div className="relative border border-gray-200 rounded-xl p-3 flex items-center bg-white">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-[#8C1515]">Email</label>
            <input className="w-full bg-transparent outline-none text-sm font-semibold text-gray-700" defaultValue="rajesh.kumar@amrita.edu" />
            <Mail size={16} className="text-[#8C1515]" />
          </div>

          <FloatingInput label="Phone Number" placeholder="Enter phone number" />

          <div className="relative border border-gray-200 rounded-xl p-3 flex items-center bg-white">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-[#8C1515]">Office Hours</label>
            <input className="w-full bg-transparent outline-none text-sm font-semibold text-gray-700" defaultValue="Mon, Wed, Fri: 2 PM - 4 PM" />
            <Clock size={16} className="text-[#8C1515]" />
          </div>
          
          {/* Cabin Location Component */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3 text-[#8C1515]">
                <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="font-bold text-xs">Cabin Location</span>
                </div>
                <ChevronDown size={16} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Block (A/B/C/D)', val: 'B', type: 'select' },
                { label: 'Floor (0-5)', val: '2', type: 'input' },
                { label: 'Cabin Number', val: 'B-205', type: 'input' }
              ].map((item, i) => (
                <div key={item.label} className="relative border border-gray-100 rounded-lg p-2 bg-gray-50/30">
                  <label className="absolute -top-2 left-1 bg-white px-1 text-[7px] font-bold text-gray-400 uppercase">{item.label}</label>
                  <div className="flex items-center justify-between">
                    <input defaultValue={item.val} className="w-full text-[11px] font-bold outline-none bg-transparent" />
                    {item.type === 'select' && <ChevronDown size={10} className="text-gray-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Qualifications Section */}
        <div className="space-y-4 pt-2">
            <h3 className="font-black text-[#8C1515] text-sm tracking-tight">Qualifications</h3>
            
            <QualificationGroup title="UG Details" tags={ugTags} setTags={setUgTags} />
            <QualificationGroup title="PG Details" tags={pgTags} setTags={setPgTags} />
            <QualificationGroup title="PhD Details" tags={phdTags} setTags={setPhdTags} />
        </div>

        <button className="w-full bg-[#8C1515] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-4">
          Save Changes
        </button>
        
        <Link href="/dashboard/faculty/profile/research" className="flex items-center justify-center gap-2 text-[#8C1515] font-black text-[11px] uppercase tracking-widest mt-4">
          Next: Add Research Details →
        </Link>
      </div>
    </div>
  );
}

// Sub-component for Inputs with Floating Labels
function FloatingInput({ label, defaultValue, placeholder, icon }: any) {
    return (
        <div className="relative border border-gray-200 rounded-xl p-3 flex items-center bg-white shadow-sm">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-gray-400">{label}</label>
            <input 
                className="w-full bg-transparent outline-none text-sm font-semibold text-gray-700 placeholder:text-gray-300" 
                defaultValue={defaultValue} 
                placeholder={placeholder}
            />
            {icon && <div className="text-gray-400">{icon}</div>}
        </div>
    );
}

// Sub-component for Qualification Chip Groups
function QualificationGroup({ title, tags, setTags }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700">{title}</span>
                <button className="bg-[#8C1515] text-white p-0.5 rounded shadow-sm hover:bg-[#a31a1a]">
                    <Plus size={14} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full group">
                        <span className="text-[10px] font-medium text-gray-600 leading-none">{tag}</span>
                        <X 
                            size={12} 
                            className="text-gray-300 cursor-pointer hover:text-red-500" 
                            onClick={() => setTags(tags.filter((_: any, i: number) => i !== index))}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}