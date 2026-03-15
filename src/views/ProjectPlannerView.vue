<template>
  <v-row justify="center">
    <v-col cols="12" lg="10" xl="8">
      <v-card elevation="1" class="pa-4 pa-md-6">
        <v-card-title class="text-h5">מתכנן פרויקט חדש</v-card-title>
        <v-card-subtitle class="mb-5">יצירת פרויקט בשלושה שלבים עם כתב כמויות ראשוני אוטומטי</v-card-subtitle>

        <v-stepper :model-value="planner.step" flat class="mb-6">
          <v-stepper-header>
            <v-stepper-item :value="1" title="פרטי בסיס" />
            <v-divider />
            <v-stepper-item :value="2" title="בחירת אזורים" />
            <v-divider />
            <v-stepper-item :value="3" title="סקירה ושמירה" />
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
                <v-select
                  v-model="planner.propertyType"
                  :items="propertyTypes"
                  label="סוג נכס"
                  prepend-inner-icon="mdi-home-city-outline"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item :value="2">
            <div class="text-subtitle-1 mb-3">בחרו את האזורים הכלולים בפרויקט</div>
            <v-chip-group selected-class="text-primary" multiple>
              <v-chip
                v-for="area in planner.areaOptions"
                :key="area.value"
                :variant="isAreaSelected(area.value) ? 'elevated' : 'outlined'"
                :color="isAreaSelected(area.value) ? 'primary' : undefined"
                size="large"
                class="ma-1"
                @click="planner.toggleArea(area.value)"
              >
                {{ area.label }}
              </v-chip>
            </v-chip-group>

            <v-alert
              v-if="planner.selectedAreas.length === 0"
              type="warning"
              variant="tonal"
              class="mt-4"
            >
              צריך לבחור לפחות אזור אחד כדי להמשיך.
            </v-alert>
          </v-window-item>

          <v-window-item :value="3">
            <v-alert type="info" variant="tonal" class="mb-4">
              נוצר כתב כמויות ראשוני לפי האזורים שבחרתם. אפשר לערוך בהמשך במסך הפרויקט.
            </v-alert>

            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-right">אזור</th>
                  <th class="text-right">סעיף</th>
                  <th class="text-right">כמות</th>
                  <th class="text-right">יחידה</th>
                  <th class="text-right">עלות יחידה משוערת</th>
                  <th class="text-right">סה"כ משוער</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in planner.generatedLineItems" :key="item.id">
                  <td>{{ item.areaLabel }}</td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.unit }}</td>
                  <td>{{ currency(item.estimatedUnitPrice) }}</td>
                  <td>{{ currency(item.quantity * item.estimatedUnitPrice) }}</td>
                </tr>
              </tbody>
            </v-table>

            <div class="d-flex justify-space-between align-center mt-4">
              <div class="text-subtitle-1 font-weight-bold">
                סה"כ אומדן ראשוני: {{ currency(planner.summaryTotal) }}
              </div>
              <v-chip color="primary" variant="tonal">
                {{ planner.generatedLineItems.length }} סעיפים
              </v-chip>
            </div>
          </v-window-item>
        </v-window>

        <v-divider class="my-5" />

        <v-alert v-if="saveError" type="error" variant="tonal" class="mb-4">
          {{ saveError }}
        </v-alert>

        <div class="d-flex flex-wrap ga-2 justify-space-between">
          <v-btn variant="text" prepend-icon="mdi-restart" @click="planner.resetPlanner">
            איפוס
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
              v-if="planner.step < 3"
              color="primary"
              append-icon="mdi-chevron-left"
              :disabled="!canProceed"
              @click="onNext"
            >
              המשך
            </v-btn>

            <v-btn
              v-else
              color="primary"
              prepend-icon="mdi-content-save-outline"
              :loading="isSaving"
              @click="onSaveProject"
            >
              שמירת פרויקט
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { makeRequest } from '../plugins/api';
import { usePlannerStore } from '../stores/planner';

const router = useRouter();
const planner = usePlannerStore();
const isSaving = ref(false);
const saveError = ref('');

const propertyTypes = [
  'דירה',
  'בית פרטי',
  'פנטהאוז',
  'משרד',
];

const canProceed = computed(() => {
  if (planner.step === 1) {
    return planner.projectName.trim().length > 1 && planner.propertyType;
  }

  if (planner.step === 2) {
    return planner.selectedAreas.length > 0;
  }

  return true;
});

const isAreaSelected = (areaKey) => planner.selectedAreas.includes(areaKey);

const onNext = () => {
  if (!canProceed.value) {
    return;
  }

  if (planner.step === 2) {
    planner.generateLineItems();
  }

  planner.goToStep(planner.step + 1);
};

const onPrevious = () => {
  planner.goToStep(Math.max(1, planner.step - 1));
};

const mapPropertyType = (value) => {
  const map = {
    דירה: 'apartment',
    'בית פרטי': 'private_house',
    פנטהאוז: 'apartment',
    משרד: 'other',
  };

  return map[value] || 'other';
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

const onSaveProject = async () => {
  saveError.value = '';
  isSaving.value = true;

  try {
    const projectPayload = {
      name: planner.projectName.trim(),
      property_type: mapPropertyType(planner.propertyType),
      status: 'draft',
      total_budget: planner.summaryTotal,
    };

    const createProjectResponse = await makeRequest('/projects', projectPayload, 'POST');
    const createdProject = extractCreatedProject(createProjectResponse);

    if (!createdProject?.id) {
      throw new Error('לא התקבל מזהה פרויקט מהשרת');
    }

    for (const [index, item] of planner.generatedLineItems.entries()) {
      await makeRequest(`/projects/${createdProject.id}/line-items`, {
        description: `${item.areaLabel} - ${item.title}`,
        quantity: Number(item.quantity || 0),
        unit_of_measurement: item.unit || 'יחידה',
        estimated_price: Number(item.quantity || 0) * Number(item.estimatedUnitPrice || 0),
        actual_price: 0,
        type: 'boq_line',
        order: index,
      }, 'POST');
    }

    planner.resetPlanner();
    router.push({ name: 'project-dashboard', params: { id: createdProject.id } });
  } catch {
    saveError.value = 'שמירת הפרויקט נכשלה. נסו שוב בעוד רגע.';
  } finally {
    isSaving.value = false;
  }
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(value);
</script>
