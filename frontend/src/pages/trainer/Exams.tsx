import React, { useState, useEffect } from 'react';
import { trainerService, Exam, ExamCreate, Subject } from '../../services/trainer';
import { useNavigate } from 'react-router-dom';

const Exams: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newExam, setNewExam] = useState<ExamCreate>({
    subject_id: '',
    title: '',
    csv_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await trainerService.getExams();
      setExams(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch exams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const data = await trainerService.getSubjects();
      setSubjects(data);
      
      // Set first subject as default if available
      if (data.length > 0) {
        setNewExam(prev => ({ ...prev, subject_id: data[0].id }));
      }
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error(err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const exam = await trainerService.createExam(newExam);
      if (selectedFile) {
        await trainerService.uploadExamCSV(exam.id, selectedFile);
      }
      setNewExam({ 
        subject_id: subjects.length > 0 ? subjects[0].id : '', 
        title: '', 
        csv_url: '' 
      });
      setSelectedFile(null);
      fetchExams();
    } catch (err) {
      setError('Failed to create exam');
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (loading || subjectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/trainer')}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold">Exams Management</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Exam</h2>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              {subjects.length === 0 ? (
                <div className="mt-1 text-sm text-red-500">
                  No subjects available. Please create a subject first.
                </div>
              ) : (
                <select
                  value={newExam.subject_id}
                  onChange={(e) => setNewExam({ ...newExam, subject_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1 block w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={subjects.length === 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Exam
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-2xl font-bold p-6">Your Exams</h2>
          {exams.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No exams found. Create your first exam above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam) => {
                    const subjectName = subjects.find(s => s.id === exam.subject_id)?.name || exam.subject_id;
                    return (
                      <tr key={exam.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subjectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exams; 