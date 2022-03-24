<template>
  <QList>
    <QItem dense v-for="message in reverseMessages">
      <QItemLabel :text="message"> {{ message }}</QItemLabel>
    </QItem>
  </QList>
</template>

<script setup lang="ts">
import { useGameLog } from '../Features/game-log'
import { computed } from 'vue'

const { messages } = useGameLog()

const reverseMessages = computed(() => messages.value.slice().reverse())
</script>

<style scoped></style>
