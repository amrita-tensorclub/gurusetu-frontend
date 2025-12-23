'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FacultyNavigationMenu from '@/components/FacultyNavigationMenu';

interface Student {
  id: string;
  name: string;
  roll_number: string;
  year: number;
  area_of_interest: string | null;
  phone_number: string | null; // ✅ ADD THIS
  department: {
    name: string;
    code: string;
  };
  user: {
    email: string;
    username: string;
  };
}

interface Faculty {
  id: string;
  name: string;
  employee_id: string;
  designation: string | null;
  area_of_interest: string | null;
  department: {
    name: string;
    code: string;
  };
  user: {
    email: string;
    username: string;
  };
}

interface FacultyProfile extends Faculty {}

export default function FacultyDashboard() {
  const router = useRouter();
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [recommendedStudents, setRecommendedStudents] = useState<Student[]>([]);
  const [facultyCollaborations, setFacultyCollaborations] = useState<Faculty[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['AI in Healthcare']);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileSource, setProfileSource] = useState<'accepted' | 'applications' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);


  const interestFilters = [
    'AI in Healthcare',
    'IoT Smart Cities', 
    'Blockchain Security',
    'Machine Learning',
    'Computer Vision',
    'Data Science',
    'Web Development',
    'Mobile Apps'
  ];

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');

    if (!userData || userRole !== 'faculty') {
      router.push('/login');
      return false;
    }
    return true;
  };

  const loadDashboardData = async () => {
    if (!checkAuth()) return;

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Load faculty profile
      try {
        const { data: faculty, error: facultyError } = await supabase
          .from('faculty')
          .select(`
            *,
            department:departments(name, code),
            user:users(email, username)
          `)
          .eq('user_id', userData.id)
          .single();

        if (faculty && !facultyError) {
          setFacultyProfile(faculty);
        } else {
          // Fallback profile from localStorage
          const profile = localStorage.getItem('profile');
          if (profile) {
            setFacultyProfile(JSON.parse(profile));
          }
        }
      } catch (err) {
        console.error('Faculty profile error:', err);
        // Use fallback data
        const profile = localStorage.getItem('profile');
        if (profile) {
          setFacultyProfile(JSON.parse(profile));
        }
      }

      // Load students data
      try {
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select(`
            *,
            department:departments(name, code),
            user:users(email, username)
          `)
          .limit(10);

        if (students && !studentsError) {
          setRecommendedStudents(students);
        }
      } catch (err) {
        console.error('Students error:', err);
      }

      // Load other faculty
      try {
        const { data: otherFaculty, error: facultyCollabError } = await supabase
          .from('faculty')
          .select(`
            *,
            department:departments(name, code),
            user:users(email, username)
          `)
          .neq('user_id', userData.id)
          .limit(6);

        if (otherFaculty && !facultyCollabError) {
          setFacultyCollaborations(otherFaculty);
        }
      } catch (err) {
        console.error('Faculty collaborations error:', err);
      }

    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatchPercentage = (student: Student) => {
    // Simple matching algorithm based on interests and department
    let score = 70; // Base score
    
    if (student.area_of_interest && facultyProfile?.area_of_interest) {
      const studentInterests = student.area_of_interest.toLowerCase();
      const facultyInterests = facultyProfile.area_of_interest.toLowerCase();
      
      // Check for common keywords
      const commonKeywords = ['machine learning', 'ai', 'data', 'web', 'mobile', 'iot', 'blockchain'];
      let matches = 0;
      
      commonKeywords.forEach(keyword => {
        if (studentInterests.includes(keyword) && facultyInterests.includes(keyword)) {
          matches++;
        }
      });
      
      score += (matches * 5); // Add 5% per matching keyword
    }
    
    // Same department bonus
    if (student.department.name === facultyProfile?.department.name) {
      score += 10;
    }
    
    // Year-based scoring (prefer 3rd/4th year)
    if (student.year >= 3) {
      score += 10;
    }
    
    return Math.min(Math.max(score, 75), 98); // Keep between 75-98%
  };

  const getStudentSkills = (student: Student) => {
    const interests = student.area_of_interest?.toLowerCase() || '';
    const skills: string[] = [];
    
    if (interests.includes('machine learning') || interests.includes('ml')) skills.push('Machine Learning');
    if (interests.includes('python')) skills.push('Python');
    if (interests.includes('computer vision') || interests.includes('cv')) skills.push('Computer Vision');
    if (interests.includes('web') || interests.includes('react') || interests.includes('javascript')) skills.push('Web Development');
    if (interests.includes('iot') || interests.includes('embedded')) skills.push('IoT');
    if (interests.includes('c++') || interests.includes('cpp')) skills.push('C++');
    if (interests.includes('embedded')) skills.push('Embedded Systems');
    if (interests.includes('java')) skills.push('Java');
    if (interests.includes('mobile') || interests.includes('android')) skills.push('Mobile Development');
    
    // Default skills based on department
    if (skills.length === 0) {
      if (student.department.code === 'CSE') {
        skills.push('Programming', 'Data Structures');
      } else if (student.department.code === 'ECE') {
        skills.push('Electronics', 'Signal Processing');
      } else {
        skills.push('Engineering', 'Problem Solving');
      }
    }
    
    return skills.slice(0, 3); // Max 3 skills
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDepartmentShort = (deptName: string) => {
    const mapping: { [key: string]: string } = {
      'Computer Science & Engineering': 'CSE',
      'Electronics & Communication Engineering': 'ECE',
      'Electrical & Electronics Engineering': 'EEE',
      'Mechanical Engineering': 'ME',
      'Civil Engineering': 'CE',
      'Chemical Engineering': 'ChE',
      'Aerospace Engineering': 'AE'
    };
    return mapping[deptName] || deptName.substring(0, 3).toUpperCase();
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
          {/* Left - Menu and Logo */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Guru</h1>
              <h1 className="text-xl font-bold -mt-1">Setu</h1>
            </div>
          </div>
          
          {/* Right - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            <button className="p-2">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
              </svg>

            </button>
            <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome! Dr. {facultyProfile?.name || 'Faculty'}
        </h2>
        <p className="text-gray-600 mt-1">
          Department of {facultyProfile?.department.name || 'Engineering'}
        </p>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-8">
        {/* Quick Actions Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/dashboard/faculty/projects')}
              className="bg-[#8B1538] text-white p-4 rounded-xl shadow-sm hover:bg-[#7A1230] transition-colors"
            >
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm font-medium">Manage Projects</span>
              </div>
            </button>
            <button 
              onClick={() => router.push('/dashboard/faculty/collaborations')}
              className="bg-white border-2 border-[#8B1538] text-[#8B1538] p-4 rounded-xl shadow-sm hover:bg-[#8B1538] hover:text-white transition-colors"
            >
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm font-medium">Find Collaborators</span>
              </div>
            </button>
          </div>
        </div>
        {/* Recommended Students Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Students</h3>
          
          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {interestFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilters.includes(filter)
                    ? 'bg-[#8B1538] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Student Cards */}
          <div className="space-y-4">
            {recommendedStudents.slice(0, 4).map((student) => {
              const matchPercentage = calculateMatchPercentage(student);
              const skills = getStudentSkills(student);
              
              return (
                <div key={student.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
                      {getAvatarInitials(student.name)}
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                          <p className="text-gray-600">
                            {getDepartmentShort(student.department.name)}, {student.year === 1 ? '1st' : student.year === 2 ? '2nd' : student.year === 3 ? '3rd' : student.year === 4 ? '4th' : `${student.year}th`} Year
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#D4AF37]">{matchPercentage}%</div>
                        </div>
                      </div>
                      
                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#8B1538] text-white text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                            onClick={() => setSelectedStudent(student)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            View Profile
                          </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Faculty Collaborations Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Faculty Collaborations</h3>
            <button className="text-[#8B1538] font-medium flex items-center" onClick={() => router.push('/dashboard/faculty/collaborations')}>
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Collaboration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyCollaborations.slice(0, 4).map((faculty) => (
              <div key={faculty.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getAvatarInitials(faculty.name)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{faculty.designation || 'Dr.'} {faculty.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {faculty.area_of_interest || 'Research & Development'}
                    </p>
                    <p className="text-xs text-gray-500">{getDepartmentShort(faculty.department.name)} Dept.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* STUDENT PROFILE MODAL */}
{selectedStudent && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-black">
    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-4 text-red-600 ">
        <h2 className="text-xl font-bold text-red-700">Student Profile</h2>
        <button
          onClick={() => setSelectedStudent(null)}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Student Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedStudent.name}
          </h3>
          <p className="text-gray-600">
            <span className='text-black'> Roll No</span> : {selectedStudent.roll_number}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{selectedStudent.user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{selectedStudent.user.username}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Year</p>
            <p className="font-medium">{selectedStudent.year}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">
              {selectedStudent.department.name} ({selectedStudent.department.code})
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Area of Interest</p>
          <p className="font-medium">
            {selectedStudent.area_of_interest || 'Not specified'}
          </p>
        </div>
        <div>
  <p className="text-sm text-gray-500">Mobile Number</p>
  <p className="font-medium">
    {selectedStudent.phone_number || 'Not provided'}
  </p>
</div>

      </div>

      {/* Actions */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={() => setSelectedStudent(null)}
          className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
        <button
          className="flex-1 py-2 bg-[#8B1538] text-white rounded-lg hover:bg-[#7A1230]"
        >
          Shortlist Student
        </button>
      </div>
    </div>
  </div>
)}

      {/* Navigation Menu */}
      <FacultyNavigationMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </div>
  );
}