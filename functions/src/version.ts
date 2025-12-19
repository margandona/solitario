/**
 * Sistema de Versionado del Backend
 * Formato: MAJOR.MINOR.PATCH (SemVer)
 */

export const BACKEND_VERSION = {
  major: 2,
  minor: 0,
  patch: 0,
  full: '2.0.0',
  buildDate: new Date('2025-12-18'),
  name: 'API Optimizada'
};

export function getVersionString(): string {
  return `v${BACKEND_VERSION.full}`;
}

export function getFullVersionInfo() {
  return {
    version: BACKEND_VERSION.full,
    name: BACKEND_VERSION.name,
    buildDate: BACKEND_VERSION.buildDate.toISOString(),
    environment: process.env.NODE_ENV || 'production'
  };
}
