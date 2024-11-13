import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:3000/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            setMessage(data.message || 'Inicio de sesión exitoso.');
            localStorage.setItem('userId', data.userId);
            console.log(data.userId);
            navigate('/classrooms');
        } else {
            setError(data.error || 'Error en las credenciales.');
        }
    };

    return (
        <div className="login-container">
            <h1 className='login-title'>Control de Persianas y Luces</h1>
            <h2 className="login-subtitle">Iniciar sesión</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <label className="login-form-label">Correo electrónico: </label>
                <input
                    type="text"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-form-input"
                    required
                />
                <label className="login-form-label">Contraseña: </label>
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-form-input"
                    required
                />
                <button type="submit" className="login-form-button">Iniciar sesión</button>
            </form>
            {message && <p className="login-form-message success">{message}</p>}
            {error && <p className="login-form-message error">{error}</p>}
            <p className="login-form-footer">
                ¿Aún no tienes una cuenta?{' '}
                <span className="login-form-link" onClick={() => navigate('/register')}>Registrarse</span>
            </p>
        </div>
    );
};

export default Login;