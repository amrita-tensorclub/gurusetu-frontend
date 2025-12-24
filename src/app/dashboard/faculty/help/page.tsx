'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function FacultyHelp() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('faculty');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "How do I add a new research project opening?",
      answer: "Go to 'My Projects' from the menu. Click the '+ Add Project' button. Fill in the project details including topic, description, tech stack, required skills, duration, and maximum students. Your project will be visible to students immediately."
    },
    {
      question: "How do I review student applications?",
      answer: "Navigate to the 'Applications' tab. You will see a list of students who have applied to your projects. You can view their full profiles, including skills and bio, and choose to 'Accept' or 'Reject' them."
    },
    {
      question: "Can I collaborate with other faculty?",
      answer: "Yes! Use the 'Collaborations' hub to search for other faculty members by department or research interest. You can send them a direct 'Collaboration Request' to start a joint research initiative."
    },
    {
      question: "How do I update my profile?",
      answer: "Go to the 'Profile' section in the sidebar. Here you can update your cabin location, office hours, and research interests so students can find you easily."
    },
    {
      question: "What happens when I accept a student?",
      answer: "The student is notified immediately. The application status changes to 'Accepted' in your dashboard, and the student's count for that project increases."
    },
    {
      question: "Can I delete a project?",
      answer: "Yes, in the 'My Projects' section, you can delete a project. Note that this will also remove any pending applications associated with that project."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  if (authLoading) {
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
        <div className="flex items-center space-x-4 max-w-4xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-8 max-w-4xl mx-auto">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Faculty Help Center</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Guru Setu! This platform helps you connect with motivated students for research collaborations. 
            Find answers to common questions below.
          </p>
        </div>

        {/* Quick Actions Guide */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">1</div>
                <h4 className="font-bold text-gray-900">Post Projects</h4>
                <p className="text-sm text-gray-600 mt-1">Create openings to attract students.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">2</div>
                <h4 className="font-bold text-gray-900">Review Apps</h4>
                <p className="text-sm text-gray-600 mt-1">Accept or reject student proposals.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">3</div>
                <h4 className="font-bold text-gray-900">Collaborate</h4>
                <p className="text-sm text-gray-600 mt-1">Connect with other faculty members.</p>
            </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {faqData.map((faq, index) => (
              <div key={index} className="group">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none"
                >
                  <span className={`font-medium ${expandedFaq === index ? 'text-[#8B1538]' : 'text-gray-700'}`}>
                    {faq.question}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === index ? 'rotate-180 text-[#8B1538]' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedFaq === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-[#8B1538] text-white rounded-xl p-8 mt-8 text-center">
          <h3 className="text-xl font-bold mb-2">Still need help?</h3>
          <p className="mb-6 opacity-90 max-w-lg mx-auto">
            Our support team is available to assist you with any technical issues or account questions.
          </p>
          <button className="bg-white text-[#8B1538] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}