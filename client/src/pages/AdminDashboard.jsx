import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    AlertCircle,
    CheckCircle,
    Clock,
    CreditCard,
    EyeOff,
    FileText,
    RefreshCw,
    RotateCcw,
    Search,
    Shield,
    Trash2,
    Users,
    Wallet,
    XCircle
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { useUser } from "../context/UserContext"
import API_BASE_URL, { apiRequest } from "../config/api"

const ADMIN_API = `${API_BASE_URL}/api/admin`

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "verifications", label: "Verifications" },
    { id: "users", label: "Users" },
    { id: "transactions", label: "Transactions" },
    { id: "moderation", label: "Moderation" },
    { id: "audit", label: "Audit Log" }
]

const formatDate = (value) => {
    if (!value) return "Unknown"
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}

const statusClass = (status) => {
    if (status === "approved" || status === "SUCCESS") return "bg-green-50 text-green-700 border-green-200"
    if (status === "active") return "bg-green-50 text-green-700 border-green-200"
    if (status === "hidden") return "bg-amber-50 text-amber-700 border-amber-200"
    if (status === "deleted") return "bg-gray-100 text-gray-600 border-gray-200"
    if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200"
    if (status === "rejected" || status === "FAILED") return "bg-red-50 text-red-700 border-red-200"
    return "bg-gray-50 text-gray-600 border-gray-200"
}

