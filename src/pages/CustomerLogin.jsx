import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api/auth';

function CustomerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // For Signup
    const [isSignup, setIsSignup] = useState(false);
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleLoginSubmit = async () => {
        try {
            const { token } = await login({ email, password });
            localStorage.setItem('authToken', token);
            navigate('/create-art');  // Redirect customers to the 'createart' page after logging in
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
        }
    };

    const handleSignupSubmit = async () => {
        try {
            await signup({ name: signupName, email: signupEmail, password: signupPassword, userType: 'customer' });
            navigate('/customer-login');  // Redirect to login after successful signup
        } catch (error) {
            console.error("Signup error:", error.response?.data || error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl mb-4">User Portal</h1>
            
            {!isSignup ? (
                <div className="w-1/3 mb-4">
                    <h2 className="text-xl mb-2">Login</h2>
                    <input 
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="p-2 border rounded mb-2 w-full"
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="p-2 border rounded mb-2 w-full"
                    />
                    <button onClick={handleLoginSubmit} className="bg-black text-white p-2 rounded w-full mb-2">Login</button>
                    <p className="text-sm text-center">
                        New to Artful Royalties? <span className="text-white cursor-pointer" onClick={() => setIsSignup(true)}>Signup here</span>
                    </p>
                </div>
            ) : (
                <div className="w-1/3">
                    <h2 className="text-xl mb-2">Signup</h2>
                    <input 
                        type="text"
                        placeholder="Full Name"
                        value={signupName}
                        onChange={e => setSignupName(e.target.value)}
                        className="p-2 border rounded mb-2 w-full"
                    />
                    <input 
                        type="email"
                        placeholder="Email"
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        className="p-2 border rounded mb-2 w-full"
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        className="p-2 border rounded mb-2 w-full"
                    />
                    <button onClick={handleSignupSubmit} className="bg-green-500 text-white p-2 rounded w-full mb-2">Signup</button>
                    <p className="text-sm text-center">
                        Already have an account? <span className="text-white cursor-pointer" onClick={() => setIsSignup(false)}>Login here</span>
                    </p>
                </div>
            )}
        </div>
    );
}

export default CustomerLogin;
