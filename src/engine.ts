import * as ex from 'excalibur'
import type { ShallowRef } from 'vue'
import { shallowRef } from 'vue'

interface EngineState {
  engine: ShallowRef<ex.Engine | null>
}

const state: EngineState = {
  engine: shallowRef(null),
}

async function startEngine() {
  state.engine.value = new ex.Engine({
    canvasElementId: 'game',
    width: 1,
    height: 1,
  })
  await state.engine.value.start()
}

export function useEngine() {
  return {
    engine: state.engine,
    startEngine,
  }
}
