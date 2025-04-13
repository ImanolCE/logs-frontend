
// PRA RENDER 
/* export const API_ENDPOINTS = {
  server1: process.env.REACT_APP_API_URL || 'https://seguridad-server1.onrender.com',
  server2: process.env.REACT_APP_API_URL || 'https://seguridad-server2.onrender.com',
  // Agrega esto para desarrollo local
  local: 'http://localhost:3001'
}; */

// Configuración de API Endpoints
// Si existe variable de entorno (.env.local) la usa (modo local)
// Si no, usa las URL ya desplegadas (Render)

 
export const API_ENDPOINTS = {
  server1: process.env.REACT_APP_API_URL_SERVER1 || 'https://seguridad-server1.onrender.com',
  server2: process.env.REACT_APP_API_URL_SERVER2 || 'https://seguridad-server2.onrender.com'
};


