<template>
  <div class="h-screen w-full flex items-center justify-center bg-[#050505] p-4">
    <Card class="w-full max-w-md bg-[#111] border border-[#333] shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all duration-300">
      <CardHeader class="text-center space-y-2">
        <CardTitle class="text-3xl font-bold text-[#e0e0e0] drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
          {{ isLoginMode ? 'Ciber-Acceso' : 'Nuevo Registro' }}
        </CardTitle>
        <p class="text-sm text-gray-500 font-mono">
          {{ isLoginMode ? 'Identifícate en la red' : 'Crea tus credenciales de acceso' }}
        </p>
      </CardHeader>
      
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs font-mono text-[#00f3ff]">USUARIO</label>
            <Input 
              v-model="form.username" 
              required 
              placeholder="Ej. admin"
              class="bg-[#0a0a0a] border-[#333] text-[#00f3ff] focus-visible:ring-[#00f3ff]"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-mono text-[#00f3ff]">CONTRASEÑA</label>
            <Input 
              v-model="form.password" 
              type="password" 
              required 
              placeholder="••••••"
              class="bg-[#0a0a0a] border-[#333] text-[#00f3ff] focus-visible:ring-[#00f3ff]"
            />
          </div>

          <Button 
            type="submit" 
            :disabled="isLoading"
            class="w-full bg-transparent border text-bold mt-4 transition-all"
            :class="isLoginMode ? 'border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black shadow-[0_0_10px_rgba(0,255,136,0.2)]'"
          >
            <span v-if="isLoading">Procesando...</span>
            <span v-else>{{ isLoginMode ? 'ENTRAR' : 'REGISTRARSE' }}</span>
          </Button>
        </form>

        <!-- Botón Alternador -->
        <p class="text-xs text-gray-500 font-mono mt-6 text-center">
          {{ isLoginMode ? '¿No tienes acceso?' : '¿Ya tienes credenciales?' }}
          <button type="button" @click="toggleMode" class="text-[#00f3ff] hover:underline ml-1">
            {{ isLoginMode ? 'Crear cuenta' : 'Iniciar sesión' }}
          </button>
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import api from '../config/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const router = useRouter();
const form = reactive({ username: '', password: '' });
const isLoading = ref(false);
const isLoginMode = ref(true);

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  form.username = '';
  form.password = '';
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    if (isLoginMode.value) {
      await api.post('/Auth/login', form);
      toast.success('Acceso concedido');
      router.push('/games');
    } else {
      await api.post('/Auth/register', form);
      toast.success('Cuenta creada exitosamente. Iniciando sesión...');
      // Auto-login después de registrarse
      await api.post('/Auth/login', form);
      router.push('/games');
    }
  } catch (error) {
    if (isLoginMode.value) {
      toast.error('Acceso denegado. Verifica tus credenciales.');
    } else {
      toast.error(error.response?.data?.message || 'Error al registrar la cuenta.');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>