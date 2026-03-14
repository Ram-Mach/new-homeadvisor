<template>
  <v-app dir="rtl">
    <v-navigation-drawer v-model="drawer" app location="right" elevation="2">
      <div class="px-4 py-3 text-subtitle-1 font-weight-bold d-flex align-center ga-2">
        <v-icon color="primary" size="20">mdi-home-city-outline</v-icon>
        HomeAdvisor
      </div>
      <SidebarMenu
        :user-role="user.role"
        :current-project-id="currentProjectId"
      />
    </v-navigation-drawer>

    <v-app-bar app elevation="0" border="b">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-icon color="primary" class="ms-1 me-2">mdi-home-city-outline</v-icon>
      <v-toolbar-title class="font-weight-bold">{{ pageTitle }}</v-toolbar-title>
      <v-spacer />

      <!-- User avatar dropdown -->
      <v-menu min-width="200" location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn icon v-bind="menuProps">
            <v-avatar color="primary" size="34" variant="tonal">
              <span class="text-caption font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list density="compact" rounded="lg">
          <v-list-item class="mb-1">
            <v-list-item-title class="font-weight-bold">{{ user.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ roleLabel }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider class="mb-1" />
          <v-list-item :to="{ name: 'profile' }" prepend-icon="mdi-account-circle-outline" title="פרופיל" />
          <v-list-item :to="{ name: 'organization-settings' }" prepend-icon="mdi-cog-outline" title="הגדרות" />
          <v-divider class="my-1" />
          <v-list-item prepend-icon="mdi-logout" title="התנתקות" color="error" @click="onLogout" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import SidebarMenu from '../components/SidebarMenu.vue';

const route = useRoute();

const routeTitles = {
  'org-dashboard': 'דשבורד ארגוני',
  'project-planner': 'מתכנן פרויקט חדש',
  'team': 'צוות',
  'subscription': 'מנוי',
  'profile': 'פרופיל',
  'organization-settings': 'הגדרות מערכת',
  'project-dashboard': 'דשבורד פרויקט',
  'project-timeline': 'לוח זמנים',
  'project-shopping-list': 'רשימת קניות',
  'project-quality-checklist': 'בקרת איכות',
  'project-budget': 'תקציב',
  'project-expenses': 'הוצאות',
  'project-team': 'צוות פרויקט',
  'project-chat': "צ'אט",
  'project-files': 'קבצים',
  'project-boq': 'כמויות (BOQ)',
  'project-bids': 'הצעות מחיר',
  'project-settings': 'הגדרות פרויקט',
};

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  currentProjectId: {
    type: [String, Number],
    default: null,
  },
});

const drawer = ref(true);

const roleTranslations = {
  super_admin: 'מנהל על',
  Homeowner: 'בעל בית',
  Designer: 'מעצב/ת',
  Architect: 'אדריכל/ית',
  ProjectManager: 'מנהל/ת פרויקט',
  Contractor: 'קבלן/ית',
};

const roleLabel = computed(() => roleTranslations[props.user.role] || props.user.role);

const userInitials = computed(() => {
  const parts = (props.user.name || '').trim().split(' ');
  return parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0]?.[0] ?? '?';
});

const onLogout = () => {
  // Placeholder — replace with real auth store logout action.
  console.log('User logged out');
};

const pageTitle = computed(() => routeTitles[route.name] ?? 'HomeAdvisor');
</script>
