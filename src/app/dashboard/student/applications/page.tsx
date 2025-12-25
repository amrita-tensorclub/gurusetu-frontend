"use client";

import React from 'react';
import { Clock, CheckCircle, Calendar, MessageSquare, ChevronRight } from 'lucide-react';

const myApplications = [
  {
    id: "ap1",
    projectTitle: "AI-Driven Medical Imaging for Early Diagnosis",
    faculty: "Dr. Rajesh Kumar",
    dateApplied: "Dec 20, 2025",
    status: "Interview Scheduled",
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "ap2",
    projectTitle: "Smart Grid Optimization using IoT",
    faculty: "Prof. Meera Reddy",
    dateApplied: "Dec 22, 2025",
    status: "Pending",
    color: "bg-amber-100 text-amber-600"
  }
];

export default function ApplicationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
        <p className="text-sm text-gray-500">Track the status of your research requests.</p>
      </div>

      <div className="grid gap-4">
        {myApplications.map((app) => (
          <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${app.color}`}>
                {app.status}
              </span>
              <h3 className="text-lg font-bold text-gray-800 leading-tight">{app.projectTitle}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="font-medium text-gray-600">Mentor: {app.faculty}</span>
                <span className="flex items-center gap-1"><Clock size={12}/> Applied: {app.dateApplied}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t md:border-t-0 pt-4 md:pt-0">
              {app.status === "Interview Scheduled" && (
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#8C1515] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#8C1515]/20">
                  <Calendar size={14}/> View Schedule
                </button>
              )}
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 text-gray-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                <MessageSquare size={14}/> Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}