<template>
  <v-card rounded="xl" elevation="0" class="state-empty pa-8 text-center">
    <v-icon :icon="icon" size="34" color="medium-emphasis" class="mb-3" />
    <div class="text-subtitle-1 font-weight-bold mb-1">{{ title }}</div>
    <div v-if="description" class="text-body-2 text-medium-emphasis">{{ description }}</div>

    <div v-if="$slots.actions" class="mt-4 d-flex justify-center">
      <slot name="actions" />
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi-inbox-outline',
  },
  title: {
    type: String,
    default: 'אין נתונים להצגה',
  },
  description: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.state-empty {
  border: 1px dashed rgba(var(--v-theme-divider), 0.8);
  background: rgba(var(--v-theme-surface), 0.8);
}
</style>
