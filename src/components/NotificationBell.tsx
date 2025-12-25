"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationService, NotificationItem } from '@/services/notificationService';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    loadNotifications();
    // Optional: Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationService.markRead(id);
    // Optimistic update
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        <Bell size={24} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 text-[#8C1515] text-[9px] font-black rounded-full flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#8C1515] p-3 text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Notifications</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{unreadCount} New</span>
            </div>
            
            <div className="max-h-64 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-xs font-bold">No new notifications</div>
                )}
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-3 border-b border-gray-50 flex gap-3 ${notif.is_read ? 'bg-white' : 'bg-red-50'}`}>
                        <div className="mt-1 w-2 h-2 rounded-full bg-[#8C1515] flex-shrink-0" style={{opacity: notif.is_read ? 0 : 1}}></div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-800 font-medium leading-tight">{notif.message}</p>
                            <p className="text-[9px] text-gray-400 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                        </div>
                        {!notif.is_read && (
                            <button onClick={() => handleMarkRead(notif.id)} className="text-gray-300 hover:text-[#8C1515]">
                                <Check size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}