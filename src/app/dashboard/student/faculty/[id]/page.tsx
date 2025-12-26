"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Globe, Award, BookOpen } from 'lucide-react';
import { ProjectCard } from '@/components/features/ProjectCard';

export default function FacultyDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Navigation Header */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-[#8C1515] transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back to Search
      </button>

      {/* Faculty Profile Hero */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 rounded-3xl bg-[#8C1515] text-white flex items-center justify-center text-4xl font-bold shadow-xl shadow-[#8C1515]/20">
            RK
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dr. Rajesh Kumar</h1>
              <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm">Associate Professor, CSE</p>
            </div>
            
            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
              Specializing in Computer Vision and Deep Learning with a focus on medical diagnostic systems. 
              Currently leading the "AI-Med" research group with 12+ published IEEE papers.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                <Mail size={14} className="text-[#8C1515]" /> Email Profile
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                <Globe size={14} className="text-[#8C1515]" /> Lab Website
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Research Openings Under This Faculty */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#8C1515] p-2 rounded-lg">
            <BookOpen size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Active Research Openings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProjectCard 
            title="AI-Driven Medical Imaging"
            faculty="Dr. Rajesh Kumar"
            department="CSE"
            match={92}
            tags={["Deep Learning", "Healthcare"]}
            description="Developing CNN architectures for early cancer detection in MRI scans..."
          />
          <ProjectCard 
            title="NLP for Vernacular Languages"
            faculty="Dr. Rajesh Kumar"
            department="CSE"
            match={81}
            tags={["NLP", "Transformers"]}
            description="Working on efficient transformer models for low-resource Indian languages..."
          />
        </div>
      </div>
    </div>
  );
}