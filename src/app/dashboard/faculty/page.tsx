"use client";

import React, { useEffect, useState } from 'react';
import { Menu, Bell, ChevronRight, X, Mail, MapPin, Home, User, Folder, Link as LinkIcon, HelpCircle, LogOut, Users } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { 
  facultyDashboardService, 
  FacultyDashboardData, 
  StudentPublicProfile, 
  FacultyMenuData, 
  FacultyProfile 
} from '@/services/facultyDashboardService';
import toast, { Toaster } from 'react-hot-toast';

export default function FacultyDashboard() {
  const router = useRouter();
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [menuData, setMenuData] = useState<FacultyMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentPublicProfile | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await facultyDashboardService.getFacultyHome();
        
        // --- MOCK DATA FALLBACK ---
        if (!res.recommended_students || res.recommended_students.length === 0) {
            res.recommended_students = [
                {
                    student_id: "mock1",
                    name: "Priya Sharma",
                    department: "CSE",
                    batch: "3rd Year",
                    profile_picture: "https://avatar.iran.liara.run/public/girl",
                    matched_skills: ["Machine Learning", "Python", "Computer Vision"],
                    match_score: "95%"
                },
                {
                    student_id: "mock2",
                    name: "Rahul Verma",
                    department: "ECE",
                    batch: "4th Year",
                    profile_picture: "https://avatar.iran.liara.run/public/boy",
                    matched_skills: ["Embedded Systems", "IoT", "C++"],
                    match_score: "90%"
                }
            ];
        }

        if (!res.faculty_collaborations || res.faculty_collaborations.length === 0) {
            res.faculty_collaborations = [
                {
                    faculty_id: "mock_f1",
                    faculty_name: "Dr. Meera Reddy",
                    faculty_dept: "EE Dept.",
                    faculty_pic: "https://avatar.iran.liara.run/public/65",
                    project_title: "Renewable Energy Grid Optimization",
                    collaboration_type: "Seeking Co-PI"
                },
                {
                    faculty_id: "mock_f2",
                    faculty_name: "Prof. Anand Singh",
                    faculty_dept: "Civil Dept.",
                    faculty_pic: "https://avatar.iran.liara.run/public/34",
                    project_title: "Urban Mobility Solutions",
                    collaboration_type: "Joint Research"
                }
            ];
        }
        
        setData(res);
        const menuRes = await facultyDashboardService.getFacultyMenu();
        setMenuData(menuRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- ACTIONS ---
  const handleShortlist = async (id: string) => {
    if (id.startsWith("mock")) {
        toast.success("Student Shortlisted!");
        return;
    }
    try {
      await facultyDashboardService.shortlistStudent(id);
      toast.success("Student Shortlisted!");
    } catch (err) {
      toast.error("Failed to shortlist");
    }
  };

  const openStudentProfile = async (id: string) => {
    setSelectedStudentId(id);
    setStudentProfile(null); 
    
    // Fallback for mock students
    if (id.startsWith("mock")) {
        setStudentProfile({
            info: {
                name: id === "mock1" ? "Priya Sharma" : "Rahul Verma",
                roll_no: "CB.SC.U4CSE22101",
                department: id === "mock1" ? "CSE" : "ECE",
                batch: "2022-2026",
                bio: "Passionate about AI and building scalable systems.",
                email: "student@amrita.edu",
                phone: "+91 9876543210",
                profile_picture: id === "mock1" ? "https://avatar.iran.liara.run/public/girl" : "https://avatar.iran.liara.run/public/boy",
                skills: ["Python", "React", "TensorFlow"],
                interests: ["AI", "Web Dev"]
            },
            projects: [
                { title: "Library Management System", description: "Built using React and Node.", duration: "Jan - May 2024", tools: ["React", "Node.js"] }
            ]
        });
        return;
    }

    try {
      const profile = await facultyDashboardService.getStudentProfile(id);
      setStudentProfile(profile);
    } catch (err) {
      toast.error("Could not load student profile");
      setSelectedStudentId(null);
    }
  };

  const openFacultyProfile = async (id: string) => {
    setSelectedFacultyId(id);
    setFacultyProfile(null);

    // Fallback for mock faculty
    if (id.startsWith("mock")) {
        setFacultyProfile({
            info: {
                name: id === "mock_f1" ? "Dr. Meera Reddy" : "Prof. Anand Singh",
                designation: "Associate Professor",
                department: id === "mock_f1" ? "Electrical Engineering" : "Civil Engineering",
                email: "faculty@amrita.edu",
                profile_picture: id === "mock_f1" ? "https://avatar.iran.liara.run/public/65" : "https://avatar.iran.liara.run/public/34",
                qualifications: ["PhD", "M.Tech"],
                cabin_location: "Block B, Floor 2",
                interests: ["Power Systems", "Renewable Energy"],
                availability_status: "Available"
            },
            schedule: "Mon-Fri 9-5",
            openings: [
                { id: "op1", title: "Smart Grid Analysis", type: "Research", description: "Looking for students." }
            ],
            previous_work: []
        });
        return;
    }

    try {
      const profile = await facultyDashboardService.getFacultyProfile(id);
      setFacultyProfile(profile);
    } catch (err) {
      toast.error("Could not load faculty profile");
      setSelectedFacultyId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleNavigation = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center py-8 font-sans">
      <Toaster position="top-center" />

      {/* PHONE FRAME */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#F9F9F9] rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* --- 1. SIDE MENU DRAWER --- */}
        <div 
          className={`absolute inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMenuOpen(false)} 
        >
           <div 
             className={`absolute top-0 left-0 bottom-0 w-[80%] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
             onClick={(e) => e.stopPropagation()} 
           >
              {/* Drawer Header */}
              <div className="bg-[#8C1515] p-6 pt-12 pb-8 text-center relative">
                 <div className="w-24 h-24 rounded-full bg-white mx-auto mb-3 p-1 border-2 border-white/20">
                    <img 
                      src={menuData?.profile_picture || "https://avatar.iran.liara.run/public/boy"} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                 </div>
                 <h2 className="text-white font-black text-lg leading-tight mb-1">{menuData?.name || "Faculty User"}</h2>
                 <p className="text-white/80 text-xs font-medium">Employee ID: {menuData?.employee_id || "N/A"}</p>
                 <p className="text-white/80 text-xs font-medium">Department: {menuData?.department || "General"}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <MenuLink icon={Home} label="Home" onClick={() => handleNavigation('/dashboard/faculty')} active />
                <MenuLink icon={User} label="Profile" onClick={() => handleNavigation('/dashboard/faculty/profile')} />
                <MenuLink icon={Folder} label="My Openings" onClick={() => handleNavigation('/dashboard/faculty/projects')} />
                
                {/* All Students Link */}
                <MenuLink icon={Users} label="All Students" onClick={() => handleNavigation('/dashboard/faculty/all-students')} />
                
                {/* --- FIX 1: Faculty Collaborations Link --- */}
                <MenuLink 
                    icon={LinkIcon} 
                    label="Faculty Collaborations" 
                    onClick={() => handleNavigation('/dashboard/faculty/collaborations')} 
                />
                
                <MenuLink icon={HelpCircle} label="Help & Support" onClick={() => handleNavigation('/dashboard/faculty/support')} />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 text-[#8C1515] font-bold text-sm hover:bg-red-50 transition-colors border-t border-gray-100 mt-2"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>

              <div className="absolute bottom-6 w-full text-center">
                 <p className="text-[10px] text-gray-400 font-bold">Version 2.1.4</p>
              </div>
           </div>
        </div>


        {/* --- 2. MAIN HEADER --- */}
        <div className="bg-[#8C1515] text-white p-6 pt-12 pb-6 shadow-md z-10 flex justify-between items-start">
           <div>
             <button onClick={() => setMenuOpen(true)} className="mb-4">
                <Menu size={24} />
             </button>
             <h1 className="text-xl font-black tracking-tight leading-none">Welcome! <br/> {data?.user_info.name}</h1>
             <p className="text-white/70 text-xs font-bold mt-1">{data?.user_info.department}</p>
           </div>
           
           {/* --- Notifications Link (Only Bell) --- */}
           <div className="flex gap-4 items-center mt-1">
              <button onClick={() => router.push('/dashboard/faculty/notifications')}>
                 <Bell size={20} />
              </button>
           </div>
        </div>


        {/* --- 3. DASHBOARD CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
           
           {/* Recommended Students */}
           <div className="mt-6 px-6">
              <h2 className="text-[#8C1515] font-black text-lg mb-4">Recommended Students</h2>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                 {['AI in Healthcare', 'IoT Smart Cities', 'Blockchain Security'].map(tag => (
                   <span key={tag} className="bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
                     {tag}
                   </span>
                 ))}
              </div>

              <div className="space-y-4">
                 {data?.recommended_students.map(student => (
                   <div key={student.student_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative">
                      <div className="absolute top-5 right-5 text-right">
                         <span className="block text-2xl font-black text-[#D4AF37]">{student.match_score}</span>
                      </div>
                      
                      {/* Clickable Student Header */}
                      <div 
                        onClick={() => openStudentProfile(student.student_id)}
                        className="flex gap-3 mb-4 cursor-pointer group"
                      >
                         <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden group-hover:ring-2 ring-[#8C1515] transition-all">
                           <img src={student.profile_picture || "https://avatar.iran.liara.run/public/girl"} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <h3 className="text-gray-900 font-black text-sm group-hover:text-[#8C1515] transition-colors">{student.name}</h3>
                            <p className="text-gray-500 text-xs font-bold">{student.department}, {student.batch}</p>
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-5 pr-12">
                         {student.matched_skills.slice(0,3).map(skill => (
                           <span key={skill} className="bg-[#8C1515] text-white px-2 py-0.5 rounded-md text-[9px] font-bold">
                             {skill}
                           </span>
                         ))}
                      </div>
                      <div className="flex gap-3">
                         <button 
                            onClick={() => openStudentProfile(student.student_id)}
                            className="flex-1 border-2 border-[#8C1515] text-[#8C1515] py-2.5 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-transform"
                         >
                           View Profile
                         </button>
                         <button 
                           onClick={() => handleShortlist(student.student_id)}
                           className="flex-1 bg-[#8C1515] text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform"
                         >
                           Shortlist
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Faculty Collaborations Preview */}
           <div className="mt-8 px-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-[#8C1515] font-black text-lg">Faculty Collaborations</h2>
                 
                 {/* --- FIX 2: View All Button Link --- */}
                 <button 
                    onClick={() => handleNavigation('/dashboard/faculty/collaborations')} 
                    className="text-[#8C1515] text-xs font-black flex items-center gap-1"
                 >
                   View All <ChevronRight size={14} />
                 </button>
                 
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                 {data?.faculty_collaborations.map(collab => (
                    <div key={collab.faculty_id + collab.project_title} className="min-w-[200px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                       
                       {/* Clickable Header */}
                       <div 
                         onClick={() => openFacultyProfile(collab.faculty_id)}
                         className="flex items-center gap-2 mb-2 cursor-pointer group"
                       >
                          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden group-hover:ring-2 ring-[#8C1515] transition-all">
                             <img src={collab.faculty_pic || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-900 group-hover:text-[#8C1515] transition-colors">{collab.faculty_name}</p>
                             <p className="text-[8px] font-bold text-gray-400">{collab.faculty_dept}</p>
                          </div>
                       </div>
                       
                       <h4 className="text-xs font-black text-gray-800 leading-tight mb-1 line-clamp-2">{collab.project_title}</h4>
                       <p className="text-[9px] text-[#8C1515] font-bold">{collab.collaboration_type}</p>
                    </div>
                 ))}
              </div>
           </div>
           <div className="h-6"></div>
        </div>


        {/* --- 4. STUDENT PROFILE MODAL --- */}
        {selectedStudentId && (
          <div className="absolute inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
             <div className="relative h-40 bg-[#FFF0F0] flex justify-center items-end pb-0 border-b border-gray-100">
                <button onClick={() => setSelectedStudentId(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500">
                   <X size={20} />
                </button>
                <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                   <img src={studentProfile?.info.profile_picture || "https://avatar.iran.liara.run/public/girl"} className="w-full h-full object-cover" />
                </div>
             </div>
             {studentProfile ? (
                <div className="px-6 pt-12 pb-10 text-center">
                   <h2 className="text-xl font-black text-gray-900 leading-tight">{studentProfile.info.name}</h2>
                   <p className="text-xs font-bold text-[#8C1515] mt-1">{studentProfile.info.roll_no}</p>
                   <p className="text-[10px] text-gray-400 font-bold">{studentProfile.info.department} | {studentProfile.info.batch}</p>
                   <p className="text-xs text-gray-600 mt-4 leading-relaxed px-4">{studentProfile.info.bio}</p>
                   <div className="flex justify-center flex-wrap gap-2 mt-4 mb-6">
                      {studentProfile.info.skills.map(s => (
                         <span key={s} className="bg-[#8C1515] text-white px-2 py-1 rounded-md text-[10px] font-bold">{s}</span>
                      ))}
                   </div>
                   <div className="text-left mb-6">
                      <h3 className="text-[#8C1515] font-black text-xs uppercase tracking-widest mb-3">Projects</h3>
                      <div className="space-y-3">
                         {studentProfile.projects.map((proj, i) => (
                            <div key={i} className="bg-[#F9F9F9] p-4 rounded-xl border border-gray-100">
                               <h4 className="font-bold text-sm text-gray-900">{proj.title}</h4>
                               <p className="text-[10px] text-gray-500 font-bold mb-2">{proj.duration}</p>
                               <p className="text-xs text-gray-600 mb-2">{proj.description}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="flex gap-2 justify-center mt-8">
                       <button className="flex items-center gap-2 bg-[#8C1515] text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md">
                          <Mail size={16} /> Contact Student
                       </button>
                   </div>
                   <div className="h-10"></div>
                </div>
             ) : (
                <div className="flex justify-center items-center h-40">
                   <p className="text-xs font-bold text-gray-400 animate-pulse">Loading Student Profile...</p>
                </div>
             )}
          </div>
        )}

        {/* --- 5. FACULTY PROFILE MODAL --- */}
        {selectedFacultyId && (
          <div className="absolute inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
             <div className="relative h-40 bg-[#F9F9F9] flex justify-center items-end pb-0 border-b border-gray-100">
                <button onClick={() => setSelectedFacultyId(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm text-gray-500">
                   <X size={20} />
                </button>
                <div className="absolute -bottom-10 border-4 border-white rounded-full overflow-hidden shadow-lg w-24 h-24 bg-gray-200">
                   <img src={facultyProfile?.info.profile_picture || "https://avatar.iran.liara.run/public/boy"} className="w-full h-full object-cover" />
                </div>
             </div>
             {facultyProfile ? (
                <div className="px-6 pt-12 pb-10 text-center">
                   <h2 className="text-xl font-black text-gray-900 leading-tight">{facultyProfile.info.name}</h2>
                   <p className="text-xs font-bold text-[#8C1515] mt-1">{facultyProfile.info.designation}</p>
                   <p className="text-[10px] text-gray-400 font-bold">{facultyProfile.info.department}</p>
                   
                   <div className="flex justify-center gap-2 mt-3 mb-5">
                      {facultyProfile.info.qualifications.map((q, i) => (
                         <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold">{q}</span>
                      ))}
                   </div>
                   
                   <div className="space-y-2 mb-6">
                      <div className="border border-red-100 bg-red-50/50 rounded-xl p-3 flex items-center gap-3">
                         <Mail size={16} className="text-[#8C1515]" />
                         <span className="text-xs font-bold text-[#8C1515]">{facultyProfile.info.email}</span>
                      </div>
                      <div className="border border-gray-100 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                         <MapPin size={16} className="text-gray-500" />
                         <div className="text-left">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Cabin Location</p>
                            <p className="text-xs font-bold text-gray-700">{facultyProfile.info.cabin_location}</p>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-3 mt-8">
                      <button className="flex-1 bg-[#8C1515] text-white py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform">
                         Navigate to Cabin
                      </button>
                   </div>
                   <div className="h-10"></div>
                </div>
             ) : (
                <div className="flex justify-center items-center h-40">
                   <p className="text-xs font-bold text-gray-400 animate-pulse">Loading Faculty Profile...</p>
                </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}

// Helper Component for Menu Items
function MenuLink({ 
    icon: Icon, 
    label, 
    active = false, 
    onClick 
}: { 
    icon: any, 
    label: string, 
    active?: boolean, 
    onClick?: () => void 
}) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 transition-colors ${active ? 'bg-red-50 text-[#8C1515]' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className={active ? "text-[#8C1515]" : "text-[#8C1515]"} strokeWidth={2.5} />
        <span className={`text-sm ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}