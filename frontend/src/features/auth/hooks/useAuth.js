import {useEffect, useContext} from "react";
import { AuthContext } from "../auth.context.jsx";
import {loginUser as login , registerUser as register , logoutUser as logout , getMe} from "../services/auth.api.js";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading} = context

    const handleLogin = async ({email, password}) => {
        setLoading(true)
        try {
            const Data = await login(email, password)
            setUser(Data.user)
            return Data.user
        } catch (error) {
            console.error('Login error:', error)
            throw error?.response?.data?.message || 'Login failed'
        } finally {
            setLoading(false)
        }
    }
    const handleRegister = async ({username, email, password}) => {
        setLoading(true)
        try {
            const Data = await register(username, email, password)
            setUser(Data.user)
            return Data.user
        } catch (error) {
            console.error('Register error:', error)
            throw error?.response?.data?.message || 'Registration failed'
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data?.user ?? null)
            } catch (error) {
                console.error('Failed to fetch current user', error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()
    }, [])

    return {user, loading, handleLogin, handleRegister, handleLogout}

}
