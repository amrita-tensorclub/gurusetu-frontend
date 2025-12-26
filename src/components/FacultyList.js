import React from 'react';
import { User, ChevronRight } from 'lucide-react';

export default function FacultyList({ facultyData, onSelect }) {
  if (!facultyData || facultyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 opacity-60">
        <User size={40} className="mb-2" />
        <p className="text-sm">No faculty found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-end px-1">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Directory</h2>
        <span className="text-[10px] text-gray-400">{facultyData.length} Results</span>
      </div>
      
      {facultyData.map((faculty) => (
        <div 
          key={faculty.id}
          onClick={() => onSelect(faculty)}
          className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amrita-maroon/20 active:scale-[0.99] transition-all cursor-pointer flex justify-between items-center relative overflow-hidden"
        >
          {/* Status Indicator Bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            faculty.status_source === 'AI Prediction' ? 'bg-purple-500' : 
            faculty.current_status === 'Available' ? 'bg-green-500' : 
            faculty.current_status === 'Busy' ? 'bg-red-500' : 'bg-orange-400'
          }`}></div>

          <div className="flex items-center gap-4 pl-2">
            <div className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 text-gray-400 group-hover:bg-amrita-maroon/5 group-hover:text-amrita-maroon transition-colors">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{faculty.name}</h3>
              <p className="text-xs text-gray-500 font-medium">{faculty.department_id ? "Department Faculty" : "Staff"}</p>
              {faculty.cabin_mappings && (
                 <span className="text-[10px] text-amrita-maroon font-semibold">{faculty.cabin_mappings.cabin_code}</span>
              )}
            </div>
          </div>
          
          <ChevronRight size={18} className="text-gray-300 group-hover:text-amrita-maroon group-hover:translate-x-1 transition-all" />
        </div>
      ))}
    </div>
  );
}