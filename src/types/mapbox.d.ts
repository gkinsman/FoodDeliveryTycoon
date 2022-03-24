import * as GeoJSON from 'geojson'
import {
  Coordinates,
  DirectionsApproach,
} from '@mapbox/mapbox-sdk/lib/classes/mapi-request'

interface Route {
  /**
   * Depending on the geometries parameter this is a GeoJSON LineString or a Polyline string.
   * Depending on the overview parameter this is the complete route geometry (full), a simplified geometry
   * to the zoom level at which the route can be displayed in full (simplified), or is not included (false)
   */
  geometry: GeoJSON.LineString | GeoJSON.MultiLineString

  /**
   * String indicating which weight was used. The default is routability which is duration-based,
   * with additional penalties for less desirable maneuvers.
   */
  weight_name: string
  /**
   * Float indicating the weight in units described by weight_name
   */
  weight: number
  /**
   * Float indicating the estimated travel time in seconds.
   */
  duration: number
  /**
   * Float indicating the distance traveled in meters.
   */
  distance: number
  /**
   * String of the locale used for voice instructions. Defaults to en, and can be any accepted instruction language.
   */
  voiceLocale?: string | undefined
}

type DirectionsWaypoint = Waypoint & {
  /**
   * Custom name for the waypoint used for the arrival instruction in banners and voice instructions.
   */
  waypointName?: string | undefined
}

interface Waypoint {
  /**
   * Semicolon-separated list of  {longitude},{latitude} coordinate pairs to visit in order. There can be between 2 and 25 coordinates.
   */
  coordinates: Coordinates
  /**
   * Used to filter the road segment the waypoint will be placed on by direction and dicates the anlge of approach.
   * This option should always be used in conjunction with a `radius`. The first values is angle clockwise from true
   * north between 0 and 360, and the second is the range of degrees the angle can deviate by.
   */
  bearing?: Coordinates | undefined
  /**
   * Used to indicate how requested routes consider from which side of the road to approach a waypoint.
   * Accepts unrestricted (default) or  curb . If set to  unrestricted , the routes can approach waypoints from either side of the road.
   * If set to  curb , the route will be returned so that on arrival, the waypoint will be found on the side that corresponds with the
   * driving_side of the region in which the returned route is located. Note that the  approaches parameter influences how you arrive at a waypoint,
   * while  bearings influences how you start from a waypoint. If provided, the list of approaches must be the same length as the list of waypoints.
   * However, you can skip a coordinate and show its position in the list with the  ; separator.
   */
  approach?: DirectionsApproach | undefined
  /**
   * Maximum distance in meters that each coordinate is allowed to move when snapped to a nearby road segment.
   * There must be as many radiuses as there are coordinates in the request, each separated by ';'.
   * Values can be any number greater than 0 or the string 'unlimited'.
   * A  NoSegment error is returned if no routable road is found within the radius.
   */
  radius?: number | 'unlimited' | undefined
}

interface DirectionsResponse {
  /**
   * Array of Route objects ordered by descending recommendation rank. May contain at most two routes.
   */
  routes: Route[]
  /**
   * Array of Waypoint objects. Each waypoints is an input coordinate snapped to the road and path network.
   * The waypoints appear in the array in the order of the input coordinates.
   */
  waypoints: DirectionsWaypoint[]
  /**
   * String indicating the state of the response. This is a separate code than the HTTP status code.
   * On normal valid responses, the value will be Ok.
   */
  code: string
  uuid: string
}
