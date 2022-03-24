import { computed, Ref, ref } from 'vue'
import { Hub } from './hub'
import { useGameLog } from './game-log'

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
  const { write } = useGameLog()

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

  function roundMoney(amount: number) {
    return Math.round(amount * 100) / 100
  }

  function selectHub(hub: Hub) {
    state.value.selectedHub = hub
  }

  function addMoney(amount: number, reason: string) {
    write(`You made some money! ${amount} from ${reason}`)
    state.value.money = roundMoney(state.value.money + amount)
  }

  function removeMoney(amount: number, reason: string) {
    write(`You spent some money! ${amount} for ${reason}`)
    state.value.money = roundMoney(state.value.money - amount)
  }

  return {
    balance: computed(() => state.value.money),
    ownedHubs: state.value.ownedHubs,
    discoveredHubs: state.value.discoveredHubs,
    buyHub,
    sellHub,
    selectHub,
    selectedHub: computed(() => state.value.selectedHub),
    addMoney,
    removeMoney,
  }
}
