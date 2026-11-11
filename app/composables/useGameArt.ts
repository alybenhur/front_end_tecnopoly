// Imágenes asociadas a cada materia: casillas pixel-art del juego para las
// materias de tecnología y un ícono temático para las demás.

export interface SubjectArt {
  /** Casilla del juego (materias de tecnología, economía, etc.). */
  src?: string
  /** Ícono temático cuando ninguna casilla del juego encaja con la materia. */
  icon?: string
  color: string
}

// Reglas por palabras clave del nombre de la materia (sin tildes, en minúsculas).
// La primera regla que coincide gana: van de lo más específico a lo más general.
// Claves de 3 letras o menos deben coincidir como palabra completa (p. ej. "tic").
const SUBJECT_RULES: { keys: string[]; art: SubjectArt }[] = [
  { keys: ['program', 'codigo', 'python', 'software', 'algoritm', 'desarrollo web'], art: { src: '/img/casilla-python.webp', color: '#334155' } },
  { keys: ['robot'], art: { src: '/img/casilla-robot.webp', color: '#2fa8f5' } },
  { keys: ['electron', 'hardware', 'arquitectura de computador'], art: { src: '/img/casilla-ram.webp', color: '#2f6b3a' } },
  { keys: ['informatic', 'computa', 'sistemas', 'tecnolog', 'ofimatic', 'tic', 'tics'], art: { src: '/img/casilla-ordenador.webp', color: '#8a1c3d' } },
  { keys: ['diseno', 'impresion 3d', 'modelado'], art: { src: '/img/casilla-impresora-3d.webp', color: '#2fa8f5' } },
  { keys: ['realidad virtual', 'videojuego'], art: { src: '/img/casilla-lentes-vr.webp', color: '#2fa8f5' } },
  { keys: ['audiovisual', 'fotograf', 'multimedia', 'comunicacion'], art: { src: '/img/casilla-camara.webp', color: '#f2b705' } },
  { keys: ['finanz', 'econom', 'contab', 'emprend', 'administracion'], art: { src: '/img/casilla-tesoreria.webp', color: '#f07b16' } },
  { keys: ['biolog', 'ciencias naturales', 'ecolog', 'ambiental', 'botanic'], art: { icon: 'mdi-leaf', color: '#2e9d57' } },
  { keys: ['quimic'], art: { icon: 'mdi-flask-outline', color: '#7b3fd1' } },
  { keys: ['fisica'], art: { icon: 'mdi-atom', color: '#0b7fc1' } },
  { keys: ['matemat', 'algebra', 'calculo', 'geometr', 'aritmet', 'trigonometr'], art: { icon: 'mdi-calculator-variant-outline', color: '#e0612a' } },
  { keys: ['estadist', 'probabil'], art: { icon: 'mdi-chart-bar', color: '#e0612a' } },
  { keys: ['ingles', 'english', 'frances', 'idioma', 'lengua extranjera'], art: { icon: 'mdi-translate', color: '#c2185b' } },
  { keys: ['espanol', 'castellano', 'lenguaje', 'lengua', 'literatura', 'lectura'], art: { icon: 'mdi-book-open-page-variant-outline', color: '#d84343' } },
  { keys: ['historia'], art: { icon: 'mdi-pillar', color: '#9a6b2f' } },
  { keys: ['geograf'], art: { icon: 'mdi-earth', color: '#1e88a8' } },
  { keys: ['sociales', 'ciudadan', 'constitucion', 'democracia', 'etica', 'civica'], art: { icon: 'mdi-account-group-outline', color: '#5c6bc0' } },
  { keys: ['filosof'], art: { icon: 'mdi-head-lightbulb-outline', color: '#6d4c9f' } },
  { keys: ['religi'], art: { icon: 'mdi-hands-pray', color: '#8d6e63' } },
  { keys: ['artes', 'artistic', 'arte', 'dibujo', 'pintura'], art: { icon: 'mdi-palette-outline', color: '#e64a8f' } },
  { keys: ['music'], art: { icon: 'mdi-music-note', color: '#ad1457' } },
  { keys: ['educacion fisica', 'deporte', 'recreacion'], art: { icon: 'mdi-run', color: '#f57c00' } },
  { keys: ['salud', 'medicina', 'anatom'], art: { icon: 'mdi-heart-pulse', color: '#d32f2f' } },
  { keys: ['ciencia'], art: { icon: 'mdi-microscope', color: '#00897b' } },
]

const DEFAULT_ART: SubjectArt = { icon: 'mdi-book-open-variant', color: '#1565c0' }

function normalize(text: string) {
  // Espacios a los lados para poder buscar palabras completas.
  return ` ${text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `
}

function matches(text: string, key: string) {
  // "arte" y claves cortas: palabra completa, para no confundir "arte" con "parte".
  return key.length <= 4 ? text.includes(` ${key} `) : text.includes(key)
}

/** Imagen asociada a la materia según su nombre (la descripción sirve de respaldo). */
export function subjectArt(name?: string, description?: string): SubjectArt {
  for (const source of [name, description]) {
    if (!source) continue
    const text = normalize(source)
    // "educacion fisica" va antes que "fisica" (física la ciencia).
    if (matches(text, 'educacion fisica')) return SUBJECT_RULES.find((r) => r.keys.includes('educacion fisica'))!.art
    const rule = SUBJECT_RULES.find((r) => r.keys.some((k) => matches(text, k)))
    if (rule) return rule.art
  }
  return DEFAULT_ART
}

/** Iniciales para el avatar del usuario. */
export function initials(name?: string) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}
