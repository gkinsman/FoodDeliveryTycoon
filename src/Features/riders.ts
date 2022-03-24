import { Entity } from 'excalibur'
import { SpatialTransformComponent } from './game/SpatialTransformComponent'
import { WaypointsComponent } from './game/WaypointsComponent'
import {
  center,
  featureCollection,
  lineString,
  nearestPoint,
  randomPoint,
} from '@turf/turf'
import mapboxgl from 'mapbox-gl'
import { Feature, LineString, Point } from 'geojson'
import { useGame } from './game/game'
import { Hub } from './hub'
import { Order } from './orders'
import { OrderComponent } from './game/OrderComponent'

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
  public setRoute(order: Order, waypoints: Feature<LineString>) {
    this.addComponent(new WaypointsComponent(waypoints))
    this.addComponent(new OrderComponent(order))
  }

  get isAssigned() {
    return this.has('waypoints')
  }

  public finishRoute() {
    this.removeComponent('waypoints')
    const orderComponent = this.get(OrderComponent)!
    const order = orderComponent.order
    this.removeComponent(orderComponent)
    console.log(`Rider ${this.riderId} finished route`)
    return order
  }

  get position() {
    const transformComponent = this.get(SpatialTransformComponent)!
    const position = transformComponent.position
    position.properties!['riderId'] = this.riderId
    return transformComponent.position
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

  function findClosestUnassignedRider(
    hub: Hub,
    from: Feature<Point>
  ): RiderEntity | null {
    if (!hub.riders.length) return null

    const unassignedRiders = hub.riders.filter((rider) => !rider.isAssigned)

    if (!unassignedRiders.length) return null

    const unassignedRiderLocations = featureCollection(
      unassignedRiders.map((rider) => rider.position)
    )

    const nearest = nearestPoint(from, unassignedRiderLocations)

    const riderId = nearest.properties!['riderId']
    return hub.riders.find((rider) => rider.riderId === riderId)!
  }

  function hireRider(map: mapboxgl.Map, hub: Hub) {
    const { mapScene } = useGame()

    const riderId = nextRiderId(hub)
    const initialPosition = center(hub.feature)
    initialPosition.properties!['bearing'] = 0

    const rider = new RiderEntity(riderId, hub.name, map, initialPosition)

    mapScene?.world.add(rider)

    hub.riders.push(rider)
  }

  return {
    hireRider,
    findClosestUnassignedRider,
  }
}
