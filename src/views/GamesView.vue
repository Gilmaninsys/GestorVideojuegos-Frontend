<template>
  <div class="h-screen bg-[#050505] flex flex-col p-4 md:p-6 overflow-hidden">
    
    <div class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-2xl md:text-3xl font-bold text-[#e0e0e0] drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]">Catálogo</h1>
      <div class="space-x-3 flex">
        <Button variant="outline" @click="$router.push('/tierlist')" class="border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black">Tier List</Button>
        <Button variant="outline" @click="handleLogout" class="border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-white">Salir</Button>
      </div>
    </div>

    <Card class="bg-[#111] border-[#333] mb-4 shrink-0">
      <CardContent class="p-3">
        <form @submit.prevent="saveGame" class="flex flex-col md:flex-row gap-3 items-end md:items-center">
          <Input v-model="formGame.title" placeholder="Título" required class="h-8 text-sm bg-[#0a0a0a] border-[#333] text-white focus-visible:ring-[#00f3ff]" />
          <Input v-model="formGame.boxArtUrl" placeholder="URL de portada" class="h-8 text-sm bg-[#0a0a0a] border-[#333] text-white focus-visible:ring-[#00f3ff]" />
          <div class="flex gap-3 w-full md:w-auto">
            <Input v-model="formGame.category" placeholder="Categoría" class="h-8 text-sm w-full md:w-24 bg-[#0a0a0a] border-[#333] text-white focus-visible:ring-[#00f3ff]" />
            <Input v-model.number="formGame.year" type="number" placeholder="Año" class="h-8 text-sm w-full md:w-20 bg-[#0a0a0a] border-[#333] text-white focus-visible:ring-[#00f3ff]" />
          </div>
          
          <Button type="submit" :disabled="isSaving" class="h-8 text-xs font-bold w-full md:w-auto shrink-0" :class="isEditingMode ? 'bg-[#ffdd00] hover:bg-yellow-600 text-black' : 'bg-[#00f3ff] hover:bg-cyan-600 text-black'">
            {{ isSaving ? '...' : (isEditingMode ? 'Actualizar' : 'Añadir') }}
          </Button>
          <Button v-if="isEditingMode" @click="cancelEdit" variant="ghost" class="h-8 text-xs text-gray-400">Cancelar</Button>
          
          <div class="hidden md:block w-[1px] h-6 bg-[#333] mx-2"></div>
          
          <Input v-model="searchQuery" placeholder="Buscar..." class="h-8 text-sm md:max-w-xs bg-[#0a0a0a] border-[#333] text-white focus-visible:ring-[#00f3ff]" />
          
          <Button type="button" variant="outline" @click="showOnlyFavorites = !showOnlyFavorites" class="h-8 text-xs font-bold w-full md:w-auto shrink-0 transition-colors" :class="showOnlyFavorites ? 'border-[#ffdd00] text-[#ffdd00] hover:bg-[#ffdd00] hover:text-black' : 'border-[#333] text-gray-400 hover:text-white'">
            {{ showOnlyFavorites ? '★ Viendo Favoritos' : '☆ Mostrar Favoritos' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
         <GameCard v-for="game in paginatedGames" :key="game.id" :game="game" @delete-game="promptDeleteGame" @edit-game="loadEditGame" @toggle-favorite="toggleFavorite" />
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-between items-center pt-4 border-t border-[#333] shrink-0 mt-2">
      <span class="text-xs font-mono text-gray-500">Mostrando {{ paginatedGames.length }} registros en esta página</span>
      <div class="flex space-x-4 items-center">
        <Button variant="outline" @click="prevPage" :disabled="currentPage === 1" class="h-8 border-[#333] text-gray-400 hover:text-white hover:border-[#00f3ff]">&lt; Anterior</Button>
        <span class="text-xs font-mono text-[#00f3ff]">Página {{ currentPage }} de {{ totalPages }}</span>
        <Button variant="outline" @click="nextPage" :disabled="currentPage === totalPages" class="h-8 border-[#333] text-gray-400 hover:text-white hover:border-[#00f3ff]">Siguiente &gt;</Button>
      </div>
    </div>

    <AlertDialog :open="!!gameToDelete" @update:open="(val) => { if(!val) gameToDelete = null }">
      <AlertDialogContent class="bg-[#111] border-[#ff003c] text-white sm:max-w-md w-[90vw] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle class="text-[#ff003c]">¿Eliminar Juego?</AlertDialogTitle>
          <AlertDialogDescription class="text-gray-400">Esta acción es irreversible. El juego se borrará permanentemente de tu catálogo.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter class="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel class="bg-transparent border-[#333] text-gray-300 hover:bg-[#333] hover:text-white">Cancelar</AlertDialogCancel>
          <Button @click="confirmDeleteGame" class="bg-[#ff003c] text-white hover:bg-red-700">Sí, eliminar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  </div>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ref, reactive, computed, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import localforage from 'localforage';
import api from '../config/axios';
import GameCard from '../components/GameCard.vue';
import { useAppStore } from '../stores/appStore'; 

const appStore = useAppStore(); 
const isSaving = ref(false);
const isEditingMode = ref(false);
const showOnlyFavorites = ref(false);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 20;
const gameToDelete = ref(null);

const formGame = reactive({ id: null, title: '', boxArtUrl: '', category: '', year: null, isFavorite: false });

const filteredGames = computed(() => {
  return appStore.games.filter(g => {
    const matchSearch = g.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        (g.category && g.category.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchFav = showOnlyFavorites.value ? g.isFavorite : true;
    return matchSearch && matchFav;
  });
});

const totalPages = computed(() => Math.ceil(filteredGames.value.length / itemsPerPage) || 1);
const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredGames.value.slice(start, start + itemsPerPage);
});

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

const saveGame = async () => {
  isSaving.value = true;
  
  if (!navigator.onLine) {
    const pendingGame = { ...formGame, id: `temp-${Date.now()}`, syncStatus: 'pending' };
    const pendingQueue = await localforage.getItem('pendingGames') || [];
    pendingQueue.push(pendingGame);
    await localforage.setItem('pendingGames', pendingQueue);
    
    toast.success('Juego guardado en IndexedDB (Pendiente)');
    cancelEdit();
    isSaving.value = false;
    await appStore.fetchGames(); 
    return;
  }

  try {
    if (isEditingMode.value) {
      if (typeof formGame.id === 'string' && formGame.id.startsWith('temp-')) {
        toast.error('No puedes editar un juego pendiente. Espera a que se sincronice.');
        isSaving.value = false;
        return;
      }
      await api.put(`/Games/${formGame.id}`, formGame);
      toast.success('Juego actualizado');
    } else {
      const { id, ...dataToSave } = formGame;
      dataToSave.year = dataToSave.year || 0; 
      await api.post('/Games', dataToSave);
      toast.success('Juego creado');
    }
    cancelEdit();
    await appStore.fetchGames(); 
  } catch (error) {
    if (!error.isOffline) toast.error('Error al guardar el juego');
  } finally {
    isSaving.value = false;
  }
};

const loadEditGame = (game) => {
  isEditingMode.value = true;
  Object.assign(formGame, { ...game });
};

const cancelEdit = () => {
  isEditingMode.value = false;
  Object.assign(formGame, { id: null, title: '', boxArtUrl: '', category: '', year: null, isFavorite: false });
};

const toggleFavorite = async (game) => {
  if (typeof game.id === 'string' && game.id.startsWith('temp-')) {
    toast.info('Sincroniza el juego primero para marcarlo como favorito');
    return;
  }
  try {
    game.isFavorite = !game.isFavorite; 
    await api.put(`/Games/${game.id}`, game);
    toast.success(game.isFavorite ? 'Añadido a favoritos' : 'Removido de favoritos');
    await appStore.fetchGames();
  } catch (error) {
    if (!error.isOffline) {
      game.isFavorite = !game.isFavorite; 
      toast.error('Error al actualizar favorito');
    }
  }
};

const promptDeleteGame = (id) => {
  gameToDelete.value = id;
};

const confirmDeleteGame = async () => {
  const id = gameToDelete.value;
  if (!id) return;

  if (typeof id === 'string' && id.startsWith('temp-')) {
    let pendingQueue = await localforage.getItem('pendingGames') || [];
    pendingQueue = pendingQueue.filter(g => g.id !== id);
    await localforage.setItem('pendingGames', pendingQueue);
    toast.success('Juego pendiente eliminado de IndexedDB');
    gameToDelete.value = null;
    await appStore.fetchGames();
    return;
  }
  try {
    await api.delete(`/Games/${id}`);
    toast.success('Juego eliminado');
    await appStore.fetchGames();
  } catch (error) {
    if (!error.isOffline) toast.error('Error al eliminar');
  } finally {
    gameToDelete.value = null;
  }
};

const handleLogout = async () => {
  try {
    await api.post('/Auth/logout');
    window.location.href = '/login';
  } catch (error) {
    window.location.href = '/login';
  }
};

onMounted(() => {
  appStore.fetchGames();
});
</script>