import { computed, ref, Ref } from 'vue'

interface GameLogState {
  messages: Ref<string[]>
}

const state: GameLogState = {
  messages: ref([]),
}

export function useGameLog() {
  function write(message: string) {
    if (state.messages.value.length > 10) {
      state.messages.value.shift()
    }
    state.messages.value.push(message)
  }

  return {
    messages: computed(() => state.messages.value),
    write,
  }
}
