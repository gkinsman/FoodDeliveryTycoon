import { Feature, FeatureCollection, GeoJSON, Point } from 'geojson'
import axios from 'axios'
import { Loading } from 'quasar'
import circle from '@turf/circle'
import { shallowRef } from 'vue'
import { point } from '@turf/turf'

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

  async function getRandomHouseNearRestaurant(restaurant: Point) {
    const theCircle = circle(restaurant, 200, {
      units: 'meters',
    })
    const houseIds = await geo.value.within(theCircle)

    const houses = await db.value.allDocs<GeoJSON>({
      include_docs: true,
      keys: houseIds,
      limit: 1,
    })

    const houseResult = houses.rows.find((x) => x) || null
    if (!houseResult) return
    const house = houseResult.doc as Feature

    return house
  }

  return {
    loadHouses,
    getRandomHouseNearRestaurant,
  }
}
