<template>
  <div class="org-dashboard">
    <DashboardHero
      overline="סקירה ארגונית"
      title="דשבורד ארגוני"
      subtitle="תמונת מצב מהירה של הפרויקטים, התקציב והפעילות האחרונה בארגון."
    >
      <template #actions>
        <v-btn prepend-icon="mdi-refresh" :loading="isLoadingProjects" @click="loadProjects">
          רענון נתונים
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-map-marker-path" to="/plan-new-project">
          תכנון פרויקט חדש
        </v-btn>
      </template>
    </DashboardHero>

    <v-row class="mb-2">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <DashboardStatCard
          :icon="stat.icon"
          :color="stat.color"
          :value="stat.value"
          :label="stat.label"
          :badge-text="stat.trend"
        />
      </v-col>
    </v-row>

    <v-alert v-if="projectsError" type="error" variant="tonal" class="mb-4">
      {{ projectsError }}
    </v-alert>

    <v-row>
      <v-col cols="12" lg="8">
        <DashboardSectionCard title="פרויקטים פעילים" body-class="px-2 px-md-4 pb-4" card-class="h-100">
          <template #headerRight>
            <v-chip color="primary" variant="tonal" size="small">{{ projects.length }} פרויקטים</v-chip>
          </template>

            <div v-if="isLoadingProjects" class="py-8 d-flex justify-center">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <div v-else-if="projects.length === 0" class="text-body-2 text-medium-emphasis py-8 px-4">
              עדיין אין פרויקטים להצגה.
            </div>

            <v-list v-else lines="two" class="bg-transparent py-0">
              <v-list-item
                v-for="project in projects"
                :key="project.id"
                :to="`/project/${project.id}/dashboard`"
                class="project-row mx-2 my-2"
              >
                <template #prepend>
                  <v-avatar :color="project.color" variant="tonal" size="42">
                    <v-icon :icon="project.icon" size="20" />
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold">{{ project.name }}</v-list-item-title>
                <v-list-item-subtitle class="d-flex align-center flex-wrap ga-2 mt-1">
                  <v-chip :color="project.color" size="x-small" variant="tonal">{{ project.status }}</v-chip>
                  <span class="text-caption">תקציב: {{ project.budget }}</span>
                </v-list-item-subtitle>

                <template #append>
                  <v-icon icon="mdi-chevron-left" color="medium-emphasis" />
                </template>
              </v-list-item>
            </v-list>
        </DashboardSectionCard>
      </v-col>

      <v-col cols="12" lg="4">
        <DashboardSectionCard title="פרויקט מוביל" card-class="mb-4">
            <div v-if="topProject" class="top-project-wrap">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar :color="topProject.color" variant="tonal" size="42">
                  <v-icon :icon="topProject.icon" size="20" />
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ topProject.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ topProject.status }}</div>
                </div>
              </div>
              <div class="text-body-2 text-medium-emphasis mb-1">תקציב נוכחי</div>
              <div class="text-h6 font-weight-bold">{{ topProject.budget }}</div>
            </div>
            <div v-else class="text-body-2 text-medium-emphasis">אין עדיין פרויקט מוביל להצגה.</div>
        </DashboardSectionCard>

        <DashboardSectionCard title="פעילות אחרונה">
            <v-timeline density="compact" side="end" class="activity-timeline pe-0">
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
        </DashboardSectionCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import DashboardHero from '../components/dashboard/DashboardHero.vue';
import DashboardSectionCard from '../components/dashboard/DashboardSectionCard.vue';
import DashboardStatCard from '../components/dashboard/DashboardStatCard.vue';
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

const topProject = computed(() => {
  if (projectsRaw.value.length === 0) {
    return null;
  }

  const byBudget = [...projectsRaw.value].sort((a, b) => Number(b.total_budget || 0) - Number(a.total_budget || 0));
  const project = byBudget[0];

  return {
    id: project.id,
    name: project.name || 'פרויקט ללא שם',
    status: statusLabel(project.status),
    budget: currency(project.total_budget),
    color: projectColor(project.status),
    icon: projectIcon(project.property_type),
  };
});

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

<style scoped>
.org-dashboard {
  position: relative;
}

.project-row {
  border: 1px solid rgba(var(--v-theme-divider), 0.7);
  border-radius: 14px;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.project-row:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background-color: rgba(var(--v-theme-primary-lighten-2), 0.32);
}

.top-project-wrap {
  border: 1px dashed rgba(var(--v-theme-primary), 0.45);
  border-radius: 14px;
  padding: 14px;
  background: rgba(var(--v-theme-primary-lighten-2), 0.24);
}
</style>

