import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import './Auth.css';

function Register({ onSwitchToLogin, onClose }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (response.success) {
                login(response.data.user, response.data.tokens);
                onClose();
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-modal">
            <div className="auth-content">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join to start tracking your manga</p>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="Choose a username"
                            required
                            minLength={3}
                            maxLength={30}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Create a password (min 8 characters)"
                            required
                            minLength={8}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Confirm your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="link-btn">
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;
