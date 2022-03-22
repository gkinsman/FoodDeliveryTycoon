import { MapScene } from './MapScene'
import { shallowRef, ShallowRef } from 'vue'
import * as ex from 'excalibur'
import mapboxgl from 'mapbox-gl'
import { SpatialSystem } from './SpatialSystem'

interface EngineState {
  engine: ShallowRef<ex.Engine | null>
  scene: ShallowRef<MapScene | null>
  nextRiderId: number
}

const state: EngineState = {
  engine: shallowRef(null),
  scene: shallowRef(null),
  nextRiderId: 1,
}

export function useGame() {
  async function startEngine(map: mapboxgl.Map) {
    state.engine.value = new ex.Engine({
      canvasElementId: 'game',
      width: 1,
      height: 1,
    })

    state.scene.value = new MapScene()
    state.scene.value.world.add(new SpatialSystem())
    state.engine.value.add('map', state.scene.value)

    await state.engine.value.start()
    state.engine.value.goToScene('map')
  }

  return {
    state,
    startEngine,
    mapScene: state.scene.value,
  }
}
