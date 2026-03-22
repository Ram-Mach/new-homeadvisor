<template>
  <div class="state-loading d-flex flex-column align-center justify-center py-8">
    <v-progress-circular indeterminate color="primary" class="mb-3" />
    <div v-if="message" class="text-body-2 text-medium-emphasis">{{ message }}</div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'טוען נתונים...',
  },
});
</script>
