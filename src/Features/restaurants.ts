import { Feature, FeatureCollection, GeoJSON, Point } from 'geojson'
import axios from 'axios'
import { Loading } from 'quasar'
import circle from '@turf/circle'
import { shallowRef } from 'vue'

// @ts-ignore

let db = shallowRef(new PouchDB('restaurants'))
let geo = shallowRef(db.value.geospatial())

async function recreate() {
  await db.value.destroy()
  db.value = new PouchDB('restaurants')
  geo.value = db.value.geospatial()
}

export function useRestaurants() {
  async function loadRestaurants() {
    const info = await db.value.info()
    if (info.doc_count > 0) {
      await recreate()
    }

    Loading.show({
      message: 'Loading restaurants...',
    })
    const restaurants = await axios.get<FeatureCollection>(
      '/restaurants.geojson'
    )

    await geo.value.load(restaurants.data.features)

    Loading.hide()
  }

  async function getRestaurantsWithin(
    point: Point,
    radiusMetres: number
  ): Promise<Feature[]> {
    const theCircle = circle(point, radiusMetres, {
      units: 'meters',
    })
    const restaurantIds = await geo.value.within(theCircle)

    const restaurants = await db.value.allDocs<GeoJSON>({
      include_docs: true,
      keys: restaurantIds,
    })

    return restaurants.rows.map((row) => row.doc! as Feature)
  }

  return { loadRestaurants, getRestaurantsWithin }
}
