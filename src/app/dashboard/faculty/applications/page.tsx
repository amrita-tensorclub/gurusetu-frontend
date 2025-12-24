'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function ApplicationReview() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('faculty');
  
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadApplications = async () => {
      if (!user) return;
      try {
        const data = await api.faculty.getApplications((user as any).id);
        
        // Handle Neo4j response structure
        // The API returns { applications: [...] }
        if (data && data.applications) {
          setApplications(data.applications);
        }
      } catch (e) {
        console.error('Error loading applications:', e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) loadApplications();
  }, [user, authLoading]);

  // Handle Accept/Reject
  const handleDecision = async (projectId: string, studentId: string, status: 'accepted' | 'rejected') => {
    // 1. Optimistic UI Update
    setApplications(prev => prev.map((app: any) => {
        // Match logic depends on API response structure (nested vs flat)
        // Assuming: app.project_opening_id & app.student_id from Neo4j relationship properties
        if (app.project_opening_id === projectId && app.student_id === studentId) {
            return { ...app, status: status };
        }
        return app;
    }));

    // 2. Call API
    const result = await api.faculty.updateApplicationStatus(projectId, studentId, status);
    
    if (result.error) {
        alert('Failed to update status: ' + result.error);
        // Revert optimistic update if needed (optional)
    }
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
      <header className="bg-[#8B1538] text-white px-4 py-4 shadow-md">
         <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button onClick={() => router.back()} className="hover:bg-white/20 p-1 rounded">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl font-bold">Review Applications</h1>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {applications.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg shadow border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No pending applications</h3>
                <p className="text-gray-500 mt-1">Students haven't applied to your projects yet.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {applications.map((app: any) => (
                    <div key={`${app.project_opening_id}-${app.student_id}`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            
                            {/* Applicant Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {/* Link to Student Profile View */}
                                    <Link href={`/dashboard/faculty/student/${app.student_id}`} className="font-bold text-lg text-blue-900 hover:underline hover:text-[#8B1538]">
                                        {app.student_name}
                                    </Link>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">
                                        Project: {app.project_title}
                                    </span>
                                </div>
                                
                                <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                                    <p><span className="font-medium">Roll No:</span> {app.student_roll_number}</p>
                                    <p><span className="font-medium">Email:</span> {app.student_email}</p>
                                    <p className="col-span-2 mt-1">
                                        <span className="font-medium">Interested In:</span> {app.student_interests || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                {app.status === 'pending' ? (
                                    <>
                                        <button 
                                            onClick={() => handleDecision(app.project_opening_id, app.student_id, 'accepted')}
                                            className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 w-full sm:w-auto transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleDecision(app.project_opening_id, app.student_id, 'rejected')}
                                            className="px-6 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded hover:bg-red-50 w-full sm:w-auto transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                                        app.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {app.status}
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>
    </div>
  );
}