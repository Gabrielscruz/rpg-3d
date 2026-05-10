export const DEFAULT_CHARACTER_APPEARANCE = {
  archetype: 'warrior',
  bodyBuild: 'athletic',
  skinColor: '#d6a57b',
  bodyColor: '#4c1d95',
  accentColor: '#f59e0b',
  metalColor: '#cbd5e1',
  hairStyle: 'topknot',
  hairColor: '#2b1d16',
  faceShape: 'balanced',
  eyeColor: '#7dd3fc',
  eyeSize: 1,
  jawWidth: 1,
  noseLength: 1,
}

export const DEFAULT_CHARACTER_FORM = {
  name: 'Novo Heroi',
  team: 'A',
  hp: 100,
  attack: 15,
  defense: 8,
  speed: 5,
  range: 1,
  moveRange: 4,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  rotationY: 0,
  ...DEFAULT_CHARACTER_APPEARANCE,
}

export const ARCHETYPE_OPTIONS = [
  { value: 'warrior', label: 'Guerreiro', hint: 'Escudo, postura firme e silhueta pesada.' },
  { value: 'mage', label: 'Mago', hint: 'Visual mais alto, roupa arcana e cajado.' },
  { value: 'rogue', label: 'Ladino', hint: 'Leve, agressivo e com presença furtiva.' },
  { value: 'archer', label: 'Arqueiro', hint: 'Equilibrado, preciso e com equipamento leve.' },
]

export const BODY_BUILD_OPTIONS = [
  { value: 'slim', label: 'Leve' },
  { value: 'athletic', label: 'Atletico' },
  { value: 'heavy', label: 'Robusto' },
]

export const FACE_SHAPE_OPTIONS = [
  { value: 'soft', label: 'Suave' },
  { value: 'balanced', label: 'Equilibrado' },
  { value: 'angular', label: 'Angular' },
]

export const HAIR_STYLE_OPTIONS = [
  { value: 'buzz', label: 'Raspado' },
  { value: 'short', label: 'Curto' },
  { value: 'topknot', label: 'Coque' },
  { value: 'long', label: 'Longo' },
]

export function extractAppearance(formData) {
  return {
    archetype: formData.archetype,
    bodyBuild: formData.bodyBuild,
    skinColor: formData.skinColor,
    bodyColor: formData.bodyColor,
    accentColor: formData.accentColor,
    metalColor: formData.metalColor,
    hairStyle: formData.hairStyle,
    hairColor: formData.hairColor,
    faceShape: formData.faceShape,
    eyeColor: formData.eyeColor,
    eyeSize: Number(formData.eyeSize) || 1,
    jawWidth: Number(formData.jawWidth) || 1,
    noseLength: Number(formData.noseLength) || 1,
  }
}
