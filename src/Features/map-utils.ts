import mapboxgl, { MapboxGeoJSONFeature } from 'mapbox-gl'
import centerOfMass from '@turf/center-of-mass'
import { useRestaurants } from './data/restaurants'
import { useGameState } from './game-state'
import { Hub } from './hub'
import { Feature, Polygon } from 'geojson'

export function findFirstSymbolLayerId(map: mapboxgl.Map): string | undefined {
  const layers = map.getStyle().layers
  if (!layers) {
    return
  }

  // Find the index of the first symbol layer in the map style.
  let firstSymbolId
  for (const layer of layers) {
    if (layer.type === 'symbol') {
      firstSymbolId = layer.id
      break
    }
  }

  return firstSymbolId
}

export async function selectHub(map: mapboxgl.Map, hub: Hub) {
  const { selectHub } = useGameState()
  await showRestaurants(map, hub)
  zoomToFeature(map, hub.feature)
  selectHub(hub)
}

export function zoomToFeature(
  map: mapboxgl.Map,
  feature: Feature<Polygon>
): void {
  const zoomTo = centerOfMass(feature).geometry.coordinates

  map.easeTo({
    zoom: 16,
    center: [zoomTo[0], zoomTo[1]],
  })
}

export async function showRestaurants(map: mapboxgl.Map, hub: Hub) {
  const sourceName = 'nearbyRestaurants'

  const center = centerOfMass(hub.feature).geometry

  const { getRestaurantsWithin } = useRestaurants()
  const features = await getRestaurantsWithin(center, 1000)

  if (map.getSource(sourceName)) {
    map.removeLayer(sourceName)
    map.removeSource(sourceName)
  }

  const source = map.addSource(sourceName, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: features,
    },
  })

  map.getLayer('123')

  const layer = map.addLayer({
    id: 'nearbyRestaurants',
    type: 'fill',
    source: sourceName,
    layout: {},
    paint: {
      'fill-color': '#0080ff',
      'fill-opacity': 0.8,
    },
  })
}
