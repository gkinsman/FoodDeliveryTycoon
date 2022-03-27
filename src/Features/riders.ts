import { Entity } from 'excalibur'
import { SpatialTransformComponent } from './game/SpatialTransformComponent'
import { WaypointsComponent } from './game/WaypointsComponent'
import { center, featureCollection, nearestPoint } from '@turf/turf'
import mapboxgl from 'mapbox-gl'
import { Feature, LineString, Point } from 'geojson'
import { useGame } from './game/game'
import { Hub } from './hub'
import { Order, useOrders } from './orders'
import { OrderComponent } from './game/OrderComponent'
import { NeedsPaymentComponent } from './game/NeedsPaymentComponent'
import { useGameLog } from './game-log'

export class RiderEntity extends Entity {
  public riderId: string

  constructor(
    public id: number,
    hubName: string,
    map: mapboxgl.Map,
    initialPosition: Feature<Point>
  ) {
    super(
      [
        new SpatialTransformComponent(
          `rider-${id}`,
          hubName,
          map,
          initialPosition
        ),

        new NeedsPaymentComponent(0),
      ],
      `rider-${id}`
    )
    this.riderId = `rider-${id}`
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
    return order
  }

  get position() {
    const transformComponent = this.get(SpatialTransformComponent)!
    const position = transformComponent.position
    position.properties!['riderId'] = this.riderId
    return transformComponent.position
  }

  public fire() {
    const spatialComponent = this.get(SpatialTransformComponent)!
    this.removeComponent(spatialComponent)
    this.removeComponent('waypoints')
    spatialComponent.destroy()

    const { cancelOrder } = useOrders()
    const order = this.get(OrderComponent)
    if (order) {
      cancelOrder(order.order, 'rider was fired')
    }
  }
}

const maxNumRiders = 50

let numberOfRiders = 0

let riderNumber = 1

export function useRiders() {
  function nextRiderId(hub: Hub) {
    const newId = riderNumber
    riderNumber++
    return newId
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
    const { write } = useGameLog()

    numberOfRiders += 1
    if (numberOfRiders >= maxNumRiders) {
      write('Maximum number of riders reached!')
      return
    }

    const riderId = nextRiderId(hub)
    const initialPosition = center(hub.feature)
    initialPosition.properties!['bearing'] = 0

    const rider = new RiderEntity(riderId, hub.name, map, initialPosition)

    mapScene?.world.add(rider)

    hub.riders.push(rider)
  }

  function fireRider(map: mapboxgl.Map, hub: Hub, riderId: string) {
    const { mapScene } = useGame()

    const riderToFire = hub.riders.find((rider) => rider.riderId === riderId)

    if (!riderToFire) {
      console.log(`Could not find rider to fire ${riderId}`)
      return
    }

    hub.riders = hub.riders.filter((rider) => rider.riderId !== riderId)
    mapScene?.world.remove(riderToFire)
    riderToFire.fire()
    numberOfRiders -= 1

    const { write } = useGameLog()
    write(`Rider ${riderId} was fired!`)
  }

  return {
    hireRider,
    fireRider,
    findClosestUnassignedRider,
  }
}
