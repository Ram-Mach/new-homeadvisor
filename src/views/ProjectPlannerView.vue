<template>
  <v-row justify="center">
    <v-col cols="12" lg="11" xl="9">
      <v-card elevation="1" class="pa-4 pa-md-6">
        <v-card-title class="text-h5">Smart BoQ Wizard</v-card-title>
        <v-card-subtitle class="mb-5">נענה על כמה שאלות קצרות ונבנה עבורך כתב כמויות ראשוני אוטומטי</v-card-subtitle>

        <v-alert v-if="saveError" type="error" variant="tonal" class="mb-4">
          {{ saveError }}
        </v-alert>

        <div v-if="!planner.setupChoice">
          <v-row>
            <v-col cols="12" md="4">
              <v-card
                rounded="xl"
                elevation="0"
                class="setup-card pa-5 h-100"
                @click="onChooseWizard"
              >
                <div class="d-flex align-center justify-space-between mb-3">
                  <v-icon size="30" icon="mdi-auto-fix" color="primary" />
                  <v-chip size="small" color="primary" variant="tonal">מומלץ</v-chip>
                </div>
                <div class="text-h6 mb-2">אשף חכם</div>
                <div class="text-body-2 text-medium-emphasis">שאלון קצר שמייצר כתב כמויות לפי סוג הנכס, חללים והיקף עבודה.</div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card rounded="xl" elevation="0" class="setup-card pa-5 h-100 opacity-70" disabled>
                <div class="d-flex align-center justify-space-between mb-3">
                  <v-icon size="30" icon="mdi-file-upload-outline" color="info" />
                  <v-chip size="small" color="info" variant="tonal">בקרוב...</v-chip>
                </div>
                <div class="text-h6 mb-2">העלאת תוכנית (AI)</div>
                <div class="text-body-2 text-medium-emphasis">העלאת PDF ותכנון אוטומטי מבוסס בינה מלאכותית.</div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                rounded="xl"
                elevation="0"
                class="setup-card pa-5 h-100"
                :loading="isSaving"
                @click="onChooseManual"
              >
                <div class="d-flex align-center justify-space-between mb-3">
                  <v-icon size="30" icon="mdi-pencil-ruler" color="secondary" />
                  <v-chip size="small" color="secondary" variant="tonal">ידני</v-chip>
                </div>
                <div class="text-h6 mb-2">בנייה ידנית</div>
                <div class="text-body-2 text-medium-emphasis">מעבר מיידי למסך כתב הכמויות והזנה חופשית של סעיפים.</div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-else-if="planner.setupChoice === 'wizard'">
          <v-alert v-if="planner.catalogError" type="error" variant="tonal" class="mb-4">
            {{ planner.catalogError }}
          </v-alert>

          <div v-if="planner.isCatalogLoading" class="py-8 d-flex justify-center">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <template v-else>
          <v-stepper :model-value="planner.step" flat class="mb-6">
            <v-stepper-header>
              <v-stepper-item :value="1" title="פרטי נכס" />
              <v-divider />
              <v-stepper-item :value="2" title="בחירת חללים" />
              <v-divider />
              <v-stepper-item :value="3" title="היקף עבודה" />
              <v-divider />
              <v-stepper-item :value="4" title="סיכום" />
            </v-stepper-header>
          </v-stepper>

          <v-window v-model="planner.step">
            <v-window-item :value="1">
              <v-row>
                <v-col cols="12" md="7">
                  <v-text-field
                    v-model="planner.projectName"
                    label="שם הפרויקט"
                    prepend-inner-icon="mdi-briefcase-outline"
                    placeholder="לדוגמה: שיפוץ דירת משפחת כהן"
                  />
                </v-col>
                <v-col cols="12" md="5">
                  <v-text-field
                    v-model.number="planner.propertyDetails.size_sqm"
                    label="שטח הנכס במ״ר"
                    type="number"
                    min="1"
                    prepend-inner-icon="mdi-ruler-square"
                  />
                </v-col>
                <v-col cols="12">
                  <div class="text-subtitle-1 mb-3">סוג הנכס</div>
                  <v-radio-group v-model="planner.propertyDetails.type" inline>
                    <v-radio label="דירה" value="apartment" />
                    <v-radio label="בית פרטי" value="house" />
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item :value="2">
              <div class="text-subtitle-1 mb-3">איזה חללים כלולים בשיפוץ?</div>
              <v-row>
                <v-col v-for="room in planner.roomOptions" :key="room.value" cols="12" sm="6" lg="3">
                  <v-card
                    rounded="xl"
                    elevation="0"
                    class="pa-4 room-card"
                    :class="{ 'room-card--active': isRoomSelected(room.value) }"
                    @click="planner.toggleRoom(room.value)"
                  >
                    <div class="d-flex align-center justify-space-between mb-2">
                      <v-icon :icon="room.icon" :color="isRoomSelected(room.value) ? 'primary' : 'medium-emphasis'" />
                      <v-icon v-if="isRoomSelected(room.value)" icon="mdi-check-circle" color="primary" />
                    </div>
                    <div class="text-subtitle-2 font-weight-medium">{{ room.label }}</div>

                    <div
                      v-if="isRoomSelected(room.value)"
                      class="d-flex align-center justify-space-between mt-3 room-counter"
                      @click.stop
                    >
                      <span class="text-caption text-medium-emphasis">כמות חדרים (עד {{ planner.MAX_ROOM_COUNT }})</span>
                      <div class="d-flex align-center ga-2">
                        <v-btn
                          icon="mdi-minus"
                          size="x-small"
                          variant="outlined"
                          @click.stop="planner.decrementRoomCount(room.value)"
                        />
                        <span class="text-body-2 font-weight-bold">{{ roomCount(room.value) }}</span>
                        <v-btn
                          icon="mdi-plus"
                          size="x-small"
                          variant="outlined"
                          :disabled="roomCount(room.value) >= planner.MAX_ROOM_COUNT"
                          @click.stop="planner.incrementRoomCount(room.value)"
                        />
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-if="selectedRoomKeys.length === 0" type="warning" variant="tonal" class="mt-4">
                צריך לבחור לפחות חלל אחד כדי להמשיך.
              </v-alert>
            </v-window-item>

            <v-window-item :value="3">
              <div class="text-subtitle-1 mb-4">בחרו היקף עבודה לכל חלל</div>

              <v-row v-if="selectedRoomKeys.length > 0">
                <v-col v-for="roomKey in selectedRoomKeys" :key="roomKey" cols="12" md="6">
                  <v-card rounded="xl" elevation="0" class="pa-4 h-100">
                    <div class="text-subtitle-1 font-weight-medium mb-1">{{ roomLabel(roomKey) }}</div>
                    <div class="text-caption text-medium-emphasis mb-3">כמות: {{ roomCount(roomKey) }}</div>

                    <v-checkbox
                      v-for="option in roomScopeOptions(roomKey)"
                      :key="`${roomKey}-${option.value}`"
                      :model-value="hasRoomScope(roomKey, option.value)"
                      :label="option.label"
                      density="comfortable"
                      hide-details
                      @update:modelValue="onToggleRoomScope(roomKey, option.value, $event)"
                    />
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-else type="warning" variant="tonal">
                חזרו לשלב הקודם ובחרו חללים לשיפוץ.
              </v-alert>
            </v-window-item>

            <v-window-item :value="4">
              <v-card rounded="xl" elevation="0" class="pa-6 text-center" color="success" variant="tonal">
                <v-icon size="42" icon="mdi-check-decagram-outline" color="success" class="mb-3" />
                <div class="text-h6 mb-2">מעולה! זיהינו {{ summaryItemCount }} סעיפי עבודה לפרויקט שלך.</div>
                <div class="text-body-2 text-medium-emphasis">כעת אפשר לשמור ולעבור למסך כתב הכמויות.</div>
              </v-card>
            </v-window-item>
          </v-window>

          <v-divider class="my-5" />

          <div class="d-flex flex-wrap ga-2 justify-space-between">
            <v-btn variant="text" prepend-icon="mdi-arrow-right" @click="onBackToSetup">
              חזרה לבחירת סוג תכנון
            </v-btn>

            <div class="d-flex ga-2">
              <v-btn
                v-if="planner.step > 1"
                variant="outlined"
                prepend-icon="mdi-chevron-right"
                @click="onPrevious"
              >
                חזרה
              </v-btn>

              <v-btn
                v-if="planner.step < 4"
                color="primary"
                append-icon="mdi-chevron-left"
                :disabled="!canProceed"
                @click="onNext"
              >
                {{ planner.step === 3 ? 'לסיכום' : 'המשך' }}
              </v-btn>

              <v-btn
                v-else
                color="primary"
                prepend-icon="mdi-content-save-check-outline"
                :loading="isSaving"
                @click="onSaveAndViewBoq"
              >
                שמור וצפה בכתב הכמויות
              </v-btn>
            </div>
          </div>
          </template>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { makeRequest } from '../plugins/api';
