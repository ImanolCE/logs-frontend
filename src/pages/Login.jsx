import React, { useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../config/apiConfig';

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [secretUrl, setSecretUrl] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("login");
    const [recoveryToken, setRecoveryToken] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

     // Cambiar a la vista Register
     const goToRegister = () => {
        setStep("register");
        setErrorMessage("");
        setUsername("");
        setEmail("");
        setPassword("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("Debes ingresar un username, email y una contraseña.");
            return;
        }

        try {
            const res = await axios.post(`${API_ENDPOINTS.server1}/api/register`, {
                username,
                email,
                password,
            });
            
            if (res.data.success) {
                setSecretUrl(res.data.secret);
                setStep("qr");
                setErrorMessage("");
            } else {
                setErrorMessage(res.data.message || "Error en el registro");
            }
        } catch (error) {
            console.error("Error en registro:", error);
            setErrorMessage(error.response?.data?.message || "Error al registrar usuario");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Debes ingresar email y contraseña.");
            return;
        }
        
        try {
            const res = await axios.post(`${API_ENDPOINTS.server1}/api/login`, {
                email,
                password
            });
        
            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                setErrorMessage("");

                if (res.data.requiresMFA) {
                    setStep("otp");
                } else {
                    navigate("/home");
                }
            } else {
                setErrorMessage(res.data.message || "Error en la autenticación");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.response?.data?.message || "Error en el servidor");
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            setErrorMessage("Por favor ingresa el código OTP");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Sesión no encontrada");

            const res = await axios.post(
                `${API_ENDPOINTS.server1}/api/verify-otp`,
                { email, token: otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                if (res.data.token) {
                    localStorage.setItem("token", res.data.token);
                }
                setErrorMessage("");
                navigate("/home");
            } else {
                setErrorMessage("Código inválido");
            }
        } catch (error) {
            console.error("Error en verificación OTP:", error);
            setErrorMessage(error.response?.data?.message || "Error en autenticación");
        }
    };

    const handleForgotPassword = () => {
        setStep("forgotPassword");
        setErrorMessage("");
    };

    const requestPasswordReset = async (e) => {
        e.preventDefault();
    
        if (!email.trim()) {
            setErrorMessage("Por favor ingresa tu correo electrónico");
            return;
        }
    
        try {
            const res = await axios.post(`${API_ENDPOINTS.server1}/api/request-password-reset`, {
                email
            });
    
            if (res.data.success) {
                setErrorMessage("");
                setStep("verifyRecoveryOTP");
    
                // ALERTA VISUAL PARA SABER QUE SE ENVIÓ
                alert(`Código enviado. Tu OTP de recuperación es: ${res.data.otpCode}`);

    
            } else {
                setErrorMessage(res.data.message || "Error al solicitar recuperación");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.response?.data?.message || "Error en el servidor");
        }
    };
    

    const verifyRecoveryOTP = async (e) => {
        e.preventDefault();
        
        if (!otp.trim()) {
            setErrorMessage("Por favor ingresa el código OTP");
            return;
        }

        try {
            const res = await axios.post(`${API_ENDPOINTS.server1}/api/verify-recovery-otp`, {
                email,
                token: otp
            });

            if (res.data.success) {
                setRecoveryToken(res.data.recoveryToken);
                setErrorMessage("");
                setStep("resetPassword");
            } else {
                setErrorMessage(res.data.message || "Código OTP inválido");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.response?.data?.message || "Error en el servidor");
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        
        if (!newPassword.trim() || !confirmPassword.trim()) {
            setErrorMessage("Por favor ingresa y confirma tu nueva contraseña");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        try {
            const res = await axios.post(`${API_ENDPOINTS.server1}/api/reset-password`, {
                email,
                newPassword,
                recoveryToken,
                otpToken: otp
            });

            if (res.data.success) {
                setErrorMessage("");
                setStep("login");
                setNewPassword("");
                setConfirmPassword("");
                setOtp("");
                setRecoveryToken("");
            } else {
                setErrorMessage(res.data.message || "Error al actualizar contraseña");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.response?.data?.message || "Error en el servidor");
        }
    };

    const goBackToLogin = () => {
        setStep("login");
        setErrorMessage("");
        setEmail("");
        setPassword("");
        setOtp("");
    };

    return (
        <div className="login-container">
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}

            {step === "login" && (
                <form onSubmit={handleLogin} className="login-form">
                    <h2>Iniciar Sesión</h2>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Tu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            placeholder="Tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Login</button>
                        <button type="button" className="btn-secondary" onClick={goToRegister}>
                            Registrar
                        </button>
                        <button 
                            type="button" 
                            className="btn-link"
                            onClick={handleForgotPassword}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </form>
            )}

            {step === "register" && (
                <form onSubmit={handleRegister} className="login-form">
                    <h2>Registrar Nueva Cuenta</h2>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Tu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            placeholder="Crea una contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Registrar</button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={goBackToLogin}
                        >
                            Volver a Login
                        </button>
                    </div>
                </form>
            )}

            {step === "qr" && (
                <div className="qr-container">
                    <h2>Configuración de Autenticación en Dos Pasos</h2>
                    <p>Escanea este código QR con Google Authenticator o Authy:</p>
                    <div className="qr-code">
                        <QRCodeSVG value={secretUrl} size={200} />
                    </div>
                    <p>O ingresa manualmente este código: <strong>{secretUrl.split('secret=')[1]?.split('&')[0]}</strong></p>
                    <button 
                        onClick={goBackToLogin}
                        className="btn-primary"
                    >
                        Continuar al Login
                    </button>
                </div>
            )}

            {step === "otp" && (
                <form onSubmit={verifyOTP} className="login-form">
                    <h2>Verificación en Dos Pasos</h2>
                    <p>Ingresa el código de 6 dígitos de tu aplicación de autenticación</p>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Código OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Verificar</button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={goBackToLogin}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {step === "forgotPassword" && (
                <form onSubmit={requestPasswordReset} className="login-form">
                    <h2>Recuperar Contraseña</h2>
                    <p>Ingresa tu email para recibir instrucciones</p>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Tu email registrado"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Enviar Código</button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={goBackToLogin}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {step === "verifyRecoveryOTP" && (
                <form onSubmit={verifyRecoveryOTP} className="login-form">
                    <h2>Verificación de Seguridad</h2>
                    <p>Ingresa el código de 6 dígitos que recibiste en tu email</p>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Código OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Verificar</button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={goBackToLogin}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {step === "resetPassword" && (
                <form onSubmit={resetPassword} className="login-form">
                    <h2>Nueva Contraseña</h2>
                    <div className="form-group">
                        <label>Nueva Contraseña:</label>
                        <input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña:</label>
                        <input
                            type="password"
                            placeholder="Repite tu nueva contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Actualizar Contraseña</button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={goBackToLogin}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Login;