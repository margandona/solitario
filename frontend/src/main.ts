import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

const app = createApp(App);

app.mount('#app');

// Service Worker es registrado automáticamente por vite-plugin-pwa
