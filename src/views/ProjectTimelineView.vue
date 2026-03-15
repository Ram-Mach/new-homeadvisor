<template>
  <div>
    <div class="text-h5 font-weight-bold mb-2">ניהול לוחות זמנים</div>
    <div class="text-body-2 text-medium-emphasis mb-6">
      תצוגת אבני דרך ושלבי ביצוע לפרויקט
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="4">
        <v-card elevation="1" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">אבני דרך קרובות</div>
          <div
            v-if="isLoading"
            class="py-4 d-flex justify-center"
          >
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div
            v-else-if="milestones.length === 0"
            class="text-body-2 text-medium-emphasis"
          >
            אין אבני דרך להצגה כרגע.
          </div>
          <v-timeline density="compact" side="end">
            <v-timeline-item
              v-for="milestone in milestones"
              :key="milestone.id"
              :dot-color="milestone.color"
              size="x-small"
            >
              <div class="text-body-2 font-weight-medium">{{ milestone.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ milestone.date }}</div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card elevation="1" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-4">התקדמות שלבים (תצוגת גאנט פשוטה)</div>
          <div
            v-if="!isLoading && phases.length === 0"
            class="text-body-2 text-medium-emphasis mb-4"
          >
            אין שלבים להצגה כרגע.
          </div>
          <v-table>
            <thead>
              <tr>
                <th class="text-right">שלב</th>
                <th class="text-right">טווח תאריכים</th>
                <th class="text-right">ביצוע</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="phase in phases" :key="phase.id">
                <td>
                  <div class="font-weight-medium">{{ phase.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ phase.owner }}</div>
                </td>
                <td>{{ phase.range }}</td>
                <td style="min-width: 220px;">
                  <v-progress-linear
                    :model-value="phase.progress"
                    color="primary"
                    height="10"
                    rounded
                  />
                  <div class="text-caption text-medium-emphasis mt-1">{{ phase.progress }}%</div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const isLoading = ref(false);
const errorMessage = ref('');
const tasksRaw = ref([]);

const formatDate = (value) => {
  if (!value) {
    return 'ללא תאריך';
  }

  return new Date(value).toLocaleDateString('he-IL');
};

const endpointCandidates = (projectId) => [
  `/projects/${projectId}/tasks`,
  `/projects/${projectId}/project-tasks`,
];

const toItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const loadTasks = async (projectId) => {
  if (!projectId) {
    tasksRaw.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    let loaded = false;

    for (const endpoint of endpointCandidates(projectId)) {
      try {
        const response = await makeRequest(endpoint);
        tasksRaw.value = toItems(response);
        loaded = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!loaded) {
      tasksRaw.value = [];
    }
  } catch {
    errorMessage.value = 'טעינת נתוני לוח הזמנים נכשלה. נסו לרענן את העמוד.';
    tasksRaw.value = [];
  } finally {
    isLoading.value = false;
  }
};

const phases = computed(() => tasksRaw.value
  .slice()
  .sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0))
  .map((task) => ({
    id: task.id,
    title: task.title || 'שלב ללא שם',
    owner: task.owner_name || 'לא הוגדר',
    range: `${formatDate(task.start_date)} - ${formatDate(task.end_date)}`,
    progress: Number(task.progress || 0),
  })));

const milestones = computed(() => {
  const milestoneTasks = tasksRaw.value.filter((task) => task.is_milestone);

  const source = milestoneTasks.length > 0 ? milestoneTasks : tasksRaw.value;

  return source
    .slice()
    .sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0))
    .slice(0, 6)
    .map((task) => ({
      id: task.id,
      title: task.title || 'אבן דרך ללא שם',
      date: formatDate(task.end_date),
      color: Number(task.progress || 0) >= 100 ? 'success' : 'primary',
    }));
});

watch(() => route.params.id, loadTasks, { immediate: true });
</script>
