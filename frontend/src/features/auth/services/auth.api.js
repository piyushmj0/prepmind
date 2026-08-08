import axios from 'axios'

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/auth`,
    withCredentials: true
})

export async function registerUser(username, email, password) {
    try {
        const response = await api.post('/register', {
            username,
            email,
            password
        })

        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function loginUser(email, password) {
    try {
        const response = await api.post('/login', {
            email,
            password
        })
            
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function logoutUser() {
    try {
        const response = await api.get('/logout')
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function getMe() {
    try {
        const response = await api.get('/get-me')    
        return response.data   
        }
        
     catch (error) {
        console.log(error)
        throw error
    }   
}

export async function sendOtp() {
    try {
        const response = await api.post('/send-otp')
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function updatePassword(otp, newPassword) {
    try {
        const response = await api.post('/update-password', {
            otp,
            newPassword
        })
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function updateName(username) {
    try {
        const response = await api.put('/update-name', {
            username
        })
        return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}