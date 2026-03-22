<template>
  <v-list nav density="comfortable">
    <v-list-subheader class="d-flex align-center justify-space-between">
      <span>ארגון</span>
      <v-btn
        v-if="currentProjectId"
        variant="text"
        icon
        size="x-small"
        @click="toggleOrgSection"
      >
        <v-icon>{{ isOrgSectionExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-list-subheader>

    <v-expand-transition>
      <div v-show="isOrgSectionExpanded">
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
      </div>
    </v-expand-transition>

    <template v-if="currentProjectId">
      <v-divider class="my-2" />
      <v-list-subheader>פרויקט</v-list-subheader>

      <div class="project-switcher-wrap">
        <v-select
          variant="underlined"
          v-model="selectedProjectId"
          :items="projectOptions"
          :loading="isLoadingProjectOptions"
          item-title="title"
          item-value="value"
          label="מעבר בין פרויקטים"
          prepend-inner-icon="mdi-swap-horizontal"
          hide-details
          class="project-switcher"
          @update:model-value="onProjectSelect"
        />
      </div>

      <template v-for="group in projectLinkGroups" :key="group.key">
        <v-list-subheader class="project-group-title">{{ group.title }}</v-list-subheader>

        <template v-for="item in group.items" :key="item.title">
          <v-list-item
            v-if="canViewByRole(item.roles)"
            :to="item.to(currentProjectId)"
            :prepend-icon="item.icon"
            :title="item.title"
            rounded="lg"
            color="primary"
            link
          >
            <template v-if="item.key === 'project-bids' && bidsCount > 0" #append>
              <v-badge
                :content="bidsCount"
                color="primary"
                inline
              />
            </template>
          </v-list-item>
        </template>

        <v-divider
          v-if="group.key !== projectLinkGroups[projectLinkGroups.length - 1].key"
          class="my-1 mx-2"
        />
      </template>
    </template>
  </v-list>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { makeRequest } from '../plugins/api';

const route = useRoute();
const router = useRouter();

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

const bidsCount = ref(0);
const isOrgSectionExpanded = ref(!props.currentProjectId);
const selectedProjectId = ref(props.currentProjectId || null);
const projectOptions = ref([]);
const isLoadingProjectOptions = ref(false);
const BIDS_COUNT_REFRESH_MS = 15000;
let bidsCountIntervalId = null;

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
    title: 'תכנון פרויקט חדש',
    icon: 'mdi-map-marker-path',
    to: '/plan-new-project',
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
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
    key: 'project-dashboard',
    title: 'דשבורד',
    icon: 'mdi-home-analytics',
    to: (id) => `/project/${id}/dashboard`,
    roles: allRoles,
  },
  {
    key: 'project-timeline',
    title: 'לוח זמנים',
    icon: 'mdi-timeline-clock-outline',
    to: (id) => `/project/${id}/timeline`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
  },
  {
    key: 'project-team',
    title: 'צוות פרויקט',
    icon: 'mdi-account-group-outline',
    to: (id) => `/project/${id}/team`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Designer', 'Architect'],
  },
  {
    key: 'project-chat',
    title: "צ'אט",
    icon: 'mdi-forum-outline',
    to: (id) => `/project/${id}/chat`,
    roles: allRoles,
  },
  {
    key: 'project-files',
    title: 'קבצים',
    icon: 'mdi-folder-multiple-outline',
    to: (id) => `/project/${id}/files`,
    roles: allRoles,
  },
  {
    key: 'project-boq',
    title: 'BOQ',
    icon: 'mdi-format-list-bulleted-square',
    to: (id) => `/project/${id}/boq`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Designer', 'Architect', 'Contractor'],
  },
  {
    key: 'project-bids',
    title: 'הצעות מחיר',
    icon: 'mdi-gavel',
    to: (id) => `/project/${id}/bids`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Contractor'],
  },
  {
    key: 'project-budget',
    title: 'תקציב',
    icon: 'mdi-cash-multiple',
    to: (id) => `/project/${id}/budget`,
    roles: ['super_admin', 'Homeowner', 'Designer', 'Architect', 'ProjectManager'],
  },
  {
    key: 'project-expenses',
    title: 'הוצאות',
    icon: 'mdi-receipt-text-outline',
    to: (id) => `/project/${id}/expenses`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager', 'Contractor'],
  },
  {
    key: 'project-shopping-list',
    title: 'רשימת קניות',
    icon: 'mdi-cart-variant',
    to: (id) => `/project/${id}/shopping-list`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
  },
  {
    key: 'project-quality',
    title: 'בקרת איכות',
    icon: 'mdi-clipboard-check-outline',
    to: (id) => `/project/${id}/quality`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
  },
  {
    key: 'project-settings',
    title: 'הגדרות',
    icon: 'mdi-cog-outline',
    to: (id) => `/project/${id}/settings`,
    roles: ['super_admin', 'Homeowner', 'ProjectManager'],
  },
]);

