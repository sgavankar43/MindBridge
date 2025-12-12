import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { useUser } from "../context/UserContext"
import { apiRequest } from "../config/api"
import {
  Mail, Phone, Linkedin, Github, Globe,
  Camera, Edit2, MapPin, Briefcase,
  Award, Target, CheckCircle, Shield, Settings,
  UserPlus, UserMinus
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

  const isOwnProfile = !searchParams.get("id") || searchParams.get("id") === currentUser?._id

  useEffect(() => {
    fetchProfile()
  }, [profileId])

  const fetchProfile = async () => {
    try {
      const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/users/${profileId}/profile`)
      setProfileData(data.user)
      setPosts(data.posts)
      setComments(data.comments)

      if (currentUser && data.user.followers) {
        setIsFollowing(data.user.followers.includes(currentUser._id))
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/users/${profileId}/follow`, {
        method: 'PUT'
      })
      setIsFollowing(data.isFollowing)
      // Update local follower count
      setProfileData(prev => ({
        ...prev,
        followers: data.isFollowing
          ? [...prev.followers, currentUser._id]
          : prev.followers.filter(id => id !== currentUser._id)
      }))
    } catch (error) {
      console.error("Error toggling follow:", error)
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
                  <div className="text-center">
                    <span className="block font-bold text-lg">{profileData.followers?.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg">{profileData.following?.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
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
                      className={`px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                        isFollowing
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
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'posts' ? 'border-[#e74c3c] text-[#e74c3c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'comments' ? 'border-[#e74c3c] text-[#e74c3c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'about' ? 'border-[#e74c3c] text-[#e74c3c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    About
                  </button>
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
    </div>
  )
}
