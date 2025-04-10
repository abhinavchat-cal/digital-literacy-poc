import axios from 'axios';
import { API_URL } from './auth';

export interface Subject {
  id: string;
  name: string;
  course_id: string;
  trainer_id: string;
  created_at: string;
}

export interface SubjectCreate {
  name: string;
  course_id: string;
}

export interface Exam {
  id: string;
  subject_id: string;
  title: string;
  csv_url: string;
  created_at: string;
}

export interface ExamCreate {
  subject_id: string;
  title: string;
  csv_url: string;
}

export interface ExamResult {
  candidate_id: string;
  exam_id: string;
  score_percentage: number;
  passed: boolean;
  attempted_on: string;
}

export const trainerService = {
  // Subject Management
  async getSubjects(): Promise<Subject[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/trainer')}/trainer/subjects`);
    return response.data;
  },

  async createSubject(data: SubjectCreate): Promise<Subject> {
    const response = await axios.post(`${API_URL.replace('/auth', '/trainer')}/trainer/subjects`, data);
    return response.data;
  },

  // Exam Management
  async getExams(): Promise<Exam[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/trainer')}/trainer/exams`);
    return response.data;
  },

  async createExam(data: ExamCreate): Promise<Exam> {
    const response = await axios.post(`${API_URL.replace('/auth', '/trainer')}/trainer/exams`, data);
    return response.data;
  },

  async uploadExamCSV(examId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`${API_URL.replace('/auth', '/trainer')}/trainer/exams/${examId}/upload-csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Candidate Management
  async getCandidates(): Promise<any[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/trainer')}/trainer/candidates`);
    return response.data;
  },

  // Exam Results
  async getExamResults(examId: string): Promise<ExamResult[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '/trainer')}/trainer/exams/${examId}/results`);
    return response.data;
  }
}; 