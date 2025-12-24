'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { Department } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    rollNumber: '',
    employeeId: '',
    departmentId: '',
    year: 1,
    designation: '',
    areaOfInterest: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const departments = [
    { id: 'aerospace', name: 'Aerospace Engineering' },
    { id: 'ai-ds', name: 'Artificial Intelligence & Data Science' },
    { id: 'chemical', name: 'Chemical Engineering' },
    { id: 'civil', name: 'Civil Engineering' },
    { id: 'cs-ai', name: 'Computer science and artificial intelligence' },
    { id: 'cse', name: 'Computer Science & Engineering (including AI & ML specializations)' },
    { id: 'cce', name: 'Computer & Communication Engineering' },
    { id: 'eee', name: 'Electrical & Electronics Engineering' },
    { id: 'ece', name: 'Electronics & Communication Engineering' },
    { id: 'mechanical', name: 'Mechanical Engineering' },
    { id: 'robotics', name: 'Robotics & Automation' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!formData.email || !formData.name || !formData.departmentId) {
      setError('Please fill in all required fields');
      return false;
    }
    if (activeTab === 'student' && !formData.rollNumber) {
      setError('Roll number is required for students');
      return false;
    }
    if (activeTab === 'faculty' && !formData.employeeId) {
      setError('Employee ID is required for faculty');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          name: formData.name,
          rollNumber: formData.rollNumber,
          employeeId: formData.employeeId,
          departmentId: formData.departmentId,
          year: formData.year,
          designation: formData.designation,
          areaOfInterest: formData.areaOfInterest,
          role: activeTab
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Store user info for demo
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userRole', activeTab);
      
      // Redirect to welcome page
      if (activeTab === 'student') {
        router.push('/welcome/student');
      } else {
        router.push('/welcome/faculty');
      }

    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-[#8B1538] h-16 flex items-center justify-between px-4">
        <Link href="/login" className="text-white text-lg">
          Already have an account? Sign In
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pt-8 pb-8 overflow-y-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#8B1538] rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#8B1538] mb-2">Guru Setu</h1>
          <p className="text-lg text-[#8B1538] font-semibold mb-2">Bridge to the Guru</p>
          <p className="text-gray-700 text-sm">
            Join Guru Setu for Research Excellence
          </p>
        </div>

        {/* Role Toggle Buttons */}
        <div className="flex mb-8 space-x-1">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'student'
                ? 'bg-[#8B1538] text-white'
                : 'bg-[#D4AF37] text-white hover:bg-[#B8941F]'
            }`}
          >
            Join as Student
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'faculty'
                ? 'bg-[#8B1538] text-white'
                : 'bg-[#D4AF37] text-white hover:bg-[#B8941F]'
            }`}
          >
            Join as Faculty
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            required
          />

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            required
          />

          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            required
          />

          {/* Role-specific fields */}
          {activeTab === 'student' ? (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Roll Number"
                value={formData.rollNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
                required
              />
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
                required
              >
                <option value="">Select Year</option>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </>
          ) : (
            <>
              <input
                type="text"
                name="employeeId"
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
                required
              />
              <input
                type="text"
                name="designation"
                placeholder="Designation (e.g., Assistant Professor)"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
              />
            </>
          )}

          {/* Department */}
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Area of Interest */}
          <textarea
            name="areaOfInterest"
            placeholder="Area of Interest (optional)"
            value={formData.areaOfInterest}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent resize-none"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            required
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
            required
          />

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8B1538] text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#7A1230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Bottom Text */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Powered by <span className="font-medium">[Institution Name]</span>
        </div>
      </div>
    </div>
  );
}
