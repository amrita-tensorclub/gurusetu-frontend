'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // ✅ New API Bridge
import { useAuth } from '@/hooks/useAuth'; // ✅ New Auth Hook

export default function FacultyProfile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('faculty');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cabinExpanded, setCabinExpanded] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Form State matching the database schema
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    designation: '',
    department_id: '',
    phone_number: '',
    office_hours: '',
    cabin_block: '',
    cabin_floor: '',
    cabin_number: '',
    ug_details: '',
    pg_details: '',
    phd_details: '',
    area_of_interest: '' // Ensure this exists for the dashboard recommendations
  });

  const designations = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Senior Professor',
    'Professor Emeritus',
    'Lecturer',
    'Senior Lecturer'
  ];

  const blocks = ['A', 'B', 'C', 'D', 'E'];
  const floors = ['0', '1', '2', '3', '4', '5'];

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Parallel fetch for speed
        const [dashboardData, deptData] = await Promise.all([
          api.dashboard.faculty((user as any).id),
          api.departments.list()
        ]);

        // 1. Setup Departments
        if (Array.isArray(deptData)) setDepartments(deptData);
        else if (deptData.departments) setDepartments(deptData.departments);

        // 2. Setup Profile Data
        if (dashboardData && dashboardData.profile) {
          const p = dashboardData.profile;
          setFormData({
            id: p.id,
            name: p.name || '',
            email: p.user?.email || '', // Nested from Neo4j return
            designation: p.designation || '',
            department_id: p.department_id || p.department?.id || '', // Handle varied return shapes
            phone_number: p.phone_number || '',
            office_hours: p.office_hours || '',
            cabin_block: p.cabin_block || '',
            cabin_floor: p.cabin_floor?.toString() || '',
            cabin_number: p.cabin_number || '',
            ug_details: p.ug_details || '',
            pg_details: p.pg_details || '',
            phd_details: p.phd_details || '',
            area_of_interest: p.area_of_interest || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) loadData();
  }, [user, authLoading]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const removeQualification = (type: 'ug_details' | 'pg_details' | 'phd_details') => {
    setFormData(prev => ({ ...prev, [type]: '' }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Prepare payload (convert floor to number if needed)
    const payload = {
      ...formData,
      cabin_floor: formData.cabin_floor ? parseInt(formData.cabin_floor) : null,
    };

    // ✅ Use API Bridge
    const result = await api.faculty.updateProfile(formData.id, payload);

    if (result.error) {
      alert('Failed to update profile: ' + result.error);
    } else {
      alert('Profile updated successfully!');
      
      // Optional: Update local cache if your app relies on it
      const currentCache = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({ ...currentCache, ...payload }));
    }
    
    setIsSaving(false);
  };

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
      <header className="bg-[#8B1538] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/20 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Faculty Profile</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        
        {/* Profile Photo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
               {formData.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#8B1538] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Dr. {formData.name}</h2>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          
          {/* Designation */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Designation</label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            >
              <option value="">Select Designation</option>
              {designations.map((designation) => (
                <option key={designation} value={designation}>{designation}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Department</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                // Assuming backend returns 'id' for the department node or code
                <option key={dept.id || dept.code} value={dept.id || dept.code}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              placeholder="Enter phone number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            />
          </div>

          {/* Office Hours */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Office Hours</label>
            <input
              type="text"
              name="office_hours"
              placeholder="e.g., Mon, Wed, Fri: 2 PM - 4 PM"
              value={formData.office_hours}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            />
          </div>

          {/* Cabin Location */}
          <div>
            <button
              onClick={() => setCabinExpanded(!cabinExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg font-medium text-gray-900">Cabin Location</span>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${cabinExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {cabinExpanded && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Block</label>
                  <select name="cabin_block" value={formData.cabin_block} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                    <option value="">Select</option>
                    {blocks.map((block) => <option key={block} value={block}>{block}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Floor</label>
                  <select name="cabin_floor" value={formData.cabin_floor} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                    <option value="">Select</option>
                    {floors.map((floor) => <option key={floor} value={floor}>{floor}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Number</label>
                  <input type="text" name="cabin_number" placeholder="B-205" value={formData.cabin_number} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h3>

            {/* UG */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">UG Details</span>
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                <input
                  type="text"
                  name="ug_details"
                  placeholder="e.g. B.Tech in CSE"
                  value={formData.ug_details}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                {formData.ug_details && (
                  <button onClick={() => removeQualification('ug_details')} className="text-gray-400 hover:text-red-500 ml-2">✕</button>
                )}
              </div>
            </div>

            {/* PG */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">PG Details</span>
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                <input
                  type="text"
                  name="pg_details"
                  placeholder="e.g. M.Tech in CSE"
                  value={formData.pg_details}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                {formData.pg_details && (
                  <button onClick={() => removeQualification('pg_details')} className="text-gray-400 hover:text-red-500 ml-2">✕</button>
                )}
              </div>
            </div>

            {/* PhD */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">PhD Details</span>
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                <input
                  type="text"
                  name="phd_details"
                  placeholder="e.g. PhD in AI"
                  value={formData.phd_details}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                {formData.phd_details && (
                  <button onClick={() => removeQualification('phd_details')} className="text-gray-400 hover:text-red-500 ml-2">✕</button>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#8B1538] text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#7A1230] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Next Step (Navigation) */}
          <div className="text-center">
            <button 
              onClick={() => router.push('/dashboard/faculty/research')}
              className="text-[#8B1538] font-medium flex items-center justify-center w-full"
            >
              Next: Add Research Details
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}