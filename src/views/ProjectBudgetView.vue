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
                bg-color="surface-variant"
                style="min-width: 90px"
              />
            </td>
            <td>
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="openEdit(row)" />
              <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeCategory(row.id)" />
            </td>
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
          <v-btn color="primary" rounded="lg" @click="saveCategory">שמירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const dialog = ref(false);
const editingId = ref(null);

const draft = reactive({
  name: '',
  budget: 0,
  spent: 0,
});

const categories = ref([
  { id: 1, name: 'הריסה ושלד', budget: 60000, spent: 58000 },
  { id: 2, name: 'חשמל', budget: 35000, spent: 32000 },
  { id: 3, name: 'אינסטלציה', budget: 28000, spent: 25000 },
  { id: 4, name: 'טיח וצבע', budget: 40000, spent: 18000 },
  { id: 5, name: 'ריצוף ואריחים', budget: 55000, spent: 42000 },
  { id: 6, name: 'מטבח', budget: 70000, spent: 43400 },
  { id: 7, name: 'ריהוט ועיצוב', budget: 32000, spent: 0 },
]);

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

const openCreate = () => {
  editingId.value = null;
  draft.name = '';
  draft.budget = 0;
  draft.spent = 0;
  dialog.value = true;
};

const openEdit = (row) => {
  editingId.value = row.id;
  draft.name = row.name;
  draft.budget = row.budget;
  draft.spent = row.spent;
  dialog.value = true;
};

const saveCategory = () => {
  if (!draft.name || draft.budget < 0 || draft.spent < 0) return;

  if (editingId.value) {
    const index = categories.value.findIndex((row) => row.id === editingId.value);
    if (index >= 0) {
      categories.value[index] = {
        id: editingId.value,
        name: draft.name,
        budget: Number(draft.budget),
        spent: Number(draft.spent),
      };
    }
  } else {
    categories.value.unshift({
      id: Date.now(),
      name: draft.name,
      budget: Number(draft.budget),
      spent: Number(draft.spent),
    });
  }

  dialog.value = false;
};

const removeCategory = (id) => {
  categories.value = categories.value.filter((row) => row.id !== id);
};
</script>
