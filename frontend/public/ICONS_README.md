# Generación de Iconos para PWA

## Iconos Requeridos

Para que la PWA funcione correctamente, necesitas los siguientes iconos en `public/icons/`:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Cómo Generar los Iconos

### Opción 1: Usando una herramienta online
1. Visita https://realfavicongenerator.net/
2. Sube una imagen de 512x512px con el diseño de tu icono
3. Descarga el paquete de iconos
4. Copia los archivos a la carpeta `public/icons/`

### Opción 2: Usando ImageMagick (línea de comandos)
```bash
# Desde una imagen fuente de 512x512
convert icon-source.png -resize 72x72 public/icons/icon-72x72.png
convert icon-source.png -resize 96x96 public/icons/icon-96x96.png
convert icon-source.png -resize 128x128 public/icons/icon-128x128.png
convert icon-source.png -resize 144x144 public/icons/icon-144x144.png
convert icon-source.png -resize 152x152 public/icons/icon-152x152.png
convert icon-source.png -resize 192x192 public/icons/icon-192x192.png
convert icon-source.png -resize 384x384 public/icons/icon-384x384.png
convert icon-source.png -resize 512x512 public/icons/icon-512x512.png
```

### Opción 3: Placeholder temporal (para desarrollo)
Por ahora, puedes usar iconos SVG inline o crear iconos simples con colores de la aplicación.

## Diseño Sugerido para el Icono

- Fondo: Verde (#2E7D32) - el color principal del juego
- Símbolo: Una carta de juego (corazón o diamante rojo)
- Texto: Opcional "S" grande o "♥"
- Estilo: Simple, legible, amigable

## Favicon

También necesitas un favicon en `public/`:
- favicon.ico (32x32 o 16x16)

Puedes generarlo en https://favicon.io/
