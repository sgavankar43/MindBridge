import { useState, useEffect, useCallback, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import { useUser } from "../context/UserContext"
import API_BASE_URL, { apiRequest } from "../config/api"
import {
    Wallet,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Send,
    ShoppingCart,
    Clock,
    ChevronRight,
    Coins,
    Search,
    User as UserIcon,
} from "lucide-react"

// ── Credit packages matching the backend ─────────────────────────────────────
const CREDIT_PACKAGES = [
    { credits: 100, price: "$4.99", label: "Starter", popular: false },
    { credits: 250, price: "$9.99", label: "Popular", popular: true },
    { credits: 500, price: "$17.99", label: "Pro", popular: false },
    { credits: 1000, price: "$29.99", label: "Premium", popular: false },
]

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
    useEffect(() => {
        if (!toast) return
        const t = setTimeout(onDismiss, 4000)
        return () => clearTimeout(t)
    }, [toast, onDismiss])

    if (!toast) return null

    const styles = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    }
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
        error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
        info: <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />,
    }

    return (
        <div
            className={`fixed top-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg
        max-w-sm w-full animate-in slide-in-from-top-2 duration-300 ${styles[toast.type]}`}
        >
            {icons[toast.type]}
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
            <button onClick={onDismiss} className="ml-auto text-current opacity-60 hover:opacity-100">
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    )
}

// ── Transaction badge ─────────────────────────────────────────────────────────
function TypeBadge({ type }) {
    if (type === "CREDIT_PURCHASE") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                <ArrowDownLeft className="w-3 h-3" /> Purchase
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <ArrowUpRight className="w-3 h-3" /> Transfer
        </span>
    )
}

