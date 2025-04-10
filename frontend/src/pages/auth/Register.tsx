import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { publicService, Institute } from '../../services/public';

const Register: React.FC = () => {
  const { register, error } = useAuth();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoadingInstitutes, setIsLoadingInstitutes] = useState(false);
  const [instituteError, setInstituteError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    aadhaar_id: '',
    role: 'candidate' as 'admin' | 'trainer' | 'candidate',
    institute_id: '',
  });

  // Fetch institutes when component mounts
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        setIsLoadingInstitutes(true);
        const data = await publicService.getInstitutes();
        setInstitutes(data);
        
        // Set first institute as default if available and role is not admin
        if (data.length > 0 && formData.role !== 'admin') {
          setFormData(prev => ({ ...prev, institute_id: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch institutes:', err);
        setInstituteError('Failed to load institutes. Please try again later.');
      } finally {
        setIsLoadingInstitutes(false);
      }
    };

    fetchInstitutes();
  }, []);

  // Update institute_id when role changes
  useEffect(() => {
    if (formData.role === 'admin') {
      // Clear institute_id for admin
      setFormData(prev => ({ ...prev, institute_id: '' }));
    } else if (institutes.length > 0 && !formData.institute_id) {
      // Set default institute if available
      setFormData(prev => ({ ...prev, institute_id: institutes[0].id }));
    }
  }, [formData.role, institutes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a clean data object for submission
    const dataToSubmit: {
      email: string;
      password: string;
      full_name: string;
      aadhaar_id: string;
      role: 'admin' | 'trainer' | 'candidate';
      institute_id?: string;
    } = {
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      aadhaar_id: formData.aadhaar_id,
      role: formData.role,
    };
    
    // Only include institute_id if not admin AND the value is not empty
    if (formData.role !== 'admin' && formData.institute_id && formData.institute_id.trim() !== '') {
      dataToSubmit.institute_id = formData.institute_id;
    }
    
    console.log('Submitting registration data:', dataToSubmit);
    await register(dataToSubmit);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="full_name" className="sr-only">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="aadhaar_id" className="sr-only">
                Aadhaar ID
              </label>
              <input
                id="aadhaar_id"
                name="aadhaar_id"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Aadhaar ID"
                value={formData.aadhaar_id}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="candidate">Candidate</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {(formData.role === 'trainer' || formData.role === 'candidate') && (
              <div>
                <label htmlFor="institute_id" className="sr-only">
                  Institute
                </label>
                {isLoadingInstitutes ? (
                  <div className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm">
                    Loading institutes...
                  </div>
                ) : instituteError ? (
                  <div className="appearance-none rounded-none relative block w-full px-3 py-2 border border-red-300 bg-white text-red-500 placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm">
                    {instituteError}
                  </div>
                ) : institutes.length === 0 ? (
                  <div className="appearance-none rounded-none relative block w-full px-3 py-2 border border-yellow-300 bg-white text-yellow-700 placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm">
                    No institutes available. Please contact an administrator.
                  </div>
                ) : (
                  <select
                    id="institute_id"
                    name="institute_id"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={formData.institute_id}
                    onChange={handleChange}
                  >
                    {institutes.map(institute => (
                      <option key={institute.id} value={institute.id}>
                        {institute.name} ({institute.district})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoadingInstitutes || (formData.role !== 'admin' && institutes.length === 0)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 