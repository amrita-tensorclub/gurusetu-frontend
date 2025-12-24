'use client';

import { useState } from 'react';



import StudentNavigationMenu from '../../../components/StudentNavigationMenu';


export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <StudentNavigationMenu 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-[#8B1538] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <span className="font-bold text-lg">Guru Setu</span>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-white/20 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}