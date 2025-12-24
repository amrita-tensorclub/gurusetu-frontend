'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function FacultyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;
  
  const [faculty, setFaculty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (facultyId) {
      loadFacultyProfile();
    }
  }, [facultyId]);

  const loadFacultyProfile = async () => {
    try {
      const data = await api.student.getFacultyProfile(facultyId);
      if (data && data.profile) {
        setFaculty(data.profile);
      }
    } catch (error) {
      console.error('Error loading faculty profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResearchInterests = () => {
    if (!faculty?.area_of_interest) return [];
    return faculty.area_of_interest.split(',').map((interest: string) => interest.trim());
  };

  const formatCabinLocation = () => {
    if (!faculty) return '';
    const parts = [];
    if (faculty.cabin_block) parts.push(`Block ${faculty.cabin_block}`);
    if (faculty.cabin_floor) parts.push(`Floor ${faculty.cabin_floor}`);
    if (faculty.cabin_number) parts.push(`Cabin ${faculty.cabin_number}`);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Faculty Not Found</h2>
          <button onClick={() => router.back()} className="text-[#8B1538] font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  // Helper to format qualifications from properties (Phase 6 model)
  const qualifications = [
    { label: 'PhD', value: faculty.phd_details },
    { label: 'PG', value: faculty.pg_details },
    { label: 'UG', value: faculty.ug_details }
  ].filter(q => q.value);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="relative p-8 text-center bg-gradient-to-b from-gray-50 to-white">
          <button 
            onClick={() => router.back()}
            className="absolute top-6 right-6 w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Profile Photo */}
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#8B1538] shadow-md flex items-center justify-center bg-gray-200">
             <span className="text-4xl font-bold text-gray-500">
               {faculty.name.charAt(0).toUpperCase()}
             </span>
          </div>

          {/* Basic Info */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{faculty.name}</h1>
          <p className="text-[#8B1538] font-medium text-lg mb-1">{faculty.designation}</p>
          <p className="text-gray-500 mb-4">{faculty.department?.name}</p>

          {/* Qualifications */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {qualifications.map((q, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                {q.value}
              </span>
            ))}
          </div>

          {/* Contact Bar */}
          <div className="flex justify-center gap-4 text-sm text-gray-600">
             {faculty.email && (
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {faculty.email}
                </div>
             )}
             {formatCabinLocation() && (
                <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg text-green-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {formatCabinLocation()}
                </div>
             )}
          </div>
        </div>

        <div className="p-8 space-y-8">
            
            {/* Research Interests */}
            {getResearchInterests().length > 0 && (
            <div className="bg-white">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-[#8B1538] pl-3">Research Interests</h2>
                <div className="flex flex-wrap gap-2">
                {getResearchInterests().map((interest: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-gray-50 text-gray-800 rounded-lg text-sm border border-gray-100 hover:border-[#8B1538] transition-colors">
                    {interest}
                    </span>
                ))}
                </div>
            </div>
            )}

            {/* Current Openings */}
            {faculty.openings && faculty.openings.length > 0 && (
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-[#8B1538] pl-3">Current Openings</h2>
                <div className="grid gap-4">
                {faculty.openings.map((opening: any) => (
                    <div key={opening.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900">{opening.topic}</h3>
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${opening.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {opening.status}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{opening.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                            {opening.expected_duration && <span>⏱ {opening.expected_duration}</span>}
                            {opening.max_students && <span>👥 {opening.max_students} Spots</span>}
                        </div>
                    </div>
                ))}
                </div>
            </div>
            )}

            {/* Previous Work & Publications */}
            {(faculty.projects?.length > 0 || faculty.papers?.length > 0) && (
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-[#8B1538] pl-3">Portfolio</h2>
                
                {/* Papers */}
                {faculty.papers?.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Publications</h3>
                        <div className="space-y-3">
                            {faculty.papers.map((p: any) => (
                                <div key={p.id} className="text-sm">
                                    <span className="font-bold text-gray-900">{p.paper_name}</span>
                                    <span className="text-gray-500 block">{p.conference_or_journal} ({p.year_published})</span>
                                    {p.publication_link && <a href={p.publication_link} target="_blank" className="text-[#8B1538] hover:underline text-xs">Read Paper →</a>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {faculty.projects?.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Projects</h3>
                        <div className="space-y-3">
                            {faculty.projects.map((p: any) => (
                                <div key={p.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <span className="font-bold text-gray-900 block">{p.title}</span>
                                    <span className="text-gray-600 block">{p.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            )}

            {/* Availability / Office Hours */}
            {faculty.office_hours && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 border-l-4 border-[#8B1538] pl-3">Office Hours</h2>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 inline-block">
                        {faculty.office_hours}
                    </p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}