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
import { computed, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import PublicLayout from './layouts/PublicLayout.vue';

const route = useRoute();

const layout = computed(() => route.meta.layout ?? 'main');

// Mock user state — replace with auth store when backend is connected.
const user = ref({
  id: 'u-1001',
  name: 'Alex Morgan',
  role: 'Designer',
});

// Derive current project from the active route param so sidebar links always match.
const currentProjectId = computed(() => route.params.id ?? null);
</script>
