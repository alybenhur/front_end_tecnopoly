// Imágenes del juego (casillas pixel-art) para decorar el panel.
export const CASILLAS = [
  { src: '/img/casilla-lentes-vr.webp', color: '#2fa8f5' },
  { src: '/img/casilla-impresora-3d.webp', color: '#2fa8f5' },
  { src: '/img/casilla-monitor.webp', color: '#f2b705' },
  { src: '/img/casilla-camara.webp', color: '#f2b705' },
  { src: '/img/casilla-ordenador.webp', color: '#8a1c3d' },
  { src: '/img/casilla-ram.webp', color: '#2f6b3a' },
  { src: '/img/casilla-python.webp', color: '#334155' },
  { src: '/img/casilla-telefono.webp', color: '#b4532a' },
  { src: '/img/casilla-webcam.webp', color: '#f2b705' },
  { src: '/img/casilla-kindle.webp', color: '#2fa8f5' },
  { src: '/img/casilla-cargador.webp', color: '#f2b705' },
  { src: '/img/casilla-tesoreria.webp', color: '#f07b16' },
]

/** Casilla fija para un id (siempre la misma imagen para la misma materia). */
export function casillaFor(id: string | number | undefined) {
  const key = String(id ?? '')
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return CASILLAS[h % CASILLAS.length]!
}

/** Iniciales para el avatar del usuario. */
export function initials(name?: string) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
