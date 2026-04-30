import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Briefcase, CheckCircle, DollarSign, Globe, MapPin, Upload } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import API_BASE_URL from "../config/api"
import { useUser } from "../context/UserContext"

export default function ApplyTherapist() {
  const navigate = useNavigate()
  const { user, updateUser } = useUser()
  const [formData, setFormData] = useState({
    profession: user?.profession || "",
    location: user?.location || "",
    consultationFees: user?.consultationFees || "",
    languages: Array.isArray(user?.languages) ? user.languages.join(", ") : "",
    licenseNumber: user?.licenseNumber || "",
    bio: user?.bio || ""
  })
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.profession.trim() || !formData.location.trim() || !formData.consultationFees) {
      setError("Profession, location, and consultation fees are required")
      return
    }

    if (documents.length === 0) {
      setError("Please upload license or certificate documents")
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
      const response = await fetch(`${API_BASE_URL}/api/users/therapist-application`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: data
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit application")
      }

      updateUser(result.user)
      setSuccess("Application submitted. Your therapist profile is pending admin review.")
      window.setTimeout(() => navigate("/verification-pending"), 700)
    } catch (err) {
      setError(err.message || "Unable to submit application")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />
      <div className="flex-1 lg:ml-16 p-4 lg:p-8 pt-28">
        <Header />

        <main className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#e74c3c]">
              <Briefcase className="w-4 h-4" />
              Therapist Application
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[#2d2d2d]">Apply to Work as a Therapist</h1>
            <p className="mt-2 text-sm text-gray-600">
              Submit your professional details and verification documents for admin review.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            {success && (
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle className="w-4 h-4 mt-0.5" />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                <input
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Clinical Psychologist"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation fees</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="consultationFees"
                    value={formData.consultationFees}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License number</label>
                <input
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="English, Hindi"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Briefly describe your background and areas of care."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification documents</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-[#e74c3c] transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={(event) => setDocuments(Array.from(event.target.files))}
                  className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload license, certificates, or identity proof</p>
                {documents.length > 0 && (
                  <p className="mt-2 text-xs text-[#e74c3c]">{documents.length} file(s) selected</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#e74c3c] px-4 py-3 font-semibold text-white hover:bg-[#c0392b] disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
