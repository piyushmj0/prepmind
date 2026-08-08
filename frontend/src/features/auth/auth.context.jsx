import { createContext , useState, useEffect } from "react";
import { getMe } from "./services/auth.api.js"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [user , setUser] = useState(null)
    const [loading , setLoading] = useState(true)

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await getMe()
                setUser(data?.user ?? null)
            } catch (error) {
                console.error("Failed to load authenticated user", error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    return(
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
      