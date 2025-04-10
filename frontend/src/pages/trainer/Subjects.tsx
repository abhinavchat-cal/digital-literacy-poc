import React, { useState, useEffect } from 'react';
import { trainerService, Subject, SubjectCreate } from '../../services/trainer';
import { useNavigate } from 'react-router-dom';

const Subjects: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState<SubjectCreate>({
    name: '',
    course_id: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await trainerService.getSubjects();
      setSubjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trainerService.createSubject(newSubject);
      setNewSubject({ name: '', course_id: '' });
      fetchSubjects();
    } catch (err) {
      setError('Failed to create subject');
      console.error(err);
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/trainer')}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold">Subjects Management</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Subject</h2>
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course ID</label>
              <input
                type="text"
                value={newSubject.course_id}
                onChange={(e) => setNewSubject({ ...newSubject, course_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Subject
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-2xl font-bold p-6">Your Subjects</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.course_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(subject.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects; 