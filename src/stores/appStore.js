import { defineStore } from 'pinia';
import api from '../config/axios';
import localforage from 'localforage';
import { toast } from 'vue-sonner';

localforage.config({
  name: 'GestorVideojuegos',
  storeName: 'offline_data',
  description: 'Base de datos local para la PWA'
});

export const useAppStore = defineStore('app', {
  state: () => ({
    games: [],
    tierLists: []
  }),
  
  actions: {
    async fetchGames() {
      try {
        if (!navigator.onLine) throw { isOffline: true };
        const response = await api.get('/Games');
        
        await localforage.setItem('cachedGames', response.data);
        const pendingQueue = await localforage.getItem('pendingGames') || [];
        this.games = [...pendingQueue, ...response.data];
      } catch (error) {
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            window.location.href = '/login';
        } else {
          const pendingQueue = await localforage.getItem('pendingGames') || [];
          const cachedGames = await localforage.getItem('cachedGames') || [];
          this.games = [...pendingQueue, ...cachedGames];
        }
      }
    },

    async fetchTierLists() {
      try {
        if (!navigator.onLine) throw { isOffline: true };
        const response = await api.get('/TierLists');
        
        await localforage.setItem('cachedTierLists', response.data);
        const queue = await localforage.getItem('pendingTierLists') || [];
        this.tierLists = [...queue, ...response.data];
      } catch (error) {
        const queue = await localforage.getItem('pendingTierLists') || [];
        const cachedTierLists = await localforage.getItem('cachedTierLists') || [];
        this.tierLists = [...queue, ...cachedTierLists];
      }
    },

    async syncData() {
      if (!navigator.onLine) return;
      let syncOccurred = false;

      // 1. Sincronizar Juegos Pendientes
      let pendingGames = await localforage.getItem('pendingGames') || [];
      if (pendingGames.length > 0) {
        let stillPending = [];
        for (const game of pendingGames) {
          try {
            const { id, syncStatus, ...dataToSave } = game;
            await api.post('/Games', dataToSave);
            syncOccurred = true;
          } catch (e) { stillPending.push(game); }
        }
        if (stillPending.length === 0) await localforage.removeItem('pendingGames');
        else await localforage.setItem('pendingGames', stillPending);
      }

      // 2. Sincronizar Tier Lists Pendientes
      let pendingTL = await localforage.getItem('pendingTierLists') || [];
      if (pendingTL.length > 0) {
        let stillPendingTL = [];
        for (const tl of pendingTL) {
          try {
            const { id, syncStatus, ...dataToSave } = tl;
            await api.post('/TierLists', dataToSave);
            syncOccurred = true;
          } catch (e) { stillPendingTL.push(tl); }
        }
        if (stillPendingTL.length === 0) await localforage.removeItem('pendingTierLists');
        else await localforage.setItem('pendingTierLists', stillPendingTL);
      }

      // 3. Recargar el estado real desde el servidor
      await this.fetchGames();
      await this.fetchTierLists();
      
      if (syncOccurred) toast.success('¡Sincronización completada con éxito!');
    }
  }
});