function StatCard({ icon: Icon, label, value, detail }) {
    return (
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-[#2d2d2d]">{value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#e74c3c]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#e74c3c]" />
                </div>
            </div>
            {detail && <p className="mt-3 text-xs text-gray-500">{detail}</p>}
        </div>
    )
}

function EmptyState({ title, detail }) {
    return (
        <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center">
            <p className="font-semibold text-[#2d2d2d]">{title}</p>
            {detail && <p className="mt-1 text-sm text-gray-500">{detail}</p>}
        </div>
    )
}

export default function AdminDashboard() {
    const { user, loading: userLoading } = useUser()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("overview")
    const [stats, setStats] = useState(null)
    const [activity, setActivity] = useState(null)
    const [therapists, setTherapists] = useState([])
    const [users, setUsers] = useState([])
    const [transactions, setTransactions] = useState([])
    const [moderationPosts, setModerationPosts] = useState([])
    const [moderationComments, setModerationComments] = useState([])
    const [auditLogs, setAuditLogs] = useState([])
    const [userQuery, setUserQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("")
    const [verificationFilter, setVerificationFilter] = useState("pending")
    const [transactionType, setTransactionType] = useState("")
    const [moderationType, setModerationType] = useState("posts")
    const [moderationQuery, setModerationQuery] = useState("")
    const [moderationStatus, setModerationStatus] = useState("active")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [notice, setNotice] = useState("")

    const isAdmin = user?.role === "admin"

    useEffect(() => {
        if (!userLoading && !isAdmin) {
            navigate("/dashboard", { replace: true })
        }
    }, [isAdmin, navigate, userLoading])

    const showMessage = (message) => {
        setNotice(message)
        window.setTimeout(() => setNotice(""), 3000)
    }

    const runRequest = async (callback) => {
        setLoading(true)
        setError("")
        try {
            await callback()
        } catch (err) {
            setError(err.message || "Admin request failed")
        } finally {
            setLoading(false)
        }
    }

    const fetchOverview = () => runRequest(async () => {
        const [statsData, activityData] = await Promise.all([
            apiRequest(`${ADMIN_API}/stats`),
            apiRequest(`${ADMIN_API}/recent-activity`)
        ])
        setStats(statsData)
        setActivity(activityData)
    })

    const fetchTherapists = () => runRequest(async () => {
        const data = await apiRequest(`${ADMIN_API}/pending-therapists?status=${verificationFilter}`)
        setTherapists(data)
    })

    const fetchUsers = () => runRequest(async () => {
        const params = new URLSearchParams({ limit: "50" })
        if (userQuery.trim()) params.set("query", userQuery.trim())
        if (roleFilter) params.set("role", roleFilter)
        const data = await apiRequest(`${ADMIN_API}/users?${params.toString()}`)
        setUsers(data.users || [])
    })

    const fetchTransactions = () => runRequest(async () => {
        const params = new URLSearchParams({ limit: "50" })
        if (transactionType) params.set("type", transactionType)
        const data = await apiRequest(`${ADMIN_API}/transactions?${params.toString()}`)
        setTransactions(data.transactions || [])
    })

    const fetchModeration = () => runRequest(async () => {
        const params = new URLSearchParams({ limit: "50" })
        if (moderationQuery.trim()) params.set("query", moderationQuery.trim())
        params.set("status", moderationStatus)

        if (moderationType === "posts") {
            const data = await apiRequest(`${ADMIN_API}/posts?${params.toString()}`)
            setModerationPosts(data.posts || [])
            return
        }

        const data = await apiRequest(`${ADMIN_API}/comments?${params.toString()}`)
        setModerationComments(data.comments || [])
    })

    const fetchAuditLogs = () => runRequest(async () => {
        const data = await apiRequest(`${ADMIN_API}/logs?limit=50`)
        setAuditLogs(data.logs || [])
    })

    useEffect(() => {
        if (!isAdmin) return

        if (activeTab === "overview") fetchOverview()
        if (activeTab === "verifications") fetchTherapists()
        if (activeTab === "users") fetchUsers()
        if (activeTab === "transactions") fetchTransactions()
        if (activeTab === "moderation") fetchModeration()
        if (activeTab === "audit") fetchAuditLogs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, isAdmin])

    useEffect(() => {
        if (isAdmin && activeTab === "verifications") fetchTherapists()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verificationFilter])

    useEffect(() => {
        if (isAdmin && activeTab === "transactions") fetchTransactions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionType])

    useEffect(() => {
        if (isAdmin && activeTab === "moderation") fetchModeration()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moderationType, moderationStatus])

    const handleVerify = async (id, status) => {
        const reason = status === "rejected" ? window.prompt("Reason for rejecting this therapist?") : ""

        if (status === "rejected" && reason === null) return
        if (status === "rejected" && !reason.trim()) {
            setError("Rejection reason is required")
            return
        }

        await runRequest(async () => {
            await apiRequest(`${ADMIN_API}/therapist/${id}/verify`, {
                method: "PUT",
                body: JSON.stringify({ status, reason })
            })
            showMessage(`Therapist ${status}`)
            await fetchTherapists()
        })
    }

    const handleRoleChange = async (id, role) => {
        await runRequest(async () => {
            await apiRequest(`${ADMIN_API}/users/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ role })
            })
            showMessage("User role updated")
            await fetchUsers()
        })
    }

    const moderateContent = async ({ type, id, status }) => {
        const label = status === "active" ? "restore" : status
        const reason = status === "active" ? "" : window.prompt(`Reason to ${label} this ${type}?`, "")

        if (status !== "active" && reason === null) return
        if (status === "deleted" && !window.confirm(`Mark this ${type} as deleted?`)) return

        await runRequest(async () => {
            await apiRequest(`${ADMIN_API}/${type}s/${id}/moderation`, {
                method: "PATCH",
                body: JSON.stringify({ status, reason })
            })
            showMessage(`${type === "post" ? "Post" : "Comment"} ${status === "active" ? "restored" : status}`)
            await fetchModeration()
        })
    }

    const handleHidePost = (id) => moderateContent({ type: "post", id, status: "hidden" })
    const handleRestorePost = (id) => moderateContent({ type: "post", id, status: "active" })
    const handleDeletePost = (id) => moderateContent({ type: "post", id, status: "deleted" })
    const handleHideComment = (id) => moderateContent({ type: "comment", id, status: "hidden" })
    const handleRestoreComment = (id) => moderateContent({ type: "comment", id, status: "active" })
    const handleDeleteComment = (id) => moderateContent({ type: "comment", id, status: "deleted" })

    const overviewStats = useMemo(() => {
        if (!stats) return []
        return [
            {
                icon: Users,
                label: "Users",
                value: stats.users?.total ?? 0,
                detail: `${stats.users?.therapists ?? 0} therapists, ${stats.users?.admins ?? 0} admins`
            },
            {
                icon: Clock,
                label: "Pending Therapists",
                value: stats.therapists?.pending ?? 0,
                detail: `${stats.therapists?.approved ?? 0} approved`
            },
            {
                icon: FileText,
                label: "Community Posts",
                value: stats.community?.posts ?? 0,
                detail: `${stats.community?.comments ?? 0} comments, ${(stats.community?.hiddenPosts ?? 0) + (stats.community?.hiddenComments ?? 0)} hidden`
            },
            {
                icon: Wallet,
                label: "Transactions",
                value: stats.wallet?.transactions ?? 0,
                detail: `${stats.wallet?.therapyPayments?.amount ?? 0} therapy credits`
            }
        ]
    }, [stats])

    if (userLoading || !isAdmin) {
        return (
            <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-[#e74c3c] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-sm text-gray-600">Checking admin access...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#f5f0e8]">
            <Sidebar />
            <div className="flex-1 lg:ml-16 p-4 lg:p-8 pt-28">
                <Header />

                <main className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-[#e74c3c]">
                                <Shield className="w-4 h-4" />
                                Admin Panel
                            </div>
                            <h1 className="mt-2 text-3xl font-bold text-[#2d2d2d]">Operations Dashboard</h1>
                        </div>
                        <button
                            onClick={() => {
                                if (activeTab === "overview") fetchOverview()
                                if (activeTab === "verifications") fetchTherapists()
                                if (activeTab === "users") fetchUsers()
                                if (activeTab === "transactions") fetchTransactions()
                                if (activeTab === "moderation") fetchModeration()
                                if (activeTab === "audit") fetchAuditLogs()
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c0392b] disabled:opacity-60"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-b border-[#dfd5c9]">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id
                                    ? "border-[#e74c3c] text-[#e74c3c]"
                                    : "border-transparent text-gray-500 hover:text-[#2d2d2d]"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {notice && (
                        <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4 mt-0.5" />
                            {notice}
                        </div>
                    )}

                    {activeTab === "overview" && (
                        <section className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                {overviewStats.map(card => (
                                    <StatCard key={card.label} {...card} />
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                                    <h2 className="font-bold text-[#2d2d2d]">New Users</h2>
                                    <div className="mt-4 space-y-3">
                                        {activity?.users?.map(item => (
                                            <div key={item._id} className="flex items-center justify-between gap-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-[#2d2d2d]">{item.name}</p>
                                                    <p className="text-gray-500">{item.email}</p>
                                                </div>
                                                <span className="text-xs capitalize text-gray-500">{item.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                                    <h2 className="font-bold text-[#2d2d2d]">Recent Posts</h2>
                                    <div className="mt-4 space-y-3">
                                        {activity?.posts?.map(item => (
                                            <div key={item._id} className="text-sm">
                                                <p className="line-clamp-2 text-[#2d2d2d]">{item.content}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {item.author?.name || "Unknown"} · {formatDate(item.createdAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                                    <h2 className="font-bold text-[#2d2d2d]">Recent Transactions</h2>
                                    <div className="mt-4 space-y-3">
                                        {activity?.transactions?.map(item => (
                                            <div key={item._id} className="flex items-center justify-between gap-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-[#2d2d2d]">{item.amount} credits</p>
                                                    <p className="text-xs text-gray-500">{item.type}</p>
                                                </div>
                                                <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === "verifications" && (
                        <section className="mt-6 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-xl font-bold text-[#2d2d2d]">Therapist Verifications</h2>
                                <select
                                    value={verificationFilter}
                                    onChange={(event) => setVerificationFilter(event.target.value)}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="all">All</option>
                                </select>
                            </div>

                            {therapists.length === 0 ? (
                                <EmptyState title="No therapists found" detail="Try a different verification status." />
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {therapists.map(therapist => (
                                        <div key={therapist._id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-bold text-lg text-[#2d2d2d]">{therapist.name}</h3>
                                                        <span className={`rounded-full border px-2 py-1 text-xs capitalize ${statusClass(therapist.verificationStatus)}`}>
                                                            {therapist.verificationStatus}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{therapist.email}</p>
                                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <p><span className="font-medium text-[#2d2d2d]">Profession:</span> {therapist.profession || "Not set"}</p>
                                                        <p><span className="font-medium text-[#2d2d2d]">Location:</span> {therapist.location || "Not set"}</p>
                                                        <p><span className="font-medium text-[#2d2d2d]">Fees:</span> {therapist.consultationFees ?? "Not set"}</p>
                                                        <p><span className="font-medium text-[#2d2d2d]">License:</span> {therapist.licenseNumber || "Not set"}</p>
                                                    </div>
                                                    {therapist.verificationDocuments?.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {therapist.verificationDocuments.map((doc, index) => (
                                                                <a
                                                                    key={doc}
                                                                    href={doc}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#e74c3c] hover:text-[#c0392b]"
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                    Document {index + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {therapist.verificationRejectionReason && (
                                                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                            <span className="font-semibold">Rejection reason:</span> {therapist.verificationRejectionReason}
                                                        </div>
                                                    )}
                                                    {therapist.verificationReviewedAt && (
                                                        <p className="mt-2 text-xs text-gray-500">
                                                            Last reviewed {formatDate(therapist.verificationReviewedAt)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 md:w-48">
                                                    <button
                                                        onClick={() => handleVerify(therapist._id, "approved")}
                                                        className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mx-auto" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(therapist._id, "rejected")}
                                                        className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                                    >
                                                        <XCircle className="w-4 h-4 mx-auto" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "users" && (
                        <section className="mt-6 space-y-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <h2 className="text-xl font-bold text-[#2d2d2d]">User Management</h2>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            value={userQuery}
                                            onChange={(event) => setUserQuery(event.target.value)}
                                            onKeyDown={(event) => event.key === "Enter" && fetchUsers()}
                                            placeholder="Search users"
                                            className="w-full sm:w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                        />
                                    </div>
                                    <select
                                        value={roleFilter}
                                        onChange={(event) => setRoleFilter(event.target.value)}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                    >
                                        <option value="">All roles</option>
                                        <option value="user">Users</option>
                                        <option value="therapist">Therapists</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                    <button
                                        onClick={fetchUsers}
                                        className="rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">User</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Verification</th>
                                            <th className="px-4 py-3">Wallet</th>
                                            <th className="px-4 py-3">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map(item => (
                                            <tr key={item._id}>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-[#2d2d2d]">{item.name}</p>
                                                    <p className="text-gray-500">{item.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={item.role}
                                                        onChange={(event) => handleRoleChange(item._id, event.target.value)}
                                                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm capitalize"
                                                    >
                                                        <option value="user">user</option>
                                                        <option value="therapist">therapist</option>
                                                        <option value="admin">admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full border px-2 py-1 text-xs capitalize ${statusClass(item.verificationStatus)}`}>
                                                        {item.verificationStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{item.walletBalance ?? 0} credits</td>
                                                <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && <EmptyState title="No users found" detail="Adjust the search or role filter." />}
                            </div>
                        </section>
                    )}

                    {activeTab === "transactions" && (
                        <section className="mt-6 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-xl font-bold text-[#2d2d2d]">Transaction Audit</h2>
                                <select
                                    value={transactionType}
                                    onChange={(event) => setTransactionType(event.target.value)}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                >
                                    <option value="">All transaction types</option>
                                    <option value="CREDIT_PURCHASE">Credit purchases</option>
                                    <option value="THERAPY_PAYMENT">Therapy payments</option>
                                </select>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">From</th>
                                            <th className="px-4 py-3">To</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map(item => (
                                            <tr key={item._id}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                                        <span>{item.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{item.from?.name || "Stripe"}</td>
                                                <td className="px-4 py-3">{item.to?.name || "Unknown"}</td>
                                                <td className="px-4 py-3 font-semibold">{item.amount} credits</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {transactions.length === 0 && <EmptyState title="No transactions found" detail="There is no wallet activity for this filter." />}
                            </div>
                        </section>
                    )}

                    {activeTab === "moderation" && (
                        <section className="mt-6 space-y-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <h2 className="text-xl font-bold text-[#2d2d2d]">Community Moderation</h2>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                                        <button
                                            onClick={() => setModerationType("posts")}
                                            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${moderationType === "posts"
                                                ? "bg-[#e74c3c] text-white"
                                                : "text-gray-600 hover:text-[#2d2d2d]"
                                                }`}
                                        >
                                            Posts
                                        </button>
                                        <button
                                            onClick={() => setModerationType("comments")}
                                            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${moderationType === "comments"
                                                ? "bg-[#e74c3c] text-white"
                                                : "text-gray-600 hover:text-[#2d2d2d]"
                                                }`}
                                        >
                                            Comments
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            value={moderationQuery}
                                            onChange={(event) => setModerationQuery(event.target.value)}
                                            onKeyDown={(event) => event.key === "Enter" && fetchModeration()}
                                            placeholder={`Search ${moderationType}`}
                                            className="w-full sm:w-72 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                        />
                                    </div>
                                    <select
                                        value={moderationStatus}
                                        onChange={(event) => setModerationStatus(event.target.value)}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                    >
                                        <option value="active">Active</option>
                                        <option value="hidden">Hidden</option>
                                        <option value="deleted">Deleted</option>
                                        <option value="all">All statuses</option>
                                    </select>
                                    <button
                                        onClick={fetchModeration}
                                        className="rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            {moderationType === "posts" && (
                                <div className="space-y-3">
                                    {moderationPosts.map(post => (
                                        <div key={post._id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                                        <span className="font-semibold text-[#2d2d2d]">{post.author?.name || "Unknown user"}</span>
                                                        <span>{post.author?.email}</span>
                                                        <span>{formatDate(post.createdAt)}</span>
                                                        <span className={`rounded-full border px-2 py-1 text-xs capitalize ${statusClass(post.moderationStatus || "active")}`}>
                                                            {post.moderationStatus || "active"}
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#2d2d2d]">{post.content}</p>
                                                    {post.image && (
                                                        <a
                                                            href={post.image}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#e74c3c] hover:text-[#c0392b]"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            View attached image
                                                        </a>
                                                    )}
                                                    <p className="mt-3 text-xs text-gray-500">
                                                        {(post.likes ?? []).length} likes · {(post.comments ?? []).length} comments
                                                    </p>
                                                    {post.moderationReason && (
                                                        <p className="mt-2 text-xs text-amber-700">Reason: {post.moderationReason}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 md:justify-end">
                                                    {post.moderationStatus !== "hidden" && (
                                                        <button
                                                            onClick={() => handleHidePost(post._id)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                                                        >
                                                            <EyeOff className="w-4 h-4" />
                                                            Hide
                                                        </button>
                                                    )}
                                                    {post.moderationStatus !== "active" && (
                                                        <button
                                                            onClick={() => handleRestorePost(post._id)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                            Restore
                                                        </button>
                                                    )}
                                                    {post.moderationStatus !== "deleted" && (
                                                        <button
                                                            onClick={() => handleDeletePost(post._id)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {moderationPosts.length === 0 && (
                                        <EmptyState title="No posts found" detail="Try a different moderation search." />
                                    )}
                                </div>
                            )}

                            {moderationType === "comments" && (
                                <div className="space-y-3">
                                    {moderationComments.map(comment => (
                                        <div key={comment._id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                                        <span className="font-semibold text-[#2d2d2d]">{comment.author?.name || "Unknown user"}</span>
                                                        <span>{comment.author?.email}</span>
                                                        <span>{formatDate(comment.createdAt)}</span>
                                                        <span className={`rounded-full border px-2 py-1 text-xs capitalize ${statusClass(comment.moderationStatus || "active")}`}>
                                                            {comment.moderationStatus || "active"}
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#2d2d2d]">{comment.content}</p>
                                                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">On post</p>
                                                        <p className="mt-1 line-clamp-2">{comment.post?.content || "Post no longer available"}</p>
                                                        {comment.post?.author?.name && (
                                                            <p className="mt-1 text-xs text-gray-500">By {comment.post.author.name}</p>
                                                        )}
                                                    </div>
                                                    {comment.moderationReason && (
                                                        <p className="mt-2 text-xs text-amber-700">Reason: {comment.moderationReason}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 md:justify-end">
                                                    {comment.moderationStatus !== "hidden" && (
                                                        <button
                                                            onClick={() => handleHideComment(comment._id)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                                                        >
                                                            <EyeOff className="w-4 h-4" />
                                                            Hide
                                                        </button>
                                                    )}
                                                    {comment.moderationStatus !== "active" && (
                                                        <button
                                                            onClick={() => handleRestoreComment(comment._id)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                            Restore
                                                        </button>
                                                    )}
                                                    {comment.moderationStatus !== "deleted" && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {moderationComments.length === 0 && (
                                        <EmptyState title="No comments found" detail="Try a different moderation search." />
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "audit" && (
                        <section className="mt-6 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-xl font-bold text-[#2d2d2d]">Admin Audit Log</h2>
                                <p className="text-sm text-gray-500">Latest 50 admin actions</p>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">Action</th>
                                            <th className="px-4 py-3">Admin</th>
                                            <th className="px-4 py-3">Target</th>
                                            <th className="px-4 py-3">Reason</th>
                                            <th className="px-4 py-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {auditLogs.map(log => (
                                            <tr key={log._id}>
                                                <td className="px-4 py-3 font-semibold text-[#2d2d2d]">{log.action}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-[#2d2d2d]">{log.admin?.name || "Unknown admin"}</p>
                                                    <p className="text-xs text-gray-500">{log.admin?.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="capitalize">{log.targetType}</span>
                                                    <p className="text-xs text-gray-500">{log.targetId}</p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{log.reason || "No reason provided"}</td>
                                                <td className="px-4 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {auditLogs.length === 0 && (
                                    <EmptyState title="No admin actions yet" detail="Moderation actions will appear here." />
                                )}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}
