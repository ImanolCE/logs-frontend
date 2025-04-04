import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Si usas React Router
import axios from "axios";
import { API_ENDPOINTS } from '../config/apiConfig';

const Home = () => {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si el usuario está autenticado, si no, redirigir al login
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }
        
                const res = await axios.get(`${API_ENDPOINTS.server1}/api/getInfo`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
        
                setUserInfo(res.data);
            } catch (error) {
                console.error("Error al obtener la información del usuario", error);
                //navigate("/login");
            }
        };
        

        fetchUserInfo();
    }, [navigate]);

    return (
        <div className="home-container">
            {userInfo ? (
                <>
                    <h1>Bienvenido, {userInfo.name}</h1>
                    <p><strong>Version de N0de:</strong> {userInfo.VersionNode}</p>
                    <p><strong>Alumno:</strong> {userInfo.alumno}</p>
                    <p><strong>Grupo:</strong> {userInfo.grupo}</p>
                    <p><strong>Grado:</strong> {userInfo.grado}</p>
                    <p><strong>Docente:</strong> {userInfo.docente}</p>
                    <p>
                        Esta aplicación te permite gestionar los logs y visualizar estadísticas
                        de manera eficiente. El botón abajo te llevará a la vista de Logs.
                    </p>
                    <button onClick={() => navigate("/logs")}>Ir a Logs</button>
                </>
            ) : (
                <p>Cargando información...</p>
            )}
        </div>
    );
};

export default Home;
