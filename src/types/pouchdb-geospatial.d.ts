declare module 'pouchdb-geospatial' {
  import type { GeoJSON } from 'geojson'

  interface TreeBulkData {
    id: string
    geojson: GeoJSON
  }

  export interface GeospatialTree {
    add(geojson: GeoJSON, id: string): Promise<void>
    load(data: TreeBulkData[]): Promise<void>
  }

  export interface PouchDBGeospatial {
    add(geojson: GeoJSON): Promise<void>
    contains(geojson: GeoJSON): Promise<void>
    coveredby(geojson: GeoJSON): Promise<void>
    covers(geojson: GeoJSON): Promise<void>
    crosses(geojson: GeoJSON): Promise<void>
    disjoint(geojson: GeoJSON): Promise<void>
    equals(geojson: GeoJSON): Promise<void>
    intersects(geojson: GeoJSON): Promise<void>
    load(geojson: GeoJSON[]): Promise<void>
    overlaps(geojson: GeoJSON): Promise<void>
    remove(geojson: GeoJSON): Promise<void>
    touches(geojson: GeoJSON): Promise<void>
    within(geojson: GeoJSON): Promise<string[]>
    rtree: GeospatialTree
  }
}
