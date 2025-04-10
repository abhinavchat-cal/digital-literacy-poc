import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { candidateService } from '../../services/candidate';

interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

const Exam: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    if (examId) {
      fetchExamQuestions();
    }
  }, [examId, pagination.page, pagination.page_size]);

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getExamQuestions(
        examId!,
        pagination.page,
        pagination.page_size
      );
      setQuestions(response.questions);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        total_pages: response.total_pages
      }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch exam questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const questionId = `${pagination.page}-${questionIndex}`;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Check if all questions across all pages are answered
      const totalAnswers = Object.keys(answers).length;
      if (totalAnswers !== pagination.total) {
        setError('Please answer all questions before submitting');
        return;
      }

      // Submit exam
      const submission = {
        exam_id: examId!,
        answers: Object.entries(answers).reduce((acc, [key, value]) => {
          const [page, index] = key.split('-');
          const questionIndex = (parseInt(page) - 1) * pagination.page_size + parseInt(index);
          acc[questionIndex.toString()] = value;
          return acc;
        }, {} as Record<string, string>)
      };

      const result = await candidateService.submitExam(submission);
      setResult({
        score: result.score_percentage,
        passed: result.passed
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit exam');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPagination(prev => ({
      ...prev,
      page_size: newPageSize,
      page: 1 // Reset to first page when changing page size
    }));
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
              <button
                onClick={() => navigate('/candidate')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Exam</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-900">Welcome, {user?.full_name}</span>
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

        {!submitted ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Exam Questions</h2>
              <div className="flex items-center space-x-2">
                <label htmlFor="page-size" className="text-sm text-gray-600">Questions per page:</label>
                <select
                  id="page-size"
                  value={pagination.page_size}
                  onChange={handlePageSizeChange}
                  className="border rounded px-2 py-1"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={`${pagination.page}-${index}`} className="border-b pb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Question {((pagination.page - 1) * pagination.page_size) + index + 1}
                  </h3>
                  <p className="text-gray-900 mb-4">{question.question}</p>
                  <div className="space-y-2">
                    {['a', 'b', 'c', 'd'].map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`question-${pagination.page}-${index}`}
                          value={option}
                          checked={answers[`${pagination.page}-${index}`] === option}
                          onChange={() => handleAnswerChange(index, option)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-900">{question[`option_${option}` as keyof Question]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-2">
                {pagination.page > 1 && (
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Previous
                  </button>
                )}
                {pagination.page < pagination.total_pages && (
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Next
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.total_pages}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== pagination.total}
                className={`w-full py-2 px-4 rounded ${
                  Object.keys(answers).length === pagination.total
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Exam
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Exam Results</h2>
            {result && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    Score: {result.score.toFixed(1)}%
                  </p>
                  <p className={`text-lg font-semibold ${
                    result.passed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.passed ? 'Passed' : 'Failed'}
                  </p>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => navigate('/candidate')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Exam; 