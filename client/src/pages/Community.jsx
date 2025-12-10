import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { Heart, MessageCircle, Share2, MoreHorizontal, Image, Smile, Send, Search, Filter } from "lucide-react"
import { apiRequest } from "../config/api"
import { useUser } from "../context/UserContext"

export default function Community() {
    const navigate = useNavigate()
    const { user } = useUser()
    const [posts, setPosts] = useState([])
    const [users, setUsers] = useState([])
    const [newPost, setNewPost] = useState("")
    const [image, setImage] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        role: "",
        location: "",
        minFees: "",
        maxFees: ""
    })
    const [activeTab, setActiveTab] = useState("posts") // "posts" or "users"
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchPosts()
    }, [])

    useEffect(() => {
        if (searchQuery || filters.role || filters.location) {
            handleSearch()
        }
    }, [searchQuery, filters, activeTab])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/posts`)
            setPosts(data)
        } catch (error) {
            console.error("Error fetching posts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        setLoading(true)
        try {
            if (activeTab === "posts") {
                const queryParams = new URLSearchParams({ search: searchQuery })
                const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/posts?${queryParams}`)
                setPosts(data)
            } else {
                const queryParams = new URLSearchParams({
                    query: searchQuery,
                    role: filters.role,
                    location: filters.location,
                    minFees: filters.minFees,
                    maxFees: filters.maxFees
                })
                const data = await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/users/search?${queryParams}`)
                setUsers(data)
            }
        } catch (error) {
            console.error("Error searching:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePost = async () => {
        if (!newPost.trim() && !image) return

        try {
            const formData = new FormData()
            formData.append('content', newPost)
            if (image) formData.append('image', image)

            // Extract hashtags
            const hashtags = newPost.match(/#[a-z0-9_]+/gi) || []
            if (hashtags.length > 0) formData.append('hashtags', JSON.stringify(hashtags))

            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                setNewPost("")
                setImage(null)
                fetchPosts()
            }
        } catch (error) {
            console.error("Error creating post:", error)
        }
    }

    const handleLike = async (postId) => {
        try {
            await apiRequest(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/posts/${postId}/like`, {
                method: 'PUT'
            })
            // Update local state efficiently
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const isLiked = post.likes.includes(user._id)
                    return {
                        ...post,
                        likes: isLiked
                            ? post.likes.filter(id => id !== user._id)
                            : [...post.likes, user._id]
                    }
                }
                return post
            }))
        } catch (error) {
            console.error("Error liking post:", error)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#f5f0e8]">
            <Sidebar />

            <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-28">
                <Header />

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">Community</h2>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-auto flex-1 max-w-lg">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'posts' ? "Search posts..." : "Search users, therapists..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                />
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${showFilters ? 'text-[#e74c3c]' : 'text-gray-400'}`}
                                >
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Filters Dropdown */}
                            {showFilters && (
                                <div className="absolute top-full mt-2 right-0 w-full md:w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-10">
                                    <h3 className="font-semibold mb-3">Filters</h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Search Type</label>
                                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                                <button
                                                    onClick={() => setActiveTab('posts')}
                                                    className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'posts' ? 'bg-white shadow-sm text-[#e74c3c]' : 'text-gray-600'}`}
                                                >
                                                    Posts
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('users')}
                                                    className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'users' ? 'bg-white shadow-sm text-[#e74c3c]' : 'text-gray-600'}`}
                                                >
                                                    People
                                                </button>
                                            </div>
                                        </div>

                                        {activeTab === 'users' && (
                                            <>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Role</label>
                                                    <select
                                                        value={filters.role}
                                                        onChange={(e) => setFilters({...filters, role: e.target.value})}
                                                        className="w-full p-2 bg-gray-50 rounded-lg text-sm"
                                                    >
                                                        <option value="">All</option>
                                                        <option value="therapist">Therapist</option>
                                                        <option value="user">User</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. New York"
                                                        value={filters.location}
                                                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                                                        className="w-full p-2 bg-gray-50 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 block mb-1">Min Fees</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={filters.minFees}
                                                            onChange={(e) => setFilters({...filters, minFees: e.target.value})}
                                                            className="w-full p-2 bg-gray-50 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 block mb-1">Max Fees</label>
                                                        <input
                                                            type="number"
                                                            placeholder="500"
                                                            value={filters.maxFees}
                                                            onChange={(e) => setFilters({...filters, maxFees: e.target.value})}
                                                            className="w-full p-2 bg-gray-50 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-8">
                            {/* Create Post */}
                            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#e74c3c] rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm sm:text-base">
                                            {user?.name?.[0] || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="Share your thoughts with the community..."
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#e74c3c] min-h-[100px]"
                                        />

                                        {image && (
                                            <div className="mt-2 relative inline-block">
                                                <img src={URL.createObjectURL(image)} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                                                <button onClick={() => setImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-xs">x</button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex gap-2">
                                                <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => setImage(e.target.files[0])}
                                                    />
                                                    <Image className="w-5 h-5 text-gray-500" />
                                                </label>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Smile className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={!newPost.trim() && !image}
                                                className="px-6 py-2 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Feed */}
                            {loading ? (
                                <div className="text-center py-10 text-gray-500">Loading...</div>
                            ) : activeTab === 'posts' ? (
                                <div className="space-y-4">
                                    {posts.map((post) => (
                                        <div key={post._id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold cursor-pointer" onClick={() => navigate(`/profile?id=${post.author._id}`)}>
                                                        {post.author?.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-semibold text-[#2d2d2d] hover:underline cursor-pointer" onClick={() => navigate(`/profile?id=${post.author._id}`)}>
                                                                {post.author?.name}
                                                            </h3>
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                                {post.author?.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm sm:text-base text-[#2d2d2d] mb-4 whitespace-pre-wrap leading-relaxed">
                                                {post.content}
                                            </p>

                                            {post.image && (
                                                <img src={post.image} alt="Post content" className="w-full rounded-xl mb-4 max-h-96 object-cover" />
                                            )}

                                            <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleLike(post._id)}
                                                    className="flex items-center gap-2 text-gray-500 hover:text-[#e74c3c] transition-colors group"
                                                >
                                                    <Heart className={`w-5 h-5 ${post.likes.includes(user?._id) ? 'fill-[#e74c3c] text-[#e74c3c]' : ''}`} />
                                                    <span className="text-sm font-medium">{post.likes.length}</span>
                                                </button>

                                                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span className="text-sm font-medium">{post.comments.length}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {users.map((u) => (
                                        <div key={u._id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#e74c3c] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {u.name[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-[#2d2d2d] cursor-pointer hover:underline" onClick={() => navigate(`/profile?id=${u._id}`)}>
                                                        {u.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{u.profession || u.role}</p>
                                                    {u.location && <p className="text-xs text-gray-400">{u.location}</p>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profile?id=${u._id}`)}
                                                className="px-4 py-2 border border-[#e74c3c] text-[#e74c3c] rounded-xl hover:bg-red-50 transition-colors"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="xl:col-span-4 hidden xl:block">
                            {/* Suggested or Other Content */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
