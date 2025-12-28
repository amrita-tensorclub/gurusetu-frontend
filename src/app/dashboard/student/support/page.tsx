"use client";

import React from 'react';
import { ChevronLeft, Mail, Phone, FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentHelpSupportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* HEADER */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex items-center gap-4">
           <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
           <h1 className="text-xl font-black tracking-tight">Help & Support</h1>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10">
           
           {/* FAQ Section */}
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                 
                 <details className="group">
                    <summary className="list-none flex justify-between items-center cursor-pointer text-xs font-bold text-gray-800">
                       How do I apply for a project?
                       <ChevronLeft size={16} className="rotate-180 group-open:-rotate-90 transition-transform text-gray-400"/>
                    </summary>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                       Go to the Home dashboard, find a project under "Recommended" or "All Openings", click "View Details", and then click the "Apply Now" button.
                    </p>
                 </details>
                 
                 <div className="h-px bg-gray-100"></div>
                 
                 <details className="group">
                    <summary className="list-none flex justify-between items-center cursor-pointer text-xs font-bold text-gray-800">
                       How do I track my application status?
                       <ChevronLeft size={16} className="rotate-180 group-open:-rotate-90 transition-transform text-gray-400"/>
                    </summary>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                       Navigate to "Track Openings" from the side menu. You will see the status (Pending, Shortlisted, or Rejected) for all your applications there.
                    </p>
                 </details>

                 <div className="h-px bg-gray-100"></div>

                 <details className="group">
                    <summary className="list-none flex justify-between items-center cursor-pointer text-xs font-bold text-gray-800">
                       How do I update my skills?
                       <ChevronLeft size={16} className="rotate-180 group-open:-rotate-90 transition-transform text-gray-400"/>
                    </summary>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                       Go to your Profile page and click the Edit icon. Adding relevant skills improves your match score for project recommendations.
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
                       <p className="text-xs font-bold text-gray-800">student.support@gurusetu.edu</p>
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
                 <span className="text-sm font-bold text-gray-700 group-hover:text-[#8C1515]">Download Student Guide</span>
              </div>
              <ExternalLink size={16} className="text-gray-300"/>
           </button>

        </div>
      </div>
    </div>
  );
}