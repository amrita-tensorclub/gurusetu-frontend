'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentHelp() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "How do I find research projects that match my interests?",
      answer: "Our recommendation system analyzes your profile, skills, and interests to suggest the most relevant research opportunities. You can also browse all available projects and use filters to find what interests you."
    },
    {
      question: "How do I apply for a research project?",
      answer: "Simply click the 'Apply' button on any project card. Your application will be sent directly to the faculty member, who will review your profile and contact you if you're a good fit."
    },
    {
      question: "Can I work on multiple projects simultaneously?",
      answer: "This depends on the project requirements and your availability. Some projects are full-time commitments, while others are more flexible. Always discuss this with the faculty member before applying."
    },
    {
      question: "How do I update my profile and skills?",
      answer: "Go to the Profile section from the menu to update your personal information, add new skills, projects, and interests. Keeping your profile updated helps improve project recommendations."
    },
    {
      question: "What if I can't find the faculty member's cabin?",
      answer: "Use our campus navigation feature to locate faculty cabins. Each faculty profile includes detailed cabin location information including block, floor, and room number."
    },
    {
      question: "How do I contact faculty members directly?",
      answer: "You can find faculty contact information and office hours in their profiles. We recommend applying through the platform first, but you can also visit during office hours or send an email."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Help & Support</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        
        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Support</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-[#8B1538] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Email Support</div>
                <div className="text-sm text-gray-600">support@gurusetu.amrita.edu</div>
                <div className="text-xs text-gray-500 mt-1">We respond within 24 hours</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-[#8B1538] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Phone Support</div>
                <div className="text-sm text-gray-600">+91 9876543210</div>
                <div className="text-xs text-gray-500 mt-1">Mon-Fri, 9 AM - 6 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About Guru Setu</h2>
          <div className="space-y-3 text-gray-600">
            <p>Guru Setu is your gateway to research collaboration at Amrita Vishwa Vidyapeetham.</p>
            <p>Connect with faculty members, discover research opportunities, and advance your academic journey.</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Version 2.1.4</span>
              <span className="text-sm text-gray-500">© 2025 Guru Setu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}