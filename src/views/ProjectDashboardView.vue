<template>
  <div>
    <div class="text-h5 font-weight-bold mb-6">דשבורד פרויקט</div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <div v-if="isLoading" class="py-8 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Summary stat cards -->
    <v-row v-if="!isLoading" class="mb-6">
      <v-col v-for="stat in stats" :key="stat.label" cols="6" lg="3">
        <v-card rounded="xl" elevation="0"  class="pa-4">
          <v-icon :icon="stat.icon" :color="stat.color" size="24" class="mb-2" />
          <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
          <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!isLoading">
      <!-- Progress -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" class="pa-5 mb-4">
          <div class="text-subtitle-1 font-weight-semibold mb-4">התקדמות לפי שלב</div>
          <div
            v-if="phases.length === 0"
            class="text-body-2 text-medium-emphasis"
          >
            אין שלבים להצגה כרגע.
          </div>
          <div v-for="phase in phases" :key="phase.name" class="mb-4">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-body-2">{{ phase.name }}</span>
              <span class="text-body-2 font-weight-medium">{{ phase.pct }}%</span>
            </div>
            <v-progress-linear
              :model-value="phase.pct"
              :color="phase.color"
              rounded
              height="8"
             
            />
          </div>
        </v-card>
      </v-col>

      <!-- Team members -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" class="pa-5 mb-4">
          <div class="text-subtitle-1 font-weight-semibold mb-4">חברי צוות</div>
          <v-list class="pa-0">
            <v-list-item
              v-for="member in team"
              :key="member.name"
              :title="member.name"
              :subtitle="member.role"
              class="px-0 mb-1"
            >
              <template #prepend>
                <v-avatar :color="member.color" variant="tonal" size="36" class="me-3">
                  <span class="text-caption font-weight-bold">{{ member.initials }}</span>
                </v-avatar>
              </template>
              <template #append>
                <v-chip :color="member.statusColor" size="x-small" variant="tonal">
                  {{ member.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upcoming tasks -->
    <v-card v-if="!isLoading" rounded="xl" elevation="0" class="pa-5">
      <div class="text-subtitle-1 font-weight-semibold mb-4">משימות קרובות</div>
      <div
        v-if="tasks.length === 0"
        class="text-body-2 text-medium-emphasis"
      >
        אין משימות להצגה כרגע.
      </div>
      <v-table density="compact">
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
            <td>{{ task.name }}</td>
            <td>{{ task.owner }}</td>
            <td>{{ task.due }}</td>
            <td>
              <v-chip :color="task.statusColor" size="x-small" variant="tonal">{{ task.status }}</v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
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

const stats = computed(() => {
  const endDate = project.value?.end_date ? new Date(project.value.end_date) : null;
  const today = new Date();
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))) : '-';

  const progressAvg = tasksRaw.value.length
    ? Math.round(tasksRaw.value.reduce((sum, task) => sum + Number(task.progress || 0), 0) / tasksRaw.value.length)
    : 0;

  const openItems = tasksRaw.value.filter((task) => Number(task.progress || 0) < 100).length;

  return [
    { label: 'ימים לסיום', value: daysLeft, icon: 'mdi-calendar-clock', color: 'primary' },
    { label: 'התקדמות', value: `${progressAvg}%`, icon: 'mdi-chart-line', color: 'success' },
    { label: 'תקציב כולל', value: currency(project.value?.total_budget), icon: 'mdi-cash-multiple', color: 'warning' },
    { label: 'פריטים פתוחים', value: openItems, icon: 'mdi-clipboard-check-outline', color: 'info' },
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

onMounted(loadProjectDashboard);
</script>

