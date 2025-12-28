"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Check, Plus, Trash2, X, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { dashboardService, StudentProfileData, ProjectCreate, PublicationItem } from '@/services/studentDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentExperiencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // We hold the full profile data to ensure we don't lose Name/Bio when saving
  const [fullProfile, setFullProfile] = useState<StudentProfileData>({
    name: "", phone: "", department: "", batch: "", bio: "",
    skills: [], interests: [], projects: [], publications: []
  });

  // Local state for the UI
  const [interests, setInterests] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectCreate[]>([]);
  const [publications, setPublications] = useState<PublicationItem[]>([]);

  // Forms
  const [newInterest, setNewInterest] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPubForm, setShowPubForm] = useState(false);

  const [tempProject, setTempProject] = useState<ProjectCreate>({
    title: "", description: "", from_date: "", to_date: "", tools: []
  });
  const [tempPub, setTempPub] = useState<PublicationItem>({
    title: "", year: new Date().getFullYear().toString(), publisher: "", link: ""
  });

  // --- Load Data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if(!userStr) { router.push('/login'); return; }
        const uid = JSON.parse(userStr).user_id || JSON.parse(userStr).user?.user_id;

        // Fetch Full Profile via Dashboard Service
        const data = await dashboardService.getStudentFullProfile(uid);
        
        setFullProfile(data);
        setInterests(data.interests || []);
        setProjects(data.projects || []);
        setPublications(data.publications || []);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  // --- Save Handler ---
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Merge current UI state into the full profile object
    const payload: StudentProfileData = {
        ...fullProfile,
        interests,
        projects,
        publications
    };
    
    try {
        await dashboardService.updateStudentProfile(payload);
        toast.success("Experience saved successfully!");
    } catch (err: any) {
        console.error("Save error:", err);
        toast.error("Failed to save.");
    }
  };

  // --- Helpers ---
  const addInterest = () => { if(newInterest) { setInterests([...interests, newInterest]); setNewInterest(""); }};
  const removeInterest = (item: string) => setInterests(interests.filter(i => i !== item));

  const addProject = () => {
    if(!tempProject.title) return toast.error("Title required");
    setProjects([...projects, tempProject]);
    setTempProject({ title: "", description: "", from_date: "", to_date: "", tools: [] });
    setShowProjectForm(false);
  };
  const removeProject = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));

  const addPublication = () => {
    if(!tempPub.title) return toast.error("Title required");
    setPublications([...publications, tempPub]);
    setTempPub({ title: "", year: "", publisher: "", link: "" });
    setShowPubForm(false);
  };
  const removePublication = (idx: number) => setPublications(publications.filter((_, i) => i !== idx));

  if(loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading...</div>;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-32 font-sans shadow-sm border-x border-gray-100 relative">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-[#8C1515] text-white p-5 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <ChevronLeft className="cursor-pointer" onClick={() => router.back()} />
        <h1 className="text-lg font-bold tracking-tight">Experience & Publications</h1>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Interests */}
        <div className="space-y-4">
          <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest">Domain Interests</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map(item => (
              <span key={item} className="bg-[#8C1515] text-white px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-sm">
                {item} <X size={12} className="cursor-pointer opacity-80" onClick={() => removeInterest(item)} />
              </span>
            ))}
          </div>
          <div className="flex gap-2">
             <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Add interest..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#8C1515]"/>
             <button onClick={addInterest} className="bg-[#8C1515] text-white p-3 rounded-xl"><Plus size={18} /></button>
          </div>
        </div>

        {/* Publications */}
        <div className="space-y-5">
           <div className="flex justify-between items-end">
              <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest">Publications</h2>
              <button onClick={() => setShowPubForm(!showPubForm)} className="text-[#8C1515] text-[10px] font-black underline flex items-center gap-1"><Plus size={12}/> Add New</button>
           </div>
           {showPubForm && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                 <input placeholder="Paper Title" className="w-full p-2 text-xs font-bold" value={tempPub.title} onChange={e=>setTempPub({...tempPub, title: e.target.value})}/>
                 <div className="flex gap-2">
                    <input placeholder="Year" className="w-20 p-2 text-xs font-bold" value={tempPub.year} onChange={e=>setTempPub({...tempPub, year: e.target.value})}/>
                    <input placeholder="Publisher" className="flex-1 p-2 text-xs font-bold" value={tempPub.publisher} onChange={e=>setTempPub({...tempPub, publisher: e.target.value})}/>
                 </div>
                 <button onClick={addPublication} className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold">Add</button>
              </div>
           )}
           <div className="relative pl-4 space-y-6 border-l-2 border-gray-100 ml-2">
              {publications.map((pub, idx) => (
                 <div key={idx} className="relative pl-6 group">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-[#8C1515] rounded-full border-2 border-white shadow-sm"></div>
                    <div>
                       <span className="text-[10px] font-black text-gray-400">{pub.year}</span>
                       <h4 className="font-black text-sm text-gray-800 leading-tight">{pub.title}</h4>
                       <p className="text-[10px] font-bold text-gray-500 mt-0.5">{pub.publisher}</p>
                       <button onClick={() => removePublication(idx)} className="text-red-500 text-[9px] font-bold mt-1">Remove</button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Projects */}
        <div className="space-y-5">
           <div className="flex justify-between items-end">
              <h2 className="text-[#8C1515] font-black text-sm uppercase tracking-widest">Projects</h2>
              <button onClick={() => setShowProjectForm(!showProjectForm)} className="text-[#8C1515] text-[10px] font-black underline flex items-center gap-1"><Plus size={12}/> Add New</button>
           </div>
           {showProjectForm && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                 <input placeholder="Title" className="w-full p-2 text-xs font-bold" value={tempProject.title} onChange={e=>setTempProject({...tempProject, title: e.target.value})}/>
                 <textarea placeholder="Desc" className="w-full p-2 text-xs font-bold" value={tempProject.description} onChange={e=>setTempProject({...tempProject, description: e.target.value})}/>
                 <div className="flex gap-2">
                    <input placeholder="From" className="flex-1 p-2 text-xs font-bold" value={tempProject.from_date} onChange={e=>setTempProject({...tempProject, from_date: e.target.value})}/>
                    <input placeholder="To" className="flex-1 p-2 text-xs font-bold" value={tempProject.to_date} onChange={e=>setTempProject({...tempProject, to_date: e.target.value})}/>
                 </div>
                 <button onClick={addProject} className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold">Add</button>
              </div>
           )}
           <div className="space-y-4">
              {projects.map((proj, idx) => (
                 <div key={idx} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-black text-gray-800 text-sm">{proj.title}</h3>
                       <button onClick={() => removeProject(idx)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mb-3"><Calendar size={12} /> <span>{proj.from_date} - {proj.to_date}</span></div>
                    <p className="text-[10px] font-bold text-gray-600 leading-relaxed">{proj.description}</p>
                 </div>
              ))}
           </div>
        </div>

      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-6 z-30">
         <button 
            type="button" 
            onClick={handleSave} 
            className="w-full bg-[#8C1515] text-white py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2"
         >
            Save Changes <Check size={18} />
         </button>
      </div>
    </div>
  );
}