<template>
  <PublicLayout v-if="layout === 'public'">
    <RouterView />
  </PublicLayout>

  <AuthLayout v-else-if="layout === 'auth'">
    <RouterView />
  </AuthLayout>

  <MainLayout v-else :user="user" :current-project-id="currentProjectId">
    <RouterView />
  </MainLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterView, useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import PublicLayout from './layouts/PublicLayout.vue';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const layout = computed(() => route.meta.layout ?? 'main');

// Derive current project from the active route param so sidebar links always match.
const currentProjectId = computed(() => route.params.id ?? null);

onMounted(async () => {
  try {
    await authStore.fetchMe();
  } catch {
    // If session is invalid or backend is unavailable, router guard handles access.
  }
});
</script>
