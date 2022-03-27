import { useGame } from './game'
import { gameMinuteToEngineMs } from './config'
import { useOrders } from '../orders'
import { useGameState } from '../game-state'
import * as ex from 'excalibur'
import { useRiders } from '../riders'
import { center, feature } from '@turf/turf'
import { useMapbox } from '../data/mapbox'
import { useGameLog } from '../game-log'

function scheduleOrderCreation() {
  const { state } = useGame()

  const timer = new ex.Timer({
    fcn: async () => {
      const { generateOrder } = useOrders()
      const { ownedHubs } = useGameState()

      for (const hub of ownedHubs) {
        await generateOrder(hub)
      }
    },
    repeats: true,
    interval: 8000,
  })

  state.scene.value?.add(timer)
  timer.start()
}

function scheduleOrderAssignment() {
  const { state } = useGame()

  const timer = new ex.Timer({
    fcn: async () => {
      const { state } = useOrders()
      const { findClosestUnassignedRider } = useRiders()
      const { findRoute } = useMapbox()

      const stillUnassignedOrders = []

      for (let unassignedOrder of state.unassignedOrders) {
        const restaurantCenter = center(unassignedOrder.restaurant)
        const availableRider = findClosestUnassignedRider(
          unassignedOrder.hub,
          restaurantCenter
        )

        if (!availableRider) {
          stillUnassignedOrders.push(unassignedOrder)
          unassignedOrder.hub.hasRidersAvailable = false
          continue
        }

        unassignedOrder.hub.hasRidersAvailable = true

        const directions = await findRoute([
          availableRider.position,
          unassignedOrder.hub.centerPoint,
          center(unassignedOrder.restaurant),
          unassignedOrder.destination,
        ])
        console.log(
          `assigned order ${unassignedOrder.id} to rider ${availableRider.id}`,
          { unassignedOrder, availableRider, directions }
        )
        unassignedOrder.assignRider(availableRider)
        availableRider.setRoute(unassignedOrder, feature(directions))
      }

      state.unassignedOrders = stillUnassignedOrders
    },
    interval: 200,
    repeats: true,
  })

  state.scene.value?.add(timer)
  timer.start()
}

export function init() {
  scheduleOrderCreation()
  scheduleOrderAssignment()
}
