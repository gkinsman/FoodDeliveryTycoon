<template> 
  <QPage>
    <div class="row">
      <div class="col-md-8 map-container">
        <div id="map"></div>
      </div>
      <div class="col-md-4 offset-md-8  q-pa-md">
        <QList>
          <QItem>
            <QCheckbox @update=""></QCheckbox>
          </QItem>
        </QList>
        <div class="q-pb-md">
          <QList bordered separator >
            <QItem>
              <div>{{bounds}}</div>
            </QItem>
            <QItem>
              <div>{{selectedFeature}}</div>
            </QItem>
            <QItem>
              <div>{{mouseOver}}</div>
            </QItem>  
          </QList>
        </div>
      </div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import {computed, onMounted, Ref, ref, ShallowRef, shallowRef} from "vue";
import mapboxgl, {LngLat, LngLatBounds} from "mapbox-gl";

const mapboxToken =
  "pk.eyJ1IjoiZ2tpbnNtYW4iLCJhIjoiY2wweWJ4andpMHA0YjNlc2RwaXRheWVkeiJ9.t5YbtNYLO2rZfinEf1Qy7g";

let map: mapboxgl.Map | null = null;

const bounds = ref<LngLatBounds | null>(null)
const mouseOver = ref<any>(null)
const selectedFeature = shallowRef<any>(null)

function updateLayerVisiblity() {
  
}

onMounted(() => {
  map = new mapboxgl.Map({
    container: 'map',
    accessToken: mapboxToken,
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-0.100, 51.527],
    zoom: 15
  })
  
  map.on('load', () => {
    map?.addLayer({
      'id': 'commercial-buildings',
      'type': 'fill',
    })
    
    map?.addLayer({
      'id': 'building-hover',
      'type': 'fill',
      'source': 'composite',
      'source-layer': 'building',
      'layout': {},
      'paint': {
        'fill-color': '#fb6100',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          0.0
        ]
      }
    });

    map?.addLayer({
      'id': 'commercial-buildings',
      'filter': ['==', 'type', 'commercial'],
      'type': 'fill',
      'source': 'composite',
      'source-layer': 'building',
      'layout': {},
      'paint': {
        'fill-color': '#fb6100',
      }
    });
  })
  
  map.on('move', () => {
    bounds.value = map!.getBounds()
  })
  
  const previouslyHoveredFeature = shallowRef<any>(null)
  
  map.on('mousemove', hovered => {
    const features = map?.queryRenderedFeatures(hovered.point);
    
    const building = features?.find(f => f.layer.id === 'building')
    
    if(!building || !building.id) return
    
    if(previouslyHoveredFeature.value && previouslyHoveredFeature.value.id === building.id) return
    if(previouslyHoveredFeature.value) {
      map?.setFeatureState(previouslyHoveredFeature.value, { hover: false })
    } 
    map?.setFeatureState(building, {
      hover: true
    })

    previouslyHoveredFeature.value = building
    mouseOver.value = JSON.stringify(building)
  })
  
  
  
  map.on('click', clicked => {
    const features = map?.queryRenderedFeatures(clicked.point);
    
    const building = features?.find(f => f.layer.id === 'building')
    if(!building || !building.id) return
    
    selectedFeature.value = building
    
  })
  
});
const zoom = ref(15);
//        :url="`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`"

const log = ({ args }: { args: any }) => console.log(args);

const center = ref([47.41322, -1.219482]);
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
