"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Globe, MapPin, ArrowRight, Clock, CheckCircle, Navigation, ShieldCheck, Calendar, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { locatorService } from '@/services/locatorService';
import InteractiveMap from '@/components/interactiveMap'; // Ensure this path is correct

export default function FacultyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params.id as string;
  
  const [faculty, setFaculty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- STATES FOR MODALS ---
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [futureDate, setFutureDate] = useState("");
  const [futureResult, setFutureResult] = useState<any>(null);

  // --- 1. Fetch Real Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Live Location & Status
        const data = await locatorService.getFacultyLocation(facultyId);
        setFaculty(data);
      } catch (error) {
        console.error("Fetch Error", error);
        toast.error("Could not load faculty details");
      } finally {
        setLoading(false);
      }
    };
    if (facultyId) fetchData();
  }, [facultyId]);

  // --- 2. Action: Request Update (Spam Protected) ---
  const handleRequestUpdate = async () => {
    toast.loading("Sending request...");
    try {
      const res = await locatorService.requestUpdate(facultyId);
      toast.dismiss();
      toast.success(res.message);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to send request");
    }
  };

  // --- 3. Action: I'm at the Cabin (Crowdsourcing) ---
  const confirmVerification = async (status: string) => {
    try {
      await locatorService.updateStatus(facultyId, status, 'Student-QR');
      
      // Optimistic Update
      setFaculty((prev: any) => ({
        ...prev,
        status: { ...prev.status, current: status, source: 'Student-QR' }
      }));
      
      setShowVerifyModal(false);
      toast.success(`Status verified as ${status}!`);
    } catch (err) {
      toast.error("Failed to verify status");
    }
  };

  // --- 4. Action: Check Future Schedule ---
  const checkFuture = async () => {
    if(!futureDate) return;
    toast.loading("Checking timetable...");
    try {
        const res = await locatorService.checkFutureAvailability(facultyId, futureDate);
        toast.dismiss();
        setFutureResult(res);
    } catch (err) {
        toast.dismiss();
        toast.error("Failed to check schedule");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-xs font-bold animate-pulse">Loading Profile...</div>;
  if (!faculty) return <div className="p-10 text-center">Faculty not found</div>;

  // Destructure for cleaner JSX
  const status = faculty.status?.current || "Available";
  const source = faculty.status?.source || "Manual";
  const location = faculty.location || {};

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans flex flex-col relative">
       <Toaster position="top-center" />
       
       {/* Header */}
       <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 sticky top-0 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h1 className="text-xl font-black tracking-tight">Faculty Profile</h1>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-10">
          
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
             
             {/* Status Strip */}
             <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                status === 'Available' ? 'bg-green-500' : 
                status === 'Busy' ? 'bg-red-500' : 'bg-yellow-500'
             }`}></div>

             <div className="absolute top-1.5 left-0 w-full h-20 bg-gradient-to-b from-gray-50 to-white"></div>
             
             <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-[#8C1515] text-3xl font-black border-4 border-white shadow-lg mb-4">
                    {faculty.name ? faculty.name[0] : 'F'}
                </div>
                
                <h2 className="text-xl font-black text-gray-800 leading-tight">{faculty.name}</h2>
                <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest mt-1">Professor</p>

                {/* Status Badge */}
                <div className="flex flex-col items-center gap-1 mt-4 mb-2">
                    <div className={`flex justify-center items-center gap-2 text-[10px] font-black uppercase py-2 px-4 rounded-xl mx-auto w-fit border ${
                        status === 'Available' ? 'bg-green-50 text-green-700 border-green-100' : 
                        status === 'Busy' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}>
                        {status === 'Available' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                        {status}
                    </div>
                    {/* Source Flag */}
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold px-2">
                        via {source}
                    </div>
                </div>

                {location.cabin_code && (
                    <div className="mt-2 flex justify-center items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 py-2 px-4 rounded-full mx-auto w-fit">
                        <MapPin size={12} className="text-[#8C1515]"/> {location.block} - {location.cabin_code}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-center gap-3 mt-6 border-t border-gray-50 pt-6">
                    <button 
                        onClick={handleRequestUpdate}
                        className="flex-1 bg-white border-2 border-gray-100 text-gray-600 py-3 rounded-xl text-[10px] font-bold uppercase active:scale-95 transition-transform hover:bg-gray-50"
                    >
                        Request Update
                    </button>
                    <button 
                        onClick={() => setShowVerifyModal(true)}
                        className="flex-[2] flex items-center justify-center gap-2 bg-[#8C1515] rounded-xl text-[10px] font-bold text-white shadow-md active:scale-95 transition-transform"
                    >
                        <MapPin size={14} /> I'm at Cabin
                    </button>
                </div>
             </div>
          </div>

          {/* MAP LOCATOR CARD */}
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
             <h3 className="text-[#8C1515] font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <Navigation size={16} /> Cabin Locator
             </h3>
             
             {/* Use the Interactive Map Component here */}
             <div className="w-full bg-gray-50 rounded-xl overflow-hidden relative border border-gray-200 mb-4">
                <InteractiveMap 
                    coordinates={location.coordinates} 
                    cabinCode={location.cabin_code} 
                />
             </div>

             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Directions</p>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {location.directions || "No specific directions available."}
                </p>
             </div>
          </div>

          {/* FUTURE CHECK BUTTON */}
          <button 
            onClick={() => setShowFutureModal(true)}
            className="w-full bg-white border-2 border-[#8C1515]/10 text-[#8C1515] py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#FFF5F5]"
          >
            <Calendar size={16} /> Check Future Schedule
          </button>
       </div>

       {/* --- MODALS --- */}
       
       {/* Verify Modal */}
       {showVerifyModal && (
         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
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

       {/* Future Modal */}
       {showFutureModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-[#8C1515] uppercase text-sm">Check Schedule</h3>
                    <X size={20} className="text-gray-400 cursor-pointer" onClick={() => setShowFutureModal(false)} />
                </div>
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