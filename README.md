# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

### 2. Para el repositorio Frontend (`GestorVideojuegos-Frontend`)

Crea un archivo llamado `README.md` en la raíz de tu proyecto Vue y pega esto:

```markdown
# 🎮 Gestor de Videojuegos - Frontend PWA (Offline-First)

Aplicación web progresiva (PWA) con estética Cyberpunk para gestionar un catálogo de videojuegos y crear "Tier Lists" interactivas. Construida con una arquitectura de estado centralizado, este frontend está diseñado para funcionar sin conexión a internet y sincronizarse de forma inteligente al recuperar la red.

## 🚀 Tecnologías y Características
- **Framework:** Vue 3 (Composition API) + Vite.
- **Gestor de Estado:** Pinia (Lógica centralizada de caché y colas pendientes).
- **Modo Offline-First:** Persistencia real de datos utilizando **IndexedDB** a través de la librería `localforage`.
- **UI/UX:** Diseño basado en Shadcn UI (Vue), Tailwind CSS, y sistema de notificaciones con `vue-sonner`.
- **Interactividad:** Motor de Drag & Drop para clasificación por rangos usando `vuedraggable`.
- **Seguridad Client-Side:** Interceptores Axios configurados para lectura e inyección automática de tokens CSRF (`X-XSRF-TOKEN`), y soporte para cookies de validación `withCredentials`.

## ⚙️ Requisitos Previos
- [Node.js](https://nodejs.org/) (v18 o superior).

## 🛠️ Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone [https://github.com/Gilmaninsys/GestorVideojuegos-Frontend.git](https://github.com/Gilmaninsys/GestorVideojuegos-Frontend.git)
cd GestorVideojuegos-Frontend
2. Configurar Variables de Entorno
Crea un archivo .env en la raíz del proyecto para conectar la PWA con el servidor backend:

Fragmento de código
VITE_API_BASE_URL="https://localhost:7036/api"
3. Instalar Dependencias
Bash
npm install
4. Ejecutar el Servidor de Desarrollo
Bash
npm run dev
La aplicación estará disponible en http://localhost:5173.

🧪 Cómo probar el Modo Offline
Levanta tanto el backend como el frontend, e inicia sesión en la aplicación.

Abre las herramientas de desarrollo de tu navegador (F12) > Pestaña Network (Red) > Cambia el estrangulamiento a Offline.

Realiza operaciones en la app (añadir juegos, crear Tier Lists, marcarlos como favoritos).

Verás la alerta de desconexión y etiquetas rojas de "EN ESPERA". Todos los datos están siendo salvaguardados de forma transparente en la base de datos local (IndexedDB).

Desactiva el modo Offline. El sistema detectará la red, unirá las colas pendientes, enviará los datos al backend en segundo plano y recargará el catálogo automáticamente.
