import React from "react";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 shadow-lg bg-[#8B0000]">
      <div className="px-6 py-4 flex items-center justify-between">
        
       
        <div className="flex items-center gap-4">
          
          {/* Logo */}
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden">
            <img
              src="/logo.png"
              alt="Amrita Logo"
              className="w-10 h-10 object-contain"
            />
          </div>

          {/* Text */}
          <div className="leading-tight">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              GuruSetu
            </h1>
            <p className="text-xs text-white/80 font-medium">
              Amrita Vishwa Vidyapeetham
            </p>
          </div>
        </div>

        {/* Right: Menu
        <Menu
          className="text-white cursor-pointer hover:text-white/80"
          size={26} 
        />*/}
      </div>
    </header>
  );
}
