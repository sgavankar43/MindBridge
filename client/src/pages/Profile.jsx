import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import {
  Mail, Phone, Linkedin, Github, Globe,
  Camera, Edit2, MapPin, Briefcase,
  Award, Target, CheckCircle, Shield
} from "lucide-react"

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState({
    personal: false,
    business: false
  })

  const tabs = [
    { id: "personal", label: "Personal & Business" },
    { id: "verification", label: "Verification & KYC" },
    { id: "skills", label: "Skills & Focus" }
  ]

  const toggleEdit = (section) => {
    setIsEditing(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />

      <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-28">
        <Header />

        <div className="mt-4 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2d2d2d] mb-4 sm:mb-6">Profile Settings</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Panel - Profile Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 bg-[#e74c3c] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-4xl">JD</span>
                    </div>
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors border-2 border-[#f5f0e8]">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-[#2d2d2d] mb-1">John Doe</h3>
                  <p className="text-sm text-gray-500 mb-4">Senior Product Designer</p>

                  <div className="w-full h-px bg-gray-100 my-4" />

                  {/* Contact Info */}
                  <div className="w-full space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm text-[#2d2d2d] truncate">john.doe@example.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm text-[#2d2d2d]">+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100 my-4" />

                  {/* Social Links */}
                  <div className="w-full">
                    <h4 className="text-xs font-medium text-gray-400 mb-3">SOCIAL LINKS</h4>
                    <div className="space-y-2">
                      <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-[#0077b5] rounded-lg flex items-center justify-center">
                          <Linkedin className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-[#2d2d2d]">LinkedIn</span>
                      </a>

                      <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-[#333] rounded-lg flex items-center justify-center">
                          <Github className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-[#2d2d2d]">GitHub</span>
                      </a>

                      <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-[#3498db] rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-[#2d2d2d]">Website</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Profile Details */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
                {/* Tab Navigation */}
                <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-8 p-1 bg-gray-50 rounded-xl sm:rounded-2xl overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                          ? 'bg-[#e74c3c] text-white shadow-sm'
                          : 'text-gray-600 hover:text-[#2d2d2d]'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Personal & Business Tab */}
                  {activeTab === "personal" && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Personal Information */}
                      <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-lg font-semibold text-[#2d2d2d]">Personal Information</h3>
                          <button
                            onClick={() => toggleEdit('personal')}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors self-start sm:self-auto"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              {isEditing.personal ? 'Save' : 'Edit'}
                            </span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Full Name</label>
                            {isEditing.personal ? (
                              <input
                                type="text"
                                defaultValue="John Doe"
                                className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                              />
                            ) : (
                              <p className="text-sm text-[#2d2d2d] font-medium">John Doe</p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Email Address</label>
                            {isEditing.personal ? (
                              <input
                                type="email"
                                defaultValue="john.doe@example.com"
                                className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                              />
                            ) : (
                              <p className="text-sm text-[#2d2d2d] font-medium">john.doe@example.com</p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Phone Number</label>
                            {isEditing.personal ? (
                              <input
                                type="tel"
                                defaultValue="+1 (555) 123-4567"
                                className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                              />
                            ) : (
                              <p className="text-sm text-[#2d2d2d] font-medium">+1 (555) 123-4567</p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Location</label>
                            {isEditing.personal ? (
                              <input
                                type="text"
                                defaultValue="San Francisco, CA"
                                className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <p className="text-sm text-[#2d2d2d] font-medium">San Francisco, CA</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Business Information */}
                      <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-lg font-semibold text-[#2d2d2d]">Business Information</h3>
                          <button
                            onClick={() => toggleEdit('business')}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors self-start sm:self-auto"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              {isEditing.business ? 'Save' : 'Edit'}
                            </span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Company Name</label>
                            {isEditing.business ? (
                              <input
                                type="text"
                                defaultValue="TechCorp Inc."
                                className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <p className="text-sm text-[#2d2d2d] font-medium">TechCorp Inc.</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-2 block">Industry</label>
                            {isEditing.business ? (
                              <input
                                type="text"
                                defaultValue="Technology & Software"
                                className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                              />
                            ) : (
                              <p className="text-sm text-[#2d2d2d] font-medium">Technology & Software</p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-xs text-gray-400 mb-2 block">Experience</label>
                            {isEditing.business ? (
                              <input
                                type="text"
                                defaultValue="8+ years in Product Design"
                                className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                              />
                            ) : (
                              <p className="text-sm text-[#2d2d2d] font-medium">8+ years in Product Design</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 mb-2 block">About Company</label>
                          {isEditing.business ? (
                            <textarea
                              defaultValue="Leading technology company focused on innovative solutions for modern businesses. Specializing in SaaS products and digital transformation."
                              rows={3}
                              className="w-full px-4 py-2 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c] resize-none"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Leading technology company focused on innovative solutions for modern businesses.
                              Specializing in SaaS products and digital transformation.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification & KYC Tab */}
                  {activeTab === "verification" && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#2d2d2d] mb-6">Verification Status</h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#2d2d2d]">Email Verified</p>
                                <p className="text-xs text-gray-400">Verified on Jan 15, 2024</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Verified
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#2d2d2d]">Phone Verified</p>
                                <p className="text-xs text-gray-400">Verified on Jan 15, 2024</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Verified
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#2d2d2d]">Identity Verification</p>
                                <p className="text-xs text-gray-400">Government ID required</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-[#e74c3c] text-white text-xs font-medium rounded-xl hover:bg-[#c0392b] transition-colors">
                              Start Verification
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#2d2d2d] mb-4">KYC Documents</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Upload your documents to complete the KYC verification process.
                        </p>

                        <div className="space-y-3">
                          <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#e74c3c] transition-colors">
                            <p className="text-sm text-gray-600">Click to upload Government ID</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                          </button>

                          <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#e74c3c] transition-colors">
                            <p className="text-sm text-gray-600">Click to upload Proof of Address</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills & Focus Tab */}
                  {activeTab === "skills" && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-[#2d2d2d]">Professional Skills</h3>
                          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                            <Edit2 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">Edit</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {['UI/UX Design', 'Product Strategy', 'Figma', 'Adobe XD', 'Prototyping',
                            'User Research', 'Wireframing', 'Design Systems'].map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-4 py-2 bg-white text-sm text-[#2d2d2d] rounded-xl"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-[#2d2d2d]">Focus Areas</h3>
                          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                            <Edit2 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">Edit</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                            <div className="w-10 h-10 bg-[#e74c3c] rounded-xl flex items-center justify-center flex-shrink-0">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-[#2d2d2d] mb-1">Product Design</h4>
                              <p className="text-xs text-gray-600">
                                Creating intuitive and beautiful user experiences for web and mobile applications
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                            <div className="w-10 h-10 bg-[#3498db] rounded-xl flex items-center justify-center flex-shrink-0">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-[#2d2d2d] mb-1">Design Leadership</h4>
                              <p className="text-xs text-gray-600">
                                Leading design teams and establishing design systems for scalable products
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#2d2d2d] mb-4">Certifications</h3>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                            <div>
                              <p className="text-sm font-medium text-[#2d2d2d]">Google UX Design Certificate</p>
                              <p className="text-xs text-gray-400">Issued: March 2023</p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                            <div>
                              <p className="text-sm font-medium text-[#2d2d2d]">Certified Scrum Product Owner</p>
                              <p className="text-xs text-gray-400">Issued: January 2023</p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
