'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FacultyProfile {
  id: string;
  name: string;
  employee_id: string;
  designation: string | null;
  department_id: string;
  cabin_block: string | null;
  cabin_floor: number | null;
  cabin_number: string | null;
  area_of_interest: string | null;
  phone_number: string | null;
  office_hours: string | null;
  ug_details: string | null;
  pg_details: string | null;
  phd_details: string | null;
  department: {
    name: string;
    code: string;
  };
  user: {
    email: string;
    username: string;
  };
}

export default function FacultyProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cabinExpanded, setCabinExpanded] = useState(true);
  const [formData, setFormData] = useState({
    designation: '',
    phone_number: '',
    office_hours: '',
    cabin_block: '',
    cabin_floor: '',
    cabin_number: '',
    ug_details: '',
    pg_details: '',
    phd_details: ''
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

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering'
  ];

  const blocks = ['A', 'B', 'C', 'D', 'E'];
  const floors = ['0', '1', '2', '3', '4', '5'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const { data, error } = await supabase
        .from('faculty')
        .select(`
          *,
          department:departments(name, code),
          user:users(email, username)
        `)
        .eq('user_id', userData.id)
        .single();

      if (data && !error) {
        setProfile(data);
        setFormData({
          designation: data.designation || '',
          phone_number: data.phone_number || '',
          office_hours: data.office_hours || '',
          cabin_block: data.cabin_block || '',
          cabin_floor: data.cabin_floor?.toString() || '',
          cabin_number: data.cabin_number || '',
          ug_details: data.ug_details || '',
          pg_details: data.pg_details || '',
          phd_details: data.phd_details || ''
        });
      } else {
        // Fallback to localStorage
        const profileData = localStorage.getItem('profile');
        if (profileData) {
          const parsed = JSON.parse(profileData);
          setProfile(parsed);
          setFormData({
            designation: parsed.designation || 'Assistant Professor',
            phone_number: parsed.phone_number || '',
            office_hours: parsed.office_hours || 'Mon, Wed, Fri: 2 PM - 4 PM',
            cabin_block: parsed.cabin_block || 'B',
            cabin_floor: parsed.cabin_floor?.toString() || '2',
            cabin_number: parsed.cabin_number || 'B-205',
            ug_details: parsed.ug_details || 'B.Tech in CSE, Amrita Vishwa Vidyapeetham, 2010',
            pg_details: parsed.pg_details || 'M.Tech in CS, IIT Madras, 2012',
            phd_details: parsed.phd_details || 'PhD in AI, IISc Bangalore, 2018'
          });
        }
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const { error } = await supabase
        .from('faculty')
        .update({
          designation: formData.designation,
          phone_number: formData.phone_number || null,
          office_hours: formData.office_hours || null,
          cabin_block: formData.cabin_block || null,
          cabin_floor: formData.cabin_floor ? parseInt(formData.cabin_floor) : null,
          cabin_number: formData.cabin_number || null,
          ug_details: formData.ug_details || null,
          pg_details: formData.pg_details || null,
          phd_details: formData.phd_details || null
        })
        .eq('user_id', userData.id);

      if (!error) {
        // Update local storage
        const updatedProfile = { ...profile, ...formData };
        localStorage.setItem('profile', JSON.stringify(updatedProfile));
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const removeQualification = (type: 'ug_details' | 'pg_details' | 'phd_details') => {
    setFormData(prev => ({
      ...prev,
      [type]: ''
    }));
  };

  if (isLoading) {
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
            <button 
              onClick={() => router.back()}
              className="p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Faculty Profile</h1>
          </div>
          <button className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Profile Photo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-white text-2xl font-medium overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#8B1538] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Dr. {profile?.name}</h2>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            >
              {designations.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Department</label>
            <select
              disabled
              value={profile?.department?.name || 'Computer Science & Engineering'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:outline-none"
            >
              <option value={profile?.department?.name || 'Computer Science & Engineering'}>
                {profile?.department?.name || 'Computer Science & Engineering'}
              </option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={profile?.user?.email || 'rajesh.kumar@amrita.edu'}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            />
          </div>

          {/* Office Hours */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Office Hours</label>
            <div className="relative">
              <input
                type="text"
                name="office_hours"
                placeholder="e.g., Mon, Wed, Fri: 2 PM - 4 PM"
                value={formData.office_hours}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
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
              <svg 
                className={`w-5 h-5 text-gray-400 transform transition-transform ${cabinExpanded ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {cabinExpanded && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Block (A/B/C/D)</label>
                  <select
                    name="cabin_block"
                    value={formData.cabin_block}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent text-sm"
                  >
                    <option value="">Select</option>
                    {blocks.map((block) => (
                      <option key={block} value={block}>
                        {block}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Floor (0-5)</label>
                  <select
                    name="cabin_floor"
                    value={formData.cabin_floor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent text-sm"
                  >
                    <option value="">Select</option>
                    {floors.map((floor) => (
                      <option key={floor} value={floor}>
                        {floor}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cabin Number</label>
                  <input
                    type="text"
                    name="cabin_number"
                    placeholder="B-205"
                    value={formData.cabin_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h3>
            
            {/* UG Details */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">UG Details</span>
                <button className="w-6 h-6 bg-[#8B1538] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {formData.ug_details ? (
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                  <input
                    type="text"
                    name="ug_details"
                    value={formData.ug_details}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <button 
                    onClick={() => removeQualification('ug_details')}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  name="ug_details"
                  placeholder="e.g., B.Tech in CSE, Amrita Vishwa Vidyapeetham, 2010"
                  value={formData.ug_details}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* PG Details */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">PG Details</span>
                <button className="w-6 h-6 bg-[#8B1538] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {formData.pg_details ? (
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                  <input
                    type="text"
                    name="pg_details"
                    value={formData.pg_details}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <button 
                    onClick={() => removeQualification('pg_details')}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  name="pg_details"
                  placeholder="e.g., M.Tech in CS, IIT Madras, 2012"
                  value={formData.pg_details}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* PhD Details */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">PhD Details</span>
                <button className="w-6 h-6 bg-[#8B1538] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {formData.phd_details ? (
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                  <input
                    type="text"
                    name="phd_details"
                    value={formData.phd_details}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <button 
                    onClick={() => removeQualification('phd_details')}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  name="phd_details"
                  placeholder="e.g., PhD in AI, IISc Bangalore, 2018"
                  value={formData.phd_details}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent text-sm"
                />
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#8B1538] text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#7A1230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Next Step */}
          <div className="text-center">
            <button className="text-[#8B1538] font-medium flex items-center justify-center w-full">
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