<template>
  <!-- Contenedor principal con estética Dark/Cyberpunk -->
  <div class="bg-[#111] border border-[#333] rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,243,255,0.1)] flex flex-col h-full group">
    
    <!-- Contenedor de la Imagen -->
    <div class="relative h-56 w-full overflow-hidden bg-black flex items-center justify-center">
      <div v-if="game.syncStatus === 'pending'" class="absolute top-2 left-2 bg-[#ff003c] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_8px_#ff003c] z-10 animate-pulse border border-white">
        EN ESPERA
      </div>
      <img 
        v-if="game.boxArtUrl" 
        :src="game.boxArtUrl" 
        :alt="game.title" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
      />
      <span v-else class="text-gray-600 font-mono">Sin Portada</span>
      
      <!-- Botón de Favorito (Estrella) -->
      <button 
        v-if="showActions" 
        @click.stop="$emit('toggle-favorite', game)" 
        class="absolute top-2 right-2 text-2xl drop-shadow-md transition-transform hover:scale-110"
      >
        {{ game.isFavorite ? '⭐' : '☆' }}
      </button>
    </div>
    
    <!-- Contenido de la tarjeta -->
    <div class="p-4 flex flex-col flex-grow">
      <h3 class="text-lg font-bold text-[#e0e0e0] truncate" :title="game.title">{{ game.title }}</h3>
      
      <div class="flex justify-between items-center mt-2 mb-4 text-xs font-mono text-gray-400">
        <span class="bg-[#0a0a0a] px-2 py-1 rounded border border-[#333]">{{ game.category || 'Sin clasificar' }}</span>
        <span>{{ game.year || 'N/A' }}</span>
      </div>
      
      <!-- Botones de Acción Neón -->
      <div v-if="showActions" class="mt-auto flex space-x-2 pt-3 border-t border-[#333]">
        <button 
          @click.stop="$emit('edit-game', game)" 
          class="flex-1 bg-transparent border border-[#00f3ff] text-[#00f3ff] py-1.5 rounded text-sm hover:bg-[#00f3ff] hover:text-black transition-all shadow-[0_0_5px_rgba(0,243,255,0.3)]"
        >
          Editar
        </button>
        <button 
          @click.stop="$emit('delete-game', game.id)" 
          class="flex-1 bg-transparent border border-[#ff003c] text-[#ff003c] py-1.5 rounded text-sm hover:bg-[#ff003c] hover:text-white transition-all shadow-[0_0_5px_rgba(255,0,60,0.3)]"
        >
          Borrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
});

// Declaramos los eventos que esta tarjeta puede emitir hacia GamesView.vue
defineEmits(['edit-game', 'delete-game', 'toggle-favorite']);
</script>