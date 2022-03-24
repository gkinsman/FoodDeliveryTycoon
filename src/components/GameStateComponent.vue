<template>
  <QCard class="col">
    <div class="q-px-md text-h6">${{ balance }}</div>

    <QTabs v-model="tab" active-color="primary" indicator-color="primary">
      <QTab name="ownedhubs" label="Owned Hubs"></QTab>
      <QTab name="riders" label="Riders"></QTab>
    </QTabs>

    <QSeparator />
    <QTabPanels v-model="tab">
      <QTabPanel name="ownedhubs">
        <div class="text-h6">Owned Hubs</div>

        <div v-if="!ownedHubs.length">You don't own any hubs!</div>

        <HubInfoComponent
          :hub="hub"
          :key="hub.name"
          :map="map"
          v-for="hub in ownedHubs"
        ></HubInfoComponent>
      </QTabPanel>

      <QTabPanel name="riders">
        <div class="text-h6">Riders</div>

        <HubRidersComponent :hubs="ownedHubs" :map="map"></HubRidersComponent>
      </QTabPanel>
    </QTabPanels>
  </QCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HubInfoComponent from './HubInfoComponent.vue'
import HubRidersComponent from './HubRidersComponent.vue'
import { useGameState } from '../Features/game-state'
import mapboxgl from 'mapbox-gl'

const props = defineProps<{
  map: mapboxgl.Map
}>()

const tab = ref('ownedhubs')

const { balance, ownedHubs } = useGameState()
</script>

<style scoped></style>
