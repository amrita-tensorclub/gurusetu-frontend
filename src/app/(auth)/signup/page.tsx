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

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '', 
    id_number: ''   
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
        roll_no: role === 'student' ? formData.id_number : null,
        employee_id: role === 'faculty' ? formData.id_number : null
      };

      await authService.signup(payload);
      toast.success('Account Created! Redirecting...');
      setTimeout(() => router.push('/login'), 1500);
      
    } catch (err: any) {
      console.error("Signup Error:", err);
      const msg = err.response?.data?.detail || 'Signup Failed. Check your inputs.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- MAIN CONTAINER (Full Screen Mobile) ---
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Toaster position="top-center" />
      
        {/* Branding Section */}
        <div className="bg-white pt-16 pb-4 px-6 text-center space-y-2">
          <h1 className="text-4xl font-black text-[#8C1515] tracking-tight">Guru Setu</h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Connecting Students & Faculty <br/> for Research Excellence
          </p>
        </div>

        {/* Form Area */}
        <div className="px-8 space-y-6 mt-4 pb-12 max-w-md mx-auto w-full">
          
          {/* Role Toggle (Styled Gold and Maroon) */}
          <div className="flex bg-[#D4AF37] p-1 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-full ${
                role === 'student' ? 'bg-[#8C1515] text-white shadow-md' : 'text-white hover:bg-[#b8962e]'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-full ${
                role === 'faculty' ? 'bg-[#8C1515] text-white shadow-md' : 'text-white hover:bg-[#b8962e]'
              }`}
            >
              Faculty
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
              <input 
                name="name"
                type="text" 
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
              <input 
                name="email"
                type="email" 
                placeholder="University Email"
                onChange={handleChange}
                className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Create Password"
                onChange={handleChange}
                className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C1515]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Department */}
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
              <select 
                name="department"
                onChange={handleChange}
                className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors appearance-none bg-white"
                required
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="AIE">AI & Data Science (AIE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="MECH">Mechanical</option>
              </select>
            </div>

            {/* ID Number */}
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C1515]" size={20} />
              <input 
                name="id_number"
                type="text" 
                placeholder={role === 'student' ? "Roll Number" : "Employee ID"}
                onChange={handleChange}
                className="w-full border-2 border-[#8C1515] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="relative pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
                {!loading && (
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <ChevronRight color="white" size={16} strokeWidth={3} />
                    </div>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs font-bold text-gray-400">Already have an account?</p>
            <Link href="/login" className="text-sm font-bold text-[#8C1515] hover:underline">
              Login Here
            </Link>
          </div>
        </div>
    </div>
  );
}