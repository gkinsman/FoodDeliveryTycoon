import { Entity } from 'excalibur'
import { SpatialTransformComponent } from './game/SpatialTransformComponent'
import { WaypointsComponent } from './game/WaypointsComponent'
import { lineString, randomPoint } from '@turf/turf'
import mapboxgl from 'mapbox-gl'
import { Feature, Point, Position } from 'geojson'
import { useGame } from './game/game'
import { Hub } from './hub'

export class RiderEntity extends Entity {
  constructor(
    public riderId: number,
    hubName: string,
    map: mapboxgl.Map,
    initialPosition: Feature<Point>
  ) {
    super(
      [
        new SpatialTransformComponent(
          `rider-${riderId}`,
          hubName,
          map,
          initialPosition
        ),
      ],
      `rider-${riderId}`
    )
  }
  public setWaypoints(waypoints: Position[]) {
    this.removeComponent(WaypointsComponent.name)
    this.addComponent(new WaypointsComponent(lineString(waypoints)))
  }

  get position() {
    const transformComponent = this.get(SpatialTransformComponent)
    return transformComponent?.position
  }
}

export function useRiders() {
  function nextRiderId(hub: Hub) {
    if (!hub.riders.length) return 1
    return (
      Math.max.apply(
        Math,
        hub.riders.map((rider) => rider.riderId)
      ) + 1
    )
  }

  function hireRider(map: mapboxgl.Map, hub: Hub) {
    const { mapScene } = useGame()

    const riderId = nextRiderId(hub)
    const initialPosition = randomPoint(1, {
      bbox: hub.feature.bbox,
    }).features[0]
    initialPosition.properties['bearing'] = 0

    const rider = new RiderEntity(riderId, hub.name, map, initialPosition)

    mapScene?.world.add(rider)

    hub.riders.push(rider)
  }

  return {
    hireRider,
  }
}
