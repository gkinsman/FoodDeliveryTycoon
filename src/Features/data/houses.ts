import { Feature, FeatureCollection, GeoJSON, Point, Polygon } from 'geojson'
import axios from 'axios'
import { Loading } from 'quasar'
import circle from '@turf/circle'
import { shallowRef } from 'vue'
import { randomElement } from '../../util'
import { center } from '@turf/turf'

let db = shallowRef(new PouchDB('houses'))
let geo = shallowRef(db.value.geospatial())

async function recreate() {
  await db.value.destroy()
  db.value = new PouchDB('houses')
  geo.value = db.value.geospatial()
}

export function useHouses() {
  async function loadHouses() {
    const info = await db.value.info()
    if (info.doc_count > 0) {
      await recreate()
    }

    Loading.show({
      message: 'Loading houses...',
    })
    const restaurants = await axios.get<FeatureCollection>(
      '/housenumbers.geojson'
    )

    await geo.value.load(restaurants.data.features)

    Loading.hide()
  }

  async function getRandomHouseNearRestaurant(
    restaurant: Feature<Polygon>
  ): Promise<Feature<Point>> {
    const restaurantCenter = center(restaurant.geometry)
    const selectionCircle = circle(restaurantCenter, 300, {
      units: 'meters',
    })
    const houseIds = await geo.value.within(selectionCircle)

    const houses = await db.value.allDocs<GeoJSON>({
      include_docs: true,
      keys: houseIds,
      limit: 50,
    })

    return randomElement(houses.rows).doc as Feature<Point>
  }

  return {
    loadHouses,
    getRandomHouseNearRestaurant,
  }
}
