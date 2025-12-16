/**
 * Sistema de Versionado de la Aplicación
 * Formato: MAJOR.MINOR.PATCH
 * 
 * MAJOR: Cambios incompatibles de API
 * MINOR: Nuevas características compatibles
 * PATCH: Correcciones de bugs
 */

export const APP_VERSION = {
  major: 1,
  minor: 1,
  patch: 0,
  full: '1.1.0',
  buildDate: new Date('2025-12-16'),
  name: 'Sonidos y Mejoras'
};

export function getVersionString(): string {
  return `v${APP_VERSION.full}`;
}

export function getFullVersionInfo(): string {
  return `${APP_VERSION.name} (${getVersionString()}) - ${APP_VERSION.buildDate.toLocaleDateString('es-ES')}`;
}

export const CHANGELOG = [
  {
    version: '1.1.0',
    date: '2025-12-16',
    changes: [
      '🔊 Sistema de sonidos con botón de silencio',
      '🎨 Diseño de cartas estilo póker con esquinas visibles',
      '📱 Optimización para pantallas desde 300px',
      '✨ Tooltips mejorados para el botón Auto',
      '🎯 Ajuste de espaciado para mejor visibilidad',
      '🔧 Configuración para deployment en Firebase'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-12-08',
    changes: [
      'Juego completo de Solitario Klondike',
      'Persistencia con Firebase Firestore',
      'Actualización optimista en tiempo real',
      'Diseño responsive para móviles',
      'Soporte desde Galaxy Fold 4',
      'PWA instalable en móvil y escritorio',
      'Orientación adaptable (vertical/horizontal)',
      'Mensajes dulces para la abuelita',
      'Drag & drop y soporte táctil'
    ]
  }
];
