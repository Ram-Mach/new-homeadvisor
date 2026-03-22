<template>
  <div class="project-dashboard">
    <DashboardHero
      overline="סקירת פרויקט"
      :title="projectTitle"
      subtitle="תצוגה מרכזית של התקדמות, לוחות זמנים, צוות ומשימות קריטיות."
    >
      <template #actions>
        <v-btn prepend-icon="mdi-refresh" :loading="isLoading" @click="loadProjectDashboard">
          רענון נתונים
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-format-list-checks" :to="`/project/${projectId}/timeline`">
          מעבר ללוח זמנים
        </v-btn>
      </template>
    </DashboardHero>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <div v-if="isLoading" class="py-8 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <v-row class="mb-2">
        <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
          <DashboardStatCard
            :icon="stat.icon"
            :color="stat.color"
            :value="stat.value"
            :label="stat.label"
            :description="stat.description"
            :badge-text="stat.label"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="8">
          <DashboardSectionCard title="התקדמות לפי שלב" card-class="mb-4">
              <div v-if="phases.length === 0" class="text-body-2 text-medium-emphasis">
                אין שלבים להצגה כרגע.
              </div>
              <div v-for="phase in phases" :key="phase.name" class="phase-row">
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="text-body-2 font-weight-medium">{{ phase.name }}</div>
                  <div class="text-body-2 font-weight-bold">{{ phase.pct }}%</div>
                </div>
                <v-progress-linear :model-value="phase.pct" :color="phase.color" rounded height="10" />
              </div>
          </DashboardSectionCard>

          <DashboardSectionCard title="משימות קרובות" body-class="px-2 px-md-4 pb-4">
            <template #headerRight>
              <v-chip color="primary" variant="tonal" size="small">{{ tasks.length }} משימות</v-chip>
            </template>

              <div v-if="tasks.length === 0" class="text-body-2 text-medium-emphasis py-6 px-4">
                אין משימות להצגה כרגע.
              </div>
              <v-table v-else density="comfortable" class="tasks-table">
                <thead>
                  <tr>
                    <th class="text-right">משימה</th>
                    <th class="text-right">אחראי</th>
                    <th class="text-right">תאריך יעד</th>
                    <th class="text-right">סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in tasks" :key="task.id">
                    <td class="font-weight-medium">{{ task.name }}</td>
                    <td>{{ task.owner }}</td>
                    <td>{{ task.due }}</td>
                    <td>
                      <v-chip :color="task.statusColor" size="x-small" variant="tonal">{{ task.status }}</v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
          </DashboardSectionCard>
        </v-col>

        <v-col cols="12" lg="4">
          <DashboardSectionCard title="בריאות הפרויקט" card-class="mb-4">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">התקדמות כוללת</div>
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="text-h6 font-weight-bold">{{ overallProgress }}%</div>
                  <v-chip :color="overallProgress >= 70 ? 'success' : 'warning'" size="small" variant="tonal">
                    {{ overallProgress >= 70 ? 'במסלול תקין' : 'דורש תשומת לב' }}
                  </v-chip>
                </div>
                <v-progress-linear :model-value="overallProgress" :color="overallProgress >= 70 ? 'success' : 'warning'" rounded height="10" />
              </div>

              <div class="text-caption text-medium-emphasis mb-1">משימות פתוחות</div>
              <div class="text-h6 font-weight-bold mb-4">{{ openItemsCount }}</div>

              <div class="text-caption text-medium-emphasis mb-1">יעד סיום</div>
              <div class="text-h6 font-weight-bold">{{ projectEndDate }}</div>
          </DashboardSectionCard>

          <DashboardSectionCard title="חברי צוות" body-class="px-3 pb-4">
              <div v-if="team.length === 0" class="text-body-2 text-medium-emphasis px-2 py-4">
                אין חברי צוות להצגה כרגע.
              </div>
              <v-list v-else class="bg-transparent py-0">
                <v-list-item
                  v-for="member in team"
                  :key="member.name"
                  class="team-row mx-2 my-1"
                >
                  <template #prepend>
                    <v-avatar :color="member.color" variant="tonal" size="36" class="me-3">
                      <span class="text-caption font-weight-bold">{{ member.initials }}</span>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">{{ member.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ member.role }}</v-list-item-subtitle>

                  <template #append>
                    <v-chip :color="member.statusColor" size="x-small" variant="tonal">{{ member.status }}</v-chip>
                  </template>
                </v-list-item>
              </v-list>
          </DashboardSectionCard>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import DashboardHero from '../components/dashboard/DashboardHero.vue';
import DashboardSectionCard from '../components/dashboard/DashboardSectionCard.vue';
import DashboardStatCard from '../components/dashboard/DashboardStatCard.vue';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const project = ref(null);
const tasksRaw = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

const projectId = computed(() => route.params.id);

const toItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

