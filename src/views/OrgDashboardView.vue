<template>
  <div>
    <!-- Page header -->
    <div class="text-h5 font-weight-bold mb-6">דשבורד ארגוני</div>

    <!-- Stat cards -->
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card rounded="xl" elevation="0"   class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon :icon="stat.icon" :color="stat.color" size="28" />
            <v-chip :color="stat.color" variant="tonal" size="x-small">{{ stat.trend }}</v-chip>
          </div>
          <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Active projects -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">פרויקטים פעילים</div>
          <v-alert v-if="projectsError" type="error" variant="tonal" class="mb-3">
            {{ projectsError }}
          </v-alert>
          <div v-if="isLoadingProjects" class="py-6 d-flex justify-center">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div
            v-else-if="projects.length === 0"
            class="text-body-2 text-medium-emphasis py-6"
          >
            עדיין אין פרויקטים להצגה.
          </div>
          <v-list lines="two" class="pa-0">
            <v-list-item
              v-for="project in projects"
              :key="project.id"
              :title="project.name"
              :subtitle="project.status"
              rounded="lg"
              class="mb-2 px-3"
              :to="`/project/${project.id}/dashboard`"
            >
              <template #prepend>
                <v-avatar :color="project.color" variant="tonal" rounded="lg" size="40">
                  <v-icon :icon="project.icon" size="20" />
                </v-avatar>
              </template>
              <template #append>
                <div class="text-caption text-medium-emphasis">{{ project.budget }}</div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Recent activity -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">פעילות אחרונה</div>
          <v-timeline density="compact" side="end" class="activity-timeline">
            <v-timeline-item
              v-for="event in activity"
              :key="event.id"
              :dot-color="event.color"
              size="x-small"
            >
              <div class="text-body-2 font-weight-medium">{{ event.text }}</div>
              <div class="text-caption text-medium-emphasis">{{ event.time }}</div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { makeRequest } from '../plugins/api';

const isLoadingProjects = ref(false);
const projectsError = ref('');
const projectsRaw = ref([]);

const toProjectList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const statusLabel = (status) => {
  const map = {
    active: 'פעיל',
    bidding: 'מכרז',
    completed: 'הושלם',
    planning: 'בתכנון',
    paused: 'מושהה',
    archived: 'בארכיון',
  };

  return map[status] || status || 'לא ידוע';
};

const projectColor = (status) => {
  const map = {
    active: 'primary',
    bidding: 'info',
    completed: 'success',
    planning: 'warning',
    paused: 'error',
  };

  return map[status] || 'primary';
};

const projectIcon = (propertyType) => {
  const map = {
    apartment: 'mdi-home-city-outline',
    private_house: 'mdi-home-outline',
    office: 'mdi-office-building-outline',
  };

  return map[propertyType] || 'mdi-home-variant-outline';
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const projects = computed(() => projectsRaw.value.map((project) => ({
  id: project.id,
  name: project.name || 'פרויקט ללא שם',
  status: statusLabel(project.status),
  budget: currency(project.total_budget),
  color: projectColor(project.status),
  icon: projectIcon(project.property_type),
})));

const stats = computed(() => {
  const activeCount = projectsRaw.value.filter((project) => project.status === 'active').length;
  const totalBudget = projectsRaw.value.reduce((sum, project) => sum + Number(project.total_budget || 0), 0);
  const biddingCount = projectsRaw.value.filter((project) => project.status === 'bidding').length;
  const memberCount = projectsRaw.value.reduce((sum, project) => {
    if (Array.isArray(project.members)) {
      return sum + project.members.length;
    }
    return sum;
  }, 0);

  return [
    {
      label: 'פרויקטים פעילים',
      value: activeCount,
      icon: 'mdi-home-city-outline',
      color: 'primary',
      trend: `${projectsRaw.value.length} בסך הכל`,
    },
    {
      label: 'חברי צוות',
      value: memberCount,
      icon: 'mdi-account-group-outline',
      color: 'success',
      trend: 'לפי פרויקטים שנטענו',
    },
    {
      label: 'תקציב כולל',
      value: currency(totalBudget),
      icon: 'mdi-cash-multiple',
      color: 'warning',
      trend: 'מתוך כל הפרויקטים',
    },
    {
      label: 'הצעות פתוחות',
      value: biddingCount,
      icon: 'mdi-gavel',
      color: 'info',
      trend: 'פרויקטים במצב מכרז',
    },
  ];
});

const activity = computed(() => projectsRaw.value
  .slice()
  .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
  .slice(0, 5)
  .map((project) => ({
    id: project.id,
    text: `הפרויקט ${project.name || 'ללא שם'} עודכן`,
    time: project.updated_at ? new Date(project.updated_at).toLocaleString('he-IL') : 'ללא זמן עדכון',
    color: projectColor(project.status),
  })));

const loadProjects = async () => {
  isLoadingProjects.value = true;
  projectsError.value = '';

  try {
    const response = await makeRequest('/projects');
    projectsRaw.value = toProjectList(response);
  } catch {
    projectsError.value = 'טעינת הפרויקטים נכשלה. נסו לרענן את העמוד.';
    projectsRaw.value = [];
  } finally {
    isLoadingProjects.value = false;
  }
};

onMounted(loadProjects);
</script>

