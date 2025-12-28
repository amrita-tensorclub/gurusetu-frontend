"use client";

import React from 'react';
import { ChevronLeft, Mail, Phone, FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HelpSupportPage() {
  const router = useRouter();

  return (
    // --- MAIN CONTAINER (Full Screen Mobile) ---
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-sans">
      
      {/* HEADER (Sticky) */}
      <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex items-center gap-4 sticky top-0">
        <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black tracking-tight">Help & Support</h1>
      </div>

      {/* CONTENT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10">
        
        {/* FAQ Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            
            <details className="group">
              <summary className="list-none flex justify-between items-center cursor-pointer text-xs font-bold text-gray-800">
                How do I edit my profile?
                <ChevronLeft size={16} className="rotate-180 group-open:-rotate-90 transition-transform text-gray-400"/>
              </summary>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                Go to the Profile section from the side menu and update your research interests, qualifications, and contact details.
              </p>
            </details>
            
            <div className="h-px bg-gray-100"></div>
            
            <details className="group">
              <summary className="list-none flex justify-between items-center cursor-pointer text-xs font-bold text-gray-800">
                How do I post a new project?
                <ChevronLeft size={16} className="rotate-180 group-open:-rotate-90 transition-transform text-gray-400"/>
              </summary>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                Navigate to "My Openings" and click the floating "+" button at the bottom right to create a new research opportunity.
              </p>
            </details>

            <div className="h-px bg-gray-100"></div>

            <details className="group">
              <summary className="list-none flex justify-between items-center cursor-pointer text-xs font-bold text-gray-800">
                How do I shortlist students?
                <ChevronLeft size={16} className="rotate-180 group-open:-rotate-90 transition-transform text-gray-400"/>
              </summary>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                You can shortlist students directly from the "Recommended Students" section on your dashboard or via the "All Students" list.
              </p>
            </details>

          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest mb-4">Contact Admin</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-red-100 p-2 rounded-full text-[#8C1515]"><Mail size={16}/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400">Email Support</p>
                <p className="text-xs font-bold text-gray-800">admin@gurusetu.edu</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-red-100 p-2 rounded-full text-[#8C1515]"><Phone size={16}/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400">Helpline</p>
                <p className="text-xs font-bold text-gray-800">+91 422 268 5000</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Manual */}
        <button className="w-full flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:border-[#8C1515] transition-colors">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-gray-400 group-hover:text-[#8C1515]"/>
            <span className="text-sm font-bold text-gray-700 group-hover:text-[#8C1515]">Download User Manual</span>
          </div>
          <ExternalLink size={16} className="text-gray-300"/>
        </button>

      </div>
    </div>
  );
}