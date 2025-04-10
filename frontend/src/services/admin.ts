import axios from 'axios';
import { API_URL } from './auth';

export interface Institute {
  id: string;
  name: string;
  district: string;
  block: string;
  created_at: string;
}

export interface InstituteCreate {
  name: string;
  district: string;
  block: string;
}

export interface InstituteWithStats extends Institute {
  total_candidates: number;
  total_trainers: number;
  total_courses: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  created_at: string;
  created_by: string;
}

export interface CourseCreate {
  title: string;
  description: string;
  pdf_url: string;
}

export interface CourseWithSubjects extends Course {
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  trainer_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  aadhaar_id: string;
  created_at: string;
}

export interface Analytics {
  total_institutes: number;
  total_candidates: number;
  total_trainers: number;
  total_courses: number;
  total_subjects: number;
  total_exams: number;
  total_certificates: number;
}

export const adminService = {
  // Institute Management
  async getInstitutes(): Promise<Institute[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/admin')}/admin/institutes`);
    return response.data;
  },

  async createInstitute(data: InstituteCreate): Promise<Institute> {
    const response = await axios.post(`${API_URL.replace('/auth', '/admin')}/admin/institutes`, data);
    return response.data;
  },

  async getInstituteStats(instituteId: string): Promise<InstituteWithStats> {
    const response = await axios.get(`${API_URL.replace('/auth', '/admin')}/admin/institutes/${instituteId}`);
    return response.data;
  },

  // Course Management
  async getCourses(): Promise<CourseWithSubjects[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/admin')}/admin/courses`);
    return response.data;
  },

  async createCourse(data: CourseCreate): Promise<Course> {
    const response = await axios.post(`${API_URL.replace('/auth', '/admin')}/admin/courses`, data);
    return response.data;
  },

  // User Management
  async getCandidates(): Promise<User[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/admin')}/admin/candidates`);
    return response.data;
  },

  async getTrainers(): Promise<User[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/admin')}/admin/trainers`);
    return response.data;
  },

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const response = await axios.get(`${API_URL.replace('/auth', '/admin')}/admin/analytics`);
    return response.data;
  }
}; 