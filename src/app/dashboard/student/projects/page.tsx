"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, RefreshCw, Calendar, FolderOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { dashboardService, ApplicationItem } from '@/services/studentDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function TrackOpeningsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStudentApplications();
      setApplications(data);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get Status Styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
            <CheckCircle size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-wider">Shortlisted</span>
          </div>
        );
      case 'Rejected':
        return (
          <div className="bg-red-50 text-red-500 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-red-100">
            <XCircle size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-wider">Rejected</span>
          </div>
        );
      default: // Pending
        return (
          <div className="bg-[#FFF8E1] text-[#D4AF37] px-3 py-1 rounded-lg flex items-center gap-1.5 border border-[#FFE082]">
            <Clock size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
          </div>
        );
    }
  };

  return (
    // --- MAIN CONTAINER (Full Screen Mobile) ---
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans">
      <Toaster position="top-center" />

        {/* --- HEADER (Sticky) --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-black tracking-tight">Track Openings</h1>
           </div>
           <button onClick={loadApplications} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
             <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
           </button>
        </div>

        {/* --- CONTENT SCROLL AREA --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
           
           {loading ? (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400 gap-2">
                 <RefreshCw className="animate-spin text-[#8C1515]" />
                 <p className="text-xs font-bold">Loading Status...</p>
              </div>
           ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                 <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                    <FolderOpen size={40} className="text-gray-300" />
                 </div>
                 <h3 className="text-sm font-black text-gray-600">No Applications Yet</h3>
                 <p className="text-[10px] font-bold text-gray-400 mt-1">Start applying to projects!</p>
                 <button onClick={() => router.push('/dashboard/student')} className="mt-4 bg-[#8C1515] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase shadow-md">Browse Openings</button>
              </div>
           ) : (
              applications.map((app) => (
                 <div key={app.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden group">
                    
                    {/* Status Badge (Top Right) */}
                    <div className="absolute top-4 right-4">
                       {getStatusBadge(app.status)}
                    </div>

                    {/* Project Details */}
                    <div className="pr-20"> {/* Padding right to avoid overlap with badge */}
                       <h3 className="font-black text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{app.title}</h3>
                       <div className="flex items-center gap-1.5 text-gray-400 mt-2">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold">Applied: {app.applied_date}</span>
                       </div>
                    </div>

                    {/* Faculty Info */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                       <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                          <img src={app.faculty_pic || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-800">{app.faculty_name}</p>
                          <p className="text-[9px] font-bold text-gray-400">{app.department}</p>
                       </div>
                    </div>

                 </div>
              ))
           )}
           <div className="h-10"></div>
        </div>

    </div>
  );
}