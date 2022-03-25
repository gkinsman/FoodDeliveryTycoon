<template>
  <QPage>
    <canvas id="game"></canvas>
    <div class="row">
      <div class="col-md-8 map-container">
        <div id="map"></div>
      </div>
      <div class="col-md-4 offset-md-8 q-pa-md">
        <div class="q-pb-md">
          <QList separator>
            <QExpansionItem font-weight-bold label="How To Play">
              <ol>
                <li>Find a hub on the map! Hint: they're orange.</li>
                <li>
                  Click on the hub so you can see how many restaurants it has.
                  This might take a few seconds the first time.
                </li>
                <li>
                  Buy it if you like the look of it! As soon as you buy it, the
                  orders will start coming in.
                </li>
                <li>
                  Make sure you have enough riders in the hub to support the
                  orders!
                </li>
              </ol>
            </QExpansionItem>
            <QItem>
              <HubInfoComponent
                v-if="selectedHub"
                :hub="selectedHub"
                :map="theMap()"
              ></HubInfoComponent>
              <QItemSection>
                <div v-if="!selectedHub">No currently selected hub</div>
              </QItemSection>
            </QItem>
            <QItem>
              <GameStateComponent :map="theMap()"></GameStateComponent>
            </QItem>
            <QItem> <GameLogComponent></GameLogComponent></QItem>
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
import { useOrders } from '../Features/orders'
import { useMapbox } from '../Features/data/mapbox'
import GameLogComponent from './GameLogComponent.vue'

let map: ShallowRef<mapboxgl.Map | null> = shallowRef(null)

const mouseOver = ref<any>(null)

const { getLayers, setLayerVisibility, getLayerVisibility } = useLayers()

const { selectedHub } = useGameState()

const checkboxChange = (layer: string, visible: boolean) => {
  setLayerVisibility(map.value!, layer, visible)
}

function theMap(): mapboxgl.Map {
  return map.value!
}

onMounted(() => {
  const { mapboxToken } = useMapbox()

  map.value = new mapboxgl.Map({
    container: 'map',
    accessToken: mapboxToken,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-0.1, 51.527],
    minZoom: 10,
    zoom: 15,
  })

  theMap().loadImage('rider_small.png', (err, img) => {
    if (err || !img) throw err || "Couldn't load rider image"
    theMap().addImage('rider', img)
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
    const { init } = useOrders()

    await startEngine(theMap())
    init(theMap())
  })

  async function maybeSelectHub(clicked: mapboxgl.MapMouseEvent) {
    const { ownedHubs, discoveredHubs } = useGameState()

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

    const isOwned = ownedHubs.some((hub) => hub.name === hubName)

    let foundHub = discoveredHubs.get(hubName)
    if (!foundHub) {
      foundHub = new Hub(
        hubName,
        restaurantFeatures.length,
        hub as Feature<Polygon>,
        isOwned,
        featureColl
      )
      discoveredHubs.set(hubName, foundHub)
    }

    await selectHub(theMap(), foundHub!)
  }
})
</script>

<style lang="scss">
.map-container {
  position: fixed;
  top: 50px;
  bottom: 0;
  left: 0;

  & > * {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.marker {
  background-image: url('/order.png');
  background-size: cover;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>
