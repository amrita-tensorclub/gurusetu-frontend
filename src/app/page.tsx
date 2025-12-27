"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function StartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center font-sans">
      
      {/* Main Mobile Container */}
      <div className="w-full max-w-[390px] h-[844px] bg-white shadow-2xl flex flex-col items-center justify-center border-x border-gray-100 relative px-8">
        
        {/* BRANDING SECTION: Centered Title & Tagline */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-[900] text-[#8C1515] tracking-tight mb-4">
            Guru Setu
          </h1>
          <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.25em] leading-relaxed">
            Connecting Students & Faculty <br /> for Research Excellence
          </p>
        </div>

        {/* BUTTON SECTION */}
        <div className="w-full space-y-8">
          {/* Get Started -> Goes to Sign Up */}
          <button 
            onClick={() => router.push('/signup')}
            className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            Get Started
            <div className="bg-white/20 p-1 rounded-full border border-white/30">
              <ChevronRight size={18} />
            </div>
          </button>

          {/* Login Link -> Goes to Login */}
          <div className="text-center space-y-1">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Already have an account?
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="text-[#8C1515] text-base font-black hover:opacity-70 transition-opacity"
            >
              Login Here
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}