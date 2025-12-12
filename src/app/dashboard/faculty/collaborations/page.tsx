'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FacultyProfile {
  id: string;
  name: string;
  employee_id: string;
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
    username: string;
  };
}

interface CollaborationRequest {
  id: string;
  from_faculty_id: string;
  to_faculty_id: string;
  project_title: string;
  description: string;
  collaboration_type: string;
  status: string;
  created_at: string;
}

export default function CollaborationsPage() {
  const router = useRouter();
  const [facultyProfiles, setFacultyProfiles] = useState<FacultyProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<FacultyProfile[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [myRequests, setMyRequests] = useState(0);
  
  const [filters, setFilters] = useState({
    departments: {
      CSE: false,
      ECE: false,
      ME: false,
      Civil: false
    },
    designations: {
      'Professor': false,
      'Associate Professor': false,
      'Assistant Professor': false
    },
    collaborationTypes: {
      'Seeking Co-PI': false,
      'Joint Research': false
    }
  });

  useEffect(() => {
    loadFacultyData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [facultyProfiles, searchQuery, filters]);

  const loadFacultyData = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get all faculty except current user
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty')
        .select(`
          *,
          department:departments(id, name, code),
          user:users(email, username)
        `)
        .neq('user_id', currentUser.id);

      if (!facultyError && faculty) {
        setFacultyProfiles(faculty);
      }

      // Get collaboration requests for current user
      const { data: requests, error: requestsError } = await supabase
        .from('collaboration_requests')
        .select('*')
        .eq('from_faculty_id', currentUser.id);

      if (!requestsError && requests) {
        setCollaborationRequests(requests);
        setMyRequests(requests.length);
      }

    } catch (error) {
      console.error('Error loading faculty data:', error);
      // Fallback to local data if database fails
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Fallback data when database is not available
    const fallbackFaculty: FacultyProfile[] = [
      {
        id: '1',
        name: 'Dr. Rajesh Kumar',
        employee_id: 'FAC.CSE.2015',
        designation: 'Associate Professor',
        area_of_interest: 'Artificial Intelligence, Machine Learning, Healthcare Technology',
        cabin_block: 'B',
        cabin_floor: 2,
        cabin_number: 'B-205',
        department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
        user: { email: 'rajesh.kumar@amrita.edu', username: 'rajeshk' }
      },
      {
        id: '2',
        name: 'Dr. Meera Reddy',
        employee_id: 'FAC.ECE.2018',
        designation: 'Assistant Professor',
        area_of_interest: 'Power Systems, Smart Grid, Renewable Energy',
        cabin_block: 'C',
        cabin_floor: 3,
        cabin_number: 'C-315',
        department: { id: '2', name: 'Electrical & Communication Engineering', code: 'ECE' },
        user: { email: 'meera.reddy@amrita.edu', username: 'meerar' }
      },
      {
        id: '3',
        name: 'Dr. Arjun Nair',
        employee_id: 'FAC.ME.2016',
        designation: 'Professor',
        area_of_interest: 'Manufacturing Systems, IoT, Industry 4.0',
        cabin_block: 'A',
        cabin_floor: 1,
        cabin_number: 'A-105',
        department: { id: '3', name: 'Mechanical Engineering', code: 'ME' },
        user: { email: 'arjun.nair@amrita.edu', username: 'arjunn' }
      },
      {
        id: '4',
        name: 'Dr. Priya Sharma',
        employee_id: 'FAC.CSE.2020',
        designation: 'Assistant Professor',
        area_of_interest: 'Data Science, Climate Modeling, Environmental Informatics',
        cabin_block: 'B',
        cabin_floor: 3,
        cabin_number: 'B-308',
        department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
        user: { email: 'priya.sharma@amrita.edu', username: 'priyas' }
      }
    ];

    setFacultyProfiles(fallbackFaculty);
    setMyRequests(2);
  };

  const applyFilters = () => {
    let filtered = [...facultyProfiles];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(faculty =>
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.area_of_interest?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.department.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply department filter
    const selectedDepartments = Object.keys(filters.departments).filter(
      dept => filters.departments[dept as keyof typeof filters.departments]
    );
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(faculty =>
        selectedDepartments.includes(faculty.department.code)
      );
    }

    // Apply designation filter
    const selectedDesignations = Object.keys(filters.designations).filter(
      designation => filters.designations[designation as keyof typeof filters.designations]
    );
    if (selectedDesignations.length > 0) {
      filtered = filtered.filter(faculty =>
        selectedDesignations.includes(faculty.designation || '')
      );
    }

    setFilteredProfiles(filtered);
  };

  const toggleFilter = (category: string, item: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [item]: !prev[category as keyof typeof prev][item as keyof typeof prev[keyof typeof prev]]
      }
    }));
  };

  const expressInterest = async (facultyId: string, facultyName: string) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const { error } = await supabase
        .from('collaboration_requests')
        .insert({
          from_faculty_id: currentUser.id,
          to_faculty_id: facultyId,
          project_title: `Collaboration Request with ${facultyName}`,
          description: 'Interested in collaborating on research projects',
          collaboration_type: 'General Collaboration',
          status: 'pending'
        });

      if (!error) {
        alert(`Collaboration request sent to ${facultyName}!`);
        setMyRequests(prev => prev + 1);
      } else {
        alert('Failed to send collaboration request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      alert('Failed to send collaboration request. Please try again.');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Collaboration Hub</h1>
          </div>
          <button className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="px-4 py-4">
        <button className="w-12 h-12 bg-[#8B1538] rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Faculty Cards */}
      <div className="px-4 pb-20 space-y-4">
        {filteredProfiles.map((faculty) => (
          <div key={faculty.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Faculty Info */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
                {getInitials(faculty.name)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{faculty.name}, {faculty.department.code}</p>
                <p className="text-sm text-gray-500">{faculty.designation}</p>
              </div>
            </div>

            {/* Research Interests */}
            <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Research Collaboration</h3>

            {/* Interest Tags */}
            {faculty.area_of_interest && (
              <div className="flex flex-wrap gap-2 mb-3">
                {faculty.area_of_interest.split(',').map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3">
              Open for collaboration in {faculty.area_of_interest || 'various research domains'}. 
              {faculty.cabin_block && ` Located at Cabin ${faculty.cabin_number}, Block ${faculty.cabin_block}, Floor ${faculty.cabin_floor}.`}
            </p>

            {/* Seeking Type */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Seeking Co-PI
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => expressInterest(faculty.id, faculty.name)}
                className="flex-1 bg-[#8B1538] text-white py-3 rounded-lg font-medium hover:bg-[#7A1230] transition-colors"
              >
                Express Interest
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        
        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No faculty found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
          <div className="bg-white rounded-tl-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>

            {/* Department Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Department</h4>
              {Object.keys(filters.departments).map(dept => (
                <label key={dept} className="flex items-center space-x-3 mb-2">
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

            {/* Designation Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Designation</h4>
              {Object.keys(filters.designations).map(designation => (
                <label key={designation} className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={filters.designations[designation as keyof typeof filters.designations]}
                    onChange={() => toggleFilter('designations', designation)}
                    className="w-4 h-4 text-[#8B1538] border-gray-300 rounded focus:ring-[#8B1538]"
                  />
                  <span className="text-gray-700">{designation}</span>
                </label>
              ))}
            </div>

            {/* Collaboration Type Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Collaboration Type</h4>
              {Object.keys(filters.collaborationTypes).map(type => (
                <label key={type} className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={filters.collaborationTypes[type as keyof typeof filters.collaborationTypes]}
                    onChange={() => toggleFilter('collaborationTypes', type)}
                    className="w-4 h-4 text-[#8B1538] border-gray-300 rounded focus:ring-[#8B1538]"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowFilter(false)}
              className="w-full bg-[#8B1538] text-white py-3 rounded-lg font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* My Requests Notification */}
      <div className="fixed bottom-4 left-4 right-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-center space-x-3">
          <div className="relative">
            <svg className="w-6 h-6 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {myRequests > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{myRequests}</span>
              </div>
            )}
          </div>
          <span className="text-gray-700 font-medium">My Requests</span>
        </div>
      </div>
    </div>
  );
}