import { usePlannerStore } from '../stores/planner';

const router = useRouter();
const planner = usePlannerStore();
const isSaving = ref(false);
const saveError = ref('');
const summaryItemsSnapshot = ref([]);

const selectedRoomKeys = computed(() => Object.keys(planner.roomCounts));

const canProceed = computed(() => {
  if (planner.step === 1) {
    return planner.propertyDetails.type && Number(planner.propertyDetails.size_sqm || 0) > 0;
  }

  if (planner.step === 2) {
    return selectedRoomKeys.value.length > 0;
  }

  return true;
});

const summaryItemCount = computed(() => summaryItemsSnapshot.value.length);

const roomLabel = (roomKey) => {
  const found = planner.roomOptions.find((room) => room.value === roomKey);
  return found?.label || roomKey;
};

const roomScopeOptions = (roomKey) => planner.scopeOptionsByRoom[roomKey] || [];

const isRoomSelected = (roomKey) => Number(planner.roomCounts[roomKey] || 0) > 0;

const roomCount = (roomKey) => Number(planner.roomCounts[roomKey] || 0);

const hasRoomScope = (roomKey, scopeKey) => (planner.roomScopes[roomKey] || []).includes(scopeKey);

const onToggleRoomScope = (roomKey, scopeKey, checked) => {
  const currentScopes = [...(planner.roomScopes[roomKey] || [])];

  if (checked && !currentScopes.includes(scopeKey)) {
    planner.setRoomScopes(roomKey, [...currentScopes, scopeKey]);
    return;
  }

  if (!checked && currentScopes.includes(scopeKey)) {
    planner.setRoomScopes(roomKey, currentScopes.filter((scope) => scope !== scopeKey));
  }
};

