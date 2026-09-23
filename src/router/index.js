import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import GamesView from '../views/GamesView.vue'; // Agregamos la nueva vista

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'home',
      component: GamesView // Ahora la raíz carga el panel de juegos
    }
  ]
});

export default router;