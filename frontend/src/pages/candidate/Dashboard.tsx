import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { candidateService, Course, Exam, CourseCertificate, Progress } from '../../services/candidate';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [certificates, setCertificates] = useState<CourseCertificate[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, examsData, certificatesData, progressData] = await Promise.all([
        candidateService.getAvailableCourses(),
        candidateService.getAvailableExams(),
        candidateService.getCertificates(),
        candidateService.getProgress()
      ]);
      setCourses(coursesData);
      setExams(examsData);
      setCertificates(certificatesData);
      setProgress(progressData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Candidate Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.full_name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Courses */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Courses</h2>
            {courses.length === 0 ? (
              <p className="text-gray-600">No courses available at the moment.</p>
            ) : (
              <ul className="space-y-2">
                {courses.map((course) => (
                  <li key={course.id} className="border-b pb-2">
                    <h3 className="font-bold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    {course.pdf_url && (
                      <a
                        href={course.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Download Course Material
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Available Exams */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Exams</h2>
            {exams.length === 0 ? (
              <p className="text-gray-600">No exams available at the moment.</p>
            ) : (
              <ul className="space-y-2">
                {exams.map((exam) => (
                  <li key={exam.id} className="border-b pb-2">
                    <h3 className="font-bold text-gray-900">{exam.title}</h3>
                    <button
                      onClick={() => navigate(`/candidate/exam/${exam.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Take Exam
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Certificates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Certificates</h2>
            {certificates.length === 0 ? (
              <p className="text-gray-600">No certificates available yet.</p>
            ) : (
              <ul className="space-y-2">
                {certificates.map((cert) => (
                  <li key={cert.id} className="border-b pb-2">
                    <h3 className="font-bold text-gray-900">Course Certificate</h3>
                    <p className="text-sm text-gray-600">Issued on: {new Date(cert.issued_on).toLocaleDateString()}</p>
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      View Certificate
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Progress */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
            {!progress ? (
              <p className="text-gray-600">No progress data available.</p>
            ) : (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Overall Progress</span>
                    <span className="text-lg font-bold text-gray-900">{progress.completion_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-lg font-bold text-gray-900">{progress.total_courses}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-600">Total Subjects</p>
                    <p className="text-lg font-bold text-gray-900">{progress.total_subjects}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-600">Completed Subjects</p>
                    <p className="text-lg font-bold text-gray-900">{progress.completed_subjects}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-600">Certificates Earned</p>
                    <p className="text-lg font-bold text-gray-900">{progress.earned_certificates}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 