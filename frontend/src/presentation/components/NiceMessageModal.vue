<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-icon">{{ icon }}</div>
      <h2 class="modal-title">{{ title }}</h2>
      <p class="modal-message">{{ message }}</p>
      <button class="modal-button" @click="handleClose">{{ buttonText }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show: boolean;
  type: 'start' | 'win' | 'lose' | 'info';
  message: string;
  title?: string;
  buttonText?: string;
}

interface Emits {
  (e: 'close'): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  buttonText: 'Continuar'
});

const emit = defineEmits<Emits>();

const icon = computed(() => {
  const icons: Record<string, string> = {
    start: '🃏',
    win: '🏆',
    lose: '🌸',
    info: 'ℹ️'
  };
  return icons[props.type] || '💝';
});

const title = computed(() => {
  if (props.title) return props.title;
  
  const titles: Record<string, string> = {
    start: '¡Bienvenida, Abuelita!',
    win: '¡Felicidades!',
    lose: 'Fin del Juego',
    info: 'Información'
  };
  return titles[props.type] || '';
});

function handleClose() {
  emit('close');
}

function handleOverlayClick() {
  emit('close');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  color: #2E7D32;
  margin: 0 0 16px 0;
}

.modal-message {
  font-size: 20px;
  line-height: 1.6;
  color: #424242;
  margin: 0 0 24px 0;
}

.modal-button {
  background: linear-gradient(135deg, #4caf50 0%, #2E7D32 100%);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 14px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.modal-button:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 24px;
  }

  .modal-icon {
    font-size: 48px;
  }

  .modal-title {
    font-size: 24px;
  }

  .modal-message {
    font-size: 18px;
  }

  .modal-button {
    font-size: 16px;
    padding: 12px 28px;
  }
}
</style>
