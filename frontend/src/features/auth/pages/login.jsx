import React,{useState} from 'react'
import '../auth.form.scss'
import { useNavigate , Link} from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export const Login = () => {

    const {loading, handleLogin} = useAuth()
    const navigate = useNavigate()

    const [ email , setEmail] = useState('')
    const [ password , setPassword] = useState('')

    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await handleLogin({email, password})
            navigate('/dashboard')
        } catch (err) {
            setError(err)
        }
    }

    if(loading) {
        return (<main><h1>Loading.....</h1></main>)
    }

  return (
    <main>
        <div className="form-container">
            <Link to="/" className="back-link">&#8592; Back to Home</Link>
            <h1>Login</h1>
            {error && <div style={{color: '#ff5e62', padding: '0.5rem', backgroundColor: 'rgba(255,94,98,0.1)', borderRadius: '4px'}}>{error}</div>}
            <form action="" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    type="email" id="email" name='email' placeholder='Enter your email' />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    type="password" id="password" name='password' placeholder='Enter your password' />
                </div>
                <button className='button primary-button' type="submit">Login</button>
            </form>
            <br />
            <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    </main>

  )
}
