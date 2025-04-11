import React, { useState, useEffect } from 'react';
import { trainerService, Subject, SubjectCreate, Course } from '../../services/trainer';
import { useNavigate } from 'react-router-dom';

const Subjects: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState<SubjectCreate>({
    name: '',
    course_id: ''
  });

  useEffect(() => {
    fetchSubjects();
    fetchCourses();
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

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      // Get trainer's institute ID from user context if available
      const data = await trainerService.getCoursesByInstitute();
      setCourses(data);
      
      // Set first course as default if available
      if (data.length > 0) {
        setNewSubject(prev => ({ ...prev, course_id: data[0].id }));
      }
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trainerService.createSubject(newSubject);
      setNewSubject({ name: '', course_id: courses.length > 0 ? courses[0].id : '' });
      fetchSubjects();
    } catch (err) {
      setError('Failed to create subject');
      console.error(err);
    }
  };

  if (loading || coursesLoading) {
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
              <label className="block text-sm font-medium text-gray-700">Course</label>
              {courses.length === 0 ? (
                <div className="mt-1 text-sm text-red-500">
                  No courses available for your institute. Please contact an administrator.
                </div>
              ) : (
                <select
                  value={newSubject.course_id}
                  onChange={(e) => setNewSubject({ ...newSubject, course_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="submit"
              disabled={courses.length === 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Subject
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-2xl font-bold p-6">Your Subjects</h2>
          {subjects.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No subjects found. Create your first subject above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject) => {
                    const courseName = courses.find(c => c.id === subject.course_id)?.title || subject.course_id;
                    return (
                      <tr key={subject.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(subject.created_at).toLocaleDateString()}
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

export default Subjects; 