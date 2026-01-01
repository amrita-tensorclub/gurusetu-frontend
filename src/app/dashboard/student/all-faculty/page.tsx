"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, MapPin, Mail, X, Calendar, ChevronLeft, CheckCircle, Clock, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { facultyService } from '@/services/facultyService';
import { locatorService } from '@/services/locatorService';
import InteractiveMap from '@/components/interactiveMap'; // <--- NEW IMPORT
import toast, { Toaster } from 'react-hot-toast';

export default function AllFacultyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState<any[]>([]); 
  const [search, setSearch] = useState('');
  
  // --- STATES FOR MODALS ---
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // --- MODAL INTERACTION STATES ---
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [futureDate, setFutureDate] = useState("");
  const [futureResult, setFutureResult] = useState<any>(null);

  // Define departments list
  const departments = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI&DS', 'IT', 'BME', 'CSBS'];

  // Load List
  useEffect(() => {
    loadFaculty();
  }, [search, activeFilter]);

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const dept = activeFilter === 'All' ? undefined : activeFilter;
      const data = await facultyService.getAllFaculty(search, dept);
      
      const dataWithStatus = data.map((f: any, i: number) => ({
          ...f,
          status: f.status || (i % 4 === 0 ? 'Available' : i % 4 === 1 ? 'Busy' : i % 4 === 2 ? 'In Class' : 'Likely Available'),
          status_source: f.status_source || 'Manual'
      }));

      setFacultyList(dataWithStatus);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load directory");
    } finally {
      setLoading(false);
    }
  };

  const openProfile = async (id: string) => {
    setSelectedFacultyId(id);
    setProfileData(null); 
    try {
      // 1. Fetch Profile Details
      const data = await facultyService.getFacultyProfile(id);
      
      // 2. Try to find real status & coordinates from the list we already loaded
      const listUser = facultyList.find(f => f.id === id);

      setProfileData({
          ...data,
          // Prefer status from the Locator API (listUser)
          status: listUser?.status || data.info.availability_status || 'Available',
          status_source: listUser?.status_source || 'Manual',
          // Pass coordinates for the map
          coordinates: listUser?.coordinates || null
      });
    } catch (err) {
      toast.error("Failed to load profile");
      setSelectedFacultyId(null);
    }
  };

  const getQualifications = (info: any) => {
    if (!info) return [];
    return [ ...(info.phd_details || []), ...(info.pg_details || []), ...(info.ug_details || []) ];
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Available': return 'bg-green-500';
          case 'Busy': return 'bg-red-500';
          case 'In Class': return 'bg-yellow-500';
          case 'Likely Available': return 'bg-purple-500';
          default: return 'bg-gray-400';
      }
  };

  // --- ACTIONS ---

  const handleRequestUpdate = async () => {
    if (!selectedFacultyId) return;
    toast.loading("Sending request...");
    try {
      const res = await locatorService.requestUpdate(selectedFacultyId);
      toast.dismiss();
      toast.success(res.message);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to send request");
    }
  };

  const checkFuture = async () => {
    if(!futureDate || !selectedFacultyId) return;
    toast.loading("Checking timetable...");
    try {
        const res = await locatorService.checkFutureAvailability(selectedFacultyId, futureDate);
        toast.dismiss();
        setFutureResult(res);
    } catch (err) {
        toast.dismiss();
        toast.error("Failed to check schedule");
    }
  };

  const confirmVerification = async (status: string) => {
    if (!selectedFacultyId) return;
    try {
      await locatorService.updateStatus(selectedFacultyId, status, 'Student-QR');
      
      setProfileData((prev: any) => ({
        ...prev,
        status: status,
        status_source: 'Student-QR'
      }));
      
      setFacultyList(prev => prev.map(f => f.id === selectedFacultyId ? { ...f, status: status, status_source: 'Student-QR' } : f));

      setShowVerifyModal(false);
      toast.success(`Status verified as ${status}!`);
    } catch (err) {
      toast.error("Failed to verify status");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans">
      <Toaster position="top-center" />

        {/* HEADER */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0">
           <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()}><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-black tracking-tight">All Faculty</h1>
           </div>
           <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-xl flex items-center px-3 py-2.5">
                 <Search size={16} className="text-gray-400 mr-2" />
                 <input placeholder="Search faculty..." className="w-full text-sm font-bold text-gray-700 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button onClick={() => setIsFilterOpen(true)} className="bg-[#6b1010] text-white px-4 rounded-xl flex items-center gap-2 text-xs font-bold border border-white/20">
                <Filter size={14} /> Filter
              </button>
           </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 scrollbar-hide">
           {loading && <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-gray-400" /></div>}
           
           {!loading && facultyList.map((fac) => (
             <div key={fac.id} onClick={() => openProfile(fac.id)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative active:scale-[0.98] transition-transform cursor-pointer overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(fac.status)}`}></div>
                <div className="flex items-start gap-3 pl-2">
                   <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={fac.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-[#8C1515] font-black text-sm leading-tight">{fac.name}</h3>
                            <p className="text-gray-500 text-[10px] font-bold">{fac.department} Dept.</p>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border flex items-center gap-1 ${
                              fac.status === 'Available' ? 'bg-green-50 text-green-700 border-green-100' :
                              fac.status === 'Busy' ? 'bg-red-50 text-red-700 border-red-100' :
                              fac.status === 'Likely Available' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                              {fac.status === 'Available' ? <CheckCircle size={8} /> : 
                               fac.status === 'Likely Available' ? <Sparkles size={8} /> :
                               <Clock size={8} />}
                              {fac.status}
                          </div>
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {(fac.domains || []).slice(0, 2).map((d: string) => (
                           <span key={d} className="bg-[#8C1515] text-white px-2 py-0.5 rounded-full text-[8px] font-bold">{d}</span>
                        ))}
                      </div>
                   </div>
                   <ChevronDown size={16} className="text-gray-300 mt-1 self-center" />
                </div>
             </div>
           ))}
           <div className="h-10"></div>
        </div>

        {/* FILTERS */}
        {isFilterOpen && (
           <div className="fixed inset-0 bg-black/60 z-40 flex items-end">
              <div className="bg-white w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2">
                    <h3 className="font-black text-lg text-gray-800">Filter By</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Department</label>
                       <div className="flex flex-wrap gap-2">
                          {departments.map(dept => (
                             <button key={dept} onClick={() => setActiveFilter(dept)} className={`px-4 py-2 rounded-lg text-xs font-bold border ${activeFilter === dept ? 'bg-[#8C1515] text-white border-[#8C1515]' : 'bg-white text-gray-600 border-gray-200'}`}>{dept}</button>
                          ))}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setIsFilterOpen(false)} className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase mt-8 shadow-lg sticky bottom-0">Apply Filters</button>
              </div>
           </div>
        )}

        {/* DETAIL PROFILE MODAL */}
        {selectedFacultyId && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="relative h-40 bg-[#F9F9F9] flex justify-center items-end pb-0 border-b border-gray-100">
                 <button onClick={() => setSelectedFacultyId(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500 z-10"><X size={20} /></button>
                 <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                    <img src={profileData?.info.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                 </div>
              </div>

              {profileData ? (
                 <div className="px-6 pt-12 pb-10 text-center">
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{profileData.info.name}</h2>
                    <p className="text-xs font-bold text-[#8C1515] mt-1">{profileData.info.designation}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{profileData.info.department}</p>
                    
                    {/* STATUS BADGE */}
                    <div className="flex flex-col items-center gap-1 mt-3 mb-2">
                        <div className={`flex justify-center items-center gap-2 text-[10px] font-black uppercase py-1.5 px-4 rounded-full mx-auto w-fit border ${
                            profileData.status === 'Available' ? 'bg-green-50 text-green-700 border-green-100' : 
                            profileData.status === 'Busy' ? 'bg-red-50 text-red-700 border-red-100' : 
                            profileData.status === 'Likely Available' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                            {profileData.status === 'Available' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                            {profileData.status || "Unknown"}
                        </div>
                        {profileData.status_source === 'Student-QR' && (
                            <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 animate-in fade-in">
                                <ShieldCheck size={10} /> Verified by Student
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center flex-wrap gap-2 mt-3 mb-5">
                       {getQualifications(profileData.info).map((q: string, i: number) => (
                          <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold">{q}</span>
                       ))}
                    </div>

                    {/* CONTACT & LOCATION INFO */}
                    <div className="space-y-2 mb-6">
                       <div className="border border-red-100 bg-red-50/50 rounded-xl p-3 flex items-center gap-3">
                          <Mail size={16} className="text-[#8C1515]" />
                          <span className="text-xs font-bold text-[#8C1515]">{profileData.info.email}</span>
                       </div>
                       <div className="border border-gray-100 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                          <MapPin size={16} className="text-gray-500" />
                          <div className="text-left">
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Cabin Location</p>
                             <p className="text-xs font-bold text-gray-700">
                               {profileData.info.cabin_block || "AB2"} {profileData.info.cabin_floor ? `, Floor ${profileData.info.cabin_floor}` : ", Floor 2"} {profileData.info.cabin_number || "205"}
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* --- MAP BOX (ADDED HERE) --- */}
                    <div className="w-full h-56 bg-gray-100 rounded-2xl overflow-hidden mb-6 border border-gray-200 relative shadow-sm">
                        {profileData.coordinates ? (
                            <InteractiveMap 
                                coordinates={profileData.coordinates} 
                                cabinCode={profileData.info.cabin_number} 
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs font-bold gap-2">
                                <MapPin size={24} className="opacity-20"/>
                                <span>No Map Data Available</span>
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col gap-3 mb-6">
                        <div className="flex gap-3">
                            <button 
                                onClick={handleRequestUpdate}
                                className="flex-1 bg-white border-2 border-[#8C1515] text-[#8C1515] py-3 rounded-xl font-black text-xs active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={14}/> Request Update
                            </button>
                            <button 
                                onClick={() => setShowVerifyModal(true)}
                                className="flex-1 bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <MapPin size={14}/> I'm at Cabin
                            </button>
                        </div>
                        <button 
                            onClick={() => setShowFutureModal(true)}
                            className="w-full bg-blue-50 text-blue-700 border border-blue-100 py-3 rounded-xl font-black text-xs uppercase shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <Calendar size={14}/> Check Future Availability
                        </button>
                    </div>

                    {/* Research Interests */}
                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Research Interests</h3>
                       <div className="flex flex-wrap gap-2">
                          {(profileData.info.interests || []).map((int: string) => (
                             <span key={int} className="border border-[#8C1515] text-[#8C1515] px-3 py-1.5 rounded-full text-[10px] font-bold">{int}</span>
                          ))}
                       </div>
                    </div>

                    <div className="text-left mb-6">
                       <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Current Openings</h3>
                       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {(profileData.openings || []).length === 0 && <p className="text-xs text-gray-400">No current openings.</p>}
                          {(profileData.openings || []).map((op: any) => (
                             <div key={op.id} className="min-w-[200px] bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{op.type}</p>
                                <h4 className="font-bold text-sm text-gray-800 leading-tight mb-2">{op.title}</h4>
                                <button className="text-[#8C1515] text-[10px] font-black underline">View Details</button>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="h-10"></div>
                 </div>
              ) : (
                 <div className="flex justify-center items-center h-40"><p className="text-xs font-bold text-gray-400 animate-pulse">Loading Profile...</p></div>
              )}
          </div>
        )}

        {/* --- VERIFY MODAL --- */}
        {showVerifyModal && (
         <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom">
                <h3 className="text-center font-black text-gray-800 mb-1 text-lg">Are you at the cabin?</h3>
                <p className="text-center text-xs text-gray-500 mb-6 font-medium">Help your peers by verifying the status.</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => confirmVerification('Available')} className="bg-green-100 text-green-700 py-3 rounded-xl font-black text-xs uppercase border border-green-200">Yes, Available</button>
                    <button onClick={() => confirmVerification('Busy')} className="bg-red-50 text-red-700 py-3 rounded-xl font-black text-xs uppercase border border-red-100">No, Busy/Away</button>
                </div>
                <button onClick={() => setShowVerifyModal(false)} className="w-full py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
            </div>
         </div>
       )}

        {/* --- FUTURE CHECK MODAL --- */}
        {showFutureModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-[#8C1515] uppercase text-sm">Check Schedule</h3>
                    <X size={20} className="text-gray-400 cursor-pointer" onClick={() => setShowFutureModal(false)} />
                </div>
                <p className="text-xs text-gray-500 font-medium mb-4">Select date & time to check availability.</p>
                <input 
                    type="datetime-local" 
                    onChange={(e) => setFutureDate(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold mb-4 outline-none focus:border-[#8C1515]" 
                />
                <button onClick={checkFuture} className="w-full bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-transform">
                    Check Status
                </button>
                {futureResult && (
                    <div className={`mt-4 p-3 rounded-xl text-center border-2 ${futureResult.status === 'Available' ? 'border-green-100 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-red-700'}`}>
                        <div className="font-black text-sm uppercase">{futureResult.status}</div>
                        <div className="text-[10px] font-bold opacity-80">{futureResult.message}</div>
                    </div>
                )}
            </div>
         </div>
        )}

    </div>
  );
}