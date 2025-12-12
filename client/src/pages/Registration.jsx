import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle, Check, MapPin, DollarSign, Globe, Upload } from "lucide-react"
import { API_ENDPOINTS, apiRequest } from "../config/api"
import { useUser } from "../context/UserContext"

export default function Registration() {
  const navigate = useNavigate()
  const { login } = useUser()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    profession: "",
    bio: "",
    location: "",
    consultationFees: "",
    languages: "",
    agreeToTerms: false
  })
  const [verificationDocs, setVerificationDocs] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    if (error) setError("")
  }

  const handleFileChange = (e) => {
    setVerificationDocs(Array.from(e.target.files))
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.role === 'therapist') {
      if (!formData.profession.trim()) {
        setError("Profession is required for therapists")
        return false
      }
      if (!formData.location.trim()) {
        setError("Location is required")
        return false
      }
      if (!formData.consultationFees) {
        setError("Consultation fee is required")
        return false
      }
      if (verificationDocs.length === 0) {
        setError("Please upload verification documents")
        return false
      }
    }
    return true
  }

  const validateStep3 = () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return false
    }
    return true
  }

  const handleNext = () => {
    setError("")
    if (step === 1 && validateStep1()) {
      if (formData.role === 'therapist') {
        setStep(2)
      } else {
        setStep(3)
      }
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(formData.role === 'therapist' ? 2 : 1)
    } else {
      setStep(step - 1)
    }
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep3()) return

    setIsLoading(true)
    setError("")

    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'languages') {
          // Convert comma-separated string to array
          const langs = formData.languages.split(',').map(l => l.trim()).filter(Boolean)
          data.append(key, JSON.stringify(langs))
        } else {
          data.append(key, formData[key])
        }
      })

      verificationDocs.forEach(file => {
        data.append('documents', file)
      })

      // We need to use fetch directly here because apiRequest handles JSON
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: data
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed')
      }

      const userData = responseData.user || {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }

      if (!responseData.token) {
        console.error('Registration failed: Missing authentication token in server response')
        throw new Error('Registration successful but authentication failed. Please try logging in.')
      }

      login(userData, responseData.token)

      if (formData.role === 'therapist') {
        navigate('/verification-pending')
      } else {
        setSuccess("Registration successful! Welcome to MindBridge!")
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      }
    } catch (error) {
      setError(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0e6d6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e74c3c] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">MB</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2d2d2d] mb-2">Join MindBridge</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((s) => (
              (formData.role === 'therapist' || s !== 2) && (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-[#e74c3c] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    {step > s ? <Check className="w-4 h-4" /> : (formData.role !== 'therapist' && s === 3 ? '2' : s)}
                  </div>
                  {s < (formData.role === 'therapist' ? 3 : 3) && (s !== 2 || formData.role === 'therapist') && (
                    <div className={`w-8 h-1 mx-2 ${step > s ? 'bg-[#e74c3c]' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'user' })}
                      className={`p-4 border-2 rounded-xl text-left transition-colors ${formData.role === 'user' ? 'border-[#e74c3c] bg-red-50' : 'border-gray-200'}`}
                    >
                      <div className="font-medium text-[#2d2d2d]">User</div>
                      <div className="text-sm text-gray-500">Seeking support</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'therapist' })}
                      className={`p-4 border-2 rounded-xl text-left transition-colors ${formData.role === 'therapist' ? 'border-[#e74c3c] bg-red-50' : 'border-gray-200'}`}
                    >
                      <div className="font-medium text-[#2d2d2d]">Therapist</div>
                      <div className="text-sm text-gray-500">Providing support</div>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 px-4 bg-[#e74c3c] text-white font-medium rounded-xl hover:bg-[#c0392b] transition-colors"
                >
                  Continue
                </button>
              </>
            )}

            {step === 2 && formData.role === 'therapist' && (
              <>
                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="e.g., Clinical Psychologist"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="consultationFees" className="block text-sm font-medium text-gray-700 mb-2">Fees ($/hr)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="consultationFees"
                        type="number"
                        name="consultationFees"
                        value={formData.consultationFees}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                        placeholder="Eng, Esp"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License/Certificates</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#e74c3c] transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload files</p>
                    {verificationDocs.length > 0 && (
                      <p className="text-xs text-[#e74c3c] mt-2">{verificationDocs.length} file(s) selected</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 bg-[#e74c3c] text-white rounded-xl hover:bg-[#c0392b]"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="Strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#e74c3c] border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                    I agree to the <Link to="/terms" className="text-[#e74c3c]">Terms</Link> and <Link to="/privacy" className="text-[#e74c3c]">Privacy Policy</Link>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-[#e74c3c] text-white rounded-xl hover:bg-[#c0392b] disabled:opacity-50"
                  >
                    {isLoading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-[#e74c3c] font-medium">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
