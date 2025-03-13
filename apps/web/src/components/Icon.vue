<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  icon: String,
})
</script>

<template>
  <span class="material-icons">{{ icon }}</span>
</template>

<style scoped>

</style>
