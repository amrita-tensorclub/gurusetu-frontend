"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Bell, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notificationService, NotificationItem } from '@/services/notificationService';
import { facultyDashboardService, StudentPublicProfile, FacultyProfile } from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Profile Modal States ---
  const [studentProfile, setStudentProfile] = useState<StudentPublicProfile | null>(null);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  // --- OPEN PROFILE LOGIC ---
  const handleProfileClick = async (id: string, role: string) => {
    setIsModalOpen(true);
    setStudentProfile(null);
    setFacultyProfile(null);

    try {
      // Check role case-insensitively
      if (role && role.toLowerCase() === 'student') {
        const data = await facultyDashboardService.getStudentProfile(id);
        setStudentProfile(data);
      } else {
        const data = await facultyDashboardService.getFacultyProfile(id);
        setFacultyProfile(data);
      }
    } catch (err) {
      toast.error("Could not load profile");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-sans">
      <Toaster position="top-center" />

        {/* --- HEADER (Sticky) --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 flex items-center gap-3">
           <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
           <h1 className="text-xl font-black tracking-tight flex-1">Notifications</h1>
           <Bell size={20} />
        </div>

        {/* --- LIST --- */}
        <div className="flex-1 overflow-y-auto p-0 pb-10 scrollbar-hide bg-white">
           {loading && <p className="text-center p-6 text-xs text-gray-400">Loading...</p>}
           
           {!loading && notifications.length === 0 && (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Bell size={40} className="mb-2 opacity-20" />
               <p className="text-xs font-bold">No notifications yet</p>
             </div>
           )}

           {notifications.map((notif) => (
             <div 
               key={notif.id} 
               className={`p-4 border-b border-gray-100 flex gap-3 transition-colors ${notif.is_read ? 'bg-white' : 'bg-red-50'}`}
             >
                {/* Clickable Avatar */}
                <div 
                  onClick={() => notif.trigger_id && handleProfileClick(notif.trigger_id, notif.trigger_role || 'faculty')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.trigger_id ? 'cursor-pointer hover:ring-2 ring-[#8C1515] bg-gray-200' : 'bg-[#8C1515]/10'}`}
                >
                   {notif.trigger_id ? (
                     <img src="https://avatar.iran.liara.run/public" className="w-full h-full rounded-full object-cover" />
                   ) : (
                     <Bell size={18} className="text-[#8C1515]" />
                   )}
                </div>

                <div className="flex-1">
                   <p className="text-sm text-gray-800 font-medium leading-tight mb-1">
                     {notif.message}
                   </p>
                   
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(notif.date).toLocaleDateString()} • {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                   </div>
                </div>

                {!notif.is_read && (
                    <button onClick={() => handleMarkRead(notif.id)} className="self-center text-gray-300 hover:text-[#8C1515]">
                        <Check size={16} />
                    </button>
                )}
             </div>
           ))}
        </div>

        {/* --- PROFILE MODAL OVERLAY --- */}
        {isModalOpen && (
           <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
              <div className="bg-white w-full h-[85%] sm:h-[90%] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden relative animate-in slide-in-from-bottom duration-300 flex flex-col">
                 
                 {/* Header */}
                 <div className="bg-[#8C1515] h-32 relative flex-shrink-0">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white hover:bg-white/30">
                       <X size={20} />
                    </button>
                 </div>

                 {/* Profile Pic */}
                 <div className="-mt-12 flex justify-center mb-2">
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                       <img src="https://avatar.iran.liara.run/public" className="w-full h-full object-cover" />
                    </div>
                 </div>

                 {/* Scrollable Content */}
                 <div className="flex-1 overflow-y-auto px-6 pb-8 text-center scrollbar-hide">
                    
                    {/* --- STUDENT VIEW --- */}
                    {studentProfile && (
                       <>
                          <h2 className="text-xl font-black text-gray-900">{studentProfile.info.name}</h2>
                          <p className="text-xs font-bold text-[#8C1515] mt-1">{studentProfile.info.roll_no}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{studentProfile.info.department} | {studentProfile.info.batch}</p>
                          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{studentProfile.info.bio}</p>

                          <div className="flex flex-wrap gap-2 justify-center mt-4">
                             {studentProfile.info.skills.map(s => (
                               <span key={s} className="bg-red-50 text-[#8C1515] px-2 py-1 rounded-md text-[10px] font-bold">{s}</span>
                             ))}
                          </div>

                          <div className="mt-6 text-left p-4 bg-gray-50 rounded-xl">
                             <h3 className="text-[#8C1515] font-black text-xs uppercase mb-2">Projects</h3>
                             {studentProfile.projects.map((p, i) => (
                               <div key={i} className="mb-3 last:mb-0">
                                  <p className="font-bold text-sm">{p.title}</p>
                                  <p className="text-[10px] text-gray-500">{p.description}</p>
                               </div>
                             ))}
                          </div>
                       </>
                    )}

                    {/* --- FACULTY VIEW --- */}
                    {facultyProfile && (
                       <>
                          <h2 className="text-xl font-black text-gray-900">{facultyProfile.info.name}</h2>
                          <p className="text-xs font-bold text-[#8C1515] mt-1">{facultyProfile.info.designation}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{facultyProfile.info.department}</p>
                          
                          <div className="mt-6 text-left">
                             <h3 className="text-[#8C1515] font-black text-xs uppercase mb-2">Current Openings</h3>
                             {facultyProfile.openings.map(op => (
                                <div key={op.id} className="bg-white border border-gray-200 p-3 rounded-xl mb-2 shadow-sm">
                                   <p className="font-bold text-sm text-gray-800">{op.title}</p>
                                   <p className="text-[10px] text-gray-500">{op.type}</p>
                                </div>
                             ))}
                          </div>
                       </>
                    )}

                    {/* Loading State */}
                    {!studentProfile && !facultyProfile && (
                       <p className="text-center text-gray-400 text-xs font-bold mt-10">Loading Profile Details...</p>
                    )}
                 </div>
              </div>
           </div>
        )}

    </div>
  );
}