import axios from 'axios';

// 1. Instancia base de Axios
const api = axios.create({
  // Ajustamos el puerto al 7036 que es donde corre nuestra API de C#
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7036/api',
  
  // OBLIGATORIO: Permite enviar y recibir cookies (como tu JWT HttpOnly)
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 2. Interceptor para inyectar el Token Anti-CSRF
api.interceptors.request.use((config) => {
  // Solo inyectamos el header en peticiones que modifican datos (POST, PUT, DELETE, PATCH)
  const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
  
  if (methodsRequiringCsrf.includes(config.method)) {
    // Leemos la cookie XSRF-TOKEN que el backend enviará
    const csrfCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
      
    if (csrfCookie) {
      const csrfToken = decodeURIComponent(csrfCookie.split('=')[1]);
      // Inyectamos el header obligatorio según los lineamientos del proyecto
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Interceptor genérico de respuestas (útil para capturar el 401 Unauthorized globalmente)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Aquí puedes agregar la lógica para redirigir al login o limpiar estado
      console.warn("Sesión expirada o no autorizada.");
    }
    return Promise.reject(error);
  }
);

export default api;