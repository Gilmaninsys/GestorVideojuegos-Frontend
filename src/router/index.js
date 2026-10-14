import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import GamesView from '../views/GamesView.vue';
import TierListView from '../views/TierListView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' }, // Redirección automática
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/games', name: 'games', component: GamesView },
    { path: '/tierlist', name: 'tierlist', component: TierListView }
  ]
});

export default router;