'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface FacultyProfile {
  id: string;
  name: string;
  designation: string | null;
  area_of_interest: string | null;
  cabin_block: string | null;
  cabin_floor: number | null;
  cabin_number: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
  user: {
    email: string;
  };
}

interface CollaborationRequest {
  id: string;
  from_faculty_id: string;
  to_faculty_id: string;
  project_title: string;
  status: string;
}

export default function CollaborationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('faculty');

  const [facultyProfiles, setFacultyProfiles] = useState<FacultyProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<FacultyProfile[]>([]);
  const [myRequests, setMyRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    departments: {
      CSE: false,
      ECE: false,
      ME: false,
      Civil: false,
      AIE: false // Added generic AI department
    },
    designations: {
      'Professor': false,
      'Associate Professor': false,
      'Assistant Professor': false
    }
  });

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        // 1. Get All Faculty
        const facultyData = await api.faculty.getAllFaculty();
        if (facultyData && facultyData.faculty) {
          // Filter out yourself
          const others = facultyData.faculty.filter((f: any) => f.id !== (user as any).id);
          setFacultyProfiles(others);
          setFilteredProfiles(others);
        }

        // 2. Get My Requests
        const requestsData = await api.faculty.getCollaborationRequests((user as any).id);
        if (requestsData && requestsData.requests) {
          setMyRequests(requestsData.requests);
        }

      } catch (error) {
        console.error('Error loading collaboration data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) loadData();
  }, [user, authLoading]);

  // Apply Filters Logic
  useEffect(() => {
    let filtered = [...facultyProfiles];

    // 1. Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.area_of_interest?.toLowerCase().includes(query) ||
        f.designation?.toLowerCase().includes(query) ||
        f.department?.name.toLowerCase().includes(query)
      );
    }

    // 2. Department Filter
    const activeDepts = Object.keys(filters.departments).filter(k => filters.departments[k as keyof typeof filters.departments]);
    if (activeDepts.length > 0) {
      filtered = filtered.filter(f => activeDepts.includes(f.department?.code));
    }

    // 3. Designation Filter
    const activeDesigs = Object.keys(filters.designations).filter(k => filters.designations[k as keyof typeof filters.designations]);
    if (activeDesigs.length > 0) {
      filtered = filtered.filter(f => activeDesigs.includes(f.designation || ''));
    }

    setFilteredProfiles(filtered);
  }, [searchQuery, filters, facultyProfiles]);


  const toggleFilter = (category: 'departments' | 'designations', item: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: !prev[category][item as keyof typeof prev[typeof category]]
      }
    }));
  };

  const expressInterest = async (toFacultyId: string, facultyName: string) => {
    if(!user) return;
    
    // Simple prompt for now, could be a modal later
    const projectTitle = prompt(`Suggest a topic for collaboration with Dr. ${facultyName}:`);
    if (!projectTitle) return;

    const message = "I am interested in collaborating on this research topic.";

    const res = await api.faculty.sendCollaborationRequest((user as any).id, toFacultyId, projectTitle, message);

    if (res.error) {
      alert('Failed: ' + res.error);
    } else {
      alert(`Request sent to Dr. ${facultyName}!`);
      // Optimistic update
      setMyRequests(prev => [...prev, { id: 'temp', from_faculty_id: (user as any).id, to_faculty_id: toFacultyId, project_title: projectTitle, status: 'pending' }]);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4 shadow-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/20 rounded transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl font-bold">Collaboration Hub</h1>
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-3">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by name, research interest, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`px-4 py-3 border rounded-lg font-medium flex items-center gap-2 ${showFilter ? 'bg-[#8B1538] text-white border-[#8B1538]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        
        {/* Faculty List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {filteredProfiles.map((faculty) => (
            <div key={faculty.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl">
                        {getInitials(faculty.name)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{faculty.name}</h3>
                            <p className="text-sm text-[#8B1538] font-medium">{faculty.designation}</p>
                            <p className="text-xs text-gray-500 mb-2">{faculty.department?.name} ({faculty.department?.code})</p>
                        </div>
                        {/* Status Badge */}
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Open to Collab
                        </span>
                    </div>

                    {/* Interests */}
                    {faculty.area_of_interest && (
                        <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Research Interests</p>
                            <div className="flex flex-wrap gap-2">
                                {faculty.area_of_interest.split(',').slice(0, 4).map((interest, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">
                                        {interest.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cabin Info */}
                    {(faculty.cabin_block || faculty.cabin_number) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Cabin: {faculty.cabin_number}, Block {faculty.cabin_block}
                        </p>
                    )}

                    {/* Action */}
                    <button
                        onClick={() => expressInterest(faculty.id, faculty.name)}
                        className="w-full sm:w-auto bg-[#8B1538] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#7A1230] transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Express Interest
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No faculty found matching your criteria.</p>
          </div>
        )}

      </main>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowFilter(false)}>
          <div 
            className="w-80 bg-white h-full shadow-xl p-6 overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilter(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>

            {/* Department */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">Department</h3>
              <div className="space-y-2">
                {Object.keys(filters.departments).map(dept => (
                  <label key={dept} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.departments[dept as keyof typeof filters.departments]}
                      onChange={() => toggleFilter('departments', dept)}
                      className="w-4 h-4 text-[#8B1538] border-gray-300 rounded focus:ring-[#8B1538]"
                    />
                    <span className="text-gray-700">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Designation */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">Designation</h3>
              <div className="space-y-2">
                {Object.keys(filters.designations).map(desig => (
                  <label key={desig} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.designations[desig as keyof typeof filters.designations]}
                      onChange={() => toggleFilter('designations', desig)}
                      className="w-4 h-4 text-[#8B1538] border-gray-300 rounded focus:ring-[#8B1538]"
                    />
                    <span className="text-gray-700">{desig}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
                onClick={() => setShowFilter(false)}
                className="w-full bg-[#8B1538] text-white py-2 rounded-lg font-medium"
            >
                Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Floating Request Counter */}
      {myRequests.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-3 animate-bounce-slow">
            <div className="bg-yellow-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
                <span className="block text-xs text-gray-500 uppercase font-bold">Active Requests</span>
                <span className="block text-sm font-bold text-gray-900">{myRequests.length} Pending</span>
            </div>
        </div>
      )}

    </div>
  );
}