const onNext = () => {
  if (!canProceed.value) {
    return;
  }

  if (planner.step === 3) {
    summaryItemsSnapshot.value = planner.generateBoq();
  }

  planner.goToStep(planner.step + 1);
};

const onPrevious = () => {
  planner.goToStep(Math.max(1, planner.step - 1));
};

const buildProjectName = () => {
  if (planner.projectName.trim()) {
    return planner.projectName.trim();
  }

  if (planner.propertyDetails.type === 'house') {
    return 'שיפוץ בית פרטי';
  }

  return 'שיפוץ דירה';
};

const extractCreatedProject = (response) => {
  if (response?.data?.id) {
    return response.data;
  }

  if (response?.id) {
    return response;
  }

  return null;
};

const createDraftProject = async (totalBudget = 0) => {
  const payload = {
    name: buildProjectName(),
    property_type: planner.propertyDetails.type === 'house' ? 'private_house' : 'apartment',
    status: 'draft',
    total_budget: totalBudget,
  };

  const createProjectResponse = await makeRequest('/projects', payload, 'POST');
  const createdProject = extractCreatedProject(createProjectResponse);

  if (!createdProject?.id) {
    throw new Error('לא התקבל מזהה פרויקט מהשרת');
  }

  return createdProject;
};

const encodeLineItemDescription = (item) => {
  const moduleName = String(item.moduleName || '').trim();
  const taskDescription = String(item.description || '').trim();

  if (!moduleName) {
    return taskDescription;
  }

  return `[[MODULE:${moduleName}]] מודול: ${moduleName} | ${taskDescription}`;
};

const toBulkLineItemPayload = (generatedItems) => generatedItems.map((item, index) => ({
  planner_task_id: item.taskId ? Number(item.taskId) : null,
  description: encodeLineItemDescription(item),
  quantity: Number(item.quantity || 0),
  unit_of_measurement: item.unit || 'יחידה',
  estimated_price: 0,
  actual_price: 0,
  profession: item.profession || null,
  type: 'boq_line',
  order: index,
}));

const onChooseWizard = () => {
  saveError.value = '';
  summaryItemsSnapshot.value = [];
  planner.resetPlanner();
  planner.setSetupChoice('wizard');
  planner.loadPlannerCatalog();
};

const onChooseManual = async () => {
  saveError.value = '';
  summaryItemsSnapshot.value = [];
  isSaving.value = true;

  try {
    planner.resetPlanner();
    const createdProject = await createDraftProject(0);
    await router.push({ name: 'project-boq', params: { id: createdProject.id } });
  } catch {
    saveError.value = 'פתיחת מצב בנייה ידנית נכשלה. נסו שוב בעוד רגע.';
  } finally {
    isSaving.value = false;
  }
};

const onSaveAndViewBoq = async () => {
  saveError.value = '';
  isSaving.value = true;

  try {
    if (planner.plannerAreas.length === 0) {
      await planner.loadPlannerCatalog();
    }

    const generatedItems = summaryItemsSnapshot.value;

    if (generatedItems.length === 0) {
      throw new Error('אין סעיפים ליצירה');
    }

    const createdProject = await createDraftProject(planner.summaryTotal);

    await makeRequest(`/projects/${createdProject.id}/line-items/bulk`, {
      items: toBulkLineItemPayload(generatedItems),
    }, 'POST');

    await router.push({ name: 'project-boq', params: { id: createdProject.id } });
    summaryItemsSnapshot.value = [];
    planner.resetPlanner();
  } catch {
    saveError.value = 'יצירת כתב הכמויות נכשלה. נסו שוב בעוד רגע.';
  } finally {
    isSaving.value = false;
  }
};

const onBackToSetup = () => {
  summaryItemsSnapshot.value = [];
  planner.resetPlanner();
};

onMounted(() => {
  if (planner.setupChoice === 'wizard' && planner.plannerAreas.length === 0) {
    planner.loadPlannerCatalog();
  }
});
</script>

<style scoped>
.setup-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.25);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  cursor: pointer;
}

.setup-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}

.room-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.25);
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.room-card--active {
  border-color: rgba(var(--v-theme-primary), 0.8);
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>
