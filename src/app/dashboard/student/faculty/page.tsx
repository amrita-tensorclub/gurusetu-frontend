'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function BrowseFaculty() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('student');
  
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Parallel fetch for speed
        const [facultyData, deptData] = await Promise.all([
          api.student.getAllFaculty(),
          api.departments.list()
        ]);

        if (facultyData.faculty) setFacultyList(facultyData.faculty);
        
        // Handle department data structure variations
        if (Array.isArray(deptData)) setDepartments(deptData);
        else if (deptData.departments) setDepartments(deptData.departments);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) loadData();
  }, [authLoading]);

  // Filter Logic
  const filteredFaculty = facultyList.filter(f => {
    const matchesSearch = (f.name?.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (f.area_of_interest?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = selectedDept === 'All' || f.department_code === selectedDept || f.department_name === selectedDept;

    return matchesSearch && matchesDept;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:bg-white/20 p-1 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold">Browse Faculty</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search by name or research area..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538] bg-white text-gray-700"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No faculty members found matching your criteria.
            </div>
          ) : (
            filteredFaculty.map((f) => (
              <div key={f.id || Math.random()} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                      {f.name?.charAt(0) || 'F'}
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                      {f.department_code}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{f.name}</h3>
                  <p className="text-sm text-[#8B1538] font-medium mb-3">{f.designation || 'Professor'}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="truncate">{f.email}</span>
                    </div>
                    {f.cabin_number && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span>{f.cabin_block ? `${f.cabin_block} - ` : ''}{f.cabin_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Research Areas</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {f.area_of_interest || 'General Engineering'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}