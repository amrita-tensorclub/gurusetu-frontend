'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api'; 
import { useAuth } from '@/hooks/useAuth';

export default function StudentDataTest() {
  const { user, loading: authLoading } = useAuth('student');
  const [studentData, setStudentData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Helper to add logs to screen
  const addLog = (msg: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    setLogs(prev => [`[${timestamp}] ${msg}${dataStr}`, ...prev]);
    console.log(`[${timestamp}] ${msg}`, data || '');
  };

  useEffect(() => {
    if (!authLoading && user) {
      runSystemTest();
    }
  }, [user, authLoading]);

  const runSystemTest = async () => {
    try {
      addLog('🚀 Starting System Diagnosis...');
      addLog('👤 Current User:', user);

      // 1. Fetch Dashboard Data (Student Profile + Projects)
      addLog('📡 Fetching Dashboard Data (API: api.dashboard.student)...');
      const dashboardData = await api.dashboard.student((user as any).id);

      if (!dashboardData) {
        addLog('❌ Error: Dashboard API returned null.');
        return;
      }

      // 2. Validate Student Data
      const student = dashboardData.student;
      setStudentData(student);
      
      if (student) {
        addLog('✅ Student Profile Found:', {
          name: student.name,
          roll: student.roll_number,
          interests: student.area_of_interest
        });
      } else {
        addLog('⚠️ Warning: Student profile is missing in dashboard response.');
      }

      // 3. Validate Projects Data
      const rawProjects = dashboardData.projects || [];
      setProjects(rawProjects);
      addLog(`📦 Received ${rawProjects.length} Projects from Backend.`);

      // 4. Run Matching Algorithm Test
      if (student && rawProjects.length > 0) {
        addLog('🧮 Running Client-Side Match Verification...');
        
        const studentInterests = student.area_of_interest 
          ? student.area_of_interest.split(',').map((i: string) => i.trim().toLowerCase())
          : [];

        addLog(`🎯 Student Tags: [${studentInterests.join(', ')}]`);

        rawProjects.slice(0, 3).forEach((project: any) => {
          const facultyInterests = project.faculty?.area_of_interest 
            ? project.faculty.area_of_interest.split(',').map((i: string) => i.trim().toLowerCase())
            : [];
          
          const projectText = `${project.topic} ${project.description} ${project.tech_stack} ${project.required_skills}`.toLowerCase();
          
          let matchScore = 25;
          // FIX: Explicitly type the array as string[]
          const matches: string[] = [];

          studentInterests.forEach((tag: string) => {
            if (facultyInterests.some((fi: string) => fi.includes(tag))) {
              matchScore += 20;
              matches.push(`Faculty Interest (${tag})`);
            }
            if (projectText.includes(tag)) {
              matchScore += 15;
              matches.push(`Project Content (${tag})`);
            }
          });

          addLog(`   • Project: "${project.topic}"`);
          addLog(`     -> Calculated Score: ${matchScore}%`);
          addLog(`     -> Matched On: ${matches.length > 0 ? matches.join(', ') : 'None'}`);
        });
        
        addLog('✅ Matching Logic Test Complete.');
      } else {
        addLog('⚠️ Skipping Matching Test: Missing student profile or projects.');
      }

    } catch (error: any) {
      addLog('❌ CRITICAL ERROR:', error.message);
    }
  };

  if (authLoading) return <div className="p-8">Loading Auth...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-mono text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Data View */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Student Profile Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-xs text-gray-700">
              {studentData ? JSON.stringify(studentData, null, 2) : 'No Data'}
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Projects Data ({projects.length})</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80 text-xs text-gray-700">
              {projects.length > 0 ? JSON.stringify(projects.slice(0, 2), null, 2) : 'No Projects'}
              {projects.length > 2 && `\n...and ${projects.length - 2} more`}
            </pre>
          </div>
        </div>

        {/* Right Column: Execution Logs */}
        <div className="bg-gray-900 rounded-lg shadow p-6 text-green-400 overflow-hidden flex flex-col h-[calc(100vh-3rem)]">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold text-white">System Logs</h2>
            <button 
              onClick={runSystemTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
            >
              Re-Run Test
            </button>
          </div>
          <div className="flex-1 overflow-y-auto font-mono space-y-2">
            {logs.length === 0 && <span className="opacity-50">Waiting for logs...</span>}
            {logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap border-l-2 border-gray-700 pl-2">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}