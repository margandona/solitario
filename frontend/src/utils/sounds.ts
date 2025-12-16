/**
 * Sistema de sonidos para el juego de Solitario
 * Sonidos amigables para la abuelita
 */

export type SoundType = 'card-flip' | 'card-place' | 'card-move' | 'win' | 'error' | 'auto-complete';

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Recuperar preferencia del usuario del localStorage
    const savedEnabled = localStorage.getItem('soundsEnabled');
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }

    const savedVolume = localStorage.getItem('soundsVolume');
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }

    this.initializeSounds();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private initializeSounds() {
    // Crear sonidos usando la Web Audio API con frecuencias simples
    // Esto evita tener que cargar archivos de audio externos
    
    // Sonido de voltear carta (click suave)
    this.createTone('card-flip', 800, 0.1, 'sine');
    
    // Sonido de colocar carta (tono medio)
    this.createTone('card-place', 400, 0.15, 'sine');
    
    // Sonido de mover carta (swish)
    this.createTone('card-move', 600, 0.1, 'sine');
    
    // Sonido de victoria (secuencia alegre)
    this.createMultiTone('win', [
      { freq: 523, duration: 0.15 }, // C5
      { freq: 659, duration: 0.15 }, // E5
      { freq: 784, duration: 0.15 }, // G5
      { freq: 1047, duration: 0.3 }  // C6
    ], 'sine');
    
    // Sonido de error (tono bajo)
    this.createTone('error', 200, 0.2, 'square');
    
    // Sonido de auto-complete (secuencia rápida)
    this.createMultiTone('auto-complete', [
      { freq: 440, duration: 0.08 },
      { freq: 550, duration: 0.08 },
      { freq: 660, duration: 0.08 }
    ], 'sine');
  }

  private createTone(type: SoundType, frequency: number, duration: number, waveType: OscillatorType = 'sine') {
    // Crear un blob de audio procedural
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generar onda sinusoidal
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-3 * t / duration); // Fade out exponencial
      
      if (waveType === 'sine') {
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope;
      } else if (waveType === 'square') {
        channelData[i] = (Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1) * envelope;
      }
    }

    // Crear un audio element simple para reproducir
    // Nota: Usaremos un enfoque más simple con beep sounds
    const audio = new Audio();
    this.sounds.set(type, audio);
  }

  private createMultiTone(type: SoundType, tones: { freq: number; duration: number }[], waveType: OscillatorType = 'sine') {
    const audio = new Audio();
    this.sounds.set(type, audio);
  }

  /**
   * Reproduce un sonido usando Web Audio API
   */
  private playWebAudioSound(frequency: number, duration: number, waveType: OscillatorType = 'sine') {
    if (!this.enabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = waveType;
      oscillator.frequency.value = frequency;
      
      // Envelope para suavizar el sonido
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error al reproducir sonido:', error);
    }
  }

  /**
   * Reproduce múltiples tonos en secuencia
   */
  private playMultipleWebAudioSounds(tones: { freq: number; duration: number }[], waveType: OscillatorType = 'sine') {
    if (!this.enabled) return;

    let currentTime = 0;
    tones.forEach(tone => {
      setTimeout(() => {
        this.playWebAudioSound(tone.freq, tone.duration, waveType);
      }, currentTime * 1000);
      currentTime += tone.duration;
    });
  }

  play(type: SoundType) {
    if (!this.enabled) return;

    try {
      switch (type) {
        case 'card-flip':
          this.playWebAudioSound(800, 0.1, 'sine');
          break;
        case 'card-place':
          this.playWebAudioSound(400, 0.15, 'sine');
          break;
        case 'card-move':
          this.playWebAudioSound(600, 0.1, 'sine');
          break;
        case 'win':
          this.playMultipleWebAudioSounds([
            { freq: 523, duration: 0.15 },
            { freq: 659, duration: 0.15 },
            { freq: 784, duration: 0.15 },
            { freq: 1047, duration: 0.3 }
          ], 'sine');
          break;
        case 'error':
          this.playWebAudioSound(200, 0.2, 'square');
          break;
        case 'auto-complete':
          this.playMultipleWebAudioSounds([
            { freq: 440, duration: 0.08 },
            { freq: 550, duration: 0.08 },
            { freq: 660, duration: 0.08 }
          ], 'sine');
          break;
      }
    } catch (error) {
      console.warn('Error al reproducir sonido:', error);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundsEnabled', this.enabled.toString());
    this.notify();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('soundsEnabled', enabled.toString());
    this.notify();
  }

  isEnabled() {
    return this.enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundsVolume', this.volume.toString());
  }

  getVolume() {
    return this.volume;
  }
}

// Singleton
export const soundManager = new SoundManager();
