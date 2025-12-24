'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function StudentHelp() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('student');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "How do I apply for a research project?",
      answer: "Go to your Dashboard or the 'Browse Faculty' page. Click on a project card to view details. If you meet the requirements, click the 'Apply' button. You may be asked to add a short message explaining your interest."
    },
    {
      question: "How do I know if my application was accepted?",
      answer: "You can track the status of all your proposals in the 'My Applications' (or 'My Projects') tab. The status will change from 'Pending' to 'Accepted' or 'Rejected'. You will also receive a notification when a decision is made."
    },
    {
      question: "Why can't I see any recommended projects?",
      answer: "Recommendations are based on your profile skills and interests. Go to the 'Profile' or 'Interests & Skills' page and ensure you have added relevant tags (e.g., Machine Learning, Python, Robotics) to see better matches."
    },
    {
      question: "Can I apply to multiple projects?",
      answer: "Yes, you can apply to multiple projects. However, we recommend focusing on 2-3 projects that best match your skills to increase your chances of acceptance and to ensure you can manage the workload."
    },
    {
      question: "How do I contact a faculty member?",
      answer: "Once your application is accepted, you will see the faculty member's contact details (email and cabin location) on the project card. You can also visit their profile page to see their office hours."
    },
    {
      question: "Can I update my application after sending it?",
      answer: "Currently, you cannot edit an application once sent. If you made a mistake, you can reach out to the faculty member directly or wait for their response."
    },
    {
      question: "What should I put in my bio?",
      answer: "Your bio is your chance to introduce yourself. Mention your academic background, key projects you've worked on, and what areas of research you are passionate about. Keep it professional and concise."
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
          <h1 className="text-xl font-bold">Student Help & Support</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-8 max-w-4xl mx-auto">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help you?</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Guru Setu! This platform connects you with top faculty for research opportunities. 
            Browse the guide below to get started.
          </p>
        </div>

        {/* Quick Actions Guide */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">1</div>
                <h4 className="font-bold text-gray-900">Update Profile</h4>
                <p className="text-sm text-gray-600 mt-1">Add your skills to get project recommendations.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">2</div>
                <h4 className="font-bold text-gray-900">Apply to Projects</h4>
                <p className="text-sm text-gray-600 mt-1">Browse openings and submit your proposals.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">3</div>
                <h4 className="font-bold text-gray-900">Start Research</h4>
                <p className="text-sm text-gray-600 mt-1">Get accepted and begin your research journey.</p>
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
            Our support team is available to assist you with account issues or application problems.
          </p>
          <button className="bg-white text-[#8B1538] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}