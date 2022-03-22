<template>
  <QItem clickable @click="selectHub(props.map, hub)">
    <QItemSection side top>
      <QBtn
        v-if="!hub.isOwned"
        :disabled="!canBuy"
        text-color="green"
        @click.stop="buyHub(hub)"
        >BUY ${{ hub.buyPrice }}</QBtn
      >
      <QBtn v-if="hub.isOwned" text-color="red" @click.stop="sellHub(hub)"
        >SELL ${{ hub.sellPrice }}</QBtn
      >
    </QItemSection>

    <QItemSection header>
      <QItemLabel class="text-weight-bold">
        {{ props.hub.name }}
      </QItemLabel>
      <QItemLabel>
        <span class="text-weight-bold">
          {{ props.hub.numberOfNearbyRestaurants }}
        </span>
        available restaurants
      </QItemLabel>
    </QItemSection>
  </QItem>
</template>

<script setup lang="ts">
import { useGameState } from '../Features/game-state'
import { computed } from 'vue'
import { selectHub } from '../Features/map-utils'
import mapboxgl from 'mapbox-gl'
import { Hub } from '../Features/hub'

const props = defineProps<{
  hub: Hub
  map: mapboxgl.Map
}>()

const { buyHub, sellHub, state } = useGameState()

const canBuy = computed(() => {
  return state.value.money >= props.hub.buyPrice
})
</script>

<style scoped></style>
