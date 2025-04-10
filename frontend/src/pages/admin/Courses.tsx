import React, { useState, useEffect } from 'react';
import { adminService, CourseWithSubjects, CourseCreate } from '../../services/admin';
import { useNavigate } from 'react-router-dom';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithSubjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState<CourseCreate>({
    title: '',
    description: '',
    pdf_url: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCourse(newCourse);
      setNewCourse({ title: '', description: '', pdf_url: '' });
      fetchCourses();
    } catch (err) {
      setError('Failed to create course');
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
            onClick={() => navigate('/admin')}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold">Courses Management</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PDF URL</label>
              <input
                type="text"
                value={newCourse.pdf_url}
                onChange={(e) => setNewCourse({ ...newCourse, pdf_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Course
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-2xl font-bold p-6">Registered Courses</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF URL</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.pdf_url}</td>
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

export default Courses; 