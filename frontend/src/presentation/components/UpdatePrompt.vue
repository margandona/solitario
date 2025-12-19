<template>
  <Transition name="fade">
    <div v-if="needRefresh" class="update-prompt">
      <div class="update-content">
        <div class="update-icon">🎉</div>
        <h3>¡Nueva versión disponible, Wely!</h3>
        <p>Hay mejoras y arreglos esperándote</p>
        <div class="update-actions">
          <button class="btn-update" @click="updateServiceWorker">
            ✨ Actualizar Ahora
          </button>
          <button class="btn-later" @click="closePrompt">
            Más tarde
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';

const needRefresh = ref(false);

const {
  needRefresh: swNeedRefresh,
  updateServiceWorker
} = useRegisterSW({
  onRegistered(registration) {
    console.log('✅ Service Worker registrado');
    if (registration) {
      // Check for updates every 1 hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error('❌ Error al registrar SW:', error);
  },
  onNeedRefresh() {
    console.log('🔄 Nueva versión disponible');
    needRefresh.value = true;
  },
  onOfflineReady() {
    console.log('📱 App lista para offline');
  }
});

function closePrompt() {
  needRefresh.value = false;
}

onBeforeMount(() => {
  // Sync with SW state
  if (swNeedRefresh.value) {
    needRefresh.value = true;
  }
});
</script>

<style scoped>
.update-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  max-width: 90%;
  width: 400px;
}

.update-content {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%);
  color: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.update-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
}

p {
  margin: 0 0 20px 0;
  font-size: 16px;
  opacity: 0.95;
}

.update-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-update,
.btn-later {
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-update {
  background: #FFD700;
  color: #2E7D32;
  flex: 1;
}

.btn-update:hover {
  background: #FFC107;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-later {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-later:hover {
  background: rgba(255, 255, 255, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Mobile */
@media (max-width: 480px) {
  .update-prompt {
    bottom: 10px;
    width: calc(100% - 20px);
  }

  .update-content {
    padding: 16px;
  }

  .update-icon {
    font-size: 36px;
  }

  h3 {
    font-size: 18px;
  }

  p {
    font-size: 14px;
  }

  .btn-update,
  .btn-later {
    padding: 10px 16px;
    font-size: 14px;
  }
}

/* Galaxy Fold 4 */
@media (max-width: 300px) {
  .update-content {
    padding: 12px;
  }

  h3 {
    font-size: 16px;
  }

  p {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .update-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn-update,
  .btn-later {
    width: 100%;
  }
}
</style>
