// src/services/locatorService.ts
import api from './api';

export const locatorService = {
  // 1. Get Live Location & Status for a specific Faculty
  getFacultyLocation: async (facultyId: string) => {
    const response = await api.get(`/locator/faculty/${facultyId}/location`);
    return response.data;
  },

  // 2. Request a Status Update (Crowdsourcing)
  requestUpdate: async (facultyId: string) => {
    const response = await api.post(`/locator/faculty/${facultyId}/request-update`);
    return response.data;
  },

  // 3. Update Status (I'm at the Cabin)
  updateStatus: async (facultyId: string, status: string, source: string) => {
    const response = await api.put(`/locator/faculty/${facultyId}/status`, {
      status,
      source
    });
    return response.data;
  },

  // 4. Check Future Availability
  checkFutureAvailability: async (facultyId: string, datetime: string) => {
    const response = await api.post(`/locator/faculty/${facultyId}/future`, {
      datetime
    });
    return response.data;
  }
};