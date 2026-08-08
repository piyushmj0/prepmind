import React,{useState} from 'react'
import { useNavigate , Link} from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'


export const Register = () => {
    const navigate = useNavigate()
    const [username , setUsername] = React.useState('')
    const [email , setEmail] = React.useState('')
    const [password , setPassword] = React.useState('')

    const {loading, handleRegister} = useAuth()

   const [error, setError] = useState('')

   const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await handleRegister({username, email, password})
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
        <h1>Register</h1>
        {error && <div style={{color: '#ff5e62', padding: '0.5rem', backgroundColor: 'rgba(255,94,98,0.1)', borderRadius: '4px'}}>{error}</div>}
        <form action="" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
            onChange={(e) => setUsername(e.target.value)}
            type="text" id="name"  placeholder='Enter username'/>
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
            onChange={(e) => setEmail(e.target.value)}
            type="email" id="email"  placeholder='Enter your email'/>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
            onChange={(e) => setPassword(e.target.value)}
            type="password" id="password"  placeholder='Enter your password' />
          </div>
          <button  className='button primary-button' type="submit">Register</button>
        </form>
        <br />
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
}
