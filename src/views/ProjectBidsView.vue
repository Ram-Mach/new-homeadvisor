<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">הצעות מחיר לפרויקט</div>
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="requestDialog = true">בקשת הצעה</v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <div v-if="isLoading" class="py-8 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-row>
      <v-col v-for="bid in bids" :key="bid.id" cols="12" md="6" lg="4">
        <v-card rounded="xl" elevation="0" class="pa-5 h-100" :class="bid.recommended ? 'border border-primary' : ''">
          <div class="d-flex align-start justify-space-between mb-3">
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ bid.vendor }}</div>
              <div class="text-caption text-medium-emphasis">{{ bid.category }}</div>
            </div>
            <v-chip v-if="bid.recommended" color="primary" size="x-small" variant="tonal">מומלץ</v-chip>
            <v-chip v-else :color="bid.statusColor" size="x-small" variant="tonal">{{ bid.status }}</v-chip>
          </div>

          <div class="text-h5 font-weight-bold text-primary mb-1">{{ bid.amount }}</div>
          <div class="text-caption text-medium-emphasis mb-4">{{ bid.note }}</div>

          <v-divider class="mb-3" />

          <div class="d-flex ga-2">
            <div v-for="tag in bid.tags" :key="tag">
              <v-chip size="x-small" variant="outlined">{{ tag }}</v-chip>
            </div>
          </div>

          <div class="d-flex justify-end mt-4 ga-2">
            <v-btn variant="text" size="small">צפייה</v-btn>
            <v-btn color="primary" size="small" rounded="lg" variant="tonal" :loading="isSaving" @click="approveBid(bid)">אשר הצעה</v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col v-if="!isLoading && bids.length === 0" cols="12">
        <v-card rounded="xl" elevation="0" class="pa-6 text-center text-medium-emphasis">
          אין הצעות מחיר להצגה כרגע.
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="requestDialog" max-width="560">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">פתיחת בקשת הצעת מחיר</v-card-title>
        <v-text-field v-model="draft.contractorName" label="שם קבלן" variant="outlined" class="mb-3" />
        <v-text-field v-model="draft.contractorEmail" label="אימייל קבלן" variant="outlined" class="mb-3" />
        <v-text-field v-model="draft.contractorPhone" label="טלפון" variant="outlined" class="mb-3" />
        <v-textarea v-model="draft.notes" label="הערות" variant="outlined" rows="3" class="mb-4" />
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="requestDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" :loading="isSaving" @click="createBidRequest">שליחה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const bids = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const requestDialog = ref(false);

const draft = reactive({
  contractorName: '',
  contractorEmail: '',
  contractorPhone: '',
  notes: '',
});

const bidEndpoints = (projectId) => [
  `/projects/${projectId}/bids`,
  `/projects/${projectId}/project-bids`,
];

const bidUpdateEndpoints = (projectId, bidId) => [
  `/projects/${projectId}/bids/${bidId}`,
  `/projects/${projectId}/project-bids/${bidId}`,
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

const statusConfig = (status) => {
  const map = {
    submitted: { label: 'התקבלה', color: 'info' },
    under_review: { label: 'בבדיקה', color: 'warning' },
    accepted: { label: 'אושרה', color: 'success' },
    rejected: { label: 'נדחתה', color: 'error' },
  };
  return map[status] || { label: status || 'לא ידוע', color: 'info' };
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const mapBid = (bid) => {
  const status = statusConfig(bid.status);
  return {
    id: bid.id,
    vendor: bid.contractor_name || 'קבלן ללא שם',
    category: 'קבלנות ראשית',
    amount: currency(bid.total_amount),
    note: bid.notes || 'ללא הערות',
    status: status.label,
    statusColor: status.color,
    recommended: bid.status === 'accepted',
    tags: [bid.contractor_phone, bid.contractor_email].filter(Boolean),
    raw: bid,
  };
};

const loadBids = async () => {
  const projectId = route.params.id;
  if (!projectId) {
    bids.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    let loaded = false;
    for (const endpoint of bidEndpoints(projectId)) {
      try {
        const response = await makeRequest(endpoint);
        bids.value = toItems(response).map(mapBid);
        loaded = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!loaded) {
      bids.value = [];
    }
  } catch {
    errorMessage.value = 'טעינת ההצעות נכשלה.';
    bids.value = [];
  } finally {
    isLoading.value = false;
  }
};

const approveBid = async (bid) => {
  const projectId = route.params.id;
  if (!projectId) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    let updated = false;
    for (const endpoint of bidUpdateEndpoints(projectId, bid.id)) {
      try {
        await makeRequest(endpoint, { status: 'accepted' }, 'PATCH');
        updated = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!updated) {
      throw new Error('Bid approve route not found');
    }

    await loadBids();
  } catch {
    errorMessage.value = 'אישור ההצעה נכשל. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

const createBidRequest = async () => {
  const projectId = route.params.id;
  if (!projectId || !draft.contractorName) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    let created = false;
    for (const endpoint of bidEndpoints(projectId)) {
      try {
        await makeRequest(endpoint, {
          contractor_name: draft.contractorName,
          contractor_email: draft.contractorEmail,
          contractor_phone: draft.contractorPhone,
          total_amount: 0,
          status: 'under_review',
          notes: draft.notes,
        }, 'POST');
        created = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!created) {
      throw new Error('Bid create route not found');
    }

    requestDialog.value = false;
    draft.contractorName = '';
    draft.contractorEmail = '';
    draft.contractorPhone = '';
    draft.notes = '';
    await loadBids();
  } catch {
    errorMessage.value = 'שליחת בקשת ההצעה נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadBids);
</script>
