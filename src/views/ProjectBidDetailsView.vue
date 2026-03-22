<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div class="text-h5 font-weight-bold">פרטי הצעת מחיר</div>
        <div class="text-body-2 text-medium-emphasis">צפייה מלאה בהצעה שנבחרה</div>
      </div>
      <v-btn variant="text" prepend-icon="mdi-arrow-right" @click="goBackToComparison">חזרה להשוואה</v-btn>
    </div>

    <AppStateError v-if="errorMessage" :message="errorMessage" @retry="loadData" />

    <AppStateLoading v-if="isLoading" message="טוען פרטי הצעה..." />

    <template v-else>
      <v-card v-if="selectedBid" rounded="xl" elevation="0" class="pa-5 mb-4">
        <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-3">
          <div>
            <div class="text-h6 font-weight-bold">{{ selectedBid.contractor_name || 'קבלן ללא שם' }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ selectedBid.contractor_phone || 'ללא טלפון' }} | {{ selectedBid.contractor_email || 'ללא אימייל' }}
            </div>
          </div>
          <div class="text-left">
            <div class="text-caption text-medium-emphasis">סכום כולל</div>
            <div class="text-h6 font-weight-bold">{{ currency(selectedBid.total_amount) }}</div>
            <v-chip size="x-small" :color="selectedBid.status === 'accepted' ? 'success' : 'info'" variant="tonal" class="mt-1">
              {{ selectedBid.status === 'accepted' ? 'הצעה מאושרת' : 'הצעה ממתינה' }}
            </v-chip>
          </div>
        </div>

        <v-alert v-if="selectedBid.notes" type="info" variant="tonal" class="mb-4">
          {{ selectedBid.notes }}
        </v-alert>

        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-right">סעיף</th>
              <th class="text-right">כמות</th>
              <th class="text-right">יחידה</th>
              <th class="text-right">מחיר יחידה</th>
              <th class="text-right">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedBidLineItems" :key="item.id">
              <td>{{ item.description || resolveDescriptionFromProjectLineItem(item.project_line_item_id) }}</td>
              <td>{{ Number(item.quantity || 0) }}</td>
              <td>{{ item.unit || 'יחידה' }}</td>
              <td>{{ currency(item.unit_price) }}</td>
              <td class="font-weight-bold">{{ currency(item.total) }}</td>
            </tr>
            <tr v-if="selectedBidLineItems.length === 0">
              <td colspan="5" class="text-center py-6 text-medium-emphasis">אין סעיפים להצעה זו.</td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex justify-end mt-4">
          <v-btn
            color="primary"
            variant="tonal"
            :loading="isApproving"
            :disabled="isApproving || selectedBid.status === 'accepted'"
            @click="approveSelectedBid"
          >
            {{ selectedBid.status === 'accepted' ? 'הצעה מאושרת' : 'אשר הצעה' }}
          </v-btn>
        </div>
      </v-card>

      <AppStateEmpty
        v-else
        icon="mdi-file-search-outline"
        title="ההצעה לא נמצאה"
        description="לא נמצאה הצעת מחיר תואמת עבור הפרויקט הנוכחי."
      />
    </template>

    <v-snackbar v-model="isSuccessSnackbarVisible" color="success" timeout="2800" location="top">
      {{ successMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppStateEmpty from '../components/state/AppStateEmpty.vue';
import AppStateError from '../components/state/AppStateError.vue';
import AppStateLoading from '../components/state/AppStateLoading.vue';
import { makeRequest } from '../plugins/api';

const route = useRoute();
const router = useRouter();

const bids = ref([]);
const lineItems = ref([]);
const isLoading = ref(false);
const isApproving = ref(false);
const errorMessage = ref('');
const isSuccessSnackbarVisible = ref(false);
const successMessage = ref('');

const projectId = computed(() => route.params.id);
const bidId = computed(() => Number(route.params.bidId || 0));

const selectedBid = computed(() => bids.value.find((bid) => Number(bid.id) === bidId.value) || null);
const selectedBidLineItems = computed(() => {
  const bid = selectedBid.value;

  if (!bid) {
    return [];
  }

  if (Array.isArray(bid.bid_line_items)) {
    return bid.bid_line_items;
  }

  if (Array.isArray(bid.bidLineItems)) {
    return bid.bidLineItems;
  }

  return [];
});

const lineItemsMap = computed(() => {
  const map = new Map();
  lineItems.value.forEach((item) => {
    map.set(Number(item.id), item);
  });
  return map;
});

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const toItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const lineItemEndpoints = (id) => [
  `/projects/${id}/line-items?per_page=500`,
  `/projects/${id}/project-line-items?per_page=500`,
];

const loadBids = async () => {
  const response = await makeRequest(`/projects/${projectId.value}/bids`);
  bids.value = toItems(response);
};

const loadLineItems = async () => {
  let loaded = false;

  for (const endpoint of lineItemEndpoints(projectId.value)) {
    try {
      const response = await makeRequest(endpoint);
      lineItems.value = toItems(response);
      loaded = true;
      break;
    } catch (error) {
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  if (!loaded) {
    lineItems.value = [];
  }
};

const loadData = async () => {
  if (!projectId.value || !bidId.value) {
    errorMessage.value = 'קישור ההצעה אינו תקין.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await Promise.all([loadBids(), loadLineItems()]);
  } catch {
    errorMessage.value = 'טעינת פרטי ההצעה נכשלה. נסו שוב.';
    bids.value = [];
    lineItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

const resolveDescriptionFromProjectLineItem = (projectLineItemId) => {
  const lineItem = lineItemsMap.value.get(Number(projectLineItemId));
  return lineItem?.description || 'סעיף ללא תיאור';
};

const approveSelectedBid = async () => {
  if (!projectId.value || !selectedBid.value) {
    return;
  }

  const confirmed = window.confirm('האם אתה בטוח שברצונך לאשר הצעה זו? פעולה זו תעדכן את מחירי הפרויקט.');
  if (!confirmed) {
    return;
  }

  isApproving.value = true;
  errorMessage.value = '';

  try {
    await makeRequest(`/projects/${projectId.value}/bids/${selectedBid.value.id}/approve`, {}, 'POST');
    successMessage.value = 'ההצעה אושרה בהצלחה.';
    isSuccessSnackbarVisible.value = true;
    await loadData();
  } catch {
    errorMessage.value = 'אישור ההצעה נכשל. נסו שוב.';
  } finally {
    isApproving.value = false;
  }
};

const goBackToComparison = () => {
  if (!projectId.value) {
    return;
  }

  router.push({ name: 'project-bids', params: { id: projectId.value } });
};

watch(
  () => [route.params.id, route.params.bidId],
  () => {
    loadData();
  },
  { immediate: true },
);
</script>
