import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Heart, MessageCircle, Share2, MoreHorizontal, Image, Smile, Send } from "lucide-react"

export default function Community() {
    const navigate = useNavigate()

    const [posts, setPosts] = useState([
        {
            id: 1,
            author: {
                name: "Dr. Sarah Mitchell",
                username: "@drsarah",
                avatar: "SM",
                role: "Therapist",
                color: "bg-purple-500"
            },
            content: "Remember: It's okay to not be okay. Seeking help is a sign of strength, not weakness. Your mental health matters. 💙",
            timestamp: "2h ago",
            likes: 124,
            comments: 18,
            shares: 12,
            liked: false,
            image: null
        },
        {
            id: 2,
            author: {
                name: "Alex Thompson",
                username: "@alextherapy",
                avatar: "AT",
                role: "Community Member",
                color: "bg-blue-500"
            },
            content: "Just finished my first therapy session through MindBridge. Feeling hopeful for the first time in months. Thank you to this amazing community! 🌟",
            timestamp: "4h ago",
            likes: 89,
            comments: 24,
            shares: 5,
            liked: true,
            image: null
        },
        {
            id: 3,
            author: {
                name: "Emma Wilson",
                username: "@emmawellness",
                avatar: "EW",
                role: "Wellness Coach",
                color: "bg-green-500"
            },
            content: "5 simple mindfulness exercises you can do in 5 minutes:\n\n1. Deep breathing\n2. Body scan meditation\n3. Gratitude journaling\n4. Mindful walking\n5. Progressive muscle relaxation\n\nWhich one will you try today?",
            timestamp: "6h ago",
            likes: 256,
            comments: 45,
            shares: 78,
            liked: false,
            image: null
        }
    ])

    const [newPost, setNewPost] = useState("")
    const [activeCommentId, setActiveCommentId] = useState(null)
    const [commentText, setCommentText] = useState("")

    // DM contacts
    const dmContacts = [
        {
            id: 1,
            name: "Dr. Sarah Mitchell",
            avatar: "SM",
            lastMessage: "How are you feeling today?",
            time: "5m ago",
            unread: 2,
            online: true,
            color: "bg-purple-500"
        },
        {
            id: 2,
            name: "Alex Thompson",
            avatar: "AT",
            lastMessage: "Thanks for the support!",
            time: "1h ago",
            unread: 0,
            online: true,
            color: "bg-blue-500"
        },
        {
            id: 3,
            name: "Emma Wilson",
            avatar: "EW",
            lastMessage: "See you in the next session",
            time: "3h ago",
            unread: 1,
            online: false,
            color: "bg-green-500"
        }
    ]

    const handleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    liked: !post.liked,
                    likes: post.liked ? post.likes - 1 : post.likes + 1
                }
            }
            return post
        }))
    }

    const handlePost = () => {
        if (newPost.trim()) {
            const post = {
                id: posts.length + 1,
                author: {
                    name: "You",
                    username: "@you",
                    avatar: "U",
                    role: "Community Member",
                    color: "bg-[#e74c3c]"
                },
                content: newPost,
                timestamp: "Just now",
                likes: 0,
                comments: 0,
                shares: 0,
                liked: false,
                image: null
            }
            setPosts([post, ...posts])
            setNewPost("")
        }
    }

    const handleComment = (postId) => {
        if (commentText.trim()) {
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments + 1
                    }
                }
                return post
            }))
            setCommentText("")
            setActiveCommentId(null)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#f5f0e8]">
            <Sidebar />

            <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-28">
                <Header />

                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d] mb-6">Community</h2>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Main Content - Posts */}
                        <div className="xl:col-span-8">
                            {/* Create Post */}
                            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#e74c3c] rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm sm:text-base">U</span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="Share your thoughts with the community..."
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#e74c3c] min-h-[100px]"
                                        />
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Image className="w-5 h-5 text-gray-500" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Smile className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={handlePost}
                                                disabled={!newPost.trim()}
                                                className="px-6 py-2 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Posts Feed */}
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                                        {/* Post Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${post.author.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                    <span className="text-white font-bold text-sm sm:text-base">{post.author.avatar}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-[#2d2d2d] text-sm sm:text-base">{post.author.name}</h3>
                                                        <span className="text-gray-400 text-xs sm:text-sm">{post.author.username}</span>
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                            {post.author.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-400">{post.timestamp}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Post Content */}
                                        <p className="text-sm sm:text-base text-[#2d2d2d] mb-4 whitespace-pre-wrap leading-relaxed">
                                            {post.content}
                                        </p>

                                        {/* Post Actions */}
                                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className="flex items-center gap-2 text-gray-500 hover:text-[#e74c3c] transition-colors group"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${post.liked ? 'fill-[#e74c3c] text-[#e74c3c]' : 'group-hover:scale-110'} transition-transform`}
                                                />
                                                <span className="text-sm font-medium">{post.likes}</span>
                                            </button>

                                            <button
                                                onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                                                className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group"
                                            >
                                                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-medium">{post.comments}</span>
                                            </button>

                                            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
                                                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-medium">{post.shares}</span>
                                            </button>
                                        </div>

                                        {/* Comment Section */}
                                        {activeCommentId === post.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 bg-[#e74c3c] rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-xs">U</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={commentText}
                                                            onChange={(e) => setCommentText(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                            placeholder="Write a comment..."
                                                            className="w-full px-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                                        />
                                                        <button
                                                            onClick={() => handleComment(post.id)}
                                                            disabled={!commentText.trim()}
                                                            className="mt-2 px-4 py-1.5 bg-[#e74c3c] text-white rounded-lg text-sm font-medium hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="mt-6 text-center">
                                <button className="px-6 py-3 bg-white text-[#2d2d2d] rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                                    Load More Posts
                                </button>
                            </div>
                        </div>

                        {/* Right Sidebar - DM Section */}
                        <div className="xl:col-span-4 hidden xl:block">
                            <div className="sticky top-28">
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-[#2d2d2d]">Direct Messages</h3>
                                        <button
                                            onClick={() => navigate('/direct-messages')}
                                            className="text-sm text-[#e74c3c] font-medium hover:text-[#c0392b] transition-colors"
                                        >
                                            View All
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {dmContacts.map((contact) => (
                                            <button
                                                key={contact.id}
                                                onClick={() => navigate('/direct-messages')}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                            >
                                                <div className="relative">
                                                    <div className={`w-12 h-12 ${contact.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                        <span className="text-white font-bold text-sm">{contact.avatar}</span>
                                                    </div>
                                                    {contact.online && (
                                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-[#2d2d2d] text-sm truncate">
                                                            {contact.name}
                                                        </h4>
                                                        {contact.unread > 0 && (
                                                            <span className="w-5 h-5 bg-[#e74c3c] text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                                                {contact.unread}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {contact.lastMessage}
                                                        </p>
                                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                            {contact.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>


                                </div>

                                {/* Suggested Connections */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
                                    <h3 className="text-lg font-semibold text-[#2d2d2d] mb-4">Suggested Connections</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">JD</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-[#2d2d2d] text-sm">Dr. John Davis</h4>
                                                <p className="text-xs text-gray-500">Psychiatrist</p>
                                            </div>
                                            <button className="px-3 py-1 bg-[#e74c3c] text-white rounded-lg text-xs font-medium hover:bg-[#c0392b] transition-colors">
                                                Follow
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">LM</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-[#2d2d2d] text-sm">Lisa Martinez</h4>
                                                <p className="text-xs text-gray-500">Life Coach</p>
                                            </div>
                                            <button className="px-3 py-1 bg-[#e74c3c] text-white rounded-lg text-xs font-medium hover:bg-[#c0392b] transition-colors">
                                                Follow
                                            </button>
                                        </div>
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
