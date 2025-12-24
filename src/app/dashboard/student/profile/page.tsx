'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function StudentProfile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('student');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    roll_number: '',
    email: '',
    department: '',
    year: 0,
    phone_number: '',
    bio: '',
    area_of_interest: '',
    linkedin_url: '',
    github_url: ''
  });

  // Load Data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        // Reuse the dashboard API to get the full profile
        const data = await api.dashboard.student((user as any).id);
        if (data && data.student) {
          const s = data.student;
          setFormData({
            id: s.id,
            name: s.name || '',
            roll_number: s.roll_number || '',
            email: s.user?.email || '',
            department: s.department?.name || '',
            year: s.year || 0,
            phone_number: s.phone_number || '',
            bio: s.bio || '',
            area_of_interest: s.area_of_interest || '',
            linkedin_url: s.linkedin_url || '', // Assuming these fields exist in DB
            github_url: s.github_url || ''
          });
        }
      } catch (error) {
        console.error('Profile load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) loadProfile();
  }, [user, authLoading]);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    const result = await api.student.updateProfile(formData.id, {
      phone_number: formData.phone_number,
      bio: formData.bio,
      area_of_interest: formData.area_of_interest,
      linkedin_url: formData.linkedin_url,
      github_url: formData.github_url
    });

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Update local user cache if needed, or just let the dashboard fetch fresh data
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
      <header className="bg-[#8B1538] text-white px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:bg-white/20 p-1 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          
          {/* Profile Header / Read-Only Info */}
          <div className="bg-gray-50 px-6 py-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-[#8B1538] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{formData.name}</h2>
              <p className="text-gray-500">{formData.roll_number} | {formData.department}</p>
              <p className="text-sm text-gray-400 mt-1">{formData.email}</p>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {message.text && (
              <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  name="phone_number"
                  value={formData.phone_number} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                <input 
                  type="text" 
                  value={formData.year} 
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Area of Interest (Critical for Recommendations) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area of Interest / Skills <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                This helps us recommend relevant projects. Separate skills with commas.
              </p>
              <textarea 
                name="area_of_interest"
                rows={3}
                value={formData.area_of_interest} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none"
                placeholder="e.g. Machine Learning, React, IoT, Python..."
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Me / Bio</label>
              <textarea 
                name="bio"
                rows={4}
                value={formData.bio} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8B1538] focus:border-transparent outline-none"
                placeholder="Tell us about your academic interests and goals..."
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
                <input 
                  type="url" 
                  name="linkedin_url"
                  value={formData.linkedin_url} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8B1538] outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile URL</label>
                <input 
                  type="url" 
                  name="github_url"
                  value={formData.github_url} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8B1538] outline-none"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-8 py-2.5 bg-[#8B1538] text-white rounded-lg hover:bg-[#7A1230] transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}