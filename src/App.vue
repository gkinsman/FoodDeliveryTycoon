<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar square>
            <img src="./assets/logo.png" />
          </q-avatar>
          Food Delivery Tycoon
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <MapComponent />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MapComponent from './components/MapComponent.vue'
import { onMounted } from 'vue'
import { useRestaurants } from './Features/data/restaurants'
import { useHouses } from './Features/data/houses'

onMounted(async () => {
  const { loadRestaurants } = useRestaurants()
  const { loadHouses } = useHouses()

  await Promise.all([loadRestaurants(), loadHouses()])
})
</script>

<style></style>
