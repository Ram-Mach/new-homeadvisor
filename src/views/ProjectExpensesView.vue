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
      <v-table density="comfortable" hover>
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
          <v-btn color="primary" rounded="lg" @click="onAddExpense">שמור</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const dialog = ref(false);
const search = ref('');
const filterCategory = ref(null);

const categoryOptions = ['חשמל', 'אינסטלציה', 'טיח וצבע', 'ריצוף', 'מטבח', 'ריהוט', 'הריסה'];

const expenses = ref([
  { id: 1, description: 'עבודות הריסה', category: 'הריסה', amount: '₪18,000', date: '01/03/2026', vendor: 'יוסי לוי עבודות', receipt: true, color: 'primary' },
  { id: 2, description: 'חומרי חשמל – שלב א', category: 'חשמל', amount: '₪12,500', date: '05/03/2026', vendor: 'ספק חשמל ישיר', receipt: true, color: 'warning' },
  { id: 3, description: 'צנרת PVC', category: 'אינסטלציה', amount: '₪7,200', date: '08/03/2026', vendor: 'אינסטל פרו', receipt: false, color: 'info' },
  { id: 4, description: 'אריחי רצפה 60x60', category: 'ריצוף', amount: '₪22,000', date: '10/03/2026', vendor: 'קרמיקה פלוס', receipt: true, color: 'secondary' },
  { id: 5, description: 'צבע פנים – כל הדירה', category: 'טיח וצבע', amount: '₪9,800', date: '12/03/2026', vendor: 'צבעי שלום', receipt: true, color: 'success' },
]);

const newExpense = reactive({ description: '', category: '', amount: '', vendor: '' });

const filteredExpenses = computed(() =>
  expenses.value.filter(e => {
    const matchSearch = !search.value || e.description.includes(search.value) || e.vendor.includes(search.value);
    const matchCat = !filterCategory.value || e.category === filterCategory.value;
    return matchSearch && matchCat;
  })
);

const onAddExpense = () => {
  expenses.value.push({
    id: Date.now(),
    ...newExpense,
    amount: `₪${parseInt(newExpense.amount || 0).toLocaleString()}`,
    date: new Date().toLocaleDateString('he-IL'),
    receipt: false,
    color: 'primary',
  });
  dialog.value = false;
  Object.assign(newExpense, { description: '', category: '', amount: '', vendor: '' });
};
</script>
