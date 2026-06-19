import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Progress {
  attention: string[]
  math: string[]
  rag: string[]
  agent: string[]
}

interface UserPreferences {
  theme: 'dark' | 'light'
  animationSpeed: 'slow' | 'normal' | 'fast'
}

interface StoreState {
  progress: Progress
  preferences: UserPreferences
  currentModule: string | null

  // Actions
  setCurrentModule: (module: string | null) => void
  markAsCompleted: (module: keyof Progress, sectionId: string) => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  resetProgress: () => void
}

const initialProgress: Progress = {
  attention: [],
  math: [],
  rag: [],
  agent: [],
}

const initialPreferences: UserPreferences = {
  theme: 'dark',
  animationSpeed: 'normal',
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      progress: initialProgress,
      preferences: initialPreferences,
      currentModule: null,

      setCurrentModule: (module) => set({ currentModule: module }),

      markAsCompleted: (module, sectionId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [module]: state.progress[module].includes(sectionId)
              ? state.progress[module]
              : [...state.progress[module], sectionId],
          },
        })),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      resetProgress: () =>
        set({
          progress: initialProgress,
          preferences: initialPreferences,
        }),
    }),
    {
      name: 'aiai-learn-storage',
    }
  )
)
