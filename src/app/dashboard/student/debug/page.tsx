'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StudentDataTest() {
  const [studentData, setStudentData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    testMatching();
  }, []);

  const testMatching = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User from localStorage:', userData);

      // Get student data
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      console.log('Student data:', student, 'Error:', studentError);
      setStudentData(student);

      // Get project data
      const { data: projectOpenings, error } = await supabase
        .from('faculty_project_openings')
        .select(`
          *,
          faculty!inner (
            id,
            name,
            area_of_interest,
            department:departments(name)
          )
        `)
        .eq('status', 'open')
        .limit(5);

      console.log('Project openings:', projectOpenings, 'Error:', error);
      setProjects(projectOpenings || []);

      // Test matching algorithm
      if (student && projectOpenings) {
        const studentInterests = student.area_of_interest 
          ? student.area_of_interest.split(',').map((i: string) => i.trim().toLowerCase())
          : [];

        console.log('Student interests for testing:', studentInterests);

        projectOpenings.forEach((project) => {
          const facultyInterests = project.faculty?.area_of_interest 
            ? project.faculty.area_of_interest.split(',').map((i: string) => i.trim().toLowerCase())
            : [];
          
          const projectText = `${project.topic} ${project.description} ${project.tech_stack} ${project.required_skills}`.toLowerCase();

          console.log(`\n--- PROJECT: ${project.topic} ---`);
          console.log('Faculty interests:', facultyInterests);
          console.log('Project text:', projectText);
          console.log('Student interests:', studentInterests);

          let matchScore = 25;
          studentInterests.forEach((studentInterest: string) => {
            if (facultyInterests.some((facultyInterest: string) => 
              facultyInterest.includes(studentInterest) || studentInterest.includes(facultyInterest))) {
              matchScore += 20;
              console.log(`✅ Faculty interest match: ${studentInterest}`);
            }
            if (projectText.includes(studentInterest)) {
              matchScore += 15;
              console.log(`✅ Project content match: ${studentInterest}`);
            }
          });

          console.log(`Final match score: ${matchScore}%`);
        });
      }

    } catch (error) {
      console.error('Test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Student Data & Matching Test</h1>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Student Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(studentData, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Project Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(projects, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <button 
            onClick={testMatching}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Run Test Again
          </button>
        </div>
      </div>
    </div>
  );
}