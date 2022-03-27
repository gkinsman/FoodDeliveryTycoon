import * as ex from 'excalibur'
import { Feature, Point } from 'geojson'
import { feature } from '@turf/turf'
import mapboxgl, { GeoJSONSource } from 'mapbox-gl'

export class SpatialTransformComponent extends ex.Component<'spatialTransform'> {
  public readonly type = 'spatialTransform'

  _position: Feature<Point>
  _sourceId: string

  constructor(
    public name: string,
    private hubName: string,
    private map: mapboxgl.Map,
    private initialPosition: Feature<Point>,
    public velocity: number = 15
  ) {
    super()
    this._position = initialPosition
    this._sourceId = `${hubName}-${name}`

    map.addSource(this._sourceId, {
      type: 'geojson',
      data: this.position,
    })

    map.addLayer({
      id: this._sourceId,
      source: this._sourceId,
      type: 'symbol',
      layout: {
        'icon-image': 'rider',
        'icon-rotate': ['get', 'bearing'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    })
  }

  get position() {
    return this._position
  }

  public setPosition(position: Feature<Point>) {
    this._position = position
    const source = this.map.getSource(this._sourceId) as GeoJSONSource
    source?.setData(this._position)
  }

  public destroy() {
    this.map.removeLayer(this._sourceId)
    this.map.removeSource(this._sourceId)
  }
}
