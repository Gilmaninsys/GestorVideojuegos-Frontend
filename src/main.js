import { createApp } from 'vue'
import { createPinia } from 'pinia' // <-- NUEVO
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia() // <-- NUEVO

app.use(pinia) // <-- NUEVO
app.use(router)
app.mount('#app')