<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">הוצאות פרויקט</div>
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="dialog = true">
        הוצאה חדשה
      </v-btn>
    </div>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" sm="5">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="חיפוש הוצאה"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="filterCategory"
          :items="categoryOptions"
          label="קטגוריה"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <!-- Expenses table -->
    <v-card rounded="xl" elevation="0">
      <AppStateError v-if="errorMessage" :message="errorMessage" @retry="loadExpenses" />
      <AppStateLoading v-if="isLoading" message="טוען הוצאות פרויקט..." />
      <AppStateEmpty
        v-else-if="filteredExpenses.length === 0"
        icon="mdi-receipt-text-outline"
        title="אין הוצאות להצגה"
        description="לא נמצאו הוצאות שמתאימות לסינון הנוכחי."
        class="ma-4"
      />
      <v-table v-else density="comfortable" hover>
        <thead>
          <tr>
            <th class="text-right">תיאור</th>
            <th class="text-right">קטגוריה</th>
            <th class="text-right">סכום</th>
            <th class="text-right">תאריך</th>
            <th class="text-right">ספק</th>
            <th class="text-right">קבלה</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in filteredExpenses" :key="expense.id">
            <td>{{ expense.description }}</td>
            <td>
              <v-chip size="x-small" :color="expense.color" variant="tonal">{{ expense.category }}</v-chip>
            </td>
            <td class="font-weight-medium">{{ expense.amount }}</td>
            <td class="text-medium-emphasis">{{ expense.date }}</td>
            <td>{{ expense.vendor }}</td>
            <td>
              <v-icon v-if="expense.receipt" size="18" color="success">mdi-file-check-outline</v-icon>
              <v-icon v-else size="18" color="error">mdi-file-remove-outline</v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Add expense dialog placeholder -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">הוספת הוצאה</v-card-title>
        <v-text-field v-model="newExpense.description" label="תיאור" variant="outlined" class="mb-3" />
        <v-select v-model="newExpense.category" :items="categoryOptions" label="קטגוריה" variant="outlined" class="mb-3" />
        <v-text-field v-model="newExpense.amount" label="סכום (₪)" variant="outlined" class="mb-3" type="number" />
        <v-text-field v-model="newExpense.vendor" label="ספק" variant="outlined" class="mb-4" />
        <div class="d-flex justify-end ga-3">
          <v-btn variant="text" @click="dialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" @click="onAddExpense" :loading="isSaving">שמור</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppStateEmpty from '../components/state/AppStateEmpty.vue';
import AppStateError from '../components/state/AppStateError.vue';
import AppStateLoading from '../components/state/AppStateLoading.vue';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const dialog = ref(false);
const search = ref('');
const filterCategory = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');

const categoryOptions = ['חשמל', 'אינסטלציה', 'טיח וצבע', 'ריצוף', 'מטבח', 'ריהוט', 'הריסה'];

const expenses = ref([]);

const projectId = computed(() => route.params.id);

const expensesEndpoint = (id) => `/projects/${id}/expenses`;

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const colorByCategory = (category) => {
  const map = {
    חשמל: 'warning',
    אינסטלציה: 'info',
    'טיח וצבע': 'success',
    ריצוף: 'secondary',
    מטבח: 'primary',
    ריהוט: 'purple',
    הריסה: 'error',
  };

  return map[category] || 'primary';
};

const normalizeCategory = (category) => category || 'כללי';

const toItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const mapExpense = (expense) => {
  const category = normalizeCategory(expense.category);
  return {
    id: expense.id,
    description: expense.description || 'ללא תיאור',
    category,
    amount: currency(expense.amount),
    date: expense.expense_date ? new Date(expense.expense_date).toLocaleDateString('he-IL') : 'ללא תאריך',
    vendor: expense.vendor || '-',
    receipt: Boolean(expense.receipt_path),
    color: colorByCategory(category),
  };
};

const loadExpenses = async () => {
  if (!projectId.value) {
    expenses.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await makeRequest(expensesEndpoint(projectId.value));
    expenses.value = toItems(response).map(mapExpense);
  } catch {
    errorMessage.value = 'טעינת ההוצאות נכשלה.';
    expenses.value = [];
  } finally {
    isLoading.value = false;
  }
};

const newExpense = reactive({ description: '', category: '', amount: '', vendor: '' });

const filteredExpenses = computed(() =>
  expenses.value.filter(e => {
    const matchSearch = !search.value || e.description.includes(search.value) || e.vendor.includes(search.value);
    const matchCat = !filterCategory.value || e.category === filterCategory.value;
    return matchSearch && matchCat;
  })
);

const onAddExpense = async () => {
  if (!projectId.value || !newExpense.description || !newExpense.category || !newExpense.amount) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      description: newExpense.description,
      category: newExpense.category,
      amount: Number(newExpense.amount),
      vendor: newExpense.vendor,
      expense_date: new Date().toISOString().slice(0, 10),
      payment_method: 'bank_transfer',
      status: 'approved',
    };

    await makeRequest(expensesEndpoint(projectId.value), payload, 'POST');

    await loadExpenses();
    dialog.value = false;
    Object.assign(newExpense, { description: '', category: '', amount: '', vendor: '' });
  } catch {
    errorMessage.value = 'שמירת ההוצאה נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => route.params.id,
  () => {
    loadExpenses();
  },
  { immediate: true },
);
</script>
