/**
 * Composable para manejar pantalla completa
 * Detecta orientación landscape y activa fullscreen automáticamente
 */

import { ref, onMounted, onUnmounted } from 'vue';

export function useFullscreen() {
  const isFullscreen = ref(false);
  const isLandscape = ref(false);
  
  /**
   * Solicita pantalla completa
   */
  async function requestFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        isFullscreen.value = true;
        console.log('Pantalla completa activada');
      }
    } catch (err) {
      console.log('Pantalla completa no disponible:', err);
    }
  }
  
  /**
   * Sale de pantalla completa
   */
  async function exitFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        isFullscreen.value = false;
        console.log('Pantalla completa desactivada');
      }
    } catch (err) {
      console.log('Error al salir de pantalla completa:', err);
    }
  }
  
  /**
   * Toggle pantalla completa
   */
  async function toggleFullscreen() {
    if (isFullscreen.value) {
      await exitFullscreen();
    } else {
      await requestFullscreen();
    }
  }
  
  /**
   * Maneja cambios en el estado de fullscreen
   */
  function handleFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement;
  }
  
  /**
   * Maneja cambios de orientación
   */
  function handleOrientationChange(e: MediaQueryListEvent | MediaQueryList) {
    const wasLandscape = isLandscape.value;
    isLandscape.value = e.matches;
    
    // Solo activar fullscreen si:
    // 1. Cambió a landscape
    // 2. No está ya en fullscreen
    // 3. El navegador soporta fullscreen
    if (isLandscape.value && !wasLandscape && !isFullscreen.value) {
      // Pequeño delay para que el usuario vea el cambio
      setTimeout(() => {
        requestFullscreen();
      }, 500);
    }
  }
  
  onMounted(() => {
    // Detectar orientación actual
    const landscapeQuery = window.matchMedia('(orientation: landscape)');
    isLandscape.value = landscapeQuery.matches;
    
    // Listener para cambios de orientación
    landscapeQuery.addEventListener('change', handleOrientationChange);
    
    // Listener para cambios de fullscreen
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    onUnmounted(() => {
      landscapeQuery.removeEventListener('change', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    });
  });
  
  return {
    isFullscreen,
    isLandscape,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
