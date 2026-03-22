<template>
  <v-card elevation="0" class="dashboard-hero mb-6">
    <v-card-text class="pa-6 pa-md-8">
      <div class="d-flex flex-wrap align-center justify-space-between ga-4">
        <div>
          <div v-if="overline" class="text-overline text-medium-emphasis mb-1">{{ overline }}</div>
          <div class="text-h4 font-weight-bold mb-2">{{ title }}</div>
          <div v-if="subtitle" class="text-body-1 text-medium-emphasis">{{ subtitle }}</div>
        </div>

        <div v-if="$slots.actions" class="d-flex align-center ga-2">
          <slot name="actions" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  overline: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.dashboard-hero {
  border: 1px solid rgba(var(--v-theme-divider), 0.85);
  background:
    radial-gradient(circle at 12% 18%, rgba(var(--v-theme-primary), 0.16), transparent 42%),
    radial-gradient(circle at 88% 24%, rgba(var(--v-theme-info), 0.12), transparent 38%),
    linear-gradient(145deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-primary-lighten-2), 0.32));
}

@media (max-width: 960px) {
  .dashboard-hero :deep(.v-card-text) {
    padding: 20px;
  }
}
</style>
