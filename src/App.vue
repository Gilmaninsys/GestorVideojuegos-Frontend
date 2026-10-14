<template>
  <div v-if="isOffline" class="bg-[#ff003c] text-white text-center py-1 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_#ff003c] z-50 relative">
    ⚠ Conexión perdida - Modo Offline Activo - Los cambios se guardarán localmente ⚠
  </div>
  
  <RouterView />
  
  <Toaster theme="dark" class="pointer-events-auto" richColors position="bottom-right" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import { Toaster, toast } from 'vue-sonner';
import api from './config/axios';
import { useAppStore } from './stores/appStore';

const isOffline = ref(!navigator.onLine);
const appStore = useAppStore();

const updateOnlineStatus = async () => {
  isOffline.value = !navigator.onLine;
  
  if (!isOffline.value) {
    toast.info('Recuperando conexión...');
    try { await api.get('/auth/csrf-token'); } catch (error) {}
    toast.success('¡En línea! Sincronizando datos...');
    
    await appStore.syncData();
  } else {
    toast.error('Estás desconectado. Usando caché local (IndexedDB).');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      await appStore.fetchGames();
      await appStore.fetchTierLists();
    }
  }
};

onMounted(async () => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    await appStore.fetchGames();
    await appStore.fetchTierLists();
  }

  if (navigator.onLine) {
    try { await api.get('/auth/csrf-token'); } catch (error) {}
  }
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>