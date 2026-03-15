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
      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">
        {{ errorMessage }}
      </v-alert>
      <div v-if="isLoading" class="py-6 d-flex justify-center">
        <v-progress-circular indeterminate color="primary" />
      </div>
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
              <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeItem(item.id)" :loading="isSaving" />
            </td>
          </tr>
          <tr v-if="!isLoading && filteredItems.length === 0">
            <td colspan="6" class="text-center text-medium-emphasis py-6">אין סעיפים להצגה</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-row>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis">סה"כ פריטים</div>
          <div class="text-h5 font-weight-bold">{{ items.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis">עלות כוללת</div>
          <div class="text-h5 font-weight-bold">{{ currency(totalCost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" class="pa-4">
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
          <v-btn color="primary" rounded="lg" @click="saveItem" :loading="isSaving">שמירה</v-btn>
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

const search = ref('');
const itemDialog = ref(false);
const editingId = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');

const draft = reactive({
  title: '',
  unit: 'מ"ר',
  quantity: 1,
  unitPrice: 0,
});

const items = ref([]);

const projectId = computed(() => route.params.id);

const listEndpoints = (id) => [
  `/projects/${id}/line-items`,
  `/projects/${id}/project-line-items`,
];

const itemEndpoints = (id, lineItemId) => [
  `/projects/${id}/line-items/${lineItemId}`,
  `/projects/${id}/project-line-items/${lineItemId}`,
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

const mapLineItem = (item) => ({
  id: item.id,
  title: item.description || 'סעיף ללא שם',
  unit: item.unit_of_measurement || 'יחידה',
  quantity: Number(item.quantity || 0),
  unitPrice: Number(item.estimated_price || 0),
});

const lineItemPayload = () => ({
  description: draft.title,
  unit_of_measurement: draft.unit,
  quantity: Number(draft.quantity || 0),
  estimated_price: Number(draft.unitPrice || 0),
  status: 'pending',
  type: 'boq_line',
});

const loadLineItems = async () => {
  if (!projectId.value) {
    items.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    let loaded = false;

    for (const endpoint of listEndpoints(projectId.value)) {
      try {
        const response = await makeRequest(endpoint);
        items.value = toItems(response).map(mapLineItem);
        loaded = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!loaded) {
      items.value = [];
    }
  } catch {
    errorMessage.value = 'טעינת כתב הכמויות נכשלה.';
    items.value = [];
  } finally {
    isLoading.value = false;
  }
};

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
  return onSaveItem();
};

const resetDraft = () => {
  editingId.value = null;
  draft.title = '';
  draft.unit = 'מ"ר';
  draft.quantity = 1;
  draft.unitPrice = 0;
};

const onSaveItem = async () => {
  if (!draft.title || !draft.unit || !draft.quantity || !draft.unitPrice || !projectId.value) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    if (editingId.value) {
      let updated = false;
      for (const endpoint of itemEndpoints(projectId.value, editingId.value)) {
        try {
          await makeRequest(endpoint, lineItemPayload(), 'PUT');
          updated = true;
          break;
        } catch (error) {
          if (error?.response?.status !== 404) {
            throw error;
          }
        }
      }

      if (!updated) {
        throw new Error('Line item update route not found');
      }
    } else {
      let created = false;
      for (const endpoint of listEndpoints(projectId.value)) {
        try {
          await makeRequest(endpoint, lineItemPayload(), 'POST');
          created = true;
          break;
        } catch (error) {
          if (error?.response?.status !== 404) {
            throw error;
          }
        }
      }

      if (!created) {
        throw new Error('Line item create route not found');
      }
    }

    await loadLineItems();
    resetDraft();
    itemDialog.value = false;
  } catch {
    errorMessage.value = 'שמירת הסעיף נכשלה. בדקו את הנתונים ונסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (id) => {
  if (!projectId.value) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    let deleted = false;
    for (const endpoint of itemEndpoints(projectId.value, id)) {
      try {
        await makeRequest(endpoint, {}, 'DELETE');
        deleted = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!deleted) {
      throw new Error('Line item delete route not found');
    }

    await loadLineItems();
  } catch {
    errorMessage.value = 'מחיקת הסעיף נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadLineItems);
</script>
