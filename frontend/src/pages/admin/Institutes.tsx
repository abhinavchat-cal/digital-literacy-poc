import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, Institute, InstituteCreate } from '../../services/admin';
import { useNavigate } from 'react-router-dom';

const Institutes: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newInstitute, setNewInstitute] = useState<InstituteCreate>({
    name: '',
    district: '',
    block: ''
  });

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const data = await adminService.getInstitutes();
        setInstitutes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch institutes');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutes();
  }, []);

  const handleCreateInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const institute = await adminService.createInstitute(newInstitute);
      setInstitutes([...institutes, institute]);
      setNewInstitute({ name: '', district: '', block: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create institute');
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => navigate('/admin')}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-xl font-bold">Institutes Management</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.full_name}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Institute</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleCreateInstitute} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newInstitute.name}
                    onChange={(e) => setNewInstitute({ ...newInstitute, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <input
                    type="text"
                    id="district"
                    value={newInstitute.district}
                    onChange={(e) => setNewInstitute({ ...newInstitute, district: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="block" className="block text-sm font-medium text-gray-700">
                    Block
                  </label>
                  <input
                    type="text"
                    id="block"
                    value={newInstitute.block}
                    onChange={(e) => setNewInstitute({ ...newInstitute, block: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Institute
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Registered Institutes</h3>
            <div className="mt-4 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            District
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Block
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {institutes.map((institute) => (
                          <tr key={institute.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {institute.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {institute.district}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {institute.block}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(institute.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Institutes; 