import { Feature, FeatureCollection, Point, Polygon } from 'geojson'
import { center, featureCollection } from '@turf/turf'
import { RiderEntity } from './riders'
import { markRaw } from 'vue'

export class Hub {
  public buyPrice: number
  public sellPrice: number
  public centerPoint: Feature<Point>
  public riders: RiderEntity[]

  public hasRidersAvailable = false

  constructor(
    public name: string,
    public numberOfNearbyRestaurants: number,
    public feature: Feature<Polygon>,
    public isOwned: boolean,
    public restaurants: FeatureCollection<Polygon>
  ) {
    this.buyPrice = this.numberOfNearbyRestaurants * 10
    this.sellPrice = this.numberOfNearbyRestaurants * 5
    this.centerPoint = center(this.feature.geometry)
    this.riders = []
  }

  public static getName(id: string | number): string {
    return `hub-${id}`
  }
}