function StatusBadge({ status }) {
    return status === "SUCCESS" ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle className="w-3 h-3" /> Success
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
            <XCircle className="w-3 h-3" /> Failed
        </span>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WalletPage() {
    const { user, updateUser, refreshWallet } = useUser()

    // Prevents the initial-load effect from firing twice under React 18 StrictMode
    const initializedRef = useRef(false)

    // Data
    const [balance, setBalance] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

    // UI state
    const [pageLoading, setPageLoading] = useState(true)
    const [txLoading, setTxLoading] = useState(false)
    const [buyLoading, setBuyLoading] = useState(null)  // creditAmount being purchased
    const [transferLoading, setTransferLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    // Transfer form
    const [transferForm, setTransferForm] = useState({ toUserId: "", amount: "" })
    const [transferErrors, setTransferErrors] = useState({})
    const [selectedTherapist, setSelectedTherapist] = useState(null)   // {id, name, avatar, profession}

    // Therapist autocomplete
    const [therapistQuery, setTherapistQuery] = useState("")
    const [therapistResults, setTherapistResults] = useState([])
    const [therapistSearching, setTherapistSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const autocompleteRef = useRef(null)
    const debounceRef = useRef(null)

    // Toast
    const [toast, setToast] = useState(null)

    const showToast = (message, type = "success") => setToast({ message, type })
    const dismissToast = () => setToast(null)

    // ── Fetch balance ───────────────────────────────────────────────────────────
    const fetchBalance = useCallback(async (silent = false) => {
        if (!silent) setPageLoading(true)
        try {
            const res = await apiRequest(`${API_BASE_URL}/api/wallet/balance`)
            setBalance(res.data.walletBalance)
            // Keep context wallet balance in sync
            updateUser({ walletBalance: res.data.walletBalance })
            refreshWallet()
        } catch (err) {
            if (!silent) showToast(err.message || "Failed to load wallet balance", "error")
        } finally {
            setPageLoading(false)
        }
        // updateUser and refreshWallet are called imperatively — not reactive deps.
        // They are stable references (context functions) so omitting them is safe.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Fetch transactions ──────────────────────────────────────────────────────
    const fetchTransactions = useCallback(async (page = 1) => {
        setTxLoading(true)
        try {
            const res = await apiRequest(
                `${API_BASE_URL}/api/wallet/transactions?page=${page}&limit=20`
            )
            setTransactions(res.data.transactions)
            setPagination(res.data.pagination)
        } catch (err) {
            showToast(err.message || "Failed to load transactions", "error")
        } finally {
            setTxLoading(false)
        }
    }, [])

    // ── Initial load ──────────────────────────────────────────────────────
    useEffect(() => {
        // Guard against React 18 StrictMode double-invoke
        if (initializedRef.current) return
        initializedRef.current = true

        fetchBalance()
        fetchTransactions()
        // [] is intentional: fetchBalance/fetchTransactions are stable (useCallback
        // with [] deps) so including them would never change the outcome but WOULD
        // cause the effect to re-run if they were ever re-created.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Handle ?status=success redirect from Stripe ──────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("status") === "success") {
            showToast("Payment successful! Credits are being processed.", "success")
            window.history.replaceState({}, "", "/wallet")

            // Initial refresh
            fetchBalance(true)
            fetchTransactions()
            refreshWallet()

            // Poll for balance updates since webhooks can be slightly delayed
            let attempts = 0
            const maxAttempts = 5
            const pollInterval = setInterval(async () => {
                attempts++
                const lastBalance = balance
                await fetchBalance(true)

                // If balance changed or we hit max attempts, stop polling
                if (balance !== lastBalance || attempts >= maxAttempts) {
                    clearInterval(pollInterval)
                    fetchTransactions() // Refresh transactions again to show the latest
                }
            }, 3000)

            return () => clearInterval(pollInterval)
        } else if (params.get("status") === "cancelled") {
            showToast("Payment was cancelled.", "info")
            window.history.replaceState({}, "", "/wallet")
        }
        // balance depends on fetchBalance updating it, but we want to know if it CHANGED.
        // However, adding 'balance' as a dep might cause infinite loops if fetchBalance is not stable.
        // In Wallet.jsx, fetchBalance is a useCallback with [] deps, so it's stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Refresh all data ────────────────────────────────────────────────────────
    const handleRefresh = async () => {
        setRefreshing(true)
        await Promise.all([fetchBalance(true), fetchTransactions(pagination.page)])
        setRefreshing(false)
        showToast("Wallet refreshed", "info")
    }

    // ── Buy credits ─────────────────────────────────────────────────────────────
    const handleBuyCredits = async (creditAmount) => {
        setBuyLoading(creditAmount)
        try {
            const res = await apiRequest(`${API_BASE_URL}/api/wallet/create-checkout-session`, {
                method: "POST",
                body: JSON.stringify({ creditAmount }),
            })
            window.location.href = res.url
        } catch (err) {
            showToast(err.message || "Failed to create checkout session", "error")
            setBuyLoading(null)
        }
    }

    // ── Therapist autocomplete ──────────────────────────────────────────────────
    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleTherapistInput = (e) => {
        const val = e.target.value
        setTherapistQuery(val)
        setSelectedTherapist(null)
        setTransferForm(f => ({ ...f, toUserId: "" }))
        setShowDropdown(true)

        clearTimeout(debounceRef.current)
        if (val.trim().length < 2) {
            setTherapistResults([])
            setTherapistSearching(false)
            return
        }
        setTherapistSearching(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await apiRequest(
                    `${API_BASE_URL}/api/users/therapists/search?q=${encodeURIComponent(val.trim())}`
                )
                setTherapistResults(res.therapists || [])
            } catch {
                setTherapistResults([])
            } finally {
                setTherapistSearching(false)
            }
        }, 300)
    }

    const selectTherapist = (therapist) => {
        setSelectedTherapist(therapist)
        setTherapistQuery(therapist.name)
        setTransferForm(f => ({ ...f, toUserId: String(therapist.id) }))
        setTherapistResults([])
        setShowDropdown(false)
        // Clear any error on this field
        setTransferErrors(prev => ({ ...prev, toUserId: undefined }))
    }

    // ── Transfer form validation ────────────────────────────────────────────────
    const validateTransfer = () => {
        const errors = {}
        if (!transferForm.toUserId.trim()) errors.toUserId = "Please select a therapist from the list"
        const amt = Number(transferForm.amount)
        if (!transferForm.amount) errors.amount = "Amount is required"
        else if (isNaN(amt) || amt <= 0) errors.amount = "Amount must be greater than 0"
        else if (amt > balance) errors.amount = `Insufficient balance (you have ${balance} credits)`
        return errors
    }

    const handleTransfer = async (e) => {
        e.preventDefault()
        const errors = validateTransfer()
        if (Object.keys(errors).length) { setTransferErrors(errors); return }
        setTransferErrors({})
        setTransferLoading(true)
        try {
            const res = await apiRequest(`${API_BASE_URL}/api/wallet/transfer`, {
                method: "POST",
                body: JSON.stringify({
                    toUserId: transferForm.toUserId.trim(),
                    amount: Number(transferForm.amount),
                }),
            })
            showToast(res.message || "Transfer successful!", "success")
            setTransferForm({ toUserId: "", amount: "" })
            setSelectedTherapist(null)
            setTherapistQuery("")
            // Refresh data + push to context so sidebar/dashboard update instantly
            await fetchBalance(true)
            await fetchTransactions()
            await refreshWallet()
        } catch (err) {
            showToast(err.message || "Transfer failed. Please try again.", "error")
        } finally {
            setTransferLoading(false)
        }
    }

    // ── Format date ─────────────────────────────────────────────────────────────
    const formatDate = (iso) => {
        const d = new Date(iso)
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
            " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }

    const getUserLabel = (txUser, selfId) => {
        if (!txUser) return "Stripe"
        if (txUser._id === selfId) return "You"
        return txUser.name || "Unknown"
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0e6d6]">
            <Sidebar />
            <Header />
            <Toast toast={toast} onDismiss={dismissToast} />

            <main className="lg:ml-16 pt-24 pb-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* ── Page header ── */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d] flex items-center gap-2">
                                <Wallet className="w-7 h-7 text-[#e74c3c]" />
                                My Wallet
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Manage your credits and payments</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-medium
                text-gray-600 shadow-sm hover:shadow-md hover:text-[#e74c3c] transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>

                    {/* ── Balance card ── */}
                    {pageLoading ? (
                        <div className="bg-white rounded-3xl shadow-lg p-8 flex items-center justify-center h-44">
                            <Loader2 className="w-8 h-8 text-[#e74c3c] animate-spin" />
                        </div>
                    ) : (
                        <div className="relative bg-gradient-to-br from-[#e74c3c] to-[#c0392b] rounded-3xl shadow-xl overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full" />

                            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                                {/* Balance */}
                                <div className="flex-1">
                                    <p className="text-white/70 text-sm font-medium tracking-wide uppercase">
                                        Available Credits
                                    </p>
                                    <div className="mt-2 flex items-end gap-3">
                                        <span className="text-5xl sm:text-6xl font-bold text-white">
                                            {balance?.toLocaleString() ?? "—"}
                                        </span>
                                        <span className="text-white/70 text-lg mb-1">credits</span>
                                    </div>
                                    <p className="text-white/60 text-xs mt-2">
                                        Welcome back, {user?.name?.split(" ")[0] ?? "User"} ✦
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex sm:flex-col gap-4 sm:gap-3 sm:items-end">
                                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                                        <p className="text-white/70 text-xs">Joined</p>
                                        <p className="text-white font-semibold text-sm capitalize">{user?.role ?? "User"}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                                        <p className="text-white/70 text-xs">Transactions</p>
                                        <p className="text-white font-semibold text-sm">{pagination.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Two column: Buy + Transfer ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Buy Credits */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-[#fef2f2] rounded-xl flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-[#e74c3c]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#2d2d2d]">Buy Credits</h2>
                                    <p className="text-xs text-gray-400">Secure payment via Stripe</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {CREDIT_PACKAGES.map((pkg) => (
                                    <button
                                        key={pkg.credits}
                                        onClick={() => handleBuyCredits(pkg.credits)}
                                        disabled={!!buyLoading}
                                        className={`relative flex flex-col items-center py-4 px-3 rounded-2xl border-2 transition-all
                      ${pkg.popular
                                                ? "border-[#e74c3c] bg-[#fef2f2]"
                                                : "border-gray-100 bg-gray-50 hover:border-[#e74c3c] hover:bg-[#fef2f2]"
                                            } disabled:opacity-60 disabled:cursor-not-allowed group`}
                                    >
                                        {pkg.popular && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#e74c3c] text-white
                        text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                MOST POPULAR
                                            </span>
                                        )}

                                        {buyLoading === pkg.credits ? (
                                            <Loader2 className="w-5 h-5 text-[#e74c3c] animate-spin mb-1" />
                                        ) : (
                                            <Coins className="w-5 h-5 text-[#e74c3c] mb-1 group-hover:scale-110 transition-transform" />
                                        )}

                                        <span className="text-xl font-bold text-[#2d2d2d]">
                                            {pkg.credits.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-400">credits</span>
                                        <span className="mt-1 text-sm font-semibold text-[#e74c3c]">{pkg.price}</span>
                                    </button>
                                ))}
                            </div>

                            <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                All transactions secured by Stripe
                            </p>
                        </div>

                        {/* Transfer Credits */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-[#fef2f2] rounded-xl flex items-center justify-center">
                                    <Send className="w-5 h-5 text-[#e74c3c]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#2d2d2d]">Transfer to Therapist</h2>
                                    <p className="text-xs text-gray-400">Search by name or ID — instantly pay from your balance</p>
                                </div>
                            </div>

                            <form onSubmit={handleTransfer} className="space-y-4">
                                {/* ── Therapist autocomplete ── */}
                                <div ref={autocompleteRef} className="relative">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                        Therapist
                                    </label>

                                    {/* Selected therapist chip */}
                                    {selectedTherapist && (
                                        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[#fef2f2] border border-[#e74c3c]/30 rounded-xl">
                                            <div className="w-7 h-7 rounded-full bg-[#e74c3c] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {selectedTherapist.avatar
                                                    ? <img src={selectedTherapist.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                    : selectedTherapist.name?.[0]?.toUpperCase()
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[#2d2d2d] truncate">{selectedTherapist.name}</p>
                                                <p className="text-[11px] text-gray-400 truncate">{selectedTherapist.profession}</p>
                                            </div>
                                            <CheckCircle className="w-4 h-4 text-[#e74c3c] flex-shrink-0" />
                                        </div>
                                    )}

                                    {/* Search input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Search therapist by name or ID..."
                                            value={therapistQuery}
                                            onChange={handleTherapistInput}
                                            onFocus={() => therapistQuery.length >= 2 && setShowDropdown(true)}
                                            onKeyDown={(e) => e.key === "Escape" && setShowDropdown(false)}
                                            className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 focus:outline-none
                                                focus:ring-2 focus:ring-[#e74c3c] transition-all
                                                ${transferErrors.toUserId ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                                        />
                                        {therapistSearching && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e74c3c] animate-spin" />
                                        )}
                                    </div>

                                    {/* Dropdown */}
                                    {showDropdown && therapistResults.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                            {therapistResults.map((t) => (
                                                <button
                                                    key={String(t.id)}
                                                    type="button"
                                                    onClick={() => selectTherapist(t)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fef2f2] transition-colors text-left"
                                                >
                                                    {/* Avatar */}
                                                    <div className="w-9 h-9 rounded-full bg-[#e74c3c] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                                                        {t.avatar
                                                            ? <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                                                            : t.name?.[0]?.toUpperCase()
                                                        }
                                                    </div>

                                                    {/* Name + profession */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-[#2d2d2d] truncate">{t.name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{t.profession}</p>
                                                    </div>

                                                    {/* ID chip */}
                                                    <span className="text-[10px] text-gray-300 font-mono truncate max-w-[80px]">
                                                        {String(t.id).slice(-6)}…
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* No results */}
                                    {showDropdown && !therapistSearching && therapistQuery.trim().length >= 2 && therapistResults.length === 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                                            <UserIcon className="w-4 h-4" /> No approved therapists found
                                        </div>
                                    )}

                                    {transferErrors.toUserId && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {transferErrors.toUserId}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                        Amount (credits)
                                    </label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="0"
                                            value={transferForm.amount}
                                            onChange={(e) =>
                                                setTransferForm((f) => ({ ...f, amount: e.target.value }))
                                            }
                                            className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 focus:outline-none
                        focus:ring-2 focus:ring-[#e74c3c] transition-all
                        ${transferErrors.amount ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                                        />
                                    </div>
                                    {transferErrors.amount ? (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {transferErrors.amount}
                                        </p>
                                    ) : (
                                        balance !== null && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                Balance: <span className="font-medium text-[#2d2d2d]">{balance} credits</span>
                                            </p>
                                        )
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={transferLoading || pageLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#e74c3c]
                    hover:bg-[#c0392b] text-white font-semibold rounded-xl transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                >
                                    {transferLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing…
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Transfer Credits
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Transaction History ── */}
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#e74c3c]" />
                                <h2 className="text-base font-bold text-[#2d2d2d]">Transaction History</h2>
                                {pagination.total > 0 && (
                                    <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                                        {pagination.total}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Loading */}
                        {txLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-7 h-7 text-[#e74c3c] animate-spin" />
                            </div>
                        ) : transactions.length === 0 ? (
                            /* Empty state */
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <div className="w-16 h-16 bg-[#fef2f2] rounded-full flex items-center justify-center mb-4">
                                    <Wallet className="w-8 h-8 text-[#e74c3c]" />
                                </div>
                                <h3 className="text-base font-semibold text-[#2d2d2d] mb-1">No transactions yet</h3>
                                <p className="text-sm text-gray-400 max-w-xs">
                                    Buy credits or transfer to a therapist to see your history here.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50/60">
                                                <th className="px-6 py-3 text-left">Type</th>
                                                <th className="px-6 py-3 text-left">From</th>
                                                <th className="px-6 py-3 text-left">To</th>
                                                <th className="px-6 py-3 text-right">Amount</th>
                                                <th className="px-6 py-3 text-left">Status</th>
                                                <th className="px-6 py-3 text-left">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {transactions.map((tx) => {
                                                const isCreditIn =
                                                    tx.type === "CREDIT_PURCHASE" ||
                                                    tx.to?._id === user?._id
                                                return (
                                                    <tr
                                                        key={tx._id}
                                                        className="hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <TypeBadge type={tx.type} />
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                                    {tx.from?.name?.[0]?.toUpperCase() ?? "S"}
                                                                </div>
                                                                {getUserLabel(tx.from, user?._id)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 bg-[#fef2f2] rounded-full flex items-center justify-center text-xs font-bold text-[#e74c3c]">
                                                                    {tx.to?.name?.[0]?.toUpperCase() ?? "?"}
                                                                </div>
                                                                {getUserLabel(tx.to, user?._id)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span
                                                                className={`text-sm font-bold ${isCreditIn ? "text-emerald-600" : "text-[#e74c3c]"
                                                                    }`}
                                                            >
                                                                {isCreditIn ? "+" : "−"}{tx.amount.toLocaleString()}
                                                                <span className="text-xs font-normal text-gray-400 ml-1">cr</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge status={tx.status} />
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                                                            {formatDate(tx.createdAt)}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <div className="md:hidden divide-y divide-gray-100">
                                    {transactions.map((tx) => {
                                        const isCreditIn =
                                            tx.type === "CREDIT_PURCHASE" || tx.to?._id === user?._id
                                        return (
                                            <div key={tx._id} className="px-4 py-4 flex items-center gap-3">
                                                {/* Icon */}
                                                <div
                                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
                            ${isCreditIn ? "bg-emerald-100" : "bg-red-50"}`}
                                                >
                                                    {isCreditIn ? (
                                                        <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                                                    ) : (
                                                        <ArrowUpRight className="w-5 h-5 text-[#e74c3c]" />
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <TypeBadge type={tx.type} />
                                                        <StatusBadge status={tx.status} />
                                                    </div>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {tx.from
                                                            ? `${getUserLabel(tx.from, user?._id)} → ${getUserLabel(tx.to, user?._id)}`
                                                            : `Stripe → ${getUserLabel(tx.to, user?._id)}`}
                                                    </p>
                                                    <p className="text-[11px] text-gray-300 mt-0.5">{formatDate(tx.createdAt)}</p>
                                                </div>

                                                {/* Amount */}
                                                <span
                                                    className={`text-base font-bold flex-shrink-0 ${isCreditIn ? "text-emerald-600" : "text-[#e74c3c]"
                                                        }`}
                                                >
                                                    {isCreditIn ? "+" : "−"}{tx.amount.toLocaleString()}
                                                    <span className="text-xs font-normal text-gray-400 ml-0.5">cr</span>
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            Page {pagination.page} of {pagination.totalPages} ·{" "}
                                            <span className="font-medium text-gray-600">{pagination.total} total</span>
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={pagination.page <= 1 || txLoading}
                                                onClick={() => fetchTransactions(pagination.page - 1)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100
                          hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                ← Prev
                                            </button>
                                            <button
                                                disabled={pagination.page >= pagination.totalPages || txLoading}
                                                onClick={() => fetchTransactions(pagination.page + 1)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#e74c3c] text-white
                          hover:bg-[#c0392b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                          flex items-center gap-1"
                                            >
                                                Next <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}
