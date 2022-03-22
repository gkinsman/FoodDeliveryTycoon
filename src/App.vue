<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar square>
            <img src="./assets/just-eat.png" />
          </q-avatar>
          JET Tycoon
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <MapComponent />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar> v0.1 </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import MapComponent from './components/MapComponent.vue'
import { onMounted } from 'vue'
import { useRestaurants } from './Features/restaurants'
import { useHouses } from './Features/houses'
import { useEngine } from './engine'

onMounted(async () => {
  const { startEngine } = useEngine()

  const { loadRestaurants } = useRestaurants()
  const { loadHouses } = useHouses()

  await loadRestaurants()
  await loadHouses()
})
</script>

<style></style>
