'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FacultyHelp() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "How do I add a new research project opening?",
      answer: "Go to 'My Projects' from the menu or dashboard. Click the '+ Add Project' button. Fill in the project details including topic, description, tech stack, required skills, duration, and maximum students. Your project will be visible to students immediately after creation."
    },
    {
      question: "What information should I include in my project description?",
      answer: "Include clear objectives, methodology, expected outcomes, and any specific requirements. Mention the problem you're trying to solve, technologies involved, and what students will learn. Be specific about the skills needed and the time commitment required."
    },
    {
      question: "How can students find and apply to my projects?",
      answer: "Your open projects appear in students' dashboards with match percentages based on their profiles. Students can see project details, your profile, and apply directly. You'll receive notifications when students apply to your projects."
    },
    {
      question: "Can I edit or close a project after posting it?",
      answer: "Yes, you can edit any project details or change the status from your project management page. You can set projects as 'Open', 'In Progress', or 'Closed'. Closed projects won't appear in student searches but remain in your project history."
    },
    {
      question: "How does the student recommendation system work?",
      answer: "Students are matched to your projects based on their department, year, interests, and skills. The system calculates match percentages and shows your projects to the most relevant students first, increasing the quality of applications."
    },
    {
      question: "Can I collaborate with other faculty members?",
      answer: "Yes! Use the 'Faculty Collaborations' feature to connect with colleagues, share projects, and work together on research initiatives. You can search for faculty by department and research interests."
    },
    {
      question: "What's the difference between project openings and completed projects?",
      answer: "Project openings are current opportunities for students to join. They appear in student searches and accept applications. Completed projects are historical records of your past work, useful for showcasing your research portfolio."
    },
    {
      question: "How do I manage multiple students on the same project?",
      answer: "Set the 'Max Students' field when creating a project. You can accept multiple applications up to this limit. Each student will be notified of their acceptance, and you can coordinate the project through the platform."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4">
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
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Faculty Help Center</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Guru Setu! This platform helps you connect with motivated students for research collaborations. 
            Find answers to common questions below, or contact our support team for additional assistance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Start Guide</h3>
          <div className="grid gap-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">Complete Your Profile</h4>
                <p className="text-gray-600 text-sm">Update your research interests, qualifications, and contact details</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Post Research Projects</h4>
                <p className="text-gray-600 text-sm">Create project openings to attract interested students</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">Review Applications</h4>
                <p className="text-gray-600 text-sm">Get matched with students and review their profiles</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-[#8B1538] text-white rounded-xl p-6 mt-6">
          <h3 className="text-lg font-bold mb-4">Need More Help?</h3>
          <p className="mb-4 opacity-90">
            Can't find what you're looking for? Our support team is here to help you make the most of Guru Setu.
          </p>
          <div className="flex flex-col space-y-3">
            <button className="bg-white text-[#8B1538] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Contact Support Team
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#8B1538] transition-colors">
              Schedule a Demo Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}