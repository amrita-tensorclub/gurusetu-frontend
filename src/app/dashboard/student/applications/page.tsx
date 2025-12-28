"use client";

import React from 'react';
import { Clock, Calendar, MessageSquare, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const myApplications = [
  {
    id: "ap1",
    projectTitle: "AI-Driven Medical Imaging for Early Diagnosis",
    faculty: "Dr. Rajesh Kumar",
    dateApplied: "Dec 20, 2025",
    status: "Interview Scheduled",
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "ap2",
    projectTitle: "Smart Grid Optimization using IoT",
    faculty: "Prof. Meera Reddy",
    dateApplied: "Dec 22, 2025",
    status: "Pending",
    color: "bg-amber-100 text-amber-600"
  }
];

export default function ApplicationsPage() {
  const router = useRouter();

  return (
    // --- Full Screen Mobile Container ---
    <div className="min-h-screen bg-[#F9F9F9] font-sans flex flex-col">
      
      {/* --- Sticky Header --- */}
      <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 flex items-center gap-4">
         <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
         </button>
         <h1 className="text-xl font-black tracking-tight">My Applications</h1>
      </div>

      {/* --- Scrollable Content --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
        
        <div className="px-2">
           <p className="text-xs text-gray-500 font-bold">Track the status of your research requests.</p>
        </div>

        <div className="space-y-4">
          {myApplications.map((app) => (
            <div key={app.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
              
              {/* Top Row: Status & Title */}
              <div className="space-y-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.color}`}>
                  {app.status}
                </span>
                <h3 className="text-lg font-black text-gray-800 leading-tight mt-1">
                  {app.projectTitle}
                </h3>
              </div>

              {/* Details */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-600">
                   Mentor: <span className="text-gray-800">{app.faculty}</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                   <Clock size={12}/> Applied: {app.dateApplied}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                {app.status === "Interview Scheduled" ? (
                  <button className="flex items-center justify-center gap-2 bg-[#8C1515] text-white py-2.5 rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95 transition-transform">
                    <Calendar size={14}/> Schedule
                  </button>
                ) : (
                  // Empty placeholder to keep alignment if needed, or you can span the Contact button
                  <div className="hidden"></div>
                )}
                
                <button 
                  className={`flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-[10px] font-black uppercase border border-gray-100 active:scale-95 transition-transform hover:bg-gray-100 ${app.status !== "Interview Scheduled" ? "col-span-2" : ""}`}
                >
                  <MessageSquare size={14}/> Contact
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}