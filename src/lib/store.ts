import type { Bien, Locataire, Proprietaire } from './types'

const KEYS = {
  biens: 'lbq_biens',
  locataires: 'lbq_locataires',
  proprietaire: 'lbq_proprietaire',
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export const biensStore = {
  getAll: (): Bien[] => load(KEYS.biens, []),
  save: (biens: Bien[]) => save(KEYS.biens, biens),
  add: (bien: Bien) => {
    const all = biensStore.getAll()
    biensStore.save([...all, bien])
  },
  update: (id: string, data: Partial<Bien>) => {
    const all = biensStore.getAll().map(b => b.id === id ? { ...b, ...data } : b)
    biensStore.save(all)
  },
  delete: (id: string) => {
    biensStore.save(biensStore.getAll().filter(b => b.id !== id))
  },
  getById: (id: string): Bien | undefined => biensStore.getAll().find(b => b.id === id),
}

export const locatairesStore = {
  getAll: (): Locataire[] => load(KEYS.locataires, []),
  save: (locataires: Locataire[]) => save(KEYS.locataires, locataires),
  add: (l: Locataire) => {
    const all = locatairesStore.getAll()
    locatairesStore.save([...all, l])
  },
  update: (id: string, data: Partial<Locataire>) => {
    const all = locatairesStore.getAll().map(l => l.id === id ? { ...l, ...data } : l)
    locatairesStore.save(all)
  },
  delete: (id: string) => {
    locatairesStore.save(locatairesStore.getAll().filter(l => l.id !== id))
  },
}

export const proprietaireStore = {
  get: (): Proprietaire => load(KEYS.proprietaire, {
    nom: '', prenom: '', adresse: '', codePostal: '', ville: '', signature: '',
  }),
  save: (p: Proprietaire) => save(KEYS.proprietaire, p),
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
