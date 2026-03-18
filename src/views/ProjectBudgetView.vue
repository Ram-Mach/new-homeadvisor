<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">ניהול תקציב פרויקט</div>
      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="openCreate">
        הוספת קטגוריה
      </v-btn>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0"   class="pa-5">
          <div class="text-caption text-medium-emphasis mb-1">תקציב כולל</div>
          <div class="text-h5 font-weight-bold">{{ formatCurrency(totalBudget) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" color="success-lighten-5" class="pa-5">
          <div class="text-caption text-medium-emphasis mb-1">נוצל עד כה</div>
          <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(totalSpent) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" color="warning-lighten-5" class="pa-5">
          <div class="text-caption text-medium-emphasis mb-1">יתרה</div>
          <div class="text-h5 font-weight-bold text-warning">{{ formatCurrency(totalRemaining) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="pa-5 mb-6">
      <div class="d-flex justify-space-between mb-2">
        <span class="text-body-2">ניצול תקציב כולל</span>
        <span class="text-body-2 font-weight-bold">{{ overallUsage }}%</span>
      </div>
      <v-progress-linear :model-value="overallUsage" color="primary" height="12" rounded   />
    </v-card>

    <v-card rounded="xl" elevation="0" class="pa-5">
      <div class="text-subtitle-1 font-weight-semibold mb-4">קטגוריות תקציב</div>
      <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
        {{ loadError }}
      </v-alert>
      <div v-if="isLoading" class="py-6 d-flex justify-center">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <v-table density="comfortable">
        <thead>
          <tr>
            <th class="text-right">קטגוריה</th>
            <th class="text-right">תקציב מאושר</th>
            <th class="text-right">בוצע</th>
            <th class="text-right">יתרה</th>
            <th class="text-right">%</th>
            <th class="text-right">פעולות</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in categories" :key="row.id">
            <td>{{ row.name }}</td>
            <td>{{ formatCurrency(row.budget) }}</td>
            <td>{{ formatCurrency(row.spent) }}</td>
            <td :class="remaining(row) < 0 ? 'text-error' : 'text-success'">{{ formatCurrency(remaining(row)) }}</td>
            <td>
              <v-progress-linear
                :model-value="usage(row)"
                :color="usage(row) > 100 ? 'error' : 'primary'"
                height="6"
                rounded
                
                style="min-width: 90px"
              />
            </td>
            <td>
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="openEdit(row)" />
              <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeCategory(row.id)" />
            </td>
          </tr>
          <tr v-if="!isLoading && categories.length === 0">
            <td colspan="6" class="text-center text-medium-emphasis py-4">אין קטגוריות תקציב עדיין.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">{{ editingId ? 'עריכת קטגוריית תקציב' : 'קטגוריית תקציב חדשה' }}</v-card-title>
        <v-text-field v-model="draft.name" label="שם קטגוריה" variant="outlined" class="mb-3" />
        <v-row>
          <v-col cols="6">
            <v-text-field v-model.number="draft.budget" label="תקציב" type="number" variant="outlined" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model.number="draft.spent" label="סכום שבוצע" type="number" variant="outlined" />
          </v-col>
        </v-row>
        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="text" @click="dialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" :loading="isSaving" @click="saveCategory">שמירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { makeRequest } from '../plugins/api';

const route = useRoute();
const projectId = computed(() => route.params.id);

const dialog = ref(false);
const editingId = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const loadError = ref('');
const saveError = ref('');

const draft = reactive({
  name: '',
  budget: 0,
  spent: 0,
});

const categories = ref([]);

const totalBudget = computed(() => categories.value.reduce((sum, row) => sum + row.budget, 0));
const totalSpent = computed(() => categories.value.reduce((sum, row) => sum + row.spent, 0));
const totalRemaining = computed(() => totalBudget.value - totalSpent.value);
const overallUsage = computed(() => (totalBudget.value ? Math.round((totalSpent.value / totalBudget.value) * 100) : 0));

const usage = (row) => (row.budget ? Math.round((row.spent / row.budget) * 100) : 0);
const remaining = (row) => row.budget - row.spent;

const formatCurrency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(value || 0);

const toCategory = (lineItem) => ({
  id: lineItem.id,
  name: lineItem.description || 'קטגוריה ללא שם',
  budget: Number(lineItem.estimated_price || 0),
  spent: Number(lineItem.actual_price || 0),
});

const toLineItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

const loadCategories = async () => {
  if (!projectId.value) {
    categories.value = [];
    loadError.value = 'לא נמצא מזהה פרויקט.';
    return;
  }

  isLoading.value = true;
  loadError.value = '';

  try {
    const response = await makeRequest(`/projects/${projectId.value}/line-items`, { per_page: 200 });
    categories.value = toLineItems(response).map(toCategory);
  } catch {
    loadError.value = 'טעינת קטגוריות התקציב נכשלה. נסו לרענן את העמוד.';
    categories.value = [];
  } finally {
    isLoading.value = false;
  }
};

const openCreate = () => {
  saveError.value = '';
  editingId.value = null;
  draft.name = '';
  draft.budget = 0;
  draft.spent = 0;
  dialog.value = true;
};

const openEdit = (row) => {
  saveError.value = '';
  editingId.value = row.id;
  draft.name = row.name;
  draft.budget = row.budget;
  draft.spent = row.spent;
  dialog.value = true;
};

const saveCategory = async () => {
  if (!draft.name || draft.budget < 0 || draft.spent < 0) return;

  if (!projectId.value) {
    saveError.value = 'לא נמצא מזהה פרויקט.';
    return;
  }

  isSaving.value = true;
  saveError.value = '';

  const payload = {
    description: draft.name,
    quantity: 1,
    unit_of_measurement: 'יחידה',
    estimated_price: Number(draft.budget),
    actual_price: Number(draft.spent),
    type: 'boq_line',
  };

  try {
    if (editingId.value) {
      await makeRequest(`/projects/${projectId.value}/line-items/${editingId.value}`, payload, 'PATCH');
    } else {
      await makeRequest(`/projects/${projectId.value}/line-items`, payload, 'POST');
    }

    await loadCategories();
    dialog.value = false;
  } catch {
    saveError.value = 'שמירת הקטגוריה נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }

  if (saveError.value) {
    return;
  }
};

const removeCategory = async (id) => {
  if (!projectId.value) {
    loadError.value = 'לא נמצא מזהה פרויקט.';
    return;
  }

  try {
    await makeRequest(`/projects/${projectId.value}/line-items/${id}`, {}, 'DELETE');
    categories.value = categories.value.filter((row) => row.id !== id);
  } catch {
    loadError.value = 'מחיקת הקטגוריה נכשלה. נסו שוב.';
  }
};

onMounted(loadCategories);
</script>