const toItem = (response) => {
  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

const fetchTasksForProject = async (id) => {
  const candidateEndpoints = [
    `/projects/${id}/tasks`,
    `/projects/${id}/project-tasks`,
  ];

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await makeRequest(endpoint);
      return toItems(response);
    } catch (error) {
      if (error?.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  return [];
};

const statusLabel = (status) => {
  const map = {
    completed: 'הושלם',
    in_progress: 'בתהליך',
    pending: 'ממתין',
    active: 'פעיל',
  };

  return map[status] || status || 'ממתין';
};

const statusColor = (status) => {
  const map = {
    completed: 'success',
    in_progress: 'warning',
    pending: 'info',
    active: 'primary',
  };

  return map[status] || 'info';
};

const formatDate = (value) => {
  if (!value) {
    return 'ללא תאריך';
  }

  return new Date(value).toLocaleDateString('he-IL');
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const initialsFromName = (name) => {
  const parts = String(name || '').trim().split(' ').filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0][0];
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`;
};

const team = computed(() => {
  const members = Array.isArray(project.value?.members) ? project.value.members : [];
  if (members.length === 0 && project.value?.owner?.name) {
    return [{
      name: project.value.owner.name,
      role: 'בעלים',
      initials: initialsFromName(project.value.owner.name),
      color: 'primary',
      status: 'פעיל',
      statusColor: 'success',
    }];
  }

  return members.map((member) => ({
    name: member.name || member.user?.name || 'ללא שם',
    role: member.role || 'חבר צוות',
    initials: initialsFromName(member.name || member.user?.name),
    color: 'primary',
    status: member.is_active === false ? 'מושהה' : 'פעיל',
    statusColor: member.is_active === false ? 'warning' : 'success',
  }));
});

const tasks = computed(() => tasksRaw.value
  .slice()
  .sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0))
  .slice(0, 8)
  .map((task) => ({
    id: task.id,
    name: task.title || 'משימה ללא כותרת',
    owner: task.owner_name || task.assignee_name || 'לא הוגדר',
    due: formatDate(task.end_date),
    status: statusLabel(task.status),
    statusColor: statusColor(task.status),
  })));

const phases = computed(() => tasksRaw.value
  .slice()
  .sort((a, b) => Number(b.progress || 0) - Number(a.progress || 0))
  .slice(0, 5)
  .map((task) => ({
    name: task.title || 'שלב ללא שם',
    pct: Number(task.progress || 0),
    color: Number(task.progress || 0) >= 100 ? 'success' : 'primary',
  })));

const overallProgress = computed(() => {
  if (tasksRaw.value.length === 0) {
    return 0;
  }

  return Math.round(
    tasksRaw.value.reduce((sum, task) => sum + Number(task.progress || 0), 0) / tasksRaw.value.length,
  );
});

const openItemsCount = computed(() => tasksRaw.value.filter((task) => Number(task.progress || 0) < 100).length);

const projectTitle = computed(() => project.value?.name || 'דשבורד פרויקט');

const projectEndDate = computed(() => formatDate(project.value?.end_date));

const stats = computed(() => {
  const endDate = project.value?.end_date ? new Date(project.value.end_date) : null;
  const today = new Date();
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))) : '-';

  return [
    {
      label: 'ימים לסיום',
      value: daysLeft,
      icon: 'mdi-calendar-clock',
      color: 'primary',
      description: 'עד תאריך היעד של הפרויקט',
    },
    {
      label: 'התקדמות',
      value: `${overallProgress.value}%`,
      icon: 'mdi-chart-line',
      color: 'success',
      description: 'ממוצע התקדמות המשימות',
    },
    {
      label: 'תקציב כולל',
      value: currency(project.value?.total_budget),
      icon: 'mdi-cash-multiple',
      color: 'warning',
      description: 'תקציב פרויקט מעודכן',
    },
    {
      label: 'פריטים פתוחים',
      value: openItemsCount.value,
      icon: 'mdi-clipboard-check-outline',
      color: 'info',
      description: 'משימות שעדיין לא הושלמו',
    },
  ];
});

const loadProjectDashboard = async () => {
  if (!projectId.value) {
    project.value = null;
    tasksRaw.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const [projectResponse, taskItems] = await Promise.all([
      makeRequest(`/projects/${projectId.value}`),
      fetchTasksForProject(projectId.value),
    ]);

    project.value = toItem(projectResponse);
    tasksRaw.value = taskItems;
  } catch {
    errorMessage.value = 'טעינת נתוני הפרויקט נכשלה. נסו לרענן את העמוד.';
    project.value = null;
    tasksRaw.value = [];
  } finally {
    isLoading.value = false;
  }
};

watch(() => route.params.id, loadProjectDashboard, { immediate: true });
</script>

<style scoped>
.project-dashboard {
  position: relative;
}

.phase-row {
  border: 1px solid rgba(var(--v-theme-divider), 0.65);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
}

.team-row {
  border: 1px solid rgba(var(--v-theme-divider), 0.7);
  border-radius: 14px;
}

.tasks-table :deep(thead th) {
  font-weight: 700;
  color: rgba(var(--v-theme-text), 0.92);
}

.tasks-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary-lighten-2), 0.3);
}
</style>

