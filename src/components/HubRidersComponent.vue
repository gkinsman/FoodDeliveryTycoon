<template>
  <QList>
    <QItem v-if="!hubs.length">You don't have any hubs!</QItem>

    <QExpansionItem
      :key="hub.name"
      v-for="hub in hubs"
      header-class="text-bold"
      :label="hub.name"
    >
      <QBtn
        color="green"
        @click="hireRider(map, hub)"
        label="Hire Rider"
      ></QBtn>
      <QList>
        <QItem :key="rider.id" v-for="rider in hub.riders">
          <QItemSection>{{ rider.name }}</QItemSection>
        </QItem>
      </QList>
    </QExpansionItem>
  </QList>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import { Hub } from '../Features/hub'
import { useRiders } from '../Features/riders'

const props = defineProps<{
  hubs: Hub[]
  map: mapboxgl.Map
}>()

const { hireRider } = useRiders()
</script>

<style scoped></style>
