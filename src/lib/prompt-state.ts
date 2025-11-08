import { atom } from 'jotai'
import { PromptState, PromptVersion } from './types'

export const promptStateAtom = atom<PromptState>({
  history: [],
  current: null,
  flow: {
    nodes: [],
    edges: []
  }
})

export const currentPromptAtom = atom(
  (get) => get(promptStateAtom).current,
  (get, set, newPrompt: PromptVersion) => {
    const state = get(promptStateAtom)
    set(promptStateAtom, {
      ...state,
      current: newPrompt,
      history: [...state.history, newPrompt]
    })
  }
)