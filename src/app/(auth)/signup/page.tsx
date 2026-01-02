"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight, User, Mail, Lock, Building, Hash } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/authService'; 
import toast, { Toaster } from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', id_number: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        department: formData.department,
        roll_no: role === 'student' ? formData.id_number : null,
        employee_id: role === 'faculty' ? formData.id_number : null
      };

      await authService.signup(payload);
      
      // STABLE FLOW: Redirect to Login
      toast.success('Account Created! Redirecting to Login...');
      
      setTimeout(() => {
        router.push('/login'); // Goes to Login Page
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
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Toaster position="top-center" />
      <div className="bg-white pt-10 pb-4 px-6 text-center space-y-2">
        <h1 className="text-4xl font-black text-[#8C1515] tracking-tight">Guru Setu</h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Create Your Account</p>
      </div>

      <div className="px-8 space-y-6 mt-2 pb-12 max-w-md mx-auto w-full">
        {/* Role Switcher */}
        <div className="flex bg-[#D4AF37] p-1 rounded-full shadow-inner">
          <button type="button" onClick={() => setRole('student')} className={`flex-1 py-3 text-xs font-black uppercase rounded-full ${role === 'student' ? 'bg-[#8C1515] text-white shadow-md' : 'text-white'}`}>Student</button>
          <button type="button" onClick={() => setRole('faculty')} className={`flex-1 py-3 text-xs font-black uppercase rounded-full ${role === 'faculty' ? 'bg-[#8C1515] text-white shadow-md' : 'text-white'}`}>Faculty</button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input name="name" type="text" placeholder="Full Name" onChange={handleChange} className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none" required />
          </div>
          <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none" required />
          </div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Password (Min 6 chars)" onChange={handleChange} className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-gray-700 outline-none" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C1515]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
          <div className="relative"><Building className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <select name="department" onChange={handleChange} className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none bg-white" required>
              <option value="">Select Department</option>
              <option value="CSE">CSE</option><option value="AIE">AIE</option><option value="ECE">ECE</option><option value="MECH">MECH</option>
            </select>
          </div>
          <div className="relative"><Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
            <input name="id_number" type="text" placeholder={role === 'student' ? "Roll Number" : "Employee ID"} onChange={handleChange} className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl mt-4 flex justify-center items-center gap-2">
            {loading ? 'Processing...' : 'Create Account'} <ChevronRight size={16} />
          </button>
        </form>
        
        <div className="text-center"><Link href="/login" className="text-sm font-bold text-[#8C1515] hover:underline">Back to Login</Link></div>
      </div>
    </div>
  );
}