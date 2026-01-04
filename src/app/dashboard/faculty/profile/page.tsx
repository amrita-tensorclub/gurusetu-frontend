"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Camera, Mail, Loader2, ChevronRight, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { dashboardService, StudentProfileData } from '@/services/studentDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Display fields
  const [rollNo, setRollNo] = useState("");
  
  const [formData, setFormData] = useState<StudentProfileData>({
    name: "",
    phone: "",
    email: "",
    department: "",
    batch: "",
    bio: "",
    profile_picture: "",
    skills: [],
    interests: [],
    projects: [],
    publications: []
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) { router.push('/login'); return; }
        
        const u = JSON.parse(userStr);
        const uid = u.user_id || u.user?.user_id;
        
        // 1. Fetch REAL data from Backend
        const data = await dashboardService.getStudentFullProfile(uid);
        
        // 2. Set Roll No (Prefer backend, fallback to local storage)
        setRollNo(data.roll_no || u.roll_no || "N/A");

        // 3. Set Form Data (Prioritize Backend Data)
        setFormData({
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || "", // ✅ FIX: Use real email from DB
            department: data.department || "", // ✅ FIX: No hardcoded default
            batch: data.batch || "",
            bio: data.bio || "",
            profile_picture: data.profile_picture || "",
            skills: data.skills || [],
            interests: data.interests || [],
            projects: data.projects || [],
            publications: data.publications || []
        });
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleInputChange = (field: keyof StudentProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        const url = await dashboardService.uploadProfilePicture(file);
        setFormData(prev => ({ ...prev, profile_picture: url }));
        toast.success("Photo updated!");
      } catch (err) {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        projects: formData.projects.map(p => ({
            ...p,
            duration: p.duration || "",
            from_date: p.from_date || "",
            to_date: p.to_date || "",
            description: p.description || "",
            tools: p.tools || []
        })),
        publications: formData.publications.map(p => ({
            ...p,
            publisher: p.publisher || "",
            link: p.link || ""
        }))
      };

      await dashboardService.updateStudentProfile(payload);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#990033]" /></div>;

  return (
    <div className="min-h-screen bg-white font-sans relative">
      <Toaster position="bottom-center" />

      {/* Header */}
      <div className="bg-[#990033] px-5 pt-8 pb-20 relative top-0 z-0">
        <div className="flex justify-between items-center text-white">
          <button onClick={() => router.back()} className="p-1 -ml-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={28} /></button>
          <h1 className="text-xl font-bold">My Profile</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="-mt-14 flex flex-col items-center relative z-10">
         <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden">
               <img src={formData.profile_picture || "https://avatar.iran.liara.run/public"} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-[#990033]">
               {uploading ? <Loader2 size={16} className="animate-spin"/> : <Camera size={18} />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
         </div>

         <div className="text-center mt-3 mb-2 space-y-1 px-4">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{formData.name || "Student Name"}</h2>
            <p className="text-gray-500 text-xs font-medium">{formData.department}</p>
            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs"><Mail size={12} /><span>{formData.email}</span></div>
            <p className="text-gray-400 text-xs">Roll Number: {rollNo}</p>
         </div>
      </div>

      {/* Form Fields */}
      <div className="px-6 space-y-5 pb-32 mt-4">
         
         <div className="group">
            <label className="block text-[#990033] text-xs font-medium mb-1 ml-1 group-focus-within:font-bold">Name</label>
            <div className="border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-[#990033] focus-within:border-2 transition-all">
               <input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full text-sm text-gray-900 outline-none placeholder-gray-400 font-medium"/>
            </div>
         </div>

         <div className="group">
            <label className="block text-[#990033] text-xs font-medium mb-1 ml-1">Department</label>
            <div className="border border-gray-300 rounded-lg px-3 py-2.5 relative focus-within:border-[#990033] focus-within:border-2 transition-all">
               {/* ✅ FIX: If the value from DB doesn't match options, it will show empty. Manually type it if needed or ensure options match exactly. */}
               <select value={formData.department} onChange={e => handleInputChange('department', e.target.value)} className="w-full text-sm text-gray-900 outline-none appearance-none bg-transparent font-medium bg-white">
                  <option value="" disabled>Select Department</option>
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Artificial Intelligence (AIE)">Artificial Intelligence (AIE)</option>
                  <option value="Electronics & Communication (ECE)">Electronics & Communication (ECE)</option>
                  <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                  {/* Fallback option to show what is in DB if it doesn't match above */}
                  {!["Computer Science & Engineering (CSE)", "Artificial Intelligence (AIE)", "Electronics & Communication (ECE)", "Mechanical Engineering (ME)"].includes(formData.department) && formData.department && (
                      <option value={formData.department}>{formData.department}</option>
                  )}
               </select>
               <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
            </div>
         </div>

         <div className="group">
            <label className="block text-[#990033] text-xs font-medium mb-1 ml-1">Year / Batch</label>
            <div className="border border-gray-300 rounded-lg px-3 py-2.5 relative focus-within:border-[#990033] focus-within:border-2 transition-all">
               <select value={formData.batch} onChange={e => handleInputChange('batch', e.target.value)} className="w-full text-sm text-gray-900 outline-none appearance-none bg-transparent font-medium bg-white">
                  <option value="" disabled>Select Batch</option>
                  <option>3rd Year / 2022-2026</option>
                  <option>2nd Year / 2023-2027</option>
                  <option>4th Year / 2021-2025</option>
               </select>
               <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
            </div>
         </div>

         <div className="group">
            <label className="block text-[#990033] text-xs font-medium mb-1 ml-1">Email</label>
            <div className="border border-gray-300 rounded-lg px-3 py-2.5 flex items-center bg-gray-50">
               {/* ✅ FIX: Use formData.email directly */}
               <input value={formData.email} disabled className="w-full text-sm text-gray-900 outline-none bg-transparent font-medium"/>
               <Mail size={18} className="text-gray-400" />
            </div>
         </div>

         <div className="group">
            <label className="block text-[#990033] text-xs font-medium mb-1 ml-1">Phone Number</label>
            <div className="border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-[#990033] focus-within:border-2 transition-all">
               <input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="Enter phone number" className="w-full text-sm text-gray-900 outline-none placeholder-gray-400 font-medium"/>
            </div>
         </div>

         <div className="group">
            <label className="block text-[#990033] text-xs font-medium mb-1 ml-1">Bio / About</label>
            <div className="border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-[#990033] focus-within:border-2 transition-all">
               <textarea value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} maxLength={100} rows={2} placeholder="Write a brief bio (max 100 characters)" className="w-full text-sm text-gray-900 outline-none placeholder-gray-400 resize-none font-medium"/>
            </div>
            <div className="text-right text-xs text-gray-400 mt-1">{formData.bio?.length || 0}/100</div>
         </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-100 p-4 z-50">
         <button onClick={handleSave} disabled={saving} className="w-full bg-[#990033] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex justify-center items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
         </button>
         
         <button onClick={() => router.push('/dashboard/student/profile/experience')} className="w-full mt-4 flex items-center justify-center gap-2 text-[#990033] font-bold text-sm hover:underline">
            Next: Add Experience & Interests <ArrowRight size={16} />
         </button>
      </div>
    </div>
  );
}