import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [surName, setSurName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:3000/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, surName }),
        });
        const data = await response.json();
        if (response.ok) {
            setMessage(data.message || 'Registro exitoso.');
            navigate('/');
        } else {
            setError(data.error);
        }
    };

    return (
        <div className="register-container">
            <h1 classname='register-title'>Control de Persianas y Luces</h1>
            <h2 className="register-subtitle">Registrarse</h2>
            <form className="register-form" onSubmit={handleRegister}>
                <label className="register-form-label">Correo electrónico: </label>
                <input
                    type="text"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="register-form-input"
                    required
                />
                <label className="register-form-label">Nombre: </label>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="register-form-input"
                    required
                />
                <label className="register-form-label">Apellido: </label>
                <input
                    type="text"
                    placeholder="Apellido"
                    value={surName}
                    onChange={(e) => setSurName(e.target.value)}
                    className="register-form-input"
                    required
                />
                <button type="submit" className="register-form-button">Registrarse</button>
            </form>
            {message && <p className="register-form-message success">{message}</p>}
            {error && <p className="register-form-message error">{error}</p>}
            <p className="register-form-footer">
                ¿Ya tienes una cuenta?{' '}
                <span className="register-form-link" onClick={() => navigate('/')}>Iniciar sesión</span>
            </p>
        </div>
    );
};

export default Register;