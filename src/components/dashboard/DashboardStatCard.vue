<template>
  <v-card elevation="0" class="dashboard-stat-card h-100">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <v-avatar :color="color" variant="tonal" size="40">
          <v-icon :icon="icon" size="20" />
        </v-avatar>
        <v-chip v-if="badgeText" :color="color" size="small" variant="tonal">{{ badgeText }}</v-chip>
      </div>

      <div class="text-h4 font-weight-bold mb-1">{{ value }}</div>
      <div class="text-body-2 text-medium-emphasis">{{ label }}</div>
      <div v-if="description" class="text-caption text-medium-emphasis mt-1">{{ description }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  badgeText: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.dashboard-stat-card {
  border: 1px solid rgba(var(--v-theme-divider), 0.75);
  background: linear-gradient(165deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-background), 0.86));
}
</style>
