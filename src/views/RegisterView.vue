<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Crear Cuenta</h2>
      <form @submit.prevent="register">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
          <input v-model="form.username" type="text" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input v-model="form.password" type="password" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" :disabled="isLoading" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50">
          {{ isLoading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <router-link to="/login" class="text-indigo-600 font-medium hover:underline">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../config/axios';

const router = useRouter();
const isLoading = ref(false);
const form = reactive({ username: '', password: '' });

const register = async () => {
  isLoading.value = true;
  try {
    await api.post('/Auth/register', form);
    alert('Cuenta creada con éxito. Ya puedes iniciar sesión.');
    router.push('/login');
  } catch (error) {
    alert(error.response?.data?.message || 'Error al registrar la cuenta');
  } finally {
    isLoading.value = false;
  }
};
</script>