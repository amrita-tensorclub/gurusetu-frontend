"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight, User, Mail, Lock, Building, Hash, Camera } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/authService'; 
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Department List
const DEPARTMENTS = [
  "Computer Science and Engineering (CSE)",
  "Artificial Intelligence Engineering (AIE)",
  "Artificial Intelligence and Data Science (AID)",
  "Integrated M.Sc Data Science",
  "Electronics and Communication Engineering (ECE)",
  "Electrical and Electronics Engineering (EEE)",
  "Computer and Communication Engineering (CCE)",
  "Mechanical Engineering (ME)",
  "Mathematics",
  "Electronics (ELC)"
];

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

  // ✅ UPDATED: Validation Logic
  const validateForm = () => {
    const email = formData.email.toLowerCase();

    // 1. Faculty Validation (Removed Employee ID Check)
    if (role === 'faculty') {
      if (!email.endsWith('@cb.amrita.edu')) {
        toast.error("Faculty email must end with @cb.amrita.edu");
        return false;
      }
      // ❌ Removed ID length check
    }

    // 2. Student Validation
    if (role === 'student') {
      if (!email.endsWith('@cb.students.amrita.edu')) {
        toast.error("Student email must end with @cb.students.amrita.edu");
        return false;
      }
      if (!formData.id_number) {
        toast.error("Roll Number is required for students");
        return false;
      }
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      let finalImageUrl = "";

      // 1. Upload Photo to Backend
      if (selectedFile) {
        const photoFormData = new FormData();
        photoFormData.append('file', selectedFile);
        
        const uploadRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/upload-profile-picture`, 
          photoFormData, 
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Register User
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        department: formData.department,
        roll_no: role === 'student' ? formData.id_number : null,
        employee_id: null, // ✅ Always null for faculty signup now
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
              placeholder={role === 'student' ? "student@cb.students.amrita.edu" : "faculty@cb.amrita.edu"}
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
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#8C1515] pointer-events-none" size={20} />
          </div>

          {/* ✅ UPDATED: Only Show ID Field for Students */}
          {role === 'student' && (
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
              <input 
                id="signup-id"
                name="id_number" 
                type="text" 
                placeholder="Roll No (e.g. CB.SC.U4AIE24324)" 
                onChange={handleChange} 
                className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none" 
                required 
              />
            </div>
          )}

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