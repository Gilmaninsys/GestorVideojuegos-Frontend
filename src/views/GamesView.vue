<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Encabezado -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mis Videojuegos</h1>
        <button 
          @click="handleLogout" 
          class="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <!-- Formulario para agregar un juego -->
      <div class="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Agregar Nuevo Juego</h2>
        <form @submit.prevent="createGame" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <input 
            v-model="newGame.title" 
            type="text" 
            placeholder="Título del juego" 
            required
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input 
            v-model="newGame.boxArtUrl" 
            type="url" 
            placeholder="URL de la portada (http://...)" 
            required
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <label class="flex items-center space-x-2 cursor-pointer text-gray-700">
            <input 
              v-model="newGame.isFavorite" 
              type="checkbox" 
              class="rounded text-indigo-600 focus:ring-indigo-500 h-5 w-5 cursor-pointer"
            />
            <span class="font-medium">¿Es favorito?</span>
          </label>
          <button 
            type="submit" 
            :disabled="isCreating"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md shadow-sm disabled:opacity-50 transition-colors"
          >
            {{ isCreating ? 'Guardando...' : 'Guardar Juego' }}
          </button>
        </form>
      </div>

      <!-- Estado vacío (sin juegos) -->
      <div v-if="games.length === 0" class="bg-white p-12 rounded-xl shadow-sm text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900">No hay videojuegos</h3>
        <p class="mt-1">Comienza agregando tu primer juego en el formulario de arriba.</p>
      </div>

      <!-- Cuadrícula de juegos -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div v-for="game in games" :key="game.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative group">
           
           <!-- Estrella de favorito interactiva -->
           <button 
             @click="toggleFavorite(game)"
             class="absolute top-2 right-2 text-3xl drop-shadow-md z-10 focus:outline-none transform transition-transform hover:scale-110"
             :class="game.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'"
             title="Marcar/Desmarcar como favorito"
           >
             ★
           </button>
           
           <!-- Imagen de portada -->
           <img :src="game.boxArtUrl" :alt="game.title" class="w-full h-56 object-cover bg-gray-200" />
           
           <div class="p-4">
             <h3 class="text-lg font-bold text-gray-900 truncate mb-4" :title="game.title">{{ game.title }}</h3>
             
             <!-- Botón de eliminar -->
             <button 
                @click="deleteGame(game.id)"
                class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-1.5 rounded-md transition-colors text-sm border border-red-200"
             >
               Eliminar
             </button>
           </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../config/axios';

const router = useRouter();
const games = ref([]);
const isCreating = ref(false);

const newGame = reactive({
  title: '',
  boxArtUrl: '',
  isFavorite: false
});

const fetchGames = async () => {
  try {
    const response = await api.get('/Games');
    games.value = response.data;
  } catch (error) {
    if (error.response?.status === 401) router.push('/login');
  }
};

const createGame = async () => {
  isCreating.value = true;
  try {
    await api.post('/Games', newGame);
    newGame.title = '';
    newGame.boxArtUrl = '';
    newGame.isFavorite = false;
    await fetchGames();
  } catch (error) {
    console.error("Error al crear el juego:", error);
    alert("No se pudo crear el juego.");
  } finally {
    isCreating.value = false;
  }
};

// Función para alternar el estado de favorito
const toggleFavorite = async (game) => {
  try {
    const updatedGame = {
      id: game.id,
      title: game.title,
      boxArtUrl: game.boxArtUrl,
      isFavorite: !game.isFavorite // Invertimos el valor actual
    };
    
    // Hacemos el PUT al backend
    await api.put(`/Games/${game.id}`, updatedGame);
    
    // Si la petición es exitosa, actualizamos el estado local en Vue
    game.isFavorite = updatedGame.isFavorite;
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    alert("No se pudo actualizar el juego.");
  }
};

// Función para eliminar un juego
const deleteGame = async (id) => {
  // Pedimos confirmación para evitar borrados accidentales
  if (!window.confirm("¿Estás seguro de que quieres eliminar este videojuego de tu colección?")) {
    return;
  }

  try {
    // Hacemos el DELETE al backend
    await api.delete(`/Games/${id}`);
    // Recargamos la lista
    await fetchGames();
  } catch (error) {
    console.error("Error al eliminar el juego:", error);
    alert("No se pudo eliminar el juego.");
  }
};

const handleLogout = async () => {
  try {
    await api.post('/Auth/logout');
    router.push('/login');
  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
};

onMounted(() => {
  fetchGames();
});
</script>