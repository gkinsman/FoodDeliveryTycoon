import { Ref, ref } from 'vue'
import { Hub } from './hub'

export interface GameState {
  discoveredHubs: Map<string, Hub>
  ownedHubs: Hub[]
  money: number
  selectedHub: Hub | null
}

const state: Ref<GameState> = ref({
  discoveredHubs: new Map(),
  ownedHubs: [],
  money: 3000,
  selectedHub: null,
})

export function useGameState() {
  function buyHub(hub: Hub) {
    if (hub.isOwned) {
      throw 'Hub is already owned'
    }

    if (state.value.money < hub.buyPrice) {
      throw 'Not enough money'
    }

    state.value.money -= hub.buyPrice
    hub.isOwned = true
    state.value.ownedHubs.push(hub)
  }
  function sellHub(hub: Hub) {
    if (!hub.isOwned) {
      throw 'Hub is not owned'
    }

    state.value.money += hub.sellPrice
    hub.isOwned = false
    state.value.ownedHubs = state.value.ownedHubs.filter(
      (ownedHub) => ownedHub !== hub
    )
  }

  function selectHub(hub: Hub) {
    state.value.selectedHub = hub
  }

  return {
    state,
    buyHub,
    sellHub,
    selectHub,
  }
}
