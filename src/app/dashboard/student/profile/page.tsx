"use client";

import React, { useState, useEffect } from 'react';
import { Camera, ChevronRight, Save, User, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    department: 'Computer Science (CSE)',
    batch: '2022-2026',
    email: '', 
    phone: '',
    bio: '',
    roll_no: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        setFormData({
            name: data.name || '',
            department: data.department || 'CSE',
            batch: '2022-2026', 
            email: data.email || 'student@amrita.edu',
            phone: data.phone || '',
            bio: data.bio || '',
            roll_no: data.roll_no || ''
        });
      } catch (error) {
        console.error("Failed to load profile");
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateStudentProfile({
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        bio: formData.bio,
        batch: formData.batch
      });
      toast.success('Profile Updated!');
      setTimeout(() => router.push('/dashboard/student/profile/interests'), 1000);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. OUTER CONTAINER (Gray Background)
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />
      
      {/* 2. PHONE SIMULATOR FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#FDFBF7] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* 3. SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto pb-40 scrollbar-hide">
            
            {/* Header */}
            <div className="bg-[#8C1515] text-white p-6 pt-12 rounded-b-[2rem] shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                <button onClick={() => router.back()} className="text-white/80 font-bold text-sm flex items-center gap-1">
                    <ChevronLeft size={16} /> Back
                </button>
                <h1 className="text-xl font-black tracking-tight">My Profile</h1>
                <div className="w-6"></div> {/* Spacer */}
                </div>

                {/* Profile Pic Section */}
                <div className="flex flex-col items-center mt-4">
                <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-white p-1 border-4 border-[#D4AF37] shadow-xl overflow-hidden">
                    <img src="https://avatar.iran.liara.run/public/girl" alt="Profile" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <button className="absolute bottom-0 right-1 bg-white text-[#8C1515] p-2 rounded-full shadow-md border border-gray-200">
                    <Camera size={18} />
                    </button>
                </div>
                <h2 className="mt-4 text-xl font-black text-white">{formData.name || "Student Name"}</h2>
                <p className="text-white/70 text-xs font-bold">{formData.roll_no}</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="px-6 -mt-6">
                <div className="bg-white rounded-[2rem] shadow-xl p-6 space-y-5 border border-gray-100">
                
                {/* Name */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8C1515] uppercase tracking-widest ml-1">Name</label>
                    <input 
                    name="name" value={formData.name} onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-[#8C1515] transition-colors"
                    />
                </div>

                {/* Department */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8C1515] uppercase tracking-widest ml-1">Department</label>
                    <select 
                    name="department" value={formData.department} onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-[#8C1515] transition-colors"
                    >
                    <option>Computer Science (CSE)</option>
                    <option>Artificial Intelligence (AIE)</option>
                    <option>Electronics (ECE)</option>
                    </select>
                </div>

                {/* Batch */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8C1515] uppercase tracking-widest ml-1">Year / Batch</label>
                    <select 
                    name="batch" value={formData.batch} onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-[#8C1515] transition-colors"
                    >
                    <option>3rd Year / 2022-2026</option>
                    <option>2nd Year / 2023-2027</option>
                    <option>4th Year / 2021-2025</option>
                    </select>
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8C1515] uppercase tracking-widest ml-1">Email</label>
                    <input 
                    name="email" value={formData.email} readOnly
                    className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-500 outline-none cursor-not-allowed"
                    />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8C1515] uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                    name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-[#8C1515] transition-colors"
                    />
                </div>

                {/* Bio */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#8C1515] uppercase tracking-widest ml-1">Bio / About</label>
                    <textarea 
                    name="bio" value={formData.bio} onChange={handleChange} maxLength={100} rows={3}
                    placeholder="Write a brief bio..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-[#8C1515] transition-colors resize-none"
                    />
                    <p className="text-[10px] text-right text-gray-400 font-bold">{formData.bio.length}/100</p>
                </div>
                </div>
            </div>
        </div>

        {/* 4. ABSOLUTE FOOTER (Sticks to Phone Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2rem]">
            <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#8C1515] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all mb-3 flex items-center justify-center gap-2"
            >
            {loading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button 
                onClick={() => router.push('/dashboard/student/profile/interests')}
                className="w-full flex items-center justify-center gap-2 text-[#8C1515] font-black text-xs uppercase tracking-wider"
            >
                Next: Add Experience & Interests <ChevronRight size={14} />
            </button>
        </div>

      </div>
    </div>
  );
}