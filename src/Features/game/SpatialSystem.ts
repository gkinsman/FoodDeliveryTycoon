import * as ex from 'excalibur'
import { SpatialTransformComponent } from './SpatialTransformComponent'
import { WaypointsComponent } from './WaypointsComponent'
import { Position } from 'geojson'
import { distance, rhumbBearing, rhumbDestination } from '@turf/turf'
import { config } from './config'

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

  public update(entities: ex.Entity[], delta: number) {
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
        waypointComponent.waypoints.geometry.coordinates.unshift()
        nextWaypoint = waypointComponent.waypoints.geometry.coordinates[0]
        distanceToNext = SpatialSystem.distanceToWaypoint(
          transformComponent.position.geometry.coordinates,
          nextWaypoint
        )
      }

      const velocity = transformComponent.velocity
      const bearing = rhumbBearing(transformComponent.position, nextWaypoint)
      const distanceToTravel = this.distanceTravelled(delta, velocity)

      const newPosition = rhumbDestination(
        transformComponent.position,
        distanceToTravel,
        bearing
      )

      newPosition.properties!['bearing'] = bearing

      transformComponent.setPosition(newPosition)
    }
  }

  distanceTravelled(delta: number, velocity: number) {
    const hoursElapsed = delta / config.msPerHour
    return hoursElapsed * velocity
  }
}
