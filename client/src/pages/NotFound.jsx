import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="mt-4 text-3xl font-medium text-gray-700">Page Not Found</h2>
        <p className="mt-3 text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 bg-[#e74c3c] text-white rounded-lg font-medium hover:bg-[#c0392b] transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
