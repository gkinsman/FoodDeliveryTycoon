<template>
  <QPage>
    <canvas id="game"></canvas>
    <div class="row">
      <div class="col-md-8 map-container">
        <div id="map"></div>
      </div>
      <div class="col-md-4 offset-md-8 q-pa-md">
        <QList>
          <QItem v-for="layer in getLayers()">
            <QCheckbox
              :model-value="getLayerVisibility(layer)"
              :label="layer"
              @update:model-value="(visible) => checkboxChange(layer, visible)"
            ></QCheckbox>
          </QItem>
        </QList>
        <div class="q-pb-md">
          <QList separator>
            <QItem>
              <HubInfoComponent
                v-if="state.selectedHub"
                :hub="state.selectedHub"
                :map="theMap()"
              ></HubInfoComponent>
              <QItemSection>
                <div v-if="!state.selectedHub">No currently selected hub</div>
              </QItemSection>
            </QItem>
            <QItem>
              <GameStateComponent :map="theMap()"></GameStateComponent>
            </QItem>
          </QList>
        </div>
      </div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css'
import { computed, onMounted, Ref, ref, ShallowRef, shallowRef } from 'vue'
import mapboxgl, { LngLat, LngLatBounds } from 'mapbox-gl'
import { useLayers } from '../Features/layers'
import {
  findFirstSymbolLayerId,
  showRestaurants,
  zoomToFeature,
  selectHub,
} from '../Features/map-utils'
import { useGameState } from '../Features/game-state'
import centerOfMass from '@turf/center-of-mass'
import { useRestaurants } from '../Features/data/restaurants'
import HubInfoComponent from './HubInfoComponent.vue'
import GameStateComponent from './GameStateComponent.vue'
import { useGame } from '../Features/game/game'
import { Hub } from '../Features/hub'
import { Feature, Polygon } from 'geojson'
import { featureCollection } from '@turf/turf'

const mapboxToken =
  'pk.eyJ1IjoiZ2tpbnNtYW4iLCJhIjoiY2wweWJ4andpMHA0YjNlc2RwaXRheWVkeiJ9.t5YbtNYLO2rZfinEf1Qy7g'

let map: ShallowRef<mapboxgl.Map | null> = shallowRef(null)

const mouseOver = ref<any>(null)

const { getLayers, setLayerVisibility, getLayerVisibility } = useLayers()

const { state } = useGameState()

const checkboxChange = (layer: string, visible: boolean) => {
  setLayerVisibility(map.value!, layer, visible)
}

function theMap(): mapboxgl.Map {
  return map.value!
}

onMounted(() => {
  map.value = new mapboxgl.Map({
    container: 'map',
    accessToken: mapboxToken,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-0.1, 51.527],
    minZoom: 10,
    zoom: 15,
  })

  theMap().on('load', async () => {
    map.value?.addLayer({
      id: 'building-hover',
      type: 'fill',
      filter: ['all', ['!=', 'type', 'garage'], ['!=', 'type', 'parking']],
      source: 'composite',
      'source-layer': 'building',
      layout: {},
      paint: {
        'fill-color': '#bdbbb8',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          0.0,
        ],
      },
    })

    theMap().addLayer(
      {
        id: 'hubs',
        filter: ['any', ['==', 'type', 'garage'], ['==', 'type', 'parking']],
        type: 'fill',
        source: 'composite',
        'source-layer': 'building',
        layout: {},
        paint: {
          'fill-color': '#fb6100',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.8,
            0.6,
          ],
        },
      },
      findFirstSymbolLayerId(map.value!)
    )

    const previouslyHoveredFeature = shallowRef<any>(null)

    theMap().on('mousemove', (hovered) => {
      const hubFeatures = map.value?.queryRenderedFeatures(hovered.point, {
        layers: ['building'],
        filter: ['any', ['==', 'type', 'garage'], ['==', 'type', 'parking']],
      })
      if (!!hubFeatures?.length) theMap().getCanvas().style.cursor = 'pointer'
      else map.value!.getCanvas().style.cursor = ''

      const features = map.value!.queryRenderedFeatures(hovered.point)

      const building = features?.find((f) => f.layer.id === 'building')

      if (!building || !building.id) return

      if (
        previouslyHoveredFeature.value &&
        previouslyHoveredFeature.value.id === building.id
      )
        return
      if (previouslyHoveredFeature.value) {
        map.value!.setFeatureState(previouslyHoveredFeature.value, {
          hover: false,
        })
      }
      theMap().setFeatureState(building, {
        hover: true,
      })

      previouslyHoveredFeature.value = building
      mouseOver.value = JSON.stringify(building)
    })

    theMap().on('click', (clicked) => {
      maybeSelectHub(clicked)
    })

    const { startEngine } = useGame()

    await startEngine(theMap())
  })

  async function maybeSelectHub(clicked: mapboxgl.MapMouseEvent) {
    const features = theMap().queryRenderedFeatures(clicked.point)

    const hub = features?.find(
      (f) =>
        f.layer.id === 'building' &&
        ['garage', 'parking'].indexOf(f.properties!['type']) >= 0
    )
    // No hub found
    if (!hub || !hub.id) return

    const center = centerOfMass(hub).geometry

    const { getRestaurantsWithin } = useRestaurants()
    const restaurantFeatures = await getRestaurantsWithin(center, 1000)

    const featureColl = featureCollection(restaurantFeatures)

    const hubName = Hub.getName(hub.id)

    const isOwned = state.value.ownedHubs.some((hub) => hub.name === hubName)

    let foundHub = state.value.discoveredHubs.get(hubName)
    if (!foundHub) {
      foundHub = new Hub(
        hubName,
        restaurantFeatures.length,
        hub as Feature<Polygon>,
        isOwned,
        featureColl
      )
      state.value.discoveredHubs.set(hubName, foundHub)
    }

    await selectHub(theMap(), foundHub!)
  }
})
</script>

<style lang="scss">
.map-container {
  position: fixed;
  top: 50px;
  bottom: 50px;
  left: 0;

  & > * {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
