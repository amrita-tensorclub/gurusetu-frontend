"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { authService } from '@/services/authService';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// --- HELPER: Manually decode JWT to get user_id ---
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Login
      const response = await authService.login(email, password);
      console.log("Login Full Response:", response);

      // 2. CRITICAL: Extract User ID safely
      let userId = response.user_id; 
      
      // If backend didn't send user_id directly, extract it from the token
      if (!userId && response.access_token) {
          const decoded = parseJwt(response.access_token);
          if (decoded) {
              // Check common ID fields in JWT
              userId = decoded.user_id || decoded.sub || decoded.id;
          }
      }

      if (!userId) {
          throw new Error("Could not find User ID in login response.");
      }

      // 3. Save to LocalStorage in a CLEAN format
      const userData = {
          user_id: userId,
          role: role,
          access_token: response.access_token
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("Saved to LocalStorage:", userData); // Verify this in console

      toast.success(`Welcome back!`);
      
      // 4. Redirect
      if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/faculty');
      }
      
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error('Login Failed: ' + (err.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden font-sans">
      <Toaster position="top-center" />
      <div className="w-[375px] h-[812px] bg-white rounded-[3rem] overflow-hidden relative shadow-2xl border-8 border-gray-900">
        
        <div className="bg-white pt-16 pb-2 px-6 text-center space-y-1">
          <h1 className="text-3xl font-black text-[#8C1515] tracking-tight">Guru Setu</h1>
          <p className="text-xs font-bold text-[#8C1515] uppercase tracking-widest leading-relaxed">
            Connecting Students & Faculty <br/> for Research Excellence
          </p>
        </div>

        <div className="px-8 mt-6">
          <div className="flex bg-gray-100 p-1 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                role === 'student' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                role === 'faculty' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Faculty
            </button>
          </div>
        </div>

        <div className="px-8 space-y-6 mt-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input 
                type="email" 
                placeholder="University Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-[#8C1515] rounded-xl p-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-[#8C1515] rounded-xl p-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
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
            <div className="relative pt-4">
              <button 
                disabled={loading}
                className="w-full bg-[#8C1515] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : `LOGIN AS ${role === 'student' ? 'STUDENT' : 'FACULTY'}`}
                {!loading && (
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <ChevronRight color="white" size={16} strokeWidth={3} />
                    </div>
                )}
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
            <p className="text-xs font-bold text-gray-400">New to Guru Setu?</p>
            <Link href="/signup" className="text-sm font-bold text-[#8C1515] hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}