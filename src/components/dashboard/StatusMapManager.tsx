"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Clock, Sparkles, Navigation, RefreshCw } from 'lucide-react';
import { locatorService } from '@/services/locatorService';
import InteractiveMap from '@/components/interactiveMap';
import toast from 'react-hot-toast';

export default function StatusMapManager({ facultyId }: { facultyId: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [facultyId]);

  const loadData = async () => {
    try {
      const res = await locatorService.getFacultyLocation(facultyId);
      setData(res);
    } catch (error) {
      console.error("Failed to load locator data", error);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await locatorService.updateStatus(facultyId, newStatus, 'Manual');
      setData((prev: any) => ({
        ...prev,
        status: { ...prev.status, current: newStatus, source: 'Manual' }
      }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-4 text-xs text-gray-400 animate-pulse">Loading Live Status...</div>;
  if (!data) return null;

  const currentStatus = data.status?.current || 'Available';
  const location = data.location || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      
      {/* 1. LIVE STATUS CONTROLLER */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <h3 className="text-[#8C1515] font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={16} /> Live Availability
        </h3>
        
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
             currentStatus === 'Available' ? 'bg-green-100 text-green-600' :
             currentStatus === 'Busy' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
          }`}>
             {currentStatus === 'Available' ? <CheckCircle /> : <Clock />}
          </div>
          <div>
             <p className="text-xs text-gray-400 font-bold uppercase">Current Status</p>
             <h2 className="text-xl font-black text-gray-800">{currentStatus}</h2>
             <p className="text-[10px] text-gray-400 font-medium">via {data.status?.source}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
           {['Available', 'Busy', 'In Class'].map((status) => (
             <button
               key={status}
               onClick={() => changeStatus(status)}
               disabled={updating || currentStatus === status}
               className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${
                 currentStatus === status 
                   ? 'bg-gray-800 text-white shadow-lg scale-[1.02]' 
                   : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
               }`}
             >
               {status}
             </button>
           ))}
        </div>
      </div>

      
    </div>
  );
}