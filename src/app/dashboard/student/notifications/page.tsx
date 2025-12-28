"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Bell, Check, Info, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { dashboardService, NotificationItem } from '@/services/studentDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await dashboardService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      // Optimistic update: Update UI immediately
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      
      // Call backend
      await dashboardService.markNotificationRead(id);
    } catch (err) {
      console.error("Failed to mark read");
    }
  };

  // Helper to get icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'StatusUpdate': return <Info size={20} className="text-blue-500" />;
      case 'Application': return <CheckCircle size={20} className="text-green-500" />;
      case 'Reject': return <XCircle size={20} className="text-red-500" />;
      default: return <Bell size={20} className="text-[#8C1515]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* HEADER */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex items-center gap-4">
           <button onClick={() => router.back()} className="p-1"><ChevronLeft size={24} /></button>
           <h1 className="text-lg font-black tracking-tight">Notifications</h1>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10">
           {loading ? (
              <p className="text-center text-xs text-gray-400 mt-10">Loading...</p>
           ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                 <Bell size={40} className="mb-3 opacity-20" />
                 <p className="text-xs font-bold">No notifications yet.</p>
              </div>
           ) : (
              notifications.map((notif) => (
                 <div 
                    key={notif.id} 
                    onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all flex gap-3 ${
                       notif.is_read 
                       ? 'bg-gray-50 border-gray-100 opacity-60' 
                       : 'bg-white border-gray-200 shadow-sm cursor-pointer hover:border-[#8C1515]'
                    }`}
                 >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.is_read ? 'bg-gray-200' : 'bg-red-50'}`}>
                       {getIcon(notif.type)}
                    </div>
                    
                    <div className="flex-1">
                       <p className={`text-xs ${notif.is_read ? 'font-medium text-gray-500' : 'font-black text-gray-800'}`}>
                          {notif.message}
                       </p>
                       <p className="text-[10px] text-gray-400 font-bold mt-1">
                          {new Date(notif.date).toLocaleDateString()}
                       </p>
                    </div>

                    {!notif.is_read && (
                       <div className="w-2 h-2 rounded-full bg-[#8C1515] mt-2"></div>
                    )}
                 </div>
              ))
           )}
        </div>

      </div>
    </div>
  );
}