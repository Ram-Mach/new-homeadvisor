<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-h5 font-weight-bold">רשימת קניות</div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">הוספת פריט</v-btn>
    </div>
    <div class="text-body-2 text-medium-emphasis mb-6">
      ניהול פריטים לרכישה לפי חומר לבן ושאר פריטי ביצוע
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

    <div v-if="isLoading" class="py-8 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="1" class="pa-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="text-subtitle-1 font-weight-bold">חומר לבן</div>
            <v-chip color="primary" variant="tonal">{{ whiteMaterials.length }} פריטים</v-chip>
          </div>

          <v-table density="comfortable">
            <thead>
              <tr>
                <th class="text-right">פריט</th>
                <th class="text-right">מותג מועדף</th>
                <th class="text-right">כמות</th>
                <th class="text-right">סטטוס</th>
                <th class="text-right">פעולות</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in whiteMaterials" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.brand }}</td>
                <td>{{ item.qty }}</td>
                <td>
                  <v-chip size="small" :color="item.statusColor" variant="tonal">{{ item.status }}</v-chip>
                </td>
                <td>
                  <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="openEditDialog(item.id)" />
                  <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    :loading="deletingId === item.id"
                    @click="confirmDeleteItem(item.id)"
                  />
                </td>
              </tr>
              <tr v-if="!isLoading && whiteMaterials.length === 0">
                <td colspan="5" class="text-center text-medium-emphasis py-3">אין פריטים להצגה</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="1" class="pa-4 mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">שאר פריטי רכישה</div>
          <v-list lines="two">
            <v-list-item
              v-for="item in otherMaterials"
              :key="item.id"
              :title="item.name"
              :subtitle="`ספק: ${item.vendor} • כמות: ${item.qty}`"
            >
              <template #append>
                <div class="d-flex align-center">
                  <v-chip size="small" :color="item.statusColor" variant="tonal" class="me-2">{{ item.status }}</v-chip>
                  <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="openEditDialog(item.id)" />
                  <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    :loading="deletingId === item.id"
                    @click="confirmDeleteItem(item.id)"
                  />
                </div>
              </template>
            </v-list-item>
            <v-list-item v-if="!isLoading && otherMaterials.length === 0" title="אין פריטים להצגה" />
          </v-list>
        </v-card>

        <v-card elevation="1" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">תקציר רכישות</div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-medium-emphasis">סה"כ חומר לבן</span>
            <span class="font-weight-bold">{{ currency(whiteTotal) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-medium-emphasis">סה"כ יתר פריטים</span>
            <span class="font-weight-bold">{{ currency(otherTotal) }}</span>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex justify-space-between">
            <span class="font-weight-bold">סה"כ קניות מתוכנן</span>
            <span class="text-primary font-weight-bold">{{ currency(whiteTotal + otherTotal) }}</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isDialogOpen" max-width="620">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">{{ editingId ? 'עריכת פריט רכישה' : 'פריט רכישה חדש' }}</v-card-title>

        <v-alert v-if="dialogError" type="error" variant="tonal" class="mb-4">
          {{ dialogError }}
        </v-alert>

        <v-row>
          <v-col cols="12">
            <v-text-field v-model="draft.description" label="שם פריט" variant="outlined" :disabled="isSaving" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="draft.profession" label="מותג/ספק" variant="outlined" :disabled="isSaving" />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="draft.type"
              :items="typeOptions"
              label="סוג פריט"
              variant="outlined"
              :disabled="isSaving"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model.number="draft.quantity" label="כמות" type="number" variant="outlined" :disabled="isSaving" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="draft.unit"
              label="יחידת מידה"
              variant="outlined"
              :disabled="isSaving"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="draft.status"
              :items="statusOptions"
              label="סטטוס"
              variant="outlined"
              :disabled="isSaving"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="draft.estimatedPrice"
              label="מחיר משוער"
              type="number"
              variant="outlined"
              :disabled="isSaving"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="draft.actualPrice"
              label="מחיר בפועל"
              type="number"
              variant="outlined"
              :disabled="isSaving"
            />
          </v-col>
        </v-row>

        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="text" :disabled="isSaving" @click="isDialogOpen = false">ביטול</v-btn>
          <v-btn color="primary" :loading="isSaving" @click="saveItem">שמירה</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isDeleteDialogOpen" max-width="420">
      <v-card rounded="xl" class="pa-5">
        <v-card-title class="text-subtitle-1 font-weight-bold mb-2">מחיקת פריט</v-card-title>
        <div class="text-body-2 text-medium-emphasis mb-4">
          האם למחוק את הפריט לצמיתות?
        </div>
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" :disabled="deletingId !== null" @click="cancelDelete">ביטול</v-btn>
          <v-btn color="error" :loading="deletingId !== null" @click="deleteConfirmedItem">מחיקה</v-btn>
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
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const deletingId = ref(null);
const lineItems = ref([]);
const isDialogOpen = ref(false);
const isSaving = ref(false);
const editingId = ref(null);
const dialogError = ref('');
const isDeleteDialogOpen = ref(false);
const pendingDeleteId = ref(null);

const statusOptions = [
  { title: 'ממתין לרכישה', value: 'pending' },
  { title: 'בהצעת מחיר', value: 'in_progress' },
  { title: 'נרכש', value: 'completed' },
];

const typeOptions = [
  { title: 'חומר לבן', value: 'material_spec' },
  { title: 'פריט כללי', value: 'boq_line' },
];

const draft = reactive({
  description: '',
  profession: '',
  quantity: 1,
  unit: 'יחידה',
  status: 'pending',
  type: 'boq_line',
  estimatedPrice: 0,
  actualPrice: 0,
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

const statusLabel = (status) => {
  const map = {
    pending: 'ממתין לרכישה',
    in_progress: 'בהצעת מחיר',
    completed: 'נרכש',
  };

  return map[status] || 'ממתין לרכישה';
};

const statusColor = (status) => {
  const map = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
  };

  return map[status] || 'warning';
};

const toQtyLabel = (item) => {
  const quantity = Number(item.quantity || 0);
  const unit = item.unit_of_measurement || 'יחידה';
  return `${quantity} ${unit}`;
};

const toPrice = (item) => {
  const actual = Number(item.actual_price || 0);
  if (actual > 0) {
    return actual;
  }
  return Number(item.estimated_price || 0);
};

const whiteKeywords = ['תנור', 'כיריים', 'מדיח', 'מקרר', 'מכונת כביסה', 'מייבש', 'מקפיא', 'אסלה'];

const isWhiteMaterial = (item) => {
  const description = String(item.description || '');
  return item.type === 'material_spec' || whiteKeywords.some((keyword) => description.includes(keyword));
};

const whiteMaterials = computed(() => lineItems.value
  .filter((item) => isWhiteMaterial(item))
  .map((item) => ({
    id: item.id,
    name: item.description || 'פריט ללא שם',
    brand: item.profession || 'לא הוגדר',
    quantity: Number(item.quantity || 0),
    qty: toQtyLabel(item),
    price: toPrice(item),
    status: statusLabel(item.status),
    statusColor: statusColor(item.status),
  })));

const otherMaterials = computed(() => lineItems.value
  .filter((item) => !isWhiteMaterial(item))
  .map((item) => ({
    id: item.id,
    name: item.description || 'פריט ללא שם',
    vendor: item.profession || 'לא הוגדר',
    quantity: Number(item.quantity || 0),
    qty: toQtyLabel(item),
    price: toPrice(item),
    status: statusLabel(item.status),
    statusColor: statusColor(item.status),
  })));

const whiteTotal = computed(() => whiteMaterials.value.reduce((acc, item) => acc + (item.price * item.quantity), 0));
const otherTotal = computed(() => otherMaterials.value.reduce((acc, item) => acc + (item.price * item.quantity), 0));

const resetDraft = () => {
  draft.description = '';
  draft.profession = '';
  draft.quantity = 1;
  draft.unit = 'יחידה';
  draft.status = 'pending';
  draft.type = 'boq_line';
  draft.estimatedPrice = 0;
  draft.actualPrice = 0;
};

const openCreateDialog = () => {
  editingId.value = null;
  dialogError.value = '';
  resetDraft();
  isDialogOpen.value = true;
};

const openEditDialog = (id) => {
  const item = lineItems.value.find((entry) => entry.id === id);
  if (!item) {
    return;
  }

  editingId.value = id;
  dialogError.value = '';
  draft.description = item.description || '';
  draft.profession = item.profession || '';
  draft.quantity = Number(item.quantity || 1);
  draft.unit = item.unit_of_measurement || 'יחידה';
  draft.status = item.status || 'pending';
  draft.type = item.type || 'boq_line';
  draft.estimatedPrice = Number(item.estimated_price || 0);
  draft.actualPrice = Number(item.actual_price || 0);
  isDialogOpen.value = true;
};

const buildPayload = () => ({
  description: String(draft.description || '').trim(),
  profession: String(draft.profession || '').trim() || null,
  quantity: Number(draft.quantity || 0),
  unit_of_measurement: String(draft.unit || '').trim() || 'יחידה',
  status: draft.status || 'pending',
  type: draft.type || 'boq_line',
  estimated_price: Number(draft.estimatedPrice || 0),
  actual_price: Number(draft.actualPrice || 0),
});

const saveItem = async () => {
  dialogError.value = '';
  successMessage.value = '';

  if (!projectId.value) {
    dialogError.value = 'לא נמצא מזהה פרויקט.';
    return;
  }

  const payload = buildPayload();

  if (!payload.description) {
    dialogError.value = 'יש למלא שם פריט.';
    return;
  }

  if (payload.quantity < 0 || payload.estimated_price < 0 || payload.actual_price < 0) {
    dialogError.value = 'כמות ומחירים חייבים להיות ערכים חיוביים.';
    return;
  }

  isSaving.value = true;

  try {
    if (editingId.value) {
      await makeRequest(`/projects/${projectId.value}/line-items/${editingId.value}`, payload, 'PATCH');
      successMessage.value = 'הפריט עודכן בהצלחה.';
    } else {
      await makeRequest(`/projects/${projectId.value}/line-items`, payload, 'POST');
      successMessage.value = 'הפריט נוסף בהצלחה.';
    }

    isDialogOpen.value = false;
    await loadShoppingList();
  } catch (error) {
    dialogError.value = error?.response?.data?.message || 'שמירת הפריט נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

const confirmDeleteItem = (id) => {
  pendingDeleteId.value = id;
  isDeleteDialogOpen.value = true;
};

const cancelDelete = () => {
  if (deletingId.value !== null) {
    return;
  }

  isDeleteDialogOpen.value = false;
  pendingDeleteId.value = null;
};

const removeItem = async (id) => {
  successMessage.value = '';
  errorMessage.value = '';

  if (!projectId.value) {
    errorMessage.value = 'לא נמצא מזהה פרויקט.';
    return;
  }

  deletingId.value = id;

  try {
    await makeRequest(`/projects/${projectId.value}/line-items/${id}`, {}, 'DELETE');
    lineItems.value = lineItems.value.filter((item) => item.id !== id);
    successMessage.value = 'הפריט נמחק בהצלחה.';
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'מחיקת הפריט נכשלה. נסו שוב.';
  } finally {
    deletingId.value = null;
  }
};

const deleteConfirmedItem = async () => {
  if (pendingDeleteId.value === null) {
    return;
  }

  const itemId = pendingDeleteId.value;
  await removeItem(itemId);

  if (deletingId.value === null) {
    isDeleteDialogOpen.value = false;
    pendingDeleteId.value = null;
  }
};

const loadShoppingList = async () => {
  if (!projectId.value) {
    errorMessage.value = 'לא נמצא מזהה פרויקט.';
    lineItems.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await makeRequest(`/projects/${projectId.value}/line-items`, { per_page: 250 });
    lineItems.value = toLineItems(response);
  } catch {
    errorMessage.value = 'טעינת רשימת הקניות נכשלה. נסו לרענן את העמוד.';
    lineItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(value);

onMounted(loadShoppingList);
</script>
