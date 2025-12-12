'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Faculty {
  id: string;
  user_id: string;
  name: string;
  employee_id: string;
  department_id: string;
  designation: string;
  cabin_block: string;
  cabin_floor: number;
  cabin_number: string;
  area_of_interest: string;
  office_hours: string;
  pg_details: string;
  phd_details: string;
  phone_number: string;
  ug_details: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

interface FilterState {
  departments: string[];
}

export default function StudentFaculty() {
  const router = useRouter();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    departments: []
  });

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [faculty, searchQuery, filters]);
  const loadFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select(`
          *,
          department:departments(id, name, code),
          user:users(id, email, username, role)
        `);

      if (data && !error) {
        setFaculty(data);
        
        // Extract unique departments
        const uniqueDepts = data.reduce((acc: any[], curr) => {
          if (curr.department && !acc.find(dept => dept.id === curr.department.id)) {
            acc.push(curr.department);
          }
          return acc;
        }, []);
        setDepartments(uniqueDepts);
      } else {
        console.error('Error loading faculty:', error);
        setFaculty([]);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error loading faculty:', error);
      setFaculty([]);
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFaculty = () => {
    let filtered = faculty;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.designation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by departments
    if (filters.departments.length > 0) {
      filtered = filtered.filter(f => 
        filters.departments.includes(f.department?.code || '')
      );
    }

    setFilteredFaculty(filtered);
  };

  const handleFilterChange = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const FacultyCard = ({ faculty }: { faculty: Faculty }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Profile Photo */}
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face" 
              alt={faculty.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            {/* Name */}
            <h3 className="font-bold text-gray-900 text-base">{faculty.name}</h3>
            
            {/* Department and Designation */}
            <p className="text-gray-600 text-sm mb-1">{faculty.department?.code} Dept.</p>
            <p className="text-gray-500 text-xs">{faculty.designation}</p>
            
            {/* Office Hours if available */}
            {faculty.office_hours && (
              <p className="text-gray-500 text-xs mt-1">Office: {faculty.office_hours}</p>
            )}
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <button 
          onClick={() => router.push(`/dashboard/faculty/profile/${faculty.id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

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
            <h1 className="text-xl font-semibold">All Faculty</h1>
          </div>
          <button className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search faculty by name or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center space-x-2 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            <span className="text-gray-600 font-medium">Filter</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Main Content */}
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map((faculty) => (
            <FacultyCard key={faculty.id} faculty={faculty} />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No faculty found matching your criteria.</h3>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 max-h-80 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6">
            {/* Department Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Department</h3>
              <div className="space-y-2">
                {departments.map(dept => (
                  <label key={dept.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.departments.includes(dept.code)}
                      onChange={() => handleFilterChange('departments', dept.code)}
                      className="w-4 h-4 text-[#8B1538] border-gray-300 rounded focus:ring-[#8B1538]"
                    />
                    <span className="text-sm text-gray-700">{dept.code} - {dept.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Close Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={() => setShowFilters(false)}
              className="w-full bg-[#8B1538] text-white py-3 rounded-lg font-semibold hover:bg-[#7A1230] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Filter Backdrop */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}