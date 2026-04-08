import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { API_ENDPOINTS, apiRequest } from '../config/api'
import API_BASE_URL from '../config/api'

const UserContext = createContext()

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [walletBalance, setWalletBalance] = useState(0)

    // Guard: prevents initializeUser from running more than once.
    // React 18 StrictMode intentionally mounts components TWICE in development
    // to expose side effects — this ref survives the remount and blocks the
    // second execution.
    const initializedRef = useRef(false)

    // ── Fetch wallet balance ──────────────────────────────────────────────────
    const refreshWallet = useCallback(async () => {
        try {
            const res = await apiRequest(`${API_BASE_URL}/api/wallet/balance`)
            const bal = res?.data?.walletBalance ?? 0
            setWalletBalance(bal)
            // Keep it in sync with the stored user object so other reads are consistent
            setUser(prev => {
                if (!prev) return prev
                const updated = { ...prev, walletBalance: bal }
                localStorage.setItem('user', JSON.stringify(updated))
                return updated
            })
        } catch {
            // Silently ignore — user might not have a wallet yet
        }
    }, [])

    // ── Initialize user from localStorage ────────────────────────────────────
    useEffect(() => {
        // Block the second StrictMode invocation — ref persists across remounts
        if (initializedRef.current) return
        initializedRef.current = true

        const controller = new AbortController()

        const initializeUser = async () => {
            const token = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            if (token && storedUser) {
                try {
                    const userData = JSON.parse(storedUser)

                    // ✅ Restore from localStorage and unblock the UI immediately.
                    // Pages are visible before any network call is made.
                    setUser(userData)
                    setIsAuthenticated(true)
                    setWalletBalance(userData.walletBalance ?? 0)
                    setLoading(false)   // ← INSTANT — no waiting for network

                    // Background: verify token + refresh profile (won't block UI)
                    if (!controller.signal.aborted) {
                        apiRequest(API_ENDPOINTS.ME)
                            .then(res => {
                                if (!controller.signal.aborted) setUser(res.user)
                            })
                            .catch(() => {
                                // Token is invalid (e.g. old token signed with broken secret)
                                // Silently log the user out so they can log in fresh
                                if (!controller.signal.aborted) logout()
                            })
                    }

                    // Background: fetch live wallet balance (won't block UI)
                    if (!controller.signal.aborted) {
                        refreshWallet()
                    }

                } catch {
                    // Corrupt localStorage data — clear it and show login
                    logout()
                    setLoading(false)
                }
            } else {
                // No stored session — show login page immediately
                setLoading(false)
            }
        }

        initializeUser()

        return () => controller.abort()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Auth actions ──────────────────────────────────────────────────────────
    const login = async (userData, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        setIsAuthenticated(true)

        // Fetch wallet balance right after login so the UI is immediately correct
        try {
            const res = await apiRequest(`${API_BASE_URL}/api/wallet/balance`)
            const bal = res?.data?.walletBalance ?? 0
            setWalletBalance(bal)
            const withBal = { ...userData, walletBalance: bal }
            localStorage.setItem('user', JSON.stringify(withBal))
            setUser(withBal)
        } catch {
            setWalletBalance(0)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsAuthenticated(false)
        setWalletBalance(0)
    }

    const updateUser = (updatedData) => {
        const newUserData = { ...user, ...updatedData }
        localStorage.setItem('user', JSON.stringify(newUserData))
        setUser(newUserData)
        // Keep walletBalance atom in sync if it was part of the update
        if ('walletBalance' in updatedData) {
            setWalletBalance(updatedData.walletBalance)
        }
    }

    // ── Context value ─────────────────────────────────────────────────────────
    const value = {
        user,
        loading,
        isAuthenticated,
        walletBalance,
        login,
        logout,
        updateUser,
        refreshWallet,   // call this after any payment or transfer to sync balance
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContext