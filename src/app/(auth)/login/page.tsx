"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight, X, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '@/services/authService';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Helper to decode JWT (Keep existing helper)
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
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- FORGOT PASSWORD STATES ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Verify, 2: Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotId, setForgotId] = useState(''); // Roll No or Employee ID
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // --- LOGIN LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      const response = await authService.login(email, password);

      let userId = response.user_id; 
      if (!userId && response.access_token) {
          const decoded = parseJwt(response.access_token);
          if (decoded) {
              userId = decoded.user_id || decoded.sub || decoded.id;
          }
      }

      if (!userId) throw new Error("Could not find User ID.");

      const userData = {
          user_id: userId,
          role: role,
          access_token: response.access_token
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user_role", role); // Ensure role is saved

      toast.success(`Welcome back!`);
      
      // Force Hard Redirect to ensure Dashboard loads fresh
      window.location.href = `/dashboard/${role === 'student' ? 'student' : 'faculty'}`;
      
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error('Login Failed: ' + (err.response?.data?.detail || "Invalid Credentials"));
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD LOGIC ---
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
        // Step 1: Verify Email + ID
        await authService.verifyIdentity({
            email: forgotEmail,
            role: role,
            id_number: forgotId
        });
        toast.success("Identity Verified!");
        setForgotStep(2); // Move to Reset Step
    } catch (err: any) {
        toast.error(err.response?.data?.detail || "Verification Failed");
    } finally {
        setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
        // Step 2: Set New Password
        await authService.resetPassword(forgotEmail, newPassword);
        toast.success("Password Reset Successfully!");
        setShowForgotModal(false); // Close Modal
        setForgotStep(1); // Reset Modal State
        setForgotEmail('');
        setForgotId('');
        setNewPassword('');
    } catch (err: any) {
        toast.error(err.response?.data?.detail || "Reset Failed");
    } finally {
        setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      <Toaster position="top-center" />
      
        {/* Branding Section */}
        <div className="bg-white pt-16 pb-4 px-6 text-center space-y-1">
          <h1 className="text-4xl font-black text-[#8C1515] tracking-tight">Guru Setu</h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Connecting Students & Faculty <br/> for Research Excellence
          </p>
        </div>

        {/* Role Switcher */}
        <div className="px-8 mt-6 max-w-md mx-auto w-full">
          <div className="flex bg-gray-100 p-1 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                role === 'student' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                role === 'faculty' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Faculty
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="px-8 space-y-6 mt-8 max-w-md mx-auto w-full">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input 
                type="email" 
                placeholder="University Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-[#8C1515] rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-[#8C1515] rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
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
            
            {/* Forgot Password Link */}
            <div className="flex justify-end">
                <button 
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-gray-400 hover:text-[#8C1515]"
                >
                    Forgot Password?
                </button>
            </div>

            <div className="relative pt-2">
              <button 
                disabled={loading}
                className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
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

          {/* Footer Links */}
          <div className="text-center mt-8 pb-10">
            <p className="text-xs font-bold text-gray-400">New to Guru Setu?</p>
            <Link href="/signup" className="text-sm font-bold text-[#8C1515] hover:underline">
              Create Account
            </Link>
          </div>
        </div>

        {/* --- FORGOT PASSWORD MODAL --- */}
        {showForgotModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6 backdrop-blur-sm">
                <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                    <button 
                        onClick={() => { setShowForgotModal(false); setForgotStep(1); }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-[#8C1515]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            {forgotStep === 1 ? <ShieldCheck className="text-[#8C1515]" /> : <KeyRound className="text-[#8C1515]" />}
                        </div>
                        <h2 className="text-xl font-black text-gray-800">
                            {forgotStep === 1 ? 'Verify Identity' : 'Reset Password'}
                        </h2>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                            {forgotStep === 1 ? 'Enter details to prove it is you' : 'Create a strong new password'}
                        </p>
                    </div>

                    {forgotStep === 1 ? (
                        <form onSubmit={handleVerifyIdentity} className="space-y-4">
                            <input 
                                type="email" placeholder="Registered Email"
                                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#8C1515]"
                                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                            />
                            <input 
                                type="text" placeholder={role === 'student' ? "Roll Number" : "Employee ID"}
                                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#8C1515]"
                                value={forgotId} onChange={e => setForgotId(e.target.value)} required
                            />
                            <button disabled={forgotLoading} className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-bold text-sm shadow-lg">
                                {forgotLoading ? 'Checking...' : 'Verify'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <input 
                                type="text" disabled value={forgotEmail}
                                className="w-full bg-gray-100 border-none rounded-xl p-3 text-sm font-bold text-gray-500"
                            />
                            <input 
                                type="text" placeholder="New Password (min 6 chars)"
                                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#8C1515]"
                                value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                            />
                            <button disabled={forgotLoading} className="w-full bg-[#D4AF37] text-white py-3 rounded-xl font-bold text-sm shadow-lg">
                                {forgotLoading ? 'Updating...' : 'Set New Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}