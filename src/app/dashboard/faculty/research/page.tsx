'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FacultyProfile {
  id: string;
  name: string;
  designation: string;
  area_of_interest: string | null;
  department: {
    name: string;
    code: string;
  };
}

interface ProjectOpening {
  id: string;
  faculty_id: string;
  topic: string;
  description: string | null;
  tech_stack: string | null;
  required_skills: string | null;
  expected_duration: string | null;
  max_students: number | null;
  status: string;
}

interface ResearchOpening {
  id: string;
  faculty_id: string;
  topic: string;
  description: string | null;
  required_skills: string | null;
  expected_duration: string | null;
  max_students: number | null;
  status: string;
}

interface PreviousProject {
  id: string;
  faculty_id: string;
  title: string;
  description: string | null;
  tech_stack: string | null;
  year_completed: number | null;
  collaborators: string | null;
  project_url: string | null;
}

interface ResearchPaper {
  id: string;
  faculty_id: string;
  paper_name: string;
  publication_link: string | null;
  conference_or_journal: string | null;
  year_published: number | null;
  co_authors: string | null;
}

export default function FacultyResearchExperience() {
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [projectOpenings, setProjectOpenings] = useState<ProjectOpening[]>([]);
  const [researchOpenings, setResearchOpenings] = useState<ResearchOpening[]>([]);
  const [previousProjects, setPreviousProjects] = useState<PreviousProject[]>([]);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [showAddOpening, setShowAddOpening] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [openingType, setOpeningType] = useState<'project' | 'research'>('project');
  const [workType, setWorkType] = useState<'project' | 'paper'>('project');
  
  // Form states
  const [newInterest, setNewInterest] = useState('');
  const [openingForm, setOpeningForm] = useState({
    topic: '',
    description: '',
    tech_stack: '',
    required_skills: '',
    expected_duration: '',
    max_students: 1
  });
  const [workForm, setWorkForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    collaborators: '',
    year: new Date().getFullYear(),
    publication_link: '',
    conference_or_journal: '',
    project_url: ''
  });

  const predefinedInterests = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Computer Vision',
    'Natural Language Processing', 'Robotics', 'Internet of Things', 'Blockchain',
    'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'Web Development',
    'Software Engineering', 'Database Systems', 'Networks', 'Embedded Systems',
    'Signal Processing', 'Image Processing', 'Human-Computer Interaction',
    'Distributed Systems', 'Operating Systems', 'Algorithms', 'Theoretical Computer Science'
  ];

  useEffect(() => {
    loadFacultyData();
    loadOpenings();
    loadPreviousWork();
  }, []);

  const loadFacultyData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (userData.id) {
        const { data, error } = await supabase
          .from('faculty')
          .select(`
            *,
            department:departments(id, name, code)
          `)
          .eq('user_id', userData.id)
          .single();

        if (data && !error) {
          setFacultyProfile(data);
          
          // Parse interests
          if (data.area_of_interest) {
            const interestsList = data.area_of_interest
              .split(',')
              .map((interest: string) => interest.trim())
              .filter((interest: string) => interest.length > 0);
            setInterests(interestsList);
          }
        } else {
          console.error('Error loading faculty data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading faculty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOpenings = async () => {
    if (!facultyProfile?.id) return;

    try {
      // Load project openings
      const { data: projectData, error: projectError } = await supabase
        .from('faculty_project_openings')
        .select('*')
        .eq('faculty_id', facultyProfile.id);

      if (projectData && !projectError) {
        setProjectOpenings(projectData);
      }

      // Load research openings
      const { data: researchData, error: researchError } = await supabase
        .from('faculty_research_openings')
        .select('*')
        .eq('faculty_id', facultyProfile.id);

      if (researchData && !researchError) {
        setResearchOpenings(researchData);
      }
    } catch (error) {
      console.error('Error loading openings:', error);
    }
  };

  const loadPreviousWork = async () => {
    if (!facultyProfile?.id) return;

    try {
      // Load previous projects
      const { data: projectData, error: projectError } = await supabase
        .from('faculty_projects')
        .select('*')
        .eq('faculty_id', facultyProfile.id)
        .order('year_completed', { ascending: false });

      if (projectData && !projectError) {
        setPreviousProjects(projectData);
      }

      // Load research papers
      const { data: paperData, error: paperError } = await supabase
        .from('faculty_research_papers')
        .select('*')
        .eq('faculty_id', facultyProfile.id)
        .order('year_published', { ascending: false });

      if (paperData && !paperError) {
        setResearchPapers(paperData);
      }
    } catch (error) {
      console.error('Error loading previous work:', error);
    }
  };

  const addInterest = async (interest: string) => {
    if (!facultyProfile?.id || interests.includes(interest)) return;

    const newInterests = [...interests, interest];
    const updatedInterestsString = newInterests.join(', ');

    try {
      const { error } = await supabase
        .from('faculty')
        .update({ area_of_interest: updatedInterestsString })
        .eq('id', facultyProfile.id);

      if (!error) {
        setInterests(newInterests);
      } else {
        console.error('Error adding interest:', error);
      }
    } catch (error) {
      console.error('Error adding interest:', error);
    }
  };

  const removeInterest = async (interestToRemove: string) => {
    if (!facultyProfile?.id) return;

    const newInterests = interests.filter(interest => interest !== interestToRemove);
    const updatedInterestsString = newInterests.join(', ');

    try {
      const { error } = await supabase
        .from('faculty')
        .update({ area_of_interest: updatedInterestsString })
        .eq('id', facultyProfile.id);

      if (!error) {
        setInterests(newInterests);
      } else {
        console.error('Error removing interest:', error);
      }
    } catch (error) {
      console.error('Error removing interest:', error);
    }
  };

  const addOpening = async () => {
    if (!facultyProfile?.id) return;

    try {
      const table = openingType === 'project' ? 'faculty_project_openings' : 'faculty_research_openings';
      const data: any = {
        faculty_id: facultyProfile.id,
        topic: openingForm.topic,
        description: openingForm.description,
        required_skills: openingForm.required_skills,
        expected_duration: openingForm.expected_duration,
        max_students: openingForm.max_students,
        status: 'open'
      };

      if (openingType === 'project') {
        data.tech_stack = openingForm.tech_stack;
      }

      const { error } = await supabase
        .from(table)
        .insert([data]);

      if (!error) {
        setOpeningForm({
          topic: '',
          description: '',
          tech_stack: '',
          required_skills: '',
          expected_duration: '',
          max_students: 1
        });
        setShowAddOpening(false);
        loadOpenings();
      } else {
        console.error('Error adding opening:', error);
      }
    } catch (error) {
      console.error('Error adding opening:', error);
    }
  };

  const addWork = async () => {
    if (!facultyProfile?.id) return;

    try {
      if (workType === 'project') {
        const { error } = await supabase
          .from('faculty_projects')
          .insert([{
            faculty_id: facultyProfile.id,
            title: workForm.title,
            description: workForm.description,
            tech_stack: workForm.tech_stack,
            collaborators: workForm.collaborators,
            year_completed: workForm.year,
            project_url: workForm.project_url
          }]);

        if (!error) {
          loadPreviousWork();
        } else {
          console.error('Error adding project:', error);
        }
      } else {
        const { error } = await supabase
          .from('faculty_research_papers')
          .insert([{
            faculty_id: facultyProfile.id,
            paper_name: workForm.title,
            publication_link: workForm.publication_link,
            conference_or_journal: workForm.conference_or_journal,
            co_authors: workForm.collaborators,
            year_published: workForm.year
          }]);

        if (!error) {
          loadPreviousWork();
        } else {
          console.error('Error adding paper:', error);
        }
      }

      setWorkForm({
        title: '',
        description: '',
        tech_stack: '',
        collaborators: '',
        year: new Date().getFullYear(),
        publication_link: '',
        conference_or_journal: '',
        project_url: ''
      });
      setShowAddWork(false);
    } catch (error) {
      console.error('Error adding work:', error);
    }
  };

  const toggleOpeningStatus = async (opening: ProjectOpening | ResearchOpening, type: 'project' | 'research') => {
    const newStatus = opening.status === 'open' ? 'closed' : 'open';
    const table = type === 'project' ? 'faculty_project_openings' : 'faculty_research_openings';

    try {
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', opening.id);

      if (!error) {
        loadOpenings();
      }
    } catch (error) {
      console.error('Error updating opening status:', error);
    }
  };

  const deleteOpening = async (id: string, type: 'project' | 'research') => {
    const table = type === 'project' ? 'faculty_project_openings' : 'faculty_research_openings';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (!error) {
        loadOpenings();
      }
    } catch (error) {
      console.error('Error deleting opening:', error);
    }
  };

  const deleteWork = async (id: string, type: 'project' | 'paper') => {
    const table = type === 'project' ? 'faculty_projects' : 'faculty_research_papers';

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (!error) {
        loadPreviousWork();
      }
    } catch (error) {
      console.error('Error deleting work:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 placeholder-gray-500">
      {/* Header */}
      <header className="bg-[#8B1538] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Research & Experience</h1>
          </div>
          <button 
            onClick={loadFacultyData}
            className="p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Domain Interests */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Domain Interests</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-3 py-1 rounded-full bg-[#8B1538] text-white text-sm"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="ml-2 text-white hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={() => setShowAddInterest(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 px-4 text-gray-500 hover:border-[#8B1538] hover:text-[#8B1538] transition-colors"
          >
            + Add Domain
          </button>
        </div>

        {/* Current R&D Openings */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current R&D Openings</h3>
          
          <div className="space-y-4">
            {[...projectOpenings, ...researchOpenings].map((opening, index) => {
              const isProject = 'tech_stack' in opening && opening.tech_stack !== undefined;
              const type: 'project' | 'research' = isProject ? 'project' : 'research';
              return (
                <div key={opening.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{opening.topic}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        opening.status === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {opening.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                      <button
                        onClick={() => toggleOpeningStatus(opening, type)}
                        className="p-1 text-gray-400 hover:text-[#8B1538]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteOpening(opening.id, type)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {opening.description && (
                    <p className="text-gray-600 text-sm mb-3">{opening.description}</p>
                  )}

                  {isProject && (opening as ProjectOpening).tech_stack && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {((opening as ProjectOpening).tech_stack || '').split(',').map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
                    {opening.expected_duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {opening.expected_duration}
                      </div>
                    )}
                    {opening.max_students && (
                      <div>
                        <span className="font-medium">Max Students:</span> {opening.max_students}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowAddOpening(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 text-gray-500 hover:border-[#8B1538] hover:text-[#8B1538] transition-colors mt-4"
          >
            + Post New Opening
          </button>
        </div>

        {/* Previous Work & Publications */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Previous Work & Publications</h3>
          
          <div className="space-y-4">
            {/* Research Papers */}
            {researchPapers.map((paper) => (
              <div key={paper.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-3 h-3 bg-[#8B1538] rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{paper.paper_name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{paper.year_published}</span>
                      <button
                        onClick={() => deleteWork(paper.id, 'paper')}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Publication</span>
                    {paper.conference_or_journal && ` - ${paper.conference_or_journal}`}
                  </p>
                  {paper.co_authors && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Co-authors:</span> {paper.co_authors}
                    </p>
                  )}
                  {paper.publication_link && (
                    <a 
                      href={paper.publication_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#8B1538] hover:underline mt-1 inline-block"
                    >
                      View Publication →
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Previous Projects */}
            {previousProjects.map((project) => (
              <div key={project.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-3 h-3 bg-[#8B1538] rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{project.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{project.year_completed}</span>
                      <button
                        onClick={() => deleteWork(project.id, 'project')}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Project</span>
                  </p>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  )}
                  {project.collaborators && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Collaborators:</span> {project.collaborators}
                    </p>
                  )}
                  {project.tech_stack && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tech_stack.split(',').map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.project_url && (
                    <a 
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#8B1538] hover:underline mt-1 inline-block"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAddWork(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 text-gray-500 hover:border-[#8B1538] hover:text-[#8B1538] transition-colors mt-4"
          >
            + Add Work
          </button>
        </div>
      </div>

      {/* Add Interest Modal */}
      {showAddInterest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Research Interest</h3>
            
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {predefinedInterests
                .filter(interest => !interests.includes(interest))
                .map((interest) => (
                <button
                  key={interest}
                  onClick={() => {
                    addInterest(interest);
                    setShowAddInterest(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm"
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <input
                type="text"
                placeholder="Or type custom interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 text-gray-900 placeholder-gray-500"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (newInterest.trim()) {
                      addInterest(newInterest.trim());
                      setNewInterest('');
                      setShowAddInterest(false);
                    }
                  }}
                  className="flex-1 bg-[#8B1538] text-white py-2 rounded font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setNewInterest('');
                    setShowAddInterest(false);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Opening Modal */}
      {showAddOpening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-red-500">
            <h3 className="text-lg font-bold mb-4">Post New Opening</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-gray-900">
                    <input
                      type="radio"
                      value="project"
                      checked={openingType === 'project'}
                      onChange={(e) => setOpeningType(e.target.value as 'project' | 'research')}
                      className="mr-2"
                    />
                    Project Opening
                  </label>
                  <label className="flex items-center text-gray-900">
                    <input
                      type="radio"
                      value="research"
                      checked={openingType === 'research'}
                      onChange={(e) => setOpeningType(e.target.value as 'project' | 'research')}
                      className="mr-2"
                    />
                    Research Opening
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Topic</label>
                <input
                  type="text"
                  value={openingForm.topic}
                  onChange={(e) => setOpeningForm({...openingForm, topic: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
                  placeholder="Enter project/research topic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Description</label>
                <textarea
                  value={openingForm.description}
                  onChange={(e) => setOpeningForm({...openingForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20 text-gray-900 placeholder-gray-500"
                  placeholder="Brief description of the work"
                />
              </div>

              {openingType === 'project' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Tech Stack</label>
                  <input
                    type="text"
                    value={openingForm.tech_stack}
                    onChange={(e) => setOpeningForm({...openingForm, tech_stack: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Python, React, Node.js"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Required Skills</label>
                <input
                  type="text"
                  value={openingForm.required_skills}
                  onChange={(e) => setOpeningForm({...openingForm, required_skills: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
                  placeholder="Skills required for this opening"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Expected Duration</label>
                <input
                  type="text"
                  value={openingForm.expected_duration}
                  onChange={(e) => setOpeningForm({...openingForm, expected_duration: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
                  placeholder="e.g., 6 months, Summer 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Max Students</label>
                <input
                  type="number"
                  min="1"
                  value={openingForm.max_students}
                  onChange={(e) => setOpeningForm({...openingForm, max_students: parseInt(e.target.value) || 1})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addOpening}
                disabled={!openingForm.topic.trim()}
                className="flex-1 bg-[#8B1538] text-white py-2 rounded font-medium disabled:bg-gray-300 text-black"
              >
                Post Opening
              </button>
              <button
                onClick={() => {
                  setOpeningForm({
                    topic: '',
                    description: '',
                    tech_stack: '',
                    required_skills: '',
                    expected_duration: '',
                    max_students: 1
                  });
                  setShowAddOpening(false);
                }}
                className="flex-1 border border-gray-300 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Work Modal */}
      {showAddWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-black">
            <h3 className="text-lg font-bold mb-4  text-red-500">Add Previous Work</h3>
            
            <div className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="project"
                      checked={workType === 'project'}
                      onChange={(e) => setWorkType(e.target.value as 'project' | 'paper')}
                      className="mr-2"
                    />
                    Project
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="paper"
                      checked={workType === 'paper'}
                      onChange={(e) => setWorkType(e.target.value as 'project' | 'paper')}
                      className="mr-2"
                    />
                    Research Paper
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2  text-black">
                  {workType === 'paper' ? 'Paper Title' : 'Project Title'}
                </label>
                <input
                  type="text"
                  value={workForm.title}
                  onChange={(e) => setWorkForm({...workForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder={workType === 'paper' ? 'Research paper title' : 'Project title'}
                />
              </div>

              {workType === 'project' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={workForm.description}
                      onChange={(e) => setWorkForm({...workForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                      placeholder="Brief description of the project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tech Stack</label>
                    <input
                      type="text"
                      value={workForm.tech_stack}
                      onChange={(e) => setWorkForm({...workForm, tech_stack: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="Technologies used"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Project URL</label>
                    <input
                      type="url"
                      value={workForm.project_url}
                      onChange={(e) => setWorkForm({...workForm, project_url: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {workType === 'paper' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Conference/Journal</label>
                    <input
                      type="text"
                      value={workForm.conference_or_journal}
                      onChange={(e) => setWorkForm({...workForm, conference_or_journal: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="Where it was published"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Publication Link</label>
                    <input
                      type="url"
                      value={workForm.publication_link}
                      onChange={(e) => setWorkForm({...workForm, publication_link: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  {workType === 'paper' ? 'Co-authors' : 'Collaborators'}
                </label>
                <input
                  type="text"
                  value={workForm.collaborators}
                  onChange={(e) => setWorkForm({...workForm, collaborators: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2  text-black"
                  placeholder="Names of collaborators"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {workType === 'paper' ? 'Year Published' : 'Year Completed'}
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={workForm.year}
                  onChange={(e) => setWorkForm({...workForm, year: parseInt(e.target.value) || new Date().getFullYear()})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addWork}
                disabled={!workForm.title.trim()}
                className="flex-1 bg-[#8B1538] text-white py-2 rounded font-medium disabled:bg-gray-300"
              >
                Add {workType === 'paper' ? 'Paper' : 'Project'}
              </button>
              <button
                onClick={() => {
                  setWorkForm({
                    title: '',
                    description: '',
                    tech_stack: '',
                    collaborators: '',
                    year: new Date().getFullYear(),
                    publication_link: '',
                    conference_or_journal: '',
                    project_url: ''
                  });
                  setShowAddWork(false);
                }}
                className="flex-1 border border-gray-300 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}