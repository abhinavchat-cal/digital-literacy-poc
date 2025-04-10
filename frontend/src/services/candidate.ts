import axios from 'axios';
import { API_URL } from './auth';

export interface Course {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
}

export interface Exam {
  id: string;
  subject_id: string;
  title: string;
  csv_url: string;
}

export interface ExamAttempt {
  id: string;
  candidate_id: string;
  exam_id: string;
  score_percentage: number;
  passed: boolean;
  attempted_on: string;
}

export interface ExamSubmission {
  exam_id: string;
  answers: Record<string, string>;
}

export interface ExamResult {
  score_percentage: number;
  passed: boolean;
}

export interface CourseCertificate {
  id: string;
  candidate_id: string;
  course_id: string;
  certificate_url: string;
  issued_on: string;
}

export interface Progress {
  total_courses: number;
  total_subjects: number;
  completed_subjects: number;
  earned_certificates: number;
  completion_percentage: number;
}

export interface ExamQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface PaginatedExamQuestions {
  questions: ExamQuestion[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const candidateService = {
  async getAvailableCourses(): Promise<Course[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '')}/candidate/courses`);
    return response.data;
  },

  async getAvailableExams(): Promise<Exam[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '')}/candidate/exams`);
    return response.data;
  },

  async submitExam(submission: ExamSubmission): Promise<ExamResult> {
    const response = await axios.post(`${API_URL.replace('/auth', '')}/candidate/exams/submit`, submission);
    return response.data;
  },

  async getExamAttempts(): Promise<ExamAttempt[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '')}/candidate/attempts`);
    return response.data;
  },

  async getCertificates(): Promise<CourseCertificate[]> {
    const response = await axios.get(`${API_URL.replace('/auth', '')}/candidate/certificates`);
    return response.data;
  },

  async getProgress(): Promise<Progress> {
    const response = await axios.get(`${API_URL.replace('/auth', '')}/candidate/progress`);
    return response.data;
  },

  async getExamQuestions(
    examId: string,
    page: number = 1,
    page_size: number = 10
  ): Promise<PaginatedExamQuestions> {
    const response = await axios.get<PaginatedExamQuestions>(
      `${API_URL.replace('/auth', '')}/candidate/exams/${examId}/questions`,
      {
        params: { page, page_size },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );
    return response.data;
  }
}; 