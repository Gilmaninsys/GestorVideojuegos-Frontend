<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Bienvenido</h2>
        <p class="text-sm text-gray-500 mt-2">Inicia sesión en tu Gestor de Videojuegos</p>
      </div>

      <!-- El modificador .prevent evita que la página se recargue al enviar el formulario -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ej. admin"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="••••••"
          />
        </div>

        <!-- Mensaje de error dinámico -->
        <div v-if="errorMessage" class="text-red-500 text-sm text-center font-medium">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          <span v-if="isLoading">Verificando...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../config/axios'; // Nuestro puente seguro

const router = useRouter();

// Estado reactivo del formulario
const form = reactive({
  username: '',
  password: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Hacemos la petición POST a tu backend
    const response = await api.post('/Auth/login', form);
    
    // Si llegamos aquí, fue un 200 OK. La cookie ya se guardó sola.
    console.log(response.data.message);
    
    // Redirigimos al usuario a la pantalla principal de juegos
    router.push('/');
  } catch (error) {
    // Capturamos el 401 Unauthorized que configuramos en C#
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'Usuario o contraseña incorrectos.';
    } else {
      errorMessage.value = 'No se pudo conectar con el servidor.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>