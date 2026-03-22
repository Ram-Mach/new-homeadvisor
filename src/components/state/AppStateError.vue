<template>
  <v-alert type="error" variant="tonal" class="mb-4">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3">
      <span>{{ message }}</span>
      <v-btn v-if="showRetry" size="small" variant="text" color="error" @click="$emit('retry')">{{ retryLabel }}</v-btn>
    </div>
  </v-alert>
</template>

<script setup>
defineEmits(['retry']);

defineProps({
  message: {
    type: String,
    default: 'אירעה שגיאה. נסו שוב.',
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
  retryLabel: {
    type: String,
    default: 'נסה שוב',
  },
});
</script>
