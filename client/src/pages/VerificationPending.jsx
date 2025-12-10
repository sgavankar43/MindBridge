import { Link } from "react-router-dom"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-lg text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-yellow-600" />
        </div>

        <h1 className="text-2xl font-bold text-[#2d2d2d] mb-4">Verification Pending</h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you for registering as a Therapist on MindBridge.
          Your account is currently under review by our administrative team.
          We will review your submitted documents and notify you via email once your account is approved.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
            <strong>Note:</strong> You cannot access the platform features until your verification is complete.
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#e74c3c] font-medium hover:text-[#c0392b] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
