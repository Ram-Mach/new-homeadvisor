<template>
  <v-card elevation="0" class="dashboard-section-card" :class="cardClass">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2 px-5 pt-5 pb-2">
      <div>
        <div class="text-subtitle-1 font-weight-bold">{{ title }}</div>
        <div v-if="subtitle" class="text-caption text-medium-emphasis mt-1">{{ subtitle }}</div>
      </div>
      <div v-if="$slots.headerRight">
        <slot name="headerRight" />
      </div>
    </v-card-title>

    <v-card-text :class="bodyClass">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  cardClass: {
    type: [String, Array, Object],
    default: '',
  },
  bodyClass: {
    type: [String, Array, Object],
    default: 'px-5 pb-5',
  },
});
</script>

<style scoped>
.dashboard-section-card {
  border: 1px solid rgba(var(--v-theme-divider), 0.75);
  background: rgba(var(--v-theme-surface), 0.98);
}
</style>
