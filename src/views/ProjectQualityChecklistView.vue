<template>
  <div>
    <div class="text-h5 font-weight-bold mb-2">בקרת איכות</div>
    <div class="text-body-2 text-medium-emphasis mb-6">
      אישור שלבים לפי רשימות בדיקה לפני מעבר לשלב הבא
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <AppStateError v-if="errorMessage" :message="errorMessage" @retry="loadChecklists" />
        <AppStateLoading v-if="isLoading" message="טוען רשימות בדיקה..." />
        <AppStateEmpty
          v-else-if="checklistPhases.length === 0"
          icon="mdi-clipboard-check-outline"
          title="אין רשימות בדיקה להצגה"
          description="טרם הוגדרו סעיפי בקרת איכות עבור הפרויקט."
          class="mb-3"
        />
        <v-expansion-panels v-else variant="accordion">
          <v-expansion-panel
            v-for="phase in checklistPhases"
            :key="phase.id"
            :title="phase.title"
            :text="`אחראי: ${phase.owner}`"
          >
            <v-expansion-panel-text>
              <v-checkbox
                v-for="item in phase.items"
                :key="item.id"
                v-model="item.done"
                :disabled="isSaving"
                :label="item.label"
                hide-details
                class="mb-2"
                @update:model-value="(nextValue) => onToggleItem(phase.id, item, nextValue)"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="1" class="pa-4 mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">מצב בקרת איכות</div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-medium-emphasis">בדיקות שהושלמו</span>
            <span class="font-weight-bold">{{ completedChecks }}/{{ totalChecks }}</span>
          </div>
          <v-progress-linear
            :model-value="completionRate"
            color="primary"
            height="10"
            rounded
          />
          <div class="text-caption mt-2 text-medium-emphasis">{{ completionRate }}% הושלמו</div>
        </v-card>

        <v-card elevation="1" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">פעולה הבאה</div>
          <v-alert type="info" variant="tonal">
            מומלץ לסיים את כל בדיקות שלב התשתיות לפני הזמנת בדיקת מהנדס.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppStateEmpty from '../components/state/AppStateEmpty.vue';
import AppStateError from '../components/state/AppStateError.vue';
import AppStateLoading from '../components/state/AppStateLoading.vue';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const checklistPhases = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
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

const checklistEndpoints = (id) => [
  `/projects/${id}/checklists`,
  `/projects/${id}/project-checklists`,
];

const checklistItemUpdateEndpoints = (id, checklistId, itemId) => [
  `/projects/${id}/checklists/${checklistId}/items/${itemId}`,
  `/projects/${id}/checklists/${checklistId}/checklist-items/${itemId}`,
];

const mapChecklist = (checklist) => ({
  id: checklist.id,
  title: checklist.title || 'צ׳קליסט ללא כותרת',
  owner: checklist.owner_name || 'לא הוגדר',
  items: (Array.isArray(checklist.items) ? checklist.items : []).map((item) => ({
    id: item.id,
    label: item.label || 'סעיף ללא תיאור',
    done: Boolean(item.is_done),
  })),
});

const loadChecklists = async () => {
  if (!projectId.value) {
    checklistPhases.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    let loaded = false;

    for (const endpoint of checklistEndpoints(projectId.value)) {
      try {
        const response = await makeRequest(endpoint);
        checklistPhases.value = toItems(response).map(mapChecklist);
        loaded = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!loaded) {
      checklistPhases.value = [];
    }
  } catch {
    errorMessage.value = 'טעינת רשימות הבדיקה נכשלה.';
    checklistPhases.value = [];
  } finally {
    isLoading.value = false;
  }
};

const updateChecklistItem = async (checklistId, itemId, nextValue) => {
  for (const endpoint of checklistItemUpdateEndpoints(projectId.value, checklistId, itemId)) {
    try {
      await makeRequest(endpoint, { is_done: nextValue ? 1 : 0 }, 'PATCH');
      return true;
    } catch (error) {
      if (error?.response?.status !== 404) {
        return false;
      }
    }
  }

  return false;
};

const onToggleItem = async (checklistId, item, nextValue) => {
  const previous = item.done;
  item.done = nextValue;
  isSaving.value = true;

  const success = await updateChecklistItem(checklistId, item.id, nextValue);

  if (!success) {
    item.done = previous;
    errorMessage.value = 'עדכון סעיף בדיקה נכשל. נסו שוב.';
  } else {
    errorMessage.value = '';
  }

  isSaving.value = false;
};

watch(
  () => route.params.id,
  () => {
    loadChecklists();
  },
  { immediate: true },
);

const totalChecks = computed(() => checklistPhases.value
  .reduce((acc, phase) => acc + phase.items.length, 0));

const completedChecks = computed(() => checklistPhases.value
  .reduce((acc, phase) => acc + phase.items.filter((item) => item.done).length, 0));

const completionRate = computed(() => {
  if (!totalChecks.value) {
    return 0;
  }

  return Math.round((completedChecks.value / totalChecks.value) * 100);
});
</script>
