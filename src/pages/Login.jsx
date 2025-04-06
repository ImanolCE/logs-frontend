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
    const [secretUrl, setSecretUrl] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("login");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim()) {
            alert("Debes ingresar un username, email y una contraseña.");
            return;
        }

        const res = await axios.post(`${API_ENDPOINTS.server1}/api/register`, {
            username,
            email,
            password,
        });
        setSecretUrl(res.data.secret);
        setStep("qr");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!username.trim() || !email.trim() || !password.trim()) {
          alert("Debes ingresar un username, email y una contraseña.");
          return;
        }
      
        try {
          // 1. Enviar datos de login
          const res = await axios.post(`${API_ENDPOINTS.server1}/api/login`, {
            username,
            email,
            password
          }, {
            //withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
      
          // Manejo mejorado de errores:
          if (res.data.success) {
            localStorage.setItem("token", res.data.token);
            if (res.data.requiresMFA) {
              setStep("otp");
            } else {
              navigate("/home");
            }
          } else {
            alert(res.data.message || "Error en la autenticación");
          }
          
          // 3. Verificar si hay token en la respuesta
          if (!res.data.token) {
            throw new Error("No se recibió token en la respuesta");
          }
      
          // 4. Guardar token
          localStorage.setItem("token", res.data.token);
      
          // 5. Verificar token con el backend
          const verifyRes = await axios.get(`${API_ENDPOINTS.server1}/api/verify-token`, {
            headers: {
              Authorization: `Bearer ${res.data.token}`
            }
          });
      
          // 6. Procesar MFA si es requerido
          if (res.data.requiresMFA) {
            setStep("otp");
          } else {
            navigate("/home");
          }
      
        } catch (error) {
          console.error("Error al hacer login:", error);
          alert(error.response?.data?.message || "Error en el servidor al iniciar sesión");
          localStorage.removeItem("token");
        }
      };
    

    const verifyOTP = async (e) => {
        e.preventDefault();

         // Validación básica
        if (!otp.trim()) {
            alert("Por favor ingresa el código OTP");
            return;
        }
    
        const token = localStorage.getItem("token");
        console.log("Token en localStorage:", token); // Verificar si el token existe

        try {
            const res = await axios.post(
                `${API_ENDPOINTS.server1}/api/verify-otp`,
                {
                  email,
                  token: otp
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

            console.log("Respuesta del servidor:", res.data); //  Verifica qué responde el backend
    
            if (res.data.success) {
                alert("Autenticado!");
                navigate("/home");

            } else {
                alert("Código inválido");
            }
        } catch (error) {
            console.error("Error en la verificación OTP", error);
            alert("Error en la autenticación");
        }
    };
    

    return (
        <div>
            {step === "login" && (
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                    <button onClick={handleRegister}>Registrar</button>
                </form>
            )}

            {step === "qr" && (
                <div>
                    <QRCodeSVG value={secretUrl} />
                    <p>Escanea este QR con Google Authenticator</p>
                    <button onClick={() => setStep("login")}>Regresar</button>
                </div>
            )}

            {step === "otp" && (
                <form onSubmit={verifyOTP}>
                    <input
                        type="text"
                        placeholder="Código OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button type="submit" >Verificar</button>
                </form>
            )}
        </div>
    );
};

export default Login;
