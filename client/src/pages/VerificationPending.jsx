import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle, ShieldAlert, Upload } from "lucide-react"
import API_BASE_URL from "../config/api"
import { useUser } from "../context/UserContext"

export default function VerificationPending() {
  const { user, updateUser } = useUser()
  const [formData, setFormData] = useState({
    profession: user?.profession || "",
    location: user?.location || "",
    consultationFees: user?.consultationFees || "",
    licenseNumber: user?.licenseNumber || "",
    languages: Array.isArray(user?.languages) ? user.languages.join(", ") : "",
    bio: user?.bio || ""
  })
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const isRejected = user?.verificationStatus === "rejected"
  const reason = user?.verificationRejectionReason

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (documents.length === 0) {
      setError("Please upload updated verification documents")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "languages") {
          const languages = value.split(",").map(item => item.trim()).filter(Boolean)
          data.append(key, JSON.stringify(languages))
        } else {
          data.append(key, value)
        }
      })
      documents.forEach(file => data.append("documents", file))

      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/users/therapist-verification/resubmit`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: data
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Unable to resubmit verification")
      }

      updateUser(result.user)
      setDocuments([])
      setSuccess("Verification resubmitted. Your profile is back in review.")
    } catch (err) {
      setError(err.message || "Unable to resubmit verification")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isRejected ? "bg-red-100" : "bg-yellow-100"}`}>
            <ShieldAlert className={`w-10 h-10 ${isRejected ? "text-red-600" : "text-yellow-600"}`} />
          </div>

          <h1 className="text-2xl font-bold text-[#2d2d2d] mb-4">
            {isRejected ? "Verification Needs Updates" : "Verification Pending"}
          </h1>

          <p className="text-gray-600 leading-relaxed">
            {isRejected
              ? "Your therapist verification was reviewed and needs updated information before approval."
              : "Thank you for registering as a therapist. Your account is currently under review by our administrative team."}
          </p>
        </div>

        {reason && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <strong>Admin note:</strong> {reason}
          </div>
        )}

        {!isRejected && (
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Note:</strong> You cannot access platform features until your verification is complete.
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 mt-0.5" />
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isRejected && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                <input
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fees</label>
                <input
                  type="number"
                  name="consultationFees"
                  value={formData.consultationFees}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <input
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="English, Hindi"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Updated documents</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#e74c3c] transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={(event) => setDocuments(Array.from(event.target.files))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload corrected certificates or license files</p>
                {documents.length > 0 && (
                  <p className="text-xs text-[#e74c3c] mt-2">{documents.length} file(s) selected</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#e74c3c] px-4 py-3 font-semibold text-white hover:bg-[#c0392b] disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Resubmit Verification"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
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
