import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import { useNavigate } from "react-router-dom"
import API_BASE_URL, { apiRequest } from "../config/api"
import { CheckCircle, XCircle, FileText, Download } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"

export default function AdminDashboard() {
    const { user } = useUser()
    const navigate = useNavigate()
    const [therapists, setTherapists] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/')
            return
        }
        fetchPendingTherapists()
    }, [user, navigate])

    const fetchPendingTherapists = async () => {
        try {
            const data = await apiRequest(`${API_BASE_URL}/api/admin/pending-therapists`)
            setTherapists(data)
        } catch (error) {
            console.error('Error fetching therapists:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (id, status) => {
        try {
            await apiRequest(`${API_BASE_URL}/api/admin/therapist/${id}/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            // Refresh list
            fetchPendingTherapists()
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#f5f0e8]">
            <Sidebar />
            <div className="flex-1 lg:ml-16 p-4 pt-28">
                <Header />
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#2d2d2d] mb-8">Admin Dashboard</h1>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-6">Pending Verifications</h2>

                        {loading ? (
                            <p>Loading...</p>
                        ) : therapists.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No pending verifications</p>
                        ) : (
                            <div className="space-y-4">
                                {therapists.map(therapist => (
                                    <div key={therapist._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-[#2d2d2d]">{therapist.name}</h3>
                                                <p className="text-gray-500">{therapist.email}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {therapist.profession}
                                                    </span>
                                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                                        {therapist.location}
                                                    </span>
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                        ${therapist.consultationFees}/hr
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                {therapist.verificationDocuments && therapist.verificationDocuments.length > 0 && (
                                                    <div className="flex gap-2 mb-2">
                                                        {therapist.verificationDocuments.map((doc, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={doc}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm text-[#e74c3c] hover:underline"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                Doc {idx + 1}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerify(therapist._id, 'approved')}
                                                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(therapist._id, 'rejected')}
                                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
