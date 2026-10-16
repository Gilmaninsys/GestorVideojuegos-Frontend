<template>
  <div class="h-screen bg-[#050505] flex flex-col p-2 md:p-6 overflow-hidden">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-3">
      <h1 class="text-2xl md:text-3xl font-bold text-[#e0e0e0] drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]">Tier List</h1>
      <div class="flex flex-wrap gap-2 items-center">
        
        <Button @click="openHistory" variant="outline" class="h-8 text-xs sm:text-sm border-[#ffdd00] text-[#ffdd00] hover:bg-[#ffdd00] hover:text-black">
          📂 Historial / Comunidad
        </Button>

        <Dialog v-model:open="showSaveModal">
          <DialogTrigger asChild>
            <Button variant="outline" class="h-8 text-xs sm:text-sm border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-white">💾 Guardar</Button>
          </DialogTrigger>
          <DialogContent class="bg-[#111] border-[#00f3ff] text-white w-[95vw] sm:max-w-md rounded-lg p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Nombrar Tier List</DialogTitle>
              <DialogDescription class="text-gray-400 text-xs sm:text-sm">Guarda esta distribución en tu histórico.</DialogDescription>
            </DialogHeader>
            <Input v-model="tierListName" placeholder="Ej. Top 2026..." class="bg-[#0a0a0a] border-[#333] text-[#00f3ff] mt-2 sm:mt-4" @keyup.enter="saveTierList"/>
            <DialogFooter class="mt-4 flex gap-2 sm:justify-end">
              <Button @click="showSaveModal = false" variant="ghost" class="text-gray-400 w-full sm:w-auto">Cancelar</Button>
              <Button @click="saveTierList" :disabled="isSaving" class="bg-[#00f3ff] text-black hover:bg-cyan-600 w-full sm:w-auto">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="showHistoryModal">
          <DialogContent class="bg-[#111] border-[#ffdd00] text-white w-[95vw] sm:max-w-md max-h-[85vh] flex flex-col rounded-lg p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle class="text-[#ffdd00]">Historial y Comunidad</DialogTitle>
              <DialogDescription class="hidden">Selecciona un snapshot para cargarlo.</DialogDescription>
            </DialogHeader>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 space-y-3 mt-4">
              <div v-if="appStore.tierLists.length === 0" class="text-center text-gray-500 py-4 text-sm">
                No hay Tier Lists guardadas.
              </div>
              <div v-for="tl in appStore.tierLists" :key="tl.id" class="flex justify-between items-center bg-[#0a0a0a] p-2 sm:p-3 border border-[#333] rounded hover:border-[#ffdd00] relative">
                
                <span v-if="tl.syncStatus === 'pending'" class="absolute -top-2 -left-2 bg-[#ff003c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_8px_#ff003c] animate-pulse">EN ESPERA</span>

                <div class="flex flex-col w-1/2">
                  <span class="font-bold text-[#e0e0e0] text-sm truncate">{{ tl.name }}</span>
                  <span v-if="tl.isMine === false || tl.author" class="text-[10px] text-[#00f3ff]">De: {{ tl.author || 'Comunidad' }}</span>
                </div>

                <div class="flex space-x-1 sm:space-x-2 shrink-0">
                  <Button @click="loadTierList(tl)" class="h-7 text-xs bg-[#00f3ff] text-black hover:bg-cyan-600 px-2 sm:px-3">Cargar</Button>
                  <Button v-if="tl.isMine !== false || tl.syncStatus === 'pending'" @click="promptDelete(tl.id)" variant="outline" class="h-7 text-xs border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-white px-2">X</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog :open="!!tierToDelete" @update:open="(val) => { if(!val) tierToDelete = null }">
          <AlertDialogContent class="bg-[#111] border-[#ff003c] text-white sm:max-w-md w-[90vw] rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle class="text-[#ff003c]">¿Eliminar Tier List?</AlertDialogTitle>
              <AlertDialogDescription class="text-gray-400">Esta acción es irreversible. Se borrará permanentemente de tu historial.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter class="gap-2 sm:gap-0 mt-4">
              <AlertDialogCancel class="bg-transparent border-[#333] text-gray-300 hover:bg-[#333] hover:text-white">Cancelar</AlertDialogCancel>
              <Button @click="confirmDelete" class="bg-[#ff003c] text-white hover:bg-red-700">Sí, eliminar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <!-- NUEVO: Botón de Exportar (Ejemplificando requerimiento pendiente) -->
        <Button @click="exportToImage" variant="outline" class="h-8 text-xs sm:text-sm border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black">
          📸 Exportar
        </Button>

        <Button variant="ghost" @click="$router.push('/games')" class="h-8 text-xs sm:text-sm text-[#00f3ff] hover:bg-[#111]">Volver</Button>
      </div>
    </div>

    <!-- Contenedor del Tier List - AÑADIDO: ref="tierListContainer" para tomar la foto -->
    <div ref="tierListContainer" class="bg-[#111] rounded shadow-xl border border-[#333] flex-1 flex flex-col overflow-y-auto custom-scrollbar min-h-[40vh]">
      <div v-for="tier in tiers" :key="tier.name" class="flex border-b border-[#333] last:border-b-0 min-h-[85px] shrink-0">
        <div :class="[tier.color, 'w-12 sm:w-16 md:w-20 flex items-center justify-center border-r border-[#111] shrink-0']">
          <span class="text-lg sm:text-xl font-black text-black">{{ tier.name }}</span>
        </div>
        <draggable v-model="tier.items" group="games" item-key="id" @change="onDragChange($event, tier.name)" class="flex-1 p-2 flex flex-wrap gap-2 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
          <template #item="{element}">
            <div class="w-12 h-16 md:w-14 md:h-20 relative cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
              <!-- crossOrigin="anonymous" previene bloqueos de CORS al exportar imágenes externas -->
              <img :src="element.boxArtUrl" crossorigin="anonymous" class="w-full h-full object-cover rounded border border-[#333]" :title="element.title"/>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Inventario -->
    <div class="mt-4 shrink-0 h-[25vh] sm:h-[30vh] flex flex-col">
      <h2 class="text-xs sm:text-sm font-mono text-[#00f3ff] mb-2 flex justify-between items-center">
        <span>Inventario</span>
        <Button @click="resetBoard" variant="ghost" class="h-6 text-[10px] sm:text-xs text-gray-400 hover:text-white p-0 px-2">♻️ Reiniciar Tablero</Button>
      </h2>
      <div class="bg-[#111] p-2 border border-[#333] flex-1 overflow-y-auto custom-scrollbar">
        <draggable v-model="unranked" group="games" item-key="id" class="flex flex-wrap gap-2 min-h-full">
          <template #item="{element}">
            <div class="w-12 h-16 md:w-14 md:h-20 relative cursor-grab active:cursor-grabbing border border-[#555] rounded">
              <img :src="element.boxArtUrl" class="w-full h-full object-cover rounded opacity-70 hover:opacity-100" :title="element.title"/>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ref, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import { toast } from 'vue-sonner';
import localforage from 'localforage';
import html2canvas from 'html2canvas-pro'; // Importamos la librería de captura
import api from '../config/axios';
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();
const showSaveModal = ref(false);
const showHistoryModal = ref(false);
const tierListName = ref('');
const isSaving = ref(false);
const tierToDelete = ref(null);
const tierListContainer = ref(null); // Referencia al div que queremos exportar

const tiers = ref([
  { name: 'S', color: 'bg-[#ff003c]', items: [] }, 
  { name: 'A', color: 'bg-[#ff8800]', items: [] }, 
  { name: 'B', color: 'bg-[#ffdd00]', items: [] }, 
  { name: 'C', color: 'bg-[#00ff88]', items: [] }
]);
const unranked = ref([]);

// ACTUALIZACIÓN REACTIVA
watch(() => appStore.games, (newGames) => {
  unranked.value = unranked.value.map(game => {
    return newGames.find(g => g.title === game.title) || game;
  });
  
  tiers.value.forEach(t => {
    t.items = t.items.map(game => {
      return newGames.find(g => g.title === game.title) || game;
    });
  });
}, { deep: true });

const resetBoard = () => {
  tiers.value.forEach(t => t.items = []);
  unranked.value = JSON.parse(JSON.stringify(appStore.games));
};

const onDragChange = (event, newTier) => {
  if (event.added) toast.success(`Movido a Rango ${newTier}`);
};

const saveTierList = async () => {
  if (!tierListName.value.trim()) return toast.error('Ingresa un nombre');
  
  isSaving.value = true;
  
  const estructuraMapeada = tiers.value.map(t => ({ 
    tier: t.name, 
    gameIds: t.items.map(g => g.id || g.Id) 
  }));
  
  const payloadStr = JSON.stringify(estructuraMapeada);

  const saveLocally = async () => {
    const pendingTL = { id: `temp-${Date.now()}`, name: tierListName.value, datosJSON: payloadStr, syncStatus: 'pending' };
    const queue = await localforage.getItem('pendingTierLists') || [];
    queue.push(pendingTL);
    await localforage.setItem('pendingTierLists', queue);
    
    toast.success('Tier List guardada en IndexedDB (Pendiente)');
    showSaveModal.value = false;
    tierListName.value = '';
    await appStore.fetchTierLists();
  };

  if (!navigator.onLine) {
    await saveLocally();
    isSaving.value = false;
    return;
  }

  try {
    await api.post('/TierLists', { name: tierListName.value, datosJSON: payloadStr });
    toast.success('¡Tier List guardada en el servidor!');
    showSaveModal.value = false;
    tierListName.value = '';
    await appStore.fetchTierLists();
  } catch (error) {
    if (error.isOffline || error.code === 'ERR_NETWORK') await saveLocally();
    else toast.error('Error al guardar');
  } finally {
    isSaving.value = false;
  }
};

const openHistory = async () => {
  await appStore.fetchTierLists();
  showHistoryModal.value = true;
};

const loadTierList = (tierList) => {
  try {
    resetBoard();
    let datosOriginales = tierList.datosJSON || tierList.DatosJSON || tierList.datosJson;
    if (!datosOriginales) {
      toast.error('La base de datos devolvió un registro vacío.');
      return;
    }

    let estructuraGuardada;
    if (typeof datosOriginales === 'object') {
        estructuraGuardada = datosOriginales;
    } else {
        estructuraGuardada = JSON.parse(datosOriginales);
        while (typeof estructuraGuardada === 'string') {
          estructuraGuardada = JSON.parse(estructuraGuardada);
        }
    }
    
    let juegosDisponibles = JSON.parse(JSON.stringify(appStore.games));
    let juegosEncontrados = 0;
    
    const nuevosTiers = [
      { name: 'S', color: 'bg-[#ff003c]', items: [] }, 
      { name: 'A', color: 'bg-[#ff8800]', items: [] }, 
      { name: 'B', color: 'bg-[#ffdd00]', items: [] }, 
      { name: 'C', color: 'bg-[#00ff88]', items: [] }
    ];

    estructuraGuardada.forEach(guardado => {
      const tierName = guardado.tier || guardado.Tier;
      const gameIds = guardado.gameIds || guardado.GameIds || [];
      
      const tierDestino = nuevosTiers.find(t => t.name === tierName);
      if (tierDestino) {
        gameIds.forEach(gameId => {
          const targetId = String(gameId).trim();
          const gameIndex = juegosDisponibles.findIndex(g => {
              const currentId = String(g.id || g.Id).trim();
              return currentId === targetId;
          });

          if (gameIndex !== -1) {
            const game = juegosDisponibles.splice(gameIndex, 1)[0];
            tierDestino.items.push(game);
            juegosEncontrados++;
          }
        });
      }
    });

    tiers.value = nuevosTiers;
    unranked.value = juegosDisponibles;
    showHistoryModal.value = false;
    
    if (juegosEncontrados === 0) {
      toast.warning('No hubo coincidencia de IDs.');
    } else {
      toast.success(`Cargada exitosamente: ${tierList.name}`);
    }
  } catch (error) {
    toast.error('Error al reconstruir la Tier List.');
  }
};

const promptDelete = (id) => { tierToDelete.value = id; };

const confirmDelete = async () => {
  const id = tierToDelete.value;
  if (!id) return;

  if (typeof id === 'string' && id.startsWith('temp-')) {
    let queue = await localforage.getItem('pendingTierLists') || [];
    queue = queue.filter(tl => tl.id !== id);
    await localforage.setItem('pendingTierLists', queue);
    
    toast.success('Tier List pendiente eliminada de IndexedDB');
    tierToDelete.value = null;
    await appStore.fetchTierLists();
    return;
  }

  try {
    await api.delete(`/TierLists/${id}`);
    toast.success('Tier List eliminada');
    await appStore.fetchTierLists();
  } catch (error) {
    if (!error.isOffline) toast.error('Error al eliminar');
  } finally {
    tierToDelete.value = null;
  }
};

// NUEVA FUNCIÓN: Exportar el contenedor de la Tier List a PNG
const exportToImage = async () => {
  if (!tierListContainer.value) return;
  
  toast.info('Generando imagen...');
  
  try {
    const canvas = await html2canvas(tierListContainer.value, {
      useCORS: true, // Permite procesar imágenes de servidores externos si tienen cabeceras CORS
      backgroundColor: '#0a0a0a', // Mantiene el estilo oscuro
      scale: 2 // Mayor calidad
    });
    
    const imageURL = canvas.toDataURL('image/png');
    
    // Crear un enlace virtual para forzar la descarga
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = `TierList_Export_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('¡Imagen descargada!');
  } catch (error) {
    console.error("Error al exportar:", error);
    toast.error('Error al generar la imagen. Verifica las URLs de las portadas.');
  }
};

onMounted(async () => {
  await appStore.fetchGames();
  resetBoard();
});
</script>