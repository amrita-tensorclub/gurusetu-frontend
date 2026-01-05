"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight, User, Mail, Lock, Building, Hash, Camera } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/authService'; 
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for Profile Photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', id_number: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = "";

      // 1. Upload Photo to Backend (which sends to Cloudinary)
      if (selectedFile) {
        const photoFormData = new FormData();
        photoFormData.append('file', selectedFile);
        
        // Uses your Netlify ENV variable to avoid Mixed Content/Localhost errors
        const uploadRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/upload-profile-picture`, 
          photoFormData, 
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Register User with Photo URL
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        department: formData.department,
        roll_no: role === 'student' ? formData.id_number : null,
        employee_id: role === 'faculty' ? formData.id_number : null,
        profile_picture: finalImageUrl 
      };

      await authService.signup(payload);
      
      toast.success('Account Created! Redirecting to Login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      
    } catch (err: any) {
      console.error("Signup Error:", err);
      const msg = err.response?.data?.detail || 'Signup Failed';
      if (Array.isArray(msg)) toast.error(msg[0].msg); 
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ SCROLL FIX: h-screen + overflow-y-auto ensures nothing is ever cut off
    <div className="h-screen bg-white flex flex-col font-sans overflow-y-auto">
      <Toaster position="top-center" />
      
      <div className="bg-white pt-10 pb-4 px-6 text-center space-y-2 flex-shrink-0">
        <h1 className="text-4xl font-black text-[#8C1515] tracking-tight">Guru Setu</h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Create Your Account</p>
      </div>

      <div className="px-8 space-y-6 mt-2 pb-12 max-w-md mx-auto w-full">
        {/* Role Switcher */}
        <div className="flex bg-[#D4AF37] p-1 rounded-full shadow-inner flex-shrink-0">
          <button type="button" onClick={() => setRole('student')} className={`flex-1 py-3 text-xs font-black uppercase rounded-full ${role === 'student' ? 'bg-[#8C1515] text-white shadow-md' : 'text-white'}`}>Student</button>
          <button type="button" onClick={() => setRole('faculty')} className={`flex-1 py-3 text-xs font-black uppercase rounded-full ${role === 'faculty' ? 'bg-[#8C1515] text-white shadow-md' : 'text-white'}`}>Faculty</button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Photo Upload UI */}
          <div className="flex flex-col items-center py-2 flex-shrink-0">
            <div className="relative w-24 h-24 border-4 border-[#8C1515] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
              <label className="absolute bottom-0 right-0 bg-[#8C1515] p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
                <Camera size={16} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-[10px] font-black text-[#8C1515] uppercase mt-2">Upload Profile Photo</p>
          </div>

          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input 
              id="signup-name"
              name="name" 
              type="text" 
              autoComplete="name"
              placeholder="Full Name" 
              onChange={handleChange} 
              className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none" 
              required 
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input 
              id="signup-email"
              name="email" 
              type="email" 
              autoComplete="email"
              placeholder="Email Address" 
              onChange={handleChange} 
              className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none" 
              required 
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input 
              id="signup-password"
              name="password" 
              type={showPassword ? "text" : "password"} 
              autoComplete="new-password"
              placeholder="Password (Min 6 chars)" 
              onChange={handleChange} 
              className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-gray-700 outline-none" 
              required 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C1515]">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Department */}
          <div className="relative">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <select 
              id="signup-dept"
              name="department" 
              onChange={handleChange} 
              className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none bg-white" 
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="AIE">AIE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>

          {/* ID Number */}
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input 
              id="signup-id"
              name="id_number" 
              type="text" 
              placeholder={role === 'student' ? "Roll Number" : "Employee ID"} 
              onChange={handleChange} 
              className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none" 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl mt-4 flex justify-center items-center gap-2">
            {loading ? 'Processing...' : 'Create Account'} <ChevronRight size={16} />
          </button>
        </form>
        
        <div className="text-center pb-8">
          <Link href="/login" className="text-sm font-bold text-[#8C1515] hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}