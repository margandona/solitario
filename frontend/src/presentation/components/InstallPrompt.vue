<template>
  <Transition name="slide-up">
    <div v-if="showInstallPrompt" class="install-banner">
      <div class="banner-content">
        <div class="banner-icon">📱</div>
        <div class="banner-text">
          <h3>¡Instala Solitario!</h3>
          <p>Juega sin conexión desde tu pantalla de inicio</p>
        </div>
        <div class="banner-actions">
          <button @click="handleInstall" class="btn-install">
            Instalar
          </button>
          <button @click="handleDismiss" class="btn-dismiss">
            ✕
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showInstallPrompt = ref(false);
let deferredPrompt: any = null;

onMounted(() => {
  // Detectar si ya está instalado
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || (window.navigator as any).standalone 
    || document.referrer.includes('android-app://');

  if (isStandalone) {
    // Ya está instalado, no mostrar prompt
    return;
  }

  // Escuchar evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Esperar un poco antes de mostrar (mejor UX)
    setTimeout(() => {
      showInstallPrompt.value = true;
    }, 5000);
  });

  // Escuchar cuando se instala
  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false;
    deferredPrompt = null;
    console.log('✅ PWA instalada exitosamente');
  });
});

async function handleInstall() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('✅ Usuario aceptó instalar');
  } else {
    console.log('❌ Usuario rechazó instalar');
  }
  
  deferredPrompt = null;
  showInstallPrompt.value = false;
}

function handleDismiss() {
  showInstallPrompt.value = false;
  
  // Guardar en localStorage para no volver a mostrar hoy
  localStorage.setItem('installPromptDismissed', new Date().toDateString());
}
</script>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
  width: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: bounce 0.5s ease;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.banner-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #2E7D32;
}

.banner-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.banner-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-install {
  background: #2E7D32;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-install:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-dismiss {
  background: transparent;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-dismiss:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

/* Animaciones */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .install-banner {
    bottom: 10px;
    width: 95%;
  }

  .banner-content {
    padding: 16px;
    gap: 12px;
  }

  .banner-icon {
    font-size: 36px;
  }

  .banner-text h3 {
    font-size: 16px;
  }

  .banner-text p {
    font-size: 13px;
  }

  .btn-install {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
