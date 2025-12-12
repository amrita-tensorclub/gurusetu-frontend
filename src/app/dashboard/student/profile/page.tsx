'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface StudentProfile {
  id: string;
  name: string;
  roll_number: string;
  year: number;
  department_id: string;
  bio: string | null;
  phone_number: string | null;
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

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function StudentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bioLength, setBioLength] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    bio: '',
    year: ''
  });

  useEffect(() => {
    loadProfile();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (data && !error) {
        setDepartments(data);
      } else {
        // Fallback departments data
        setDepartments([
          { id: '1', name: 'Computer Science & Engineering (CSE)', code: 'CSE' },
          { id: '2', name: 'Electronics & Communication Engineering (ECE)', code: 'ECE' },
          { id: '3', name: 'Mechanical Engineering (ME)', code: 'ME' },
          { id: '4', name: 'Civil Engineering (CE)', code: 'CE' },
          { id: '5', name: 'Electrical & Electronics Engineering (EEE)', code: 'EEE' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
      // Use fallback data
      setDepartments([
        { id: '1', name: 'Computer Science & Engineering (CSE)', code: 'CSE' },
        { id: '2', name: 'Electronics & Communication Engineering (ECE)', code: 'ECE' },
        { id: '3', name: 'Mechanical Engineering (ME)', code: 'ME' },
        { id: '4', name: 'Civil Engineering (CE)', code: 'CE' },
        { id: '5', name: 'Electrical & Electronics Engineering (EEE)', code: 'EEE' }
      ]);
    }
  };

  const loadProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          department:departments(id, name, code),
          user:users(email, username)
        `)
        .eq('user_id', userData.id)
        .single();

      if (data && !error) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone_number: data.phone_number || '',
          bio: data.bio || '',
          year: `${data.year}${data.year === 1 ? 'st' : data.year === 2 ? 'nd' : data.year === 3 ? 'rd' : 'th'} Year / ${2025-data.year+1}-${2025-data.year+5}`
        });
        setBioLength(data.bio?.length || 0);
      } else {
        // Fallback to localStorage
        const profileData = localStorage.getItem('profile');
        if (profileData) {
          const parsed = JSON.parse(profileData);
          setProfile(parsed);
          setFormData({
            name: parsed.name || 'Priya Sharma',
            phone_number: parsed.phone_number || '',
            bio: parsed.bio || '',
            year: '3rd Year / 2022-2026'
          });
          setBioLength(parsed.bio?.length || 0);
        }
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'bio') {
      setBioLength(value.length);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const { error } = await supabase
        .from('students')
        .update({
          name: formData.name,
          phone_number: formData.phone_number || null,
          bio: formData.bio || null
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
            <h1 className="text-xl font-semibold">My Profile</h1>
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
                src="https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=150&h=150&fit=crop&crop=face" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">{profile?.name || 'Priya Sharma'}</h2>
          <p className="text-gray-600">{profile?.department?.code || 'CSE'}, {profile?.year === 1 ? '1st' : profile?.year === 2 ? '2nd' : profile?.year === 3 ? '3rd' : '4th'} Year</p>
          <div className="flex items-center justify-center space-x-2 mt-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{profile?.user?.email || 'priya.sharma@amrita.edu'}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Roll Number: {profile?.roll_number || 'AM.EN.U4CSE22051'}
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Department</label>
            <select
              disabled
              value={profile?.department?.name || 'Computer Science & Engineering (CSE)'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:outline-none"
            >
              <option value={profile?.department?.name || 'Computer Science & Engineering (CSE)'}>
                {profile?.department?.name || 'Computer Science & Engineering (CSE)'}
              </option>
            </select>
          </div>

          {/* Year / Batch */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Year / Batch</label>
            <select
              name="year"
              disabled
              value={formData.year}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:outline-none"
            >
              <option value={formData.year}>{formData.year}</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={profile?.user?.email || 'priya.sharma@amrita.edu'}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Bio / About */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Bio / About</label>
            <div className="relative">
              <textarea
                name="bio"
                placeholder="Write a brief bio (max 100 characters)"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={100}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent resize-none"
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {bioLength}/100
              </div>
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
              Next: Add Experience & Interests
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4 4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}