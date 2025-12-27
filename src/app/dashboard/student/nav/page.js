'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, CheckCircle, Navigation, X, ShieldCheck, Sparkles, RefreshCw, CalendarDays, Menu } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import FacultyList from '../components/FacultyList';
import InteractiveMap from '../components/MapView';
import { supabase } from '../lib/supabaseClient'; 

export default function Home() {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [futureDate, setFutureDate] = useState("");
  const [futureResult, setFutureResult] = useState(null);

  // --- DATA FETCHING ---
  async function fetchFacultyData() {
    try {
      const res = await fetch('http://localhost:5000/api/faculty');
      const data = await res.json();
      
      if (Array.isArray(data)) {
          setFacultyList(data);
          // Re-apply search filter if exists
          if (searchTerm) {
             const results = data.filter(f => 
                (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (f.cabin_mappings && f.cabin_mappings.cabin_code.toLowerCase().includes(searchTerm.toLowerCase()))
              );
              setFilteredFaculty(results);
          } else {
              setFilteredFaculty(data);
          }

          // Live update selected faculty view
          if (selectedFaculty) {
             const updatedProfile = data.find(f => f.id === selectedFaculty.id);
             if (updatedProfile) setSelectedFaculty(updatedProfile);
          }
      } else {
          setFacultyList([]); 
      }
      setLoading(false);
    } catch (error) {
      console.error("Network Error fetching faculty:", error);
      setFacultyList([]); 
      setLoading(false);
    }
  }

  // Initial Load & Realtime
  useEffect(() => {
    fetchFacultyData();
    
    const channel = supabase
      .channel('realtime-faculty')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'faculty' }, (payload) => {
        setFacultyList(prevList => {
            if (!Array.isArray(prevList)) return [];
            return prevList.map(f => f.id === payload.new.id ? { ...f, ...payload.new } : f);
        });
        
        // Update selected faculty if open
        setSelectedFaculty(prev => prev && prev.id === payload.new.id ? { ...prev, ...payload.new } : prev);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  // Filter Logic
  useEffect(() => {
    if (!Array.isArray(facultyList)) return;
    const results = facultyList.filter(f => 
      (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.cabin_mappings && f.cabin_mappings.cabin_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredFaculty(results);
  }, [searchTerm, facultyList]);


  // --- FEATURE HANDLERS ---

  // 1. Manual Refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchFacultyData();
    setTimeout(() => setIsRefreshing(false), 800);
    toast.success("Data refreshed", { id: 'refresh', icon: '🔄' });
  };

  // 2. Request Update (Spam Protected)
  const handleRequestUpdate = async (facultyId) => {
    toast.promise(
      fetch(`http://localhost:5000/api/faculty/${facultyId}/request`, { method: 'POST' })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          return data.message || "Request sent!";
        }),
      {
        loading: 'Sending request...',
        success: (msg) => msg,
        error: 'Failed to send request.',
      }
    );
  };

  // 3. Confirm Verification ("Yes/No" Modal Logic)
  const confirmVerification = async (isAvailable) => {
    if (!selectedFaculty) return;

    toast.promise(
        (async () => {
            const newStatus = isAvailable ? 'Available' : 'Away';
            
            // A. Update Status
            const statusRes = await fetch(`http://localhost:5000/api/faculty/${selectedFaculty.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, source: 'Student-QR' })
            });

            // B. Notify Professor (Increment Request Count)
            await fetch(`http://localhost:5000/api/faculty/${selectedFaculty.id}/request`, { method: 'POST' });
            
            if (!statusRes.ok) throw new Error("Failed");

            setShowVerificationModal(false);
            handleManualRefresh();
            return `Status marked as ${newStatus}!`;
        })(),
        {
            loading: 'Verifying...',
            success: (msg) => msg,
            error: 'Could not verify status.',
        }
    );
  };

  // 4. Check Future Availability (Timetable)
  const handleCheckFuture = async () => {
    if(!futureDate || !selectedFaculty) return;

    const promise = fetch(`http://localhost:5000/api/faculty/${selectedFaculty.id}/future`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datetime: futureDate })
    }).then(r => r.json());

    toast.promise(promise, {
        loading: 'Checking schedule...',
        success: (data) => {
            setFutureResult(data);
            return "Schedule retrieved!";
        },
        error: "Failed to check schedule"
    });
  };


  // --- UI COMPONENTS ---

  const StatusBadge = ({ status, source }) => {
    let styles = "bg-gray-100 text-gray-600 border-gray-200";
    let icon = <Clock size={13} />;

    if (source === "AI Prediction") {
      styles = "bg-purple-50 text-purple-800 border-purple-200";
      icon = <Sparkles size={13} />;
    } else if (status === "Available") {
      styles = "bg-green-100 text-green-800 border-green-200";
      icon = <CheckCircle size={13} />;
    } else if (status === "Busy" || status === "In Class") {
      styles = "bg-red-50 text-red-800 border-red-200";
      icon = <X size={13} />;
    }

    return (
      <div className="flex flex-col items-end gap-1">
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles} shadow-sm`}>
          {icon} {status ? status.toUpperCase() : "UNKNOWN"}
        </span>
        {source === "Student-QR" && (
          <span className="flex items-center gap-1 text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
            <ShieldCheck size={10} /> Verified by peers
          </span>
        )}
        {source === "Timetable" && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500 italic">
                <Clock size={10} /> Synced via Timetable
            </span>
        )}
        {source === "Calendar" && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500 italic">
                Synced via Calendar
            </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 shadow-xl border-x border-gray-100 font-sans overflow-hidden">
      <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />

      {/* HEADER - Matches Faculty Profile Style */}
      <div className="bg-[#8C1515] text-white p-5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
             <span className="font-black text-sm">GS</span>
           </div>
           <div>
             <h1 className="text-lg font-bold leading-none tracking-tight">GuruSetu</h1>
             <p className="text-[10px] text-white/70 font-medium mt-0.5 tracking-wide uppercase">Amrita Student Portal</p>
           </div>
        </div>
        <Menu className="text-white/90 cursor-pointer hover:text-white transition-colors" size={24} />
      </div>

      {/* SEARCH BAR - Floating & Sticky */}
      <div className="px-5 pt-4 pb-2 sticky top-[76px] z-40 bg-gray-50/95 backdrop-blur-sm">
        <div className="relative shadow-sm rounded-2xl transition-all group focus-within:shadow-md">
          <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#8C1515] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Find faculty or cabin..." 
            className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#8C1515] focus:ring-1 focus:ring-[#8C1515] transition-all text-sm font-bold text-gray-700 outline-none placeholder:text-gray-400 placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedFaculty(null); 
              setShowVerificationModal(false);
            }}
          />
        </div>
      </div>

      <main className="px-5 pb-6">
        {loading ? (
            <div className="flex flex-col items-center justify-center mt-20 gap-3 text-gray-400 animate-pulse">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#8C1515] rounded-full animate-spin"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Loading Directory...</span>
            </div>
        ) : (
            <>
                {/* DIRECTORY VIEW */}
                {!selectedFaculty && (
                <FacultyList 
                    facultyData={filteredFaculty} 
                    onSelect={setSelectedFaculty} 
                />
                )}

                {/* DETAILED VIEW */}
                {selectedFaculty && (
                <div className="animate-in slide-in-from-right-10 duration-300">
                    
                    <button 
                        onClick={() => { setSelectedFaculty(null); setShowVerificationModal(false); }}
                        className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1 hover:text-[#8C1515] transition-colors bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100 w-fit active:scale-95"
                    >
                    ← Back to Directory
                    </button>

                    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 mb-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8C1515] opacity-5 rounded-bl-full -mr-8 -mt-8"></div>
                        
                        {/* Profile Header */}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">{selectedFaculty.name}</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                    <MapPin size={10} />
                                    {selectedFaculty.cabin_mappings ? selectedFaculty.cabin_mappings.cabin_code : "No Cabin"}
                                </p>
                            </div>
                            <StatusBadge 
                                status={selectedFaculty.current_status} 
                                source={selectedFaculty.status_source}
                            />
                        </div>

                        {/* Last Updated & Refresh */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl w-fit border border-gray-100">
                                <Clock size={12} className="text-[#8C1515]" />
                                <span>Updated: {selectedFaculty.last_status_updated ? new Date(selectedFaculty.last_status_updated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A"}</span>
                            </div>
                            
                            <button 
                                onClick={handleManualRefresh}
                                className="p-2 rounded-xl bg-gray-50 hover:bg-[#8C1515] hover:text-white active:scale-95 transition-all text-gray-500 border border-gray-100 shadow-sm"
                            >
                                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {/* Future Check Button */}
                        <button 
                            onClick={() => { setShowFutureModal(true); setFutureResult(null); }}
                            className="w-full mb-4 flex items-center justify-center gap-2 bg-[#8C1515]/5 text-[#8C1515] py-3 rounded-xl text-xs font-black uppercase tracking-wider border border-[#8C1515]/10 active:scale-95 transition-all hover:bg-[#8C1515]/10">
                            <CalendarDays size={14} /> Check Future Availability
                        </button>

                        {/* Action Grid */}
                        {showVerificationModal ? (
                            <div className="bg-[#8C1515]/5 p-4 rounded-2xl border border-[#8C1515]/10 animate-in fade-in zoom-in-95">
                                <p className="text-xs font-bold text-gray-800 mb-4 text-center">Is {selectedFaculty.name} inside the cabin?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => confirmVerification(true)}
                                        className="bg-green-600 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <CheckCircle size={16} /> Yes
                                    </button>
                                    <button
                                        onClick={() => confirmVerification(false)}
                                        className="bg-red-500 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <X size={16} /> No
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowVerificationModal(false)}
                                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 w-full text-center hover:text-gray-600">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setShowVerificationModal(true)}
                                    className="relative overflow-hidden group bg-[#8C1515] text-white py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-[#8C1515]/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <MapPin size={16} /> I'm at Cabin
                                </button>
                                
                                <button 
                                    onClick={() => handleRequestUpdate(selectedFaculty.id)}
                                    className="bg-white text-gray-700 py-3.5 rounded-xl text-xs font-bold border-2 border-gray-100 shadow-sm active:scale-95 hover:bg-gray-50 transition-all">
                                    Request Update
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Locator Card */}
                    <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-[#8C1515]/10 text-[#8C1515] rounded-xl">
                                <Navigation size={18} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Cabin Locator</h3>
                        </div>

                        {selectedFaculty.cabin_mappings && selectedFaculty.cabin_mappings.coordinates ? (
                            <InteractiveMap 
                                coordinates={selectedFaculty.cabin_mappings.coordinates} 
                                isSelected={true} 
                                cabinCode={selectedFaculty.cabin_mappings.cabin_code}
                            />
                        ) : (
                            <div className="h-48 bg-gray-50 rounded-2xl flex items-center justify-center text-xs text-gray-400 border-2 border-dashed border-gray-200">
                                Map location not available
                            </div>
                        )}

                        {selectedFaculty.cabin_mappings && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cabin Code</span>
                                    <span className="text-base font-black text-[#8C1515]">{selectedFaculty.cabin_mappings.cabin_code}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 font-medium">Block</span>
                                        <span className="text-gray-800 font-bold">{selectedFaculty.cabin_mappings.block_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Directions</span>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed bg-white p-2 rounded border border-gray-100">
                                            {selectedFaculty.cabin_mappings.directions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                )}
            </>
        )}
      </main>

       {/* FUTURE CHECK MODAL */}
       {showFutureModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#8C1515]/20 p-6 backdrop-blur-md">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 border border-white/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-gray-800 uppercase tracking-wide text-sm">Check Schedule</h3>
                    <button onClick={() => setShowFutureModal(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                
                <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">Select a date and time to check if <span className="text-gray-900 font-bold">{selectedFaculty.name}</span> will be available.</p>
                
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 mb-5">
                    <input 
                        type="datetime-local" 
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none focus:border-[#8C1515] transition-colors"
                        onChange={(e) => setFutureDate(e.target.value)}
                    />
                </div>

                <button 
                    onClick={handleCheckFuture}
                    disabled={!futureDate}
                    className="w-full bg-[#8C1515] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#8C1515]/20 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all">
                    Check Status
                </button>

                {futureResult && (
                    <div className={`mt-5 p-4 rounded-xl text-center border-2 ${futureResult.status === 'Available' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        <div className="font-black text-sm uppercase tracking-wider">{futureResult.status}</div>
                        <div className="text-[10px] font-bold mt-1 opacity-80">{futureResult.message}</div>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
}