"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Trash2, X, Loader2, Save } from 'lucide-react';
import { facultyDashboardService, WorkItem} from '@/services/facultyDashboardService';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// Explicit interface to resolve TypeScript property errors
interface OpeningFormState {
  title: string;
  description: string;
  skills: string[];
  duration: string;
  cgpa: string;
  years: string[];
  deadline: string;
}

const getUserId = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (!userStr) return "";
    try {
        const userObj = JSON.parse(userStr);
        return userObj.user_id || (userObj.user && userObj.user.user_id) || "";
    } catch (e) {
        return "";
    }
  }
  return "";
};

export default function ResearchExperiencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  
  const [domains, setDomains] = useState<string[]>([]);
  const [openings, setOpenings] = useState<any[]>([]);
  const [previousWork, setPreviousWork] = useState<WorkItem[]>([]);

  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  
  const [isPostingOpening, setIsPostingOpening] = useState(false);
  
  // ✅ UPDATED: Explicitly typed state to fix red lines
  const [newOpening, setNewOpening] = useState<OpeningFormState>({
    title: "",
    description: "",
    skills: [],
    duration: "Jan 2026 - May 2026",
    cgpa: "8.0",
    years: ["3rd Year"],
    deadline: "2026-12-31"
  });
  const [newSkill, setNewSkill] = useState("");

  const [isAddingWork, setIsAddingWork] = useState(false);
  const [newWork, setNewWork] = useState({
    year: "2026",
    title: "",
    type: "Publication",
    collaborators: "",
    outcome: "" 
  });

  useEffect(() => {
    const uid = getUserId();
    if (!uid) {
        setLoading(false);
        return;
    }
    setUserId(uid);
    loadProfile(uid);
  }, []);

  const loadProfile = async (id: string) => {
    try {
      const data = await facultyDashboardService.getFacultyProfile(id);
      // Ensure we access data correctly based on service return type
      setDomains(data.info?.interests || []);
      setOpenings(data.openings || []);
      const mappedWork = (data.previous_work || []).map((w: any) => ({
        title: w.title,
        type: w.type || "Publication",
        year: w.year,
        outcome: w.outcome || "",
        collaborators: w.collaborators || ""
      }));
      setPreviousWork(mappedWork);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    const currentUserId = userId || getUserId();
    if (!currentUserId) {
        toast.error("Session Expired");
        return;
    }

    try {
      setLoading(true);
      const payload: any = {
        domain_interests: domains,
        previous_work: previousWork,
      };
      await facultyDashboardService.updateFacultyProfile(payload);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const addDomain = () => {
    if (newDomain && !domains.includes(newDomain)) {
      setDomains([...domains, newDomain]);
      setNewDomain("");
      setIsAddingDomain(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !newOpening.skills.includes(newSkill)) {
      setNewOpening({...newOpening, skills: [...newOpening.skills, newSkill]});
      setNewSkill("");
    }
  };

  const saveOpening = async () => {
    if (!newOpening.title || !newOpening.description) {
      toast.error("Title and Description required");
      return;
    }
    
    try {
        setLoading(true);
        // ✅ Mapping local state to the payload expected by the service
        const openingPayload = {
            title: newOpening.title,
            description: newOpening.description,
            required_skills: newOpening.skills,
            expected_duration: newOpening.duration,
            target_years: newOpening.years,
            min_cgpa: newOpening.cgpa,
            deadline: newOpening.deadline
        };

        await facultyDashboardService.postOpening(openingPayload);
        await loadProfile(userId);
        
        setIsPostingOpening(false);
        setNewOpening({
            title: "", description: "", skills: [], duration: "Jan 2026 - May 2026",
            cgpa: "8.0", years: ["3rd Year"], deadline: "2026-12-31"
        });
        toast.success("Opening Published!");
    } catch (err) {
        console.error(err);
        toast.error("Failed to post opening");
    } finally {
        setLoading(false);
    }
  };

  const saveWork = () => {
    if (!newWork.title || !newWork.year) return;
    setPreviousWork([...previousWork, newWork]);
    setIsAddingWork(false);
    setNewWork({ year: "2026", title: "", type: "Publication", collaborators: "", outcome: "" });
  };

  const handleDeleteOpening = async (id: string) => {
      if(confirm("Remove this opening?")) {
          // Add logic to call service.deleteOpening(id) if available
          setOpenings(openings.filter(o => o.id !== id));
          toast.success("Opening removed");
      }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[#8C1515]" /></div>;

  return (
    <div className="min-h-screen bg-white font-sans relative pb-40">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <div className="bg-[#8C1515] text-white p-5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4" onClick={() => router.back()}>
          <ChevronRight className="rotate-180 cursor-pointer" />
          <h1 className="text-lg font-bold tracking-tight">Research & Experience</h1>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="p-6 space-y-10">
        
        {/* DOMAIN INTERESTS */}
        <div className="space-y-4">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Domain Interests</h2>
          <div className="flex flex-wrap gap-2">
            {domains.map(domain => (
              <span key={domain} className="bg-[#8C1515] text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-sm uppercase tracking-wider">
                {domain} <X size={14} className="cursor-pointer opacity-70" onClick={() => setDomains(domains.filter(d => d !== domain))} />
              </span>
            ))}
          </div>
          {isAddingDomain ? (
            <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
              <input 
                autoFocus
                className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-xs font-bold focus:border-[#8C1515] outline-none transition-colors"
                placeholder="E.g. Robotics"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <button onClick={addDomain} className="bg-[#8C1515] text-white px-5 rounded-xl font-bold text-xs">Add</button>
              <button onClick={() => setIsAddingDomain(false)} className="text-gray-400 px-2"><X size={20}/></button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingDomain(true)}
              className="w-full border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8C1515]/5 transition-colors">
              <Plus size={18} /> Add Domain
            </button>
          )}
        </div>

        {/* CURRENT R&D OPENINGS */}
        <div className="space-y-5">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Current R&D Openings</h2>
          {openings.map((opening) => (
            <div key={opening.id} className="border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="bg-gray-50/80 p-5 flex justify-between items-center border-b border-gray-100">
                <span className="font-black text-xs text-gray-800 uppercase tracking-tight truncate max-w-[150px]">
                  {opening.title}
                </span>
                <div className="flex items-center gap-3">
                  <span className="bg-[#D4AF37] text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">Active</span>
                  <Trash2 size={16} className="text-[#8C1515] cursor-pointer" onClick={() => handleDeleteOpening(opening.id)} />
                </div>
              </div>
              <div className="p-5 bg-white">
                 <p className="text-gray-500 text-xs leading-relaxed">{opening.description}</p>
              </div>
            </div>
          ))}
          {isPostingOpening ? (
            <div className="border-2 border-[#8C1515]/20 rounded-[2rem] p-5 space-y-4 bg-white shadow-lg animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[#8C1515] font-black text-sm uppercase">New Project Details</h3>
                <X size={20} className="text-gray-400 cursor-pointer" onClick={() => setIsPostingOpening(false)} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Title</label>
                <input 
                  className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold text-gray-800 focus:border-[#8C1515] outline-none"
                  placeholder="E.g. Smart Campus IoT"
                  value={newOpening.title}
                  onChange={(e) => setNewOpening({...newOpening, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 mt-2 text-xs font-medium text-gray-600 focus:border-[#8C1515] outline-none resize-none h-24"
                  placeholder="Describe the project goals..."
                  value={newOpening.description}
                  onChange={(e) => setNewOpening({...newOpening, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Required Skills</label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {newOpening.skills.map(skill => (
                    <span key={skill} className="border border-[#8C1515] text-[#8C1515] px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                      {skill} <X size={12} onClick={() => setNewOpening({...newOpening, skills: newOpening.skills.filter(s => s !== skill)})} />
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                    placeholder="Add Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  <button onClick={handleAddSkill} className="text-[#8C1515] font-black text-xs uppercase px-2">+</button>
                </div>
              </div>
              <button onClick={saveOpening} className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest mt-4 shadow-lg">
                Publish Opening
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsPostingOpening(true)}
              className="w-full border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8C1515]/5 transition-colors">
              <Plus size={18} /> Post New Opening
            </button>
          )}
        </div>

        {/* PREVIOUS WORK & PUBLICATIONS */}
        <div className="space-y-6">
          <h2 className="text-[#8C1515] font-black text-lg uppercase tracking-tight">Previous Work & Publications</h2>
          
          <div className="space-y-8 relative ml-3 border-l-2 border-[#8C1515]/20 pl-7">
            {previousWork.map((work, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[35px] top-1.5 w-3.5 h-3.5 bg-[#8C1515] rounded-full border-[3px] border-white shadow-sm shadow-[#8C1515]/40" />
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800 leading-snug">
                      <span className="text-gray-400 font-black mr-3 tracking-tighter">{work.year}</span> 
                      {work.title} 
                    </p>
                    {work.outcome && (
                      <p className="text-[11px] text-gray-700 mt-1 italic">"{work.outcome}"</p>
                    )}
                    <p className="text-[10px] text-gray-500 font-medium mt-1">{work.type} • {work.collaborators || "Sole Author"}</p>
                  </div>
                  <Trash2 size={14} className="text-gray-300 hover:text-[#8C1515] cursor-pointer" onClick={() => setPreviousWork(previousWork.filter((_, i) => i !== idx))} />
                </div>
              </div>
            ))}

            {isAddingWork && (
               <div className="relative animate-in slide-in-from-left-4 fade-in duration-300">
                  <div className="absolute -left-[35px] top-4 w-3.5 h-3.5 bg-gray-300 rounded-full border-[3px] border-white" />
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                     <div className="flex gap-2">
                        <input 
                            className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold text-center"
                            placeholder="Year"
                            value={newWork.year}
                            onChange={(e) => setNewWork({...newWork, year: e.target.value})}
                        />
                        <input 
                            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold"
                            placeholder="Title"
                            value={newWork.title}
                            onChange={(e) => setNewWork({...newWork, title: e.target.value})}
                        />
                     </div>
                     <textarea 
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#8C1515] resize-none h-16"
                        placeholder="Outcome..."
                        value={newWork.outcome}
                        onChange={(e) => setNewWork({...newWork, outcome: e.target.value})}
                     />
                     <div className="flex gap-2">
                         <select 
                            className="bg-white border border-gray-200 rounded px-2 py-1 text-[10px] font-bold text-gray-600"
                            value={newWork.type}
                            onChange={(e) => setNewWork({...newWork, type: e.target.value})}
                         >
                            <option>Publication</option>
                            <option>Project</option>
                            <option>Patent</option>
                         </select>
                         <input 
                            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-[10px]"
                            placeholder="Collaborators"
                            value={newWork.collaborators}
                            onChange={(e) => setNewWork({...newWork, collaborators: e.target.value})}
                        />
                     </div>
                     <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setIsAddingWork(false)} className="text-xs font-bold text-gray-400 px-3">Cancel</button>
                        <button onClick={saveWork} className="bg-[#8C1515] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm">Save Item</button>
                     </div>
                  </div>
               </div>
            )}
          </div>
          
          {!isAddingWork && (
            <button 
              onClick={() => setIsAddingWork(true)}
              className="w-full border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:bg-[#8C1515]/5 transition-colors">
              <Plus size={18} /> Add Work
            </button>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 p-4 pb-6 z-30 flex justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
         <button 
            onClick={handleSaveAll}
            className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
            <Save size={20} /> Save Changes
         </button>
      </div>
    </div>
  );
}