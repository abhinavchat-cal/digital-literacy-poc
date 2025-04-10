import axios from 'axios';
import { API_URL } from './auth';

export interface Institute {
  id: string;
  name: string;
  district: string;
  block: string;
  created_at: string;
}

// Public service for accessing data that doesn't require auth
export const publicService = {
  // Get all institutes for registration
  async getInstitutes(): Promise<Institute[]> {
    try {
      const response = await axios.get(`${API_URL.replace('/auth', '')}/institute/institutes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institutes:', error);
      return []; // Return empty array on error
    }
  }
}; 