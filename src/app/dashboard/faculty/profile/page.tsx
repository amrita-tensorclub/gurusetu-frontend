"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Camera, Mail, Clock, MapPin, Plus, X, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyDashboardService } from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';

const getUserId = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (!userStr) return "";
    try {
        const userObj = JSON.parse(userStr);
        return userObj.user_id || (userObj.user && userObj.user.user_id) || "";
    } catch (e) {
        return "";
    }
  }
  return "";
};

export default function FacultyProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  // Hidden State
  const [savedDomains, setSavedDomains] = useState<string[]>([]);
  const [savedWork, setSavedWork] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    designation: "Assistant Professor",
    department: "Computer Science & Engineering",
    email: "",
    phone: "",
    profile_picture: "",
    office_hours: "Mon, Wed, Fri: 2 PM - 4 PM",
    cabin_block: "AB1", // Default matching your request
    cabin_floor: "2",
    cabin_number: "B-205",
    ug_details: [] as string[],
    pg_details: [] as string[],
    phd_details: [] as string[]
  });

  const [newUG, setNewUG] = useState("");
  const [newPG, setNewPG] = useState("");
  const [newPhD, setNewPhD] = useState("");

  useEffect(() => {
    const uid = getUserId();
    if (!uid) {
        setLoading(false);
        return;
    }
    setUserId(uid);
    loadProfile(uid);
  }, []);

  const loadProfile = async (id: string) => {
    try {
      const data = await facultyDashboardService.getFacultyProfile(id);
      const info = data.info;
      
      setSavedDomains(info.interests || []);
      const mappedWork = (data.previous_work || []).map((w: any) => ({
        title: w.title,
        type: w.type || "Publication",
        year: w.year,
        outcome: w.outcome,
        collaborators: w.collaborators
      }));
      setSavedWork(mappedWork);

      setFormData({
        name: info.name || "",
        designation: info.designation || "Assistant Professor",
        department: info.department || "Computer Science & Engineering",
        email: info.email || "",
        phone: info.phone || "",
        profile_picture: info.profile_picture || "",
        office_hours: data.schedule || "",
        
        // FIX: Reading RAW fields
        cabin_block: info.cabin_block || "AB1", 
        cabin_floor: info.cabin_floor || "2",
        cabin_number: info.cabin_number || "B-205",
        
        // FIX: Reading RAW arrays
        ug_details: info.ug_details || [],
        pg_details: info.pg_details || [],
        phd_details: info.phd_details || []
      });

    } catch (error) {
      console.error("Failed to load profile", error);
      toast.error("Could not load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImg(true);
    try {
        const response = await facultyDashboardService.uploadImage(file);
        setFormData({ ...formData, profile_picture: response.url });
        toast.success("Photo uploaded!");
    } catch (error) {
        toast.error("Failed to upload photo");
    } finally {
        setUploadingImg(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const payload: any = {
        name: formData.name,
        designation: formData.designation,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
        profile_picture: formData.profile_picture,
        office_hours: formData.office_hours,
        cabin_block: formData.cabin_block,
        cabin_floor: formData.cabin_floor,
        cabin_number: formData.cabin_number,
        ug_details: formData.ug_details,
        pg_details: formData.pg_details,
        phd_details: formData.phd_details,
        domain_interests: savedDomains,
        previous_work: savedWork
      };

      await facultyDashboardService.updateFacultyProfile(payload);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const addQual = (type: 'ug' | 'pg' | 'phd') => {
    if (type === 'ug' && newUG) {
        setFormData({...formData, ug_details: [...formData.ug_details, newUG]});
        setNewUG("");
    } else if (type === 'pg' && newPG) {
        setFormData({...formData, pg_details: [...formData.pg_details, newPG]});
        setNewPG("");
    } else if (type === 'phd' && newPhD) {
        setFormData({...formData, phd_details: [...formData.phd_details, newPhD]});
        setNewPhD("");
    }
  };

  const removeQual = (type: 'ug' | 'pg' | 'phd', index: number) => {
    if (type === 'ug') {
        const updated = formData.ug_details.filter((_, i) => i !== index);
        setFormData({...formData, ug_details: updated});
    } else if (type === 'pg') {
        const updated = formData.pg_details.filter((_, i) => i !== index);
        setFormData({...formData, pg_details: updated});
    } else if (type === 'phd') {
        const updated = formData.phd_details.filter((_, i) => i !== index);
        setFormData({...formData, phd_details: updated});
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[#8C1515]" /></div>;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-32 font-sans relative shadow-2xl">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <div className="bg-[#8C1515] text-white p-5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4" onClick={() => router.back()}>
          <ChevronRight className="rotate-180 cursor-pointer" />
          <h1 className="text-lg font-bold tracking-tight">Faculty Profile</h1>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Profile Picture */}
        <div className="flex flex-col items-center -mt-2">
            <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    {uploadingImg ? (
                        <Loader2 className="animate-spin text-[#8C1515]" />
                    ) : formData.profile_picture ? (
                        <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-black text-gray-300">
                            {formData.name ? formData.name.charAt(0) : "DR"}
                        </span>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-[#8C1515] hover:bg-gray-50 border border-gray-100 transition-transform active:scale-95"
                >
                    <Camera size={16} />
                </button>
            </div>
            <input 
                className="mt-4 text-center text-xl font-black text-[#8C1515] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#8C1515] outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Dr. Your Name"
            />
        </div>

        {/* Basic Info Fields */}
        <div className="space-y-4">
            
            {/* Designation */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                <div className="mt-1 relative">
                    <select 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none appearance-none bg-white"
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    >
                        <option>Assistant Professor</option>
                        <option>Associate Professor</option>
                        <option>Professor</option>
                        <option>Lecturer</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-3.5 rotate-90 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Department */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                <div className="mt-1 relative">
                    <select 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none appearance-none bg-white"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                    >
                        <option>Computer Science & Engineering</option>
                        <option>Electrical & Electronics</option>
                        <option>Mechanical Engineering</option>
                        <option>Artificial Intelligence</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-3.5 rotate-90 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <div className="mt-1 relative">
                    <input 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:border-[#8C1515]"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@amrita.edu"
                    />
                    <Mail className="absolute right-3 top-3.5 text-gray-400" size={16} />
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="mt-1">
                    <input 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:border-[#8C1515]"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+91 99999 99999"
                    />
                </div>
            </div>

             {/* Office Hours */}
             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Office Hours</label>
                <div className="mt-1 relative">
                    <input 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:border-[#8C1515]"
                        value={formData.office_hours}
                        onChange={(e) => setFormData({...formData, office_hours: e.target.value})}
                    />
                    <Clock className="absolute right-3 top-3.5 text-[#8C1515]" size={16} />
                </div>
            </div>

            {/* Cabin Location */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-[#8C1515]" />
                    <span className="text-xs font-black text-[#8C1515] uppercase tracking-wide">Cabin Location</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Block</label>
                        <select 
                            className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-xs font-bold"
                            value={formData.cabin_block}
                            onChange={(e) => setFormData({...formData, cabin_block: e.target.value})}
                        >
                            <option>AB1</option>
                            <option>AB2</option>
                            <option>AB3</option>
                            <option>AB4</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Floor</label>
                        <input 
                            className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-xs font-bold"
                            value={formData.cabin_floor}
                            onChange={(e) => setFormData({...formData, cabin_floor: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Cabin No</label>
                        <input 
                            className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-xs font-bold"
                            value={formData.cabin_number}
                            onChange={(e) => setFormData({...formData, cabin_number: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Qualifications Section */}
            <div>
                <h3 className="text-[#8C1515] font-black text-sm uppercase mb-3 mt-4">Qualifications</h3>
                
                {/* UG */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">UG Details</label>
                        <Plus size={14} className="bg-[#8C1515] text-white rounded cursor-pointer" onClick={() => addQual('ug')} />
                    </div>
                    {formData.ug_details.map((q, i) => (
                        <div key={i} className="flex justify-between bg-gray-50 p-2 rounded mb-1 text-xs">
                            <span>{q}</span>
                            <X size={14} className="text-gray-400 cursor-pointer" onClick={() => removeQual('ug', i)} />
                        </div>
                    ))}
                    <input 
                        className="w-full border-b border-gray-200 py-1 text-xs outline-none focus:border-[#8C1515]"
                        placeholder="Add degree (e.g. B.Tech in CSE)"
                        value={newUG}
                        onChange={(e) => setNewUG(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addQual('ug')}
                    />
                </div>

                 {/* PG */}
                 <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">PG Details</label>
                        <Plus size={14} className="bg-[#8C1515] text-white rounded cursor-pointer" onClick={() => addQual('pg')} />
                    </div>
                    {formData.pg_details.map((q, i) => (
                        <div key={i} className="flex justify-between bg-gray-50 p-2 rounded mb-1 text-xs">
                            <span>{q}</span>
                            <X size={14} className="text-gray-400 cursor-pointer" onClick={() => removeQual('pg', i)} />
                        </div>
                    ))}
                    <input 
                        className="w-full border-b border-gray-200 py-1 text-xs outline-none focus:border-[#8C1515]"
                        placeholder="Add degree (e.g. M.Tech in AI)"
                        value={newPG}
                        onChange={(e) => setNewPG(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addQual('pg')}
                    />
                </div>

                 {/* PhD */}
                 <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">PhD Details</label>
                        <Plus size={14} className="bg-[#8C1515] text-white rounded cursor-pointer" onClick={() => addQual('phd')} />
                    </div>
                    {formData.phd_details.map((q, i) => (
                        <div key={i} className="flex justify-between bg-gray-50 p-2 rounded mb-1 text-xs">
                            <span>{q}</span>
                            <X size={14} className="text-gray-400 cursor-pointer" onClick={() => removeQual('phd', i)} />
                        </div>
                    ))}
                    <input 
                        className="w-full border-b border-gray-200 py-1 text-xs outline-none focus:border-[#8C1515]"
                        placeholder="Add degree (e.g. PhD in NLP)"
                        value={newPhD}
                        onChange={(e) => setNewPhD(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addQual('phd')}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-white border-t border-gray-200 p-4 pb-6 z-30 flex flex-col items-center gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
         <button 
            onClick={handleSave}
            className="w-full max-w-sm bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
            <Save size={20} /> Save Changes
         </button>
         
         <button 
            onClick={() => router.push('/dashboard/faculty/profile/research')}
            className="text-[10px] font-bold text-[#8C1515] uppercase tracking-widest hover:underline">
            Next: Add Research Details →
         </button>
      </div>

    </div>
  );
}