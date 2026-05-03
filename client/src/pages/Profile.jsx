import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { useUser } from "../context/UserContext"
import API_BASE_URL, { apiRequest } from "../config/api"
import {
  Mail, Phone, Linkedin, Github, Globe,
  Camera, Edit2, MapPin, Briefcase,
  Award, Target, CheckCircle, Shield, Settings,
  UserPlus, UserMinus, FileText, AlertCircle
} from "lucide-react"

export default function Profile() {
  const navigate = useNavigate()
  const { user: currentUser } = useUser()
  const [searchParams] = useSearchParams()
  const profileId = searchParams.get("id") || currentUser?._id

  const [profileData, setProfileData] = useState(null)
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [activeTab, setActiveTab] = useState("posts")
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [remarkText, setRemarkText] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [submittingRemark, setSubmittingRemark] = useState(false)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [modalUsersList, setModalUsersList] = useState([])
  const [modalTitle, setModalTitle] = useState("")

  const openUsersModal = (title, usersList) => {
    setModalTitle(title)
    setModalUsersList(usersList || [])
    setShowUsersModal(true)
  }

  const isOwnProfile = !searchParams.get("id") || searchParams.get("id") === currentUser?._id

  useEffect(() => {
    fetchProfile()
  }, [profileId])

  const fetchProfile = async () => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/api/users/${profileId}/profile`)
      setProfileData(data.user)
      setPosts(data.posts)
      setComments(data.comments)

      if (currentUser && data.user.followers) {
        setIsFollowing(data.user.followers.some(f => (f._id || f) === currentUser._id))
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/api/users/${profileId}/follow`, {
        method: 'PUT'
      })
      setIsFollowing(data.isFollowing)
      // Update local follower count
      setProfileData(prev => ({
        ...prev,
        followers: data.isFollowing
          ? [...prev.followers, { _id: currentUser._id, name: currentUser.name, role: currentUser.role, profession: currentUser.profession }]
          : prev.followers.filter(f => (f._id || f) !== currentUser._id)
      }))
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  const handleAddRemark = async (e) => {
    e.preventDefault()
    if (!remarkText.trim()) return

    try {
      setSubmittingRemark(true)
      const data = await apiRequest(`${API_BASE_URL}/api/users/${profileId}/remarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ remark: remarkText, isEmergency })
      })

      setProfileData(prev => ({
        ...prev,
        medicalRemarks: [...(prev.medicalRemarks || []), data.remark]
      }))

      setShowRemarkModal(false)
      setRemarkText("")
      setIsEmergency(false)
    } catch (error) {
      console.error("Error adding remark:", error)
    } finally {
      setSubmittingRemark(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-[#f5f0e8]">Loading...</div>
  }

  if (!profileData) {
    return <div className="flex justify-center items-center h-screen bg-[#f5f0e8]">User not found</div>
  }

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />

      <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-28">
        <Header />

        <div className="mt-4 sm:mt-8 max-w-6xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 bg-[#e74c3c] rounded-full flex items-center justify-center text-4xl text-white font-bold">
                  {profileData.name?.[0]}
                </div>
                {isOwnProfile && (
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-[#2d2d2d] mb-1">{profileData.name}</h1>
                <p className="text-gray-500 mb-2">{profileData.profession || profileData.role}</p>
                {profileData.location && (
                  <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                )}

                <div className="flex justify-center md:justify-start gap-8 mb-6">
                  <div 
                    className="text-center cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => openUsersModal("Followers", profileData.followers)}
                  >
                    <span className="block font-bold text-lg">{profileData.followers?.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide hover:underline">Followers</span>
                  </div>
                  <div 
                    className="text-center cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => openUsersModal("Following", profileData.following)}
                  >
                    <span className="block font-bold text-lg">{profileData.following?.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide hover:underline">Following</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">{posts.length}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Posts</span>
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${isFollowing
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : 'bg-[#e74c3c] text-white hover:bg-[#c0392b]'
                        }`}
                    >
                      {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button
                      onClick={() => navigate('/direct-messages', { state: { selectedUser: profileData } })}
                      className="px-6 py-2 border border-[#e74c3c] text-[#e74c3c] rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Message
                    </button>
                    {currentUser?.role === 'therapist' && (
                      <button
                        onClick={() => setShowRemarkModal(true)}
                        className="px-6 py-2 border border-[#e74c3c] text-[#e74c3c] rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Remark
                      </button>
                    )}
                  </div>
                )}

                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-6 py-2 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {profileData.bio && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-600 text-center md:text-left">{profileData.bio}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content (Posts/Comments) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'posts' ? 'border-[#e74c3c] text-[#e74c3c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comments' ? 'border-[#e74c3c] text-[#e74c3c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'about' ? 'border-[#e74c3c] text-[#e74c3c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    About
                  </button>
                  {(isOwnProfile || currentUser?.role === 'therapist') && (
                    <button
                      onClick={() => setActiveTab('remarks')}
                      className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'remarks' ? 'border-[#e74c3c] text-[#e74c3c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Medical Remarks
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {activeTab === 'posts' && (
                    <div className="space-y-6">
                      {posts.length === 0 ? (
                        <p className="text-center text-gray-500">No posts yet.</p>
                      ) : (
                        posts.map(post => (
                          <div key={post._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <p className="text-gray-800 mb-2">{post.content}</p>
                            {post.image && (
                              <img src={post.image} alt="Post" className="rounded-xl mt-2 max-h-60 object-cover" />
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>{post.likes.length} Likes</span>
                              <span>{post.comments.length} Comments</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className="space-y-6">
                      {comments.length === 0 ? (
                        <p className="text-center text-gray-500">No comments yet.</p>
                      ) : (
                        comments.map(comment => (
                          <div key={comment._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <p className="text-gray-800 mb-2">"{comment.content}"</p>
                            <p className="text-xs text-gray-400">
                              on post by {comment.post?.author?.name || 'Unknown'} • {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'remarks' && (
                    <div className="space-y-6">
                      {(!profileData.medicalRemarks || profileData.medicalRemarks.length === 0) ? (
                        <p className="text-center text-gray-500">No medical remarks yet.</p>
                      ) : (
                        profileData.medicalRemarks.map((remark, idx) => (
                          <div key={idx} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#e74c3c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {remark.therapistId?.name?.[0] || 'T'}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{remark.therapistId?.name || 'Unknown Therapist'}</p>
                                  <p className="text-xs text-gray-500">{new Date(remark.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              {remark.isEmergency && (
                                <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                  <AlertCircle className="w-3 h-3" /> Emergency
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 text-sm mt-3">{remark.remark}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 block">Role</span>
                            <span className="capitalize">{profileData.role}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Joined</span>
                            <span>{new Date(profileData.createdAt).toLocaleDateString()}</span>
                          </div>
                          {profileData.languages && profileData.languages.length > 0 && (
                            <div>
                              <span className="text-gray-500 block">Languages</span>
                              <span>{profileData.languages.join(', ')}</span>
                            </div>
                          )}
                          {profileData.consultationFees && (
                            <div>
                              <span className="text-gray-500 block">Fees</span>
                              <span>${profileData.consultationFees}/hr</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Verification Badge */}
              {profileData.role === 'therapist' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">Verification Status</h3>
                  {profileData.verificationStatus === 'approved' ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Verified Therapist</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-xl">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium capitalize">{profileData.verificationStatus || 'Pending'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{profileData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Add Medical Remark</h3>
              <button onClick={() => setShowRemarkModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <form onSubmit={handleAddRemark} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark Description
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e74c3c]/20 focus:border-[#e74c3c] transition-all resize-none"
                  placeholder="Enter medical remarks or observations..."
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isEmergency"
                  className="w-5 h-5 text-[#e74c3c] rounded border-gray-300 focus:ring-[#e74c3c]"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                />
                <label htmlFor="isEmergency" className="text-sm font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Mark as Emergency Case
                </label>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRemarkModal(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRemark}
                  className="px-6 py-2.5 rounded-xl font-medium bg-[#e74c3c] text-white hover:bg-[#c0392b] transition-colors disabled:opacity-50"
                >
                  {submittingRemark ? 'Saving...' : 'Save Remark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Modal (Followers/Following) */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{modalTitle}</h3>
              <button onClick={() => setShowUsersModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {modalUsersList.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No {modalTitle.toLowerCase()} yet.</p>
              ) : (
                <div className="space-y-1">
                  {modalUsersList.map((u, idx) => (
                    <div 
                      key={u._id || idx} 
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                      onClick={() => {
                        setShowUsersModal(false)
                        navigate(`/profile?id=${u._id}`)
                      }}
                    >
                      <div className="w-10 h-10 bg-[#e74c3c] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                        {u.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[#2d2d2d] truncate">{u.name || 'Unknown User'}</h4>
                        <p className="text-xs text-gray-500 truncate capitalize">{u.profession || u.role || 'user'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
