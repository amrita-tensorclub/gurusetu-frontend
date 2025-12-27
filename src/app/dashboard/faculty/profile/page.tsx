'use client';

import React, { useState } from 'react';
import { Camera, Mail, Clock, MapPin, Edit2, ChevronRight, Calendar, User, LogOut, CheckCircle, X } from 'lucide-react';

// --- YOUR MOCK TIMETABLE DATA ---
// (In a real app, you might define an interface for this in TypeScript)
const MOCK_TIMETABLE = [
    { day: 'Monday', start: '09:00', end: '10:00', activity: 'Class (CS302)' },
    { day: 'Monday', start: '14:00', end: '16:00', activity: 'Lab (CS304)' },
    { day: 'Tuesday', start: '11:00', end: '12:00', activity: 'Office Hours' },
    { day: 'Wednesday', start: '09:00', end: '10:00', activity: 'Class (CS302)' },
    { day: 'Friday', start: '10:00', end: '11:00', activity: 'Dept Meeting' },
];

export default function FacultyProfilePage() {
  const [status, setStatus] = useState("Available");

  // YOUR FUNCTION: Handle status updates
  const handleStatusChange = async (newStatus: string) => {
      setStatus(newStatus);
      // In real app: await fetch(...)
      alert(`Status updated to: ${newStatus}`);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20 shadow-sm border-x border-gray-100 font-sans">
      
      {/* --- FRIEND'S HEADER --- */}
      <div className="bg-[#8C1515] text-white p-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <ChevronRight className="rotate-180 cursor-pointer" onClick={() => window.history.back()} />
          <h1 className="text-lg font-bold">Faculty Dashboard</h1>
        </div>
        <Edit2 size={18} className="cursor-pointer" />
      </div>

      <div className="p-6 space-y-7">
        
        {/* --- FRIEND'S AVATAR --- */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
             {/* Placeholder image in case file is missing */}
            <img src="https://placehold.co/400x400" alt="Dr. Rajesh Kumar" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 text-[#8C1515]">
            <Camera size={16} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Dr. Rajesh Kumar</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Computer Science Dept</p>
        </div>

        {/* --- YOUR FEATURE: STATUS TOGGLE (Injected Here) --- */}
        <div className="bg-[#8C1515]/5 rounded-3xl p-5 border border-[#8C1515]/10">
            <div className="flex items-center gap-2 mb-3 text-[#8C1515]">
                <Clock size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Live Status</span>
            </div>
            <div className="flex gap-2">
                {['Available', 'Busy', 'In Class'].map((s) => (
                    <button 
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${
                            status === s 
                            ? 'bg-[#8C1515] text-white shadow-lg scale-105' 
                            : 'bg-white text-gray-500 border border-white'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>

        {/* --- FRIEND'S FORM FIELDS --- */}
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

        {/* --- YOUR FEATURE: WEEKLY SCHEDULE (Injected Here) --- */}
        <div>
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Calendar size={16} className="text-[#8C1515]" /> My Schedule
            </h3>

            <div className="space-y-3">
                {MOCK_TIMETABLE.map((slot, index) => (
                    <div key={index} className="bg-white p-4 rounded-2xl border-2 border-gray-50 shadow-sm flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-gray-50 w-12 h-12 rounded-xl border border-gray-100">
                            <span className="text-[9px] font-black text-gray-400 uppercase">{slot.day.substring(0,3)}</span>
                            <span className="text-sm font-black text-gray-800 leading-none mt-0.5">{slot.start.split(':')[0]}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-xs truncate">{slot.activity}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1 font-bold">
                                {slot.start} - {slot.end}
                            </div>
                        </div>

                        <div className={`w-2 h-2 rounded-full ${
                            slot.activity.includes('Class') ? 'bg-blue-500' : 
                            slot.activity.includes('Lab') ? 'bg-purple-500' : 'bg-green-500'
                        }`}></div>
                    </div>
                ))}
            </div>
        </div>

        <button className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#8C1515]/20 mt-4 active:scale-95 transition-all">
          Save Changes
        </button>
        
        <a href="/dashboard/faculty/profile/research" className="flex items-center justify-center gap-2 text-[#8C1515] font-black text-[11px] uppercase tracking-widest mt-6">
          Next: Add Research Details →
        </a>
      </div>
    </div>
  );
}