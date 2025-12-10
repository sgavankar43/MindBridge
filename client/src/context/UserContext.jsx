import { createContext, useContext, useState, useEffect } from 'react'
import { API_ENDPOINTS, apiRequest } from '../config/api'

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

    // Initialize user from localStorage
    useEffect(() => {
        const initializeUser = async () => {
            try {
                const token = localStorage.getItem('token')
                const storedUser = localStorage.getItem('user')

                if (token && storedUser) {
                    const userData = JSON.parse(storedUser)
                    setUser(userData)
                    setIsAuthenticated(true)

                    // Optionally verify token with backend
                    try {
                        const response = await apiRequest(API_ENDPOINTS.ME)
                        setUser(response.user)
                    } catch (error) {
                        console.warn('Token verification failed:', error)
                        // Keep using stored user data if verification fails
                    }
                }
            } catch (error) {
                console.error('Error initializing user:', error)
                logout()
            } finally {
                setLoading(false)
            }
        }

        initializeUser()
    }, [])

    const login = (userData, token) => {
        // Check verification status for therapists
        if (userData.role === 'therapist' && userData.verificationStatus === 'pending') {
            // We store the token to allow basic profile access if needed,
            // but the UI should redirect them.
            // However, typically we might not even want to log them in fully if pending.
            // For this requirement, we'll store it but components will check status.
        }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        setIsAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsAuthenticated(false)
    }

    const updateUser = (updatedData) => {
        const newUserData = { ...user, ...updatedData }
        localStorage.setItem('user', JSON.stringify(newUserData))
        setUser(newUserData)
    }

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContext