import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl p-12 shadow-sm text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-[#f5f0e8] rounded-full mb-6">
              <Search className="w-16 h-16 text-[#e74c3c]" />
            </div>
            <h1 className="text-8xl font-bold text-[#e74c3c] mb-4">404</h1>
            <h2 className="text-3xl font-bold text-[#2d2d2d] mb-4">Page Not Found</h2>
            <p className="text-gray-600 text-lg mb-8">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-[#2d2d2d] rounded-2xl hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e74c3c] text-white rounded-2xl hover:bg-[#c0392b] transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">Quick Links</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-gray-50 text-sm text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/messages")}
                className="px-4 py-2 bg-gray-50 text-sm text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Messages
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 bg-gray-50 text-sm text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => navigate("/game")}
                className="px-4 py-2 bg-gray-50 text-sm text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Games
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
