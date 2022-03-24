import { Feature, FeatureCollection, LineString, Point } from 'geojson'
import { parse } from 'uri-template'

import mbxDirections from '@mapbox/mapbox-sdk/services/directions'
import { DirectionsResponse } from '../../types/mapbox'

const template = parse(
  'https://api.mapbox.com/directions/v5/{profile}/{coordinates}{?accessToken}'
)

const mapboxToken =
  'pk.eyJ1IjoiZ2tpbnNtYW4iLCJhIjoiY2wweWJ4andpMHA0YjNlc2RwaXRheWVkeiJ9.t5YbtNYLO2rZfinEf1Qy7g'

const directionsClient = mbxDirections({
  accessToken: mapboxToken,
})

export function useMapbox() {
  async function findRoute(waypoints: Feature<Point>[]): Promise<LineString> {
    const pointToMapboxPoint = (point: Feature<Point>) => ({
      coordinates: point.geometry.coordinates as [number, number],
    })

    const waypointsMapbox = waypoints.map(pointToMapboxPoint)

    const response = await directionsClient
      .getDirections({
        profile: 'cycling',
        geometries: 'geojson',
        waypoints: waypointsMapbox,
      })
      .send()

    const directions = response.body as DirectionsResponse
    return directions.routes[0].geometry as LineString
  }

  return {
    mapboxToken,
    findRoute,
  }
}
