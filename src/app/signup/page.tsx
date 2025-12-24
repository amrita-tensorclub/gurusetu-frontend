'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api'; // Import our bridge

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');
  
  // State for Departments (Fetched from API)
  const [departments, setDepartments] = useState<{id: string, name: string, code: string}[]>([]);
  
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

  // 1. Fetch Departments on Load
  useEffect(() => {
    const loadDepts = async () => {
      const data = await api.departments.list();
      // Handle array or object response structure safely
      if (Array.isArray(data)) setDepartments(data);
      else if (data.departments) setDepartments(data.departments);
    };
    loadDepts();
  }, []);

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
    
    if (!validateForm()) return;

    setIsLoading(true);

    // 2. Use API Bridge
    const response = await api.auth.signup({
       ...formData,
       role: activeTab
    });

    if (response.error) {
       setError(response.error);
       setIsLoading(false);
    } else {
       // Success! Store user and redirect
       // Note: Response usually contains { user: ... }
       if (response.user) {
         localStorage.setItem('currentUser', JSON.stringify(response.user));
       }
       
       // 3. Redirect to the correct Dashboard URL
       if (activeTab === 'student') {
         router.push('/dashboard/student');
       } else {
         router.push('/dashboard/faculty');
       }
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
        </div>

        {/* Role Toggle Buttons */}
        <div className="flex mb-8 space-x-1 justify-center max-w-md mx-auto">
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
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Email */}
            <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                required
            />

            {/* Username */}
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                required
            />
          </div>

          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            required
          />

          {/* Role-specific fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'student' ? (
                <>
                <input
                    type="text"
                    name="rollNumber"
                    placeholder="Roll Number"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                    required
                />
                <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                    required
                >
                    <option value="">Select Year</option>
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                    required
                />
                <input
                    type="text"
                    name="designation"
                    placeholder="Designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                />
                </>
            )}
          </div>

          {/* Department */}
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              // Use dept.code if that is what your backend expects for ID mapping, or dept.id
              <option key={dept.id} value={dept.code || dept.id}>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538] resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Password */}
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                required
            />

            {/* Confirm Password */}
            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center font-bold bg-red-50 p-2 rounded">{error}</div>
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
          Powered by <span className="font-medium">Guru Setu</span>
        </div>
      </div>
    </div>
  );
}