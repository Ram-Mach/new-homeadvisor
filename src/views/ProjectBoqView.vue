<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">BOQ - כתב כמויות</div>
      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="itemDialog = true">
        הוספת סעיף
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" sm="5">
        <v-text-field
          v-model="search"
          label="חיפוש סעיף"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="pa-4 mb-5">
      <v-table density="comfortable" hover>
        <thead>
          <tr>
            <th class="text-right">סעיף</th>
            <th class="text-right">יחידה</th>
            <th class="text-right">כמות</th>
            <th class="text-right">מחיר יחידה</th>
            <th class="text-right">סה"כ</th>
            <th class="text-right">פעולות</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ currency(item.unitPrice) }}</td>
            <td class="font-weight-bold">{{ currency(item.quantity * item.unitPrice) }}</td>
            <td>
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="startEdit(item)" />
              <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeItem(item.id)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-row>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" color="surface-variant" class="pa-4">
          <div class="text-caption text-medium-emphasis">סה"כ פריטים</div>
          <div class="text-h5 font-weight-bold">{{ items.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" color="surface-variant" class="pa-4">
          <div class="text-caption text-medium-emphasis">עלות כוללת</div>
          <div class="text-h5 font-weight-bold">{{ currency(totalCost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" color="surface-variant" class="pa-4">
          <div class="text-caption text-medium-emphasis">מחיר ממוצע לסעיף</div>
          <div class="text-h5 font-weight-bold">{{ currency(avgCost) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="itemDialog" max-width="540">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">{{ editingId ? 'עריכת סעיף BOQ' : 'הוספת סעיף BOQ' }}</v-card-title>
        <v-text-field v-model="draft.title" label="שם סעיף" variant="outlined" class="mb-3" />
        <v-row>
          <v-col cols="4">
            <v-text-field v-model="draft.unit" label="יחידה" variant="outlined" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model.number="draft.quantity" label="כמות" type="number" variant="outlined" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model.number="draft.unitPrice" label="מחיר יחידה" type="number" variant="outlined" />
          </v-col>
        </v-row>
        <div class="text-body-2 mb-4">סה"כ מחושב: <strong>{{ currency((draft.quantity || 0) * (draft.unitPrice || 0)) }}</strong></div>
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="itemDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" @click="saveItem">שמירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const search = ref('');
const itemDialog = ref(false);
const editingId = ref(null);

const draft = reactive({
  title: '',
  unit: 'מ"ר',
  quantity: 1,
  unitPrice: 0,
});

const items = ref([
  { id: 1, title: 'ריצוף גרניט פורצלן', unit: 'מ"ר', quantity: 120, unitPrice: 180 },
  { id: 2, title: 'צביעת קירות ותקרות', unit: 'מ"ר', quantity: 350, unitPrice: 32 },
  { id: 3, title: 'נקודות חשמל', unit: 'יח', quantity: 48, unitPrice: 140 },
  { id: 4, title: 'יחידות נגרות מטבח', unit: 'יח', quantity: 1, unitPrice: 52000 },
]);

const filteredItems = computed(() =>
  items.value.filter((item) => !search.value || item.title.includes(search.value))
);

const totalCost = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
);

const avgCost = computed(() => (items.value.length ? totalCost.value / items.value.length : 0));

const currency = (value) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value || 0);

const startEdit = (item) => {
  editingId.value = item.id;
  draft.title = item.title;
  draft.unit = item.unit;
  draft.quantity = item.quantity;
  draft.unitPrice = item.unitPrice;
  itemDialog.value = true;
};

const saveItem = () => {
  if (!draft.title || !draft.unit || !draft.quantity || !draft.unitPrice) return;

  if (editingId.value) {
    const index = items.value.findIndex((item) => item.id === editingId.value);
    if (index >= 0) {
      items.value[index] = { id: editingId.value, ...draft };
    }
  } else {
    items.value.unshift({ id: Date.now(), ...draft });
  }

  editingId.value = null;
  draft.title = '';
  draft.unit = 'מ"ר';
  draft.quantity = 1;
  draft.unitPrice = 0;
  itemDialog.value = false;
};

const removeItem = (id) => {
  items.value = items.value.filter((item) => item.id !== id);
};
</script>
