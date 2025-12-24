'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function StudentProfileView() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;
  
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      loadStudentProfile();
    }
  }, [studentId]);

  const loadStudentProfile = async () => {
    try {
      const data = await api.faculty.getStudentProfile(studentId);
      if (data && data.profile) {
        setStudent(data.profile);
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSkills = () => {
    if (!student?.area_of_interest) return [];
    return student.area_of_interest.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <button onClick={() => router.back()} className="text-[#8B1538] font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden">
        
        {/* Header Section */}
        <div className="relative p-8 bg-gradient-to-r from-[#8B1538] to-[#6d102b] text-white">
          <button 
            onClick={() => router.back()}
            className="absolute top-6 right-6 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-2 border-white/30">
               {student.name?.charAt(0).toUpperCase()}
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-1">{student.name}</h1>
              <p className="text-white/80 text-lg">{student.department?.name}</p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-sm text-white/70">
                 <span>Year: {student.year || 'N/A'}</span>
                 <span>•</span>
                 <span>Roll No: {student.roll_number}</span>
                 <span>•</span>
                 <a href={`mailto:${student.email}`} className="hover:text-white underline decoration-dotted">
                    {student.email}
                 </a>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
            
            {/* Bio */}
            {student.bio && (
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">{student.bio}</p>
                </div>
            )}

            {/* Skills / Interests */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Skills & Interests</h3>
                {getSkills().length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {getSkills().map((skill: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No skills listed yet.</p>
                )}
            </div>

            {/* Links */}
            <div className="flex gap-4">
                {student.linkedin_url && (
                    <a href={student.linkedin_url} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        LinkedIn Profile
                    </a>
                )}
                {student.github_url && (
                    <a href={student.github_url} target="_blank" className="flex items-center gap-2 text-gray-800 hover:underline">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        GitHub Profile
                    </a>
                )}
            </div>

            {/* Projects Portfolio */}
            {student.projects && student.projects.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-[#8B1538] pl-3">Project Portfolio</h3>
                    <div className="grid gap-4">
                        {student.projects.map((p: any) => (
                            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 text-lg">{p.title}</h4>
                                    <span className="text-gray-500 text-sm font-medium">{p.year}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{p.description}</p>
                                
                                {p.tech_stack && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {p.tech_stack.split(',').map((t: string, i: number) => (
                                            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase tracking-wide">
                                                {t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-4 text-sm">
                                    {p.project_url && (
                                        <a href={p.project_url} target="_blank" className="text-[#8B1538] hover:underline flex items-center gap-1">
                                            Live Demo ↗
                                        </a>
                                    )}
                                    {p.github_url && (
                                        <a href={p.github_url} target="_blank" className="text-gray-600 hover:text-black hover:underline flex items-center gap-1">
                                            Source Code ↗
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}