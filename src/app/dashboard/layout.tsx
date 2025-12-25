"use client";

import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // This gray background fills the whole screen. 
    // The "Phone Simulator" will sit centered inside it.
    <div className="min-h-screen bg-[#e0e0e0]">
      {children}
    </div>
  );
}