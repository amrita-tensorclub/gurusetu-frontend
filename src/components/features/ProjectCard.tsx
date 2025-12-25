import React from 'react';
import { User, Tag, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  faculty: string;
  department: string;
  match: number;
  tags: string[];
  description: string;
}

export const ProjectCard = ({ title, faculty, department, match, tags, description }: ProjectCardProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 relative overflow-hidden transition-hover hover:shadow-md">
      {/* Match Badge */}
      <div className="absolute top-0 right-0 bg-[#D4AF37] text-white px-4 py-2 rounded-bl-2xl font-bold text-sm">
        {match}% Match
      </div>

      <h3 className="text-lg font-bold text-[#8C1515] pr-16 leading-tight mb-3 leading-snug">
        {title}
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400">
          <User size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">{faculty}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">{department}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
          <span key={tag} className="text-[10px] bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-100 flex items-center gap-1">
            <Tag size={10} /> {tag}
          </span>
        ))}
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-5 leading-relaxed">
        {description}
      </p>

      <button className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
        Apply Now
        <ArrowUpRight size={16} />
      </button>
    </div>
  );
}