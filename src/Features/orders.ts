import { Feature, FeatureCollection, Point, Polygon } from 'geojson'
import { RiderEntity } from './riders'
import { Hub } from './hub'
import { useHouses } from './data/houses'
import { randomElement, randomInteger } from '../util'
import mapboxgl from 'mapbox-gl'
import { v4 as uuidv4 } from 'uuid'
import { useGameState } from './game-state'
import { config } from './game/config'
import { useGameLog } from './game-log'
import { center } from '@turf/turf'

export class Order {
  public id: string

  constructor(
    public hub: Hub,
    public destination: Feature<Point>,
    public restaurant: Feature<Polygon>,
    public value: number
  ) {
    this.id = uuidv4()
    this.rider = null
  }

  rider: RiderEntity | null

  assignRider(rider: RiderEntity) {
    this.rider = rider
  }
}

interface OrderState {
  map: mapboxgl.Map | null
  orders: Map<string, mapboxgl.Marker>
  unassignedOrders: Order[]
}

const state: OrderState = {
  map: null,
  orders: new Map<string, mapboxgl.Marker>(),
  unassignedOrders: [],
}

export function useOrders() {
  function init(map: mapboxgl.Map) {
    state.map = map
  }

  async function generateOrder(hub: Hub): Promise<Order> {
    const { getRandomHouseNearRestaurant } = useHouses()
    const { write } = useGameLog()

    const value = randomInteger(10, 50)
    const restaurant = randomElement(hub.restaurants.features)
    const destination = await getRandomHouseNearRestaurant(restaurant)

    const newOrder = new Order(hub, destination, restaurant, value)

    const element = document.createElement('div')
    element.className = 'marker'

    let destinationGeometry: Feature<Point>
    if (destination.geometry.type !== 'Point') {
      destinationGeometry = center(destination.geometry)
    } else {
      destinationGeometry = destination
    }

    const marker = new mapboxgl.Marker(element)
      .setLngLat(destinationGeometry.geometry.coordinates as [number, number])
      .addTo(state.map!)

    state.orders.set(newOrder.id, marker)
    state.unassignedOrders.push(newOrder)

    write(`New order for restaurant ${restaurant.properties!['name']}!`)

    return newOrder
  }

  function completeOrder(order: Order) {
    const { addMoney } = useGameState()

    removeMarker(order)
    state.orders.delete(order.id)

    const commission = config.commission * order.value
    addMoney(commission, 'commission')
  }

  function removeMarker(order: Order) {
    const marker = state.orders.get(order.id)
    if (marker) {
      marker.remove()
    }
  }

  function cancelOrder(order: Order, reason: string) {
    removeMarker(order)
    state.orders.delete(order.id)

    const { write } = useGameLog()
    write(`Order ${order.id} was cancelled because: ${reason}`)
  }

  // async function

  return {
    state,
    init,
    generateOrder,
    completeOrder,
    cancelOrder,
  }
}
