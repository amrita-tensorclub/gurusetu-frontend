'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, CheckCircle, Navigation, X, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FacultyList from '../../components/FacultyList';
import InteractiveMap from '../../components/MapView';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State for refresh animation
  const [showVerificationModal, setShowVerificationModal] = useState(false); // State for verification question

  // Defined fetch function outside useEffect so we can call it manually
  async function fetchFacultyData() {
    try {
      const res = await fetch('http://localhost:5000/api/faculty');
      const data = await res.json();
      
      if (Array.isArray(data)) {
          setFacultyList(data);
          // If search term exists, re-filter immediately
          if (searchTerm) {
             const results = data.filter(f => 
                (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (f.cabin_mappings && f.cabin_mappings.cabin_code.toLowerCase().includes(searchTerm.toLowerCase()))
              );
              setFilteredFaculty(results);
          } else {
              setFilteredFaculty(data);
          }

          // If a faculty is currently selected, update their details live
          if (selectedFaculty) {
             const updatedProfile = data.find(f => f.id === selectedFaculty.id);
             if (updatedProfile) setSelectedFaculty(updatedProfile);
          }
      } else {
          console.error("Backend Error:", data);
          setFacultyList([]); 
      }
      setLoading(false);
    } catch (error) {
      console.error("Network Error fetching faculty:", error);
      setFacultyList([]); 
      setLoading(false);
    }
  }

  // 1. Initial Load
  useEffect(() => {
    fetchFacultyData();

    // 2. Setup Real-time Listener
    const channel = supabase
      .channel('realtime-faculty')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'faculty' }, (payload) => {
        setFacultyList(prevList => {
            if (!Array.isArray(prevList)) return [];
            return prevList.map(f => f.id === payload.new.id ? { ...f, ...payload.new } : f);
        });
        
        // Also update selectedFaculty if it's the one currently open
        setSelectedFaculty(prev => prev && prev.id === payload.new.id ? { ...prev, ...payload.new } : prev);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  // Filter Logic (Client Side)
  useEffect(() => {
    if (!Array.isArray(facultyList)) return;
    const results = facultyList.filter(f => 
      (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.cabin_mappings && f.cabin_mappings.cabin_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredFaculty(results);
  }, [searchTerm, facultyList]);

  // Handle Manual Refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchFacultyData();
    // Small delay to let the user see the spin animation
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Feature: Spam-Protected Request Update
  const handleRequestUpdate = async (facultyId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/${facultyId}/request`, { 
          method: 'POST' 
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Request sent!");
      } else {
        alert("Error sending request.");
      }
    } catch (error) {
      console.error("Error requesting update:", error);
      alert("Failed to send request. Is the backend running?");
    }
  };

  // Feature: Submit Verification ("Yes" or "No" logic)
  const confirmVerification = async (isAvailable) => {
    if (!selectedFaculty) return;

    try {
      const newStatus = isAvailable ? 'Available' : 'Away';
      
      // 1. Update Status based on student input
      const statusRes = await fetch(`http://localhost:5000/api/faculty/${selectedFaculty.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, source: 'Student-QR' })
      });

      // 2. Also Notify Professor (Since student is at the door)
      // This hits the request endpoint to increment the counter/notify
      await fetch(`http://localhost:5000/api/faculty/${selectedFaculty.id}/request`, { 
          method: 'POST' 
      });
      
      if (statusRes.ok) {
        alert(`Status updated to '${newStatus}'. Notification sent to professor.`);
        setShowVerificationModal(false);
        handleManualRefresh(); // Auto-refresh after action
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error verifying:", error);
      alert("Network error.");
    }
  };

  // Status Badge Helper
  const StatusBadge = ({ status, source, count }) => {
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
        {source === "Calendar" && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500 italic">
                Synced via Calendar
            </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans text-amrita-text bg-amrita-bg pb-20">
      <Navbar />

      <div className="sticky top-[72px] z-40 px-4 pb-5 pt-2 bg-amrita-bg/95 backdrop-blur-sm -mb-6">
        <div className="relative shadow-md rounded-xl">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Find faculty, cabin..." 
            className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-amrita-maroon transition-all text-sm font-medium outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedFaculty(null); 
              setShowVerificationModal(false);
            }}
          />
        </div>
      </div>

      <main className="px-4 pt-10 pb-6">
        {loading ? (
            <div className="text-center mt-10 text-gray-400">Loading Faculty Data...</div>
        ) : (
            <>
                {!selectedFaculty && (
                <FacultyList 
                    facultyData={filteredFaculty} 
                    onSelect={setSelectedFaculty} 
                />
                )}

                {selectedFaculty && (
                <div className="animate-in slide-in-from-right-10 duration-300">
                    <button 
                    onClick={() => { setSelectedFaculty(null); setShowVerificationModal(false); }}
                    className="mb-4 text-xs font-bold text-gray-500 flex items-center gap-1 hover:text-amrita-maroon transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 w-fit"
                    >
                    ← Back to Directory
                    </button>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amrita-maroon opacity-5 rounded-bl-full -mr-5 -mt-5"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedFaculty.name}</h2>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">
                            {selectedFaculty.cabin_mappings ? selectedFaculty.cabin_mappings.cabin_code : "No Cabin Assigned"}
                        </p>
                        </div>
                        <StatusBadge 
                            status={selectedFaculty.current_status} 
                            source={selectedFaculty.status_source}
                        />
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                         {/* Last Updated Timestamp */}
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit">
                            <Clock size={11} />
                            <span>Last updated: {selectedFaculty.last_status_updated ? new Date(selectedFaculty.last_status_updated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A"}</span>
                        </div>
                        
                        {/* Refresh Button */}
                        <button 
                            onClick={handleManualRefresh}
                            className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all text-gray-500 hover:text-amrita-maroon border border-gray-100"
                            title="Refresh Status"
                        >
                            <RefreshCw size={12} className={isRefreshing ? "animate-spin text-amrita-maroon" : ""} />
                        </button>
                    </div>

                    {showVerificationModal ? (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in">
                        <p className="text-sm font-bold text-gray-800 mb-3 text-center">Is {selectedFaculty.name} inside the cabin?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => confirmVerification(true)}
                                className="bg-green-600 text-white py-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1">
                                <CheckCircle size={14} /> Yes, Available
                            </button>
                            <button
                                onClick={() => confirmVerification(false)}
                                className="bg-red-500 text-white py-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1">
                                <X size={14} /> No, Away
                            </button>
                        </div>
                        <button
                            onClick={() => setShowVerificationModal(false)}
                            className="text-[10px] text-gray-500 underline mt-3 w-full text-center hover:text-gray-700">
                            Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                              onClick={() => setShowVerificationModal(true)}
                              className="relative overflow-hidden group bg-amrita-maroon text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                              <MapPin size={14} /> I'm at the Cabin
                          </button>
                          
                          <button 
                              onClick={() => handleRequestUpdate(selectedFaculty.id)}
                              className="bg-white text-gray-700 py-3 rounded-xl text-xs font-bold border border-gray-200 shadow-sm active:scale-95 hover:bg-gray-50 transition-all">
                              Request Update
                          </button>
                      </div>
                    )}

                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Navigation size={16} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">Cabin Locator</h3>
                    </div>

                    {selectedFaculty.cabin_mappings && selectedFaculty.cabin_mappings.coordinates ? (
                        <InteractiveMap 
                            coordinates={selectedFaculty.cabin_mappings.coordinates} 
                            isSelected={true} 
                            cabinCode={selectedFaculty.cabin_mappings.cabin_code}
                        />
                    ) : (
                        <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 mb-4">
                            Map location not available
                        </div>
                    )}

                    {selectedFaculty.cabin_mappings && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cabin Code</span>
                            <span className="text-base font-extrabold text-amrita-maroon">{selectedFaculty.cabin_mappings.cabin_code}</span>
                            </div>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <div className="space-y-1.5">
                            <p className="text-sm text-gray-800"><span className="font-semibold">Block:</span> {selectedFaculty.cabin_mappings.block_name}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                <span className="font-semibold text-gray-600">Directions:</span> {selectedFaculty.cabin_mappings.directions}
                            </p>
                            </div>
                        </div>
                    )}
                    </div>

                </div>
                )}
            </>
        )}
      </main>
    </div>
  );
}