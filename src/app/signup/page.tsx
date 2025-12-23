'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, Department } from '@/lib/supabase';

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (data) {
      setDepartments(data);
    }
  };

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
      
      // Redirect to dashboard
      if (activeTab === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/faculty');
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
          ←
        </Link>
        <div className="flex items-center space-x-2 text-white">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <div className="w-4 h-4 border border-white rounded-sm"></div>
          <div className="w-4 h-4 bg-white rounded-sm"></div>
          <span className="text-sm font-medium">10:30</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pt-8 pb-8 overflow-y-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8B1538] mb-2">Create Account</h1>
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
            Student Signup
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'faculty'
                ? 'bg-[#8B1538] text-white'
                : 'bg-[#D4AF37] text-white hover:bg-[#B8941F]'
            }`}
          >
            Faculty Signup
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

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#8B1538] font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Powered by <span className="font-medium">[Institution Name]</span>
        </div>
      </div>
    </div>
  );
}