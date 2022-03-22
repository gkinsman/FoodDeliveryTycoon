import { useGame } from './game/game'
import { gameMinuteToEngineMs } from './game/config'

const { state } = useGame()

function generateOrder() {}

state.engine.value?.clock.schedule(() => {
  generateOrder
}, gameMinuteToEngineMs(1))
