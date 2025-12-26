import api from './api';

export const profileService = {
  // Updates student skills and bio
  updateStudentProfile: async (profileData: any) => {
    const { data } = await api.put('/profile/student/update', profileData);
    return data;
  },

  // Updates faculty research domains and openings
  updateFacultyProfile: async (profileData: any) => {
    const { data } = await api.put('/profile/faculty/update', profileData);
    return data;
  },

  // Posts a new research project (Faculty only)
  postNewProject: async (projectData: any) => {
    const { data } = await api.post('/projects/create', projectData);
    return data;
  }
};