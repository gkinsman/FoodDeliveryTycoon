import * as ex from 'excalibur'
import { Feature, LineString } from 'geojson'

export class WaypointsComponent extends ex.Component<'waypoints'> {
  public readonly type = 'waypoints'

  constructor(public waypoints: Feature<LineString>) {
    super()
  }
}
