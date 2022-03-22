import { Feature, Point, Polygon } from 'geojson'
import { RiderEntity } from './riders'
import { Hub } from './hub'
import { useHouses } from './data/houses'
import { randomElement, randomInteger } from '../util'
import { Random } from 'excalibur'
import mapboxgl from 'mapbox-gl'

export class Order {
  constructor(
    destination: Feature<Point>,
    restaurant: Feature<Polygon>,
    value: number
  ) {
    this.rider = null
  }

  rider: RiderEntity | null

  assignRider(rider: RiderEntity) {
    this.rider = rider
  }
}

interface OrderState {
  map: mapboxgl.Map | null
}

const state: OrderState = {
  map: null,
}

export function useOrders() {
  function init(map: mapboxgl.Map) {
    state.map = map
  }

  async function generateOrder(hub: Hub): Promise<Order> {
    const { getRandomHouseNearRestaurant } = useHouses()

    const value = randomInteger(10, 50)
    const randomRestaurant = randomElement(hub.restaurants.features)
    const randomDestination = await getRandomHouseNearRestaurant(
      randomRestaurant
    )

    return new Order(randomDestination, randomRestaurant, value)
  }

  // async function

  return {
    generateOrder,
  }
}
