import * as ex from 'excalibur'
import { SpatialTransformComponent } from './SpatialTransformComponent'
import { WaypointsComponent } from './WaypointsComponent'
import { Position } from 'geojson'
import { distance, rhumbBearing, rhumbDestination } from '@turf/turf'
import { config } from './config'
import { RiderEntity } from '../riders'
import { useOrders } from '../orders'

export class SpatialSystem extends ex.System<
  SpatialTransformComponent | WaypointsComponent
> {
  public readonly types = ['spatialTransform'] as const

  public priority = 10

  public systemType = ex.SystemType.Update

  private static distanceToWaypoint(from: Position, to: Position) {
    return distance(from, to, {
      units: 'meters',
    })
  }

  public update(entities: RiderEntity[], delta: number) {
    const { completeOrder } = useOrders()

    for (let entity of entities) {
      const transformComponent = entity.get(SpatialTransformComponent)!
      const waypointComponent = entity.get(WaypointsComponent)!

      if (!waypointComponent) continue

      if (!waypointComponent.waypoints.geometry.coordinates.length) {
        // No waypoints
        continue
      }

      let nextWaypoint = waypointComponent.waypoints.geometry.coordinates[0]

      // if close to next waypoint, unshift last one
      let distanceToNext = SpatialSystem.distanceToWaypoint(
        transformComponent.position.geometry.coordinates,
        nextWaypoint
      )

      if (distanceToNext < 5) {
        waypointComponent.waypoints.geometry.coordinates.shift()
        nextWaypoint = waypointComponent.waypoints.geometry.coordinates[0]

        if (!nextWaypoint) {
          const completedOrder = entity.finishRoute()
          const commission = completedOrder.value * config.commission

          completeOrder(completedOrder)

          continue
        }

        distanceToNext = SpatialSystem.distanceToWaypoint(
          transformComponent.position.geometry.coordinates,
          nextWaypoint
        )
      }

      const kmh = transformComponent.velocity
      const bearing = rhumbBearing(transformComponent.position, nextWaypoint)
      const distanceToTravel = this.metersTravelled(delta, kmh)

      const newPosition = rhumbDestination(
        transformComponent.position,
        distanceToTravel,
        bearing,
        {
          units: 'meters',
        }
      )

      newPosition.properties!['bearing'] = bearing

      transformComponent.setPosition(newPosition)
    }
  }

  metersTravelled(delta: number, kilometersPerHour: number): number {
    const metersTravelled = delta * 0.1 // 15km/h assuming 1 minute = 1 hour game time

    return metersTravelled
  }
}
