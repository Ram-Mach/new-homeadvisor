<template>
  <v-list nav density="comfortable">
    <v-list-subheader>ארגון</v-list-subheader>

    <template v-for="item in globalLinks" :key="item.title">
      <v-list-item
        v-if="canViewByRole(item.roles)"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="lg"
        color="primary"
        link
      />
    </template>

    <template v-if="currentProjectId">
      <v-divider class="my-2" />
      <v-list-subheader>פרויקט</v-list-subheader>

      <template v-for="item in projectLinks" :key="item.title">
        <v-list-item
          v-if="canViewByRole(item.roles)"
          :to="item.to(currentProjectId)"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          color="primary"
          link
        />
      </template>
    </template>
  </v-list>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  userRole: {
    type: String,
    required: true,
  },
  currentProjectId: {
    type: [String, Number],
    default: null,
  },
});

const allRoles = [
  'super_admin',
  'Homeowner',
  'Designer',
  'Architect',
  'ProjectManager',
  'Contractor',
];

const globalLinks = computed(() => [
  {
    title: 'דשבורד',
    icon: 'mdi-view-dashboard-outline',
    to: '/dashboard',
    roles: allRoles,
  },
  {
    title: 'צוות',
    icon: 'mdi-account-group-outline',
    to: '/team',
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
  },
  {
    title: 'מנוי',
    icon: 'mdi-credit-card-outline',
    to: '/subscription',
    roles: ['super_admin', 'Homeowner'],
  },
  {
    title: 'פרופיל',
    icon: 'mdi-account-circle-outline',
    to: '/profile',
    roles: allRoles,
  },
  {
    title: 'הגדרות מערכת',
    icon: 'mdi-cog-outline',
    to: '/settings',
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
  },
]);

const projectLinks = computed(() => [
  {
    title: 'דשבורד',
    icon: 'mdi-home-analytics',
    to: (id) => `/project/${id}/dashboard`,
    roles: allRoles,
  },
  {
    title: 'תקציב',
    icon: 'mdi-cash-multiple',
    to: (id) => `/project/${id}/budget`,
    roles: ['super_admin', 'Homeowner', 'Designer', 'Architect', 'ProjectManager'],
  },
  {
    title: 'הוצאות',
    icon: 'mdi-receipt-text-outline',
    to: (id) => `/project/${id}/expenses`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Contractor'],
  },
  {
    title: 'צוות פרויקט',
    icon: 'mdi-account-group-outline',
    to: (id) => `/project/${id}/team`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Designer', 'Architect'],
  },
  {
    title: "צ'אט",
    icon: 'mdi-forum-outline',
    to: (id) => `/project/${id}/chat`,
    roles: allRoles,
  },
  {
    title: 'קבצים',
    icon: 'mdi-folder-multiple-outline',
    to: (id) => `/project/${id}/files`,
    roles: allRoles,
  },
  {
    title: 'BOQ',
    icon: 'mdi-format-list-bulleted-square',
    to: (id) => `/project/${id}/boq`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Designer', 'Architect', 'Contractor'],
  },
  {
    title: 'הצעות מחיר',
    icon: 'mdi-gavel',
    to: (id) => `/project/${id}/bids`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Contractor'],
  },
  {
    title: 'הגדרות',
    icon: 'mdi-cog-outline',
    to: (id) => `/project/${id}/settings`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
  },
]);

const canViewByRole = (allowedRoles) => allowedRoles.includes(props.userRole);
</script>