const projectLinkGroups = computed(() => {
  const groups = [
    {
      key: 'daily-work',
      title: 'עבודה יומית',
      linkKeys: ['project-dashboard', 'project-timeline', 'project-team'],
    },
    {
      key: 'collaboration',
      title: 'תקשורת ושיתוף',
      linkKeys: ['project-chat', 'project-files', 'project-boq', 'project-bids'],
    },
    {
      key: 'finance-control',
      title: 'כספים ובקרה',
      linkKeys: ['project-budget', 'project-expenses', 'project-shopping-list', 'project-quality'],
    },
    {
      key: 'configuration',
      title: 'הגדרות',
      linkKeys: ['project-settings'],
    },
  ];

  const linkMap = new Map(projectLinks.value.map((link) => [link.key, link]));

  return groups
    .map((group) => ({
      ...group,
      items: group.linkKeys.map((key) => linkMap.get(key)).filter(Boolean),
    }))
    .filter((group) => group.items.length > 0);
});

const canViewByRole = (allowedRoles) => allowedRoles.includes(props.userRole);

const toProjectList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const loadProjectOptions = async () => {
  isLoadingProjectOptions.value = true;

  try {
    const response = await makeRequest('/projects');
    const projects = toProjectList(response).map((project) => ({
      title: project.name || `פרויקט #${project.id}`,
      value: String(project.id),
    }));

    projectOptions.value = projects;

    if (!props.currentProjectId) {
      return;
    }

    const currentId = String(props.currentProjectId);
    const hasCurrent = projects.some((project) => project.value === currentId);
    if (hasCurrent) {
      return;
    }

    const currentResponse = await makeRequest(`/projects/${currentId}`);
    const currentProject = currentResponse?.data && !Array.isArray(currentResponse.data)
      ? currentResponse.data
      : currentResponse;

    if (currentProject?.id) {
      projectOptions.value = [
        {
          title: currentProject.name || `פרויקט #${currentProject.id}`,
          value: String(currentProject.id),
        },
        ...projects,
      ];
    }
  } catch {
    projectOptions.value = [];
  } finally {
    isLoadingProjectOptions.value = false;
  }
};

const targetPathForProject = (projectId) => {
  if (typeof route.path === 'string' && route.path.startsWith('/project/')) {
    return route.path.replace(/^\/project\/[^/]+/, `/project/${projectId}`);
  }

  return `/project/${projectId}/dashboard`;
};

const switchToProject = async (projectId) => {
  if (!projectId || String(projectId) === String(props.currentProjectId)) {
    return;
  }

  await router.push(targetPathForProject(projectId));
};

const onProjectSelect = (projectId) => {
  switchToProject(projectId);
};

const toggleOrgSection = () => {
  isOrgSectionExpanded.value = !isOrgSectionExpanded.value;
};

const loadBidsCount = async () => {
  if (!props.currentProjectId) {
    bidsCount.value = 0;
    return;
  }

  try {
    const response = await makeRequest(`/projects/${props.currentProjectId}/bids`);
    const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
    bidsCount.value = items.length;
  } catch {
    bidsCount.value = 0;
  }
};

const stopBidsCountAutoRefresh = () => {
  if (!bidsCountIntervalId) {
    return;
  }

  clearInterval(bidsCountIntervalId);
  bidsCountIntervalId = null;
};

const startBidsCountAutoRefresh = () => {
  stopBidsCountAutoRefresh();

  if (!props.currentProjectId) {
    return;
  }

  bidsCountIntervalId = setInterval(() => {
    loadBidsCount();
  }, BIDS_COUNT_REFRESH_MS);
};

watch(
  () => props.currentProjectId,
  (nextProjectId) => {
    isOrgSectionExpanded.value = !nextProjectId;
    selectedProjectId.value = nextProjectId ? String(nextProjectId) : null;
    loadBidsCount();
    startBidsCountAutoRefresh();
  },
);

onMounted(() => {
  selectedProjectId.value = props.currentProjectId ? String(props.currentProjectId) : null;
  loadProjectOptions();
  loadBidsCount();
  startBidsCountAutoRefresh();
});

onBeforeUnmount(() => {
  stopBidsCountAutoRefresh();
});
</script>

<style scoped>
.project-switcher-wrap {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: rgb(var(--v-theme-surface));
  padding: 0 8px 8px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(var(--v-theme-divider), 0.65);
}

.project-switcher {
  margin-bottom: 0;
}

.project-group-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(var(--v-theme-on-surface), 0.78);
}
</style>
