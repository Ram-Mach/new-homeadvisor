<template>
  <div>
    <v-card rounded="xl" elevation="0" class="pa-5 mb-5 comparison-hero">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2">
        <div>
          <div class="text-h5 font-weight-bold">השוואת הצעות מחיר</div>
          <div class="text-body-2 text-medium-emphasis">השוואה מקצועית לפי מודולים ולפי סעיפי כתב הכמויות</div>
        </div>
        <v-chip color="secondary" variant="elevated" prepend-icon="mdi-compare-horizontal">{{ activeComparisonId }}</v-chip>
      </div>

      <v-row class="mt-2">
        <v-col cols="12" sm="4">
          <v-card rounded="lg" elevation="0" class="pa-3 stat-card">
            <div class="text-caption text-medium-emphasis">מודול בהשוואה</div>
            <div class="text-subtitle-1 font-weight-bold">{{ activeModuleLabel }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card rounded="lg" elevation="0" class="pa-3 stat-card">
            <div class="text-caption text-medium-emphasis">מספר הצעות פעילות</div>
            <div class="text-subtitle-1 font-weight-bold">{{ filteredBids.length }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card rounded="lg" elevation="0" class="pa-3 stat-card">
            <div class="text-caption text-medium-emphasis">הצעה מובילה</div>
            <div class="text-subtitle-1 font-weight-bold">{{ bestBidLabel }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <AppStateError v-if="errorMessage" :message="errorMessage" @retry="loadData" />

    <AppStateLoading v-if="isLoading" message="טוען הצעות להשוואה..." />

    <template v-else>
      <AppStateEmpty
        v-if="bids.length === 0"
        icon="mdi-gavel"
        title="עדיין לא התקבלו הצעות מחיר"
        description="שתפו את כתב הכמויות כדי להתחיל לקבל הצעות מקבלנים."
        class="mb-4"
      >
        <template #actions>
          <v-btn color="primary" variant="tonal" @click="goToBoq">מעבר לכתב הכמויות</v-btn>
        </template>
      </AppStateEmpty>

      <v-card v-if="bids.length > 0 && moduleFilterOptions.length > 1" rounded="xl" elevation="0" class="pa-4 mb-4">
        <div class="text-subtitle-2 mb-2">סינון מודול להשוואה</div>
        <v-chip-group v-model="activeModule" selected-class="text-primary" mandatory>
          <v-chip v-for="option in moduleFilterOptions" :key="option.value" :value="option.value" variant="outlined" filter>
            {{ option.title }}
          </v-chip>
        </v-chip-group>
      </v-card>

      <v-alert v-if="bids.length > 0 && filteredBids.length === 0" type="warning" variant="tonal" class="mb-4">
        אין הצעות עבור המודול שנבחר. ניתן לבחור מודול אחר להשוואה.
      </v-alert>

      <v-row v-if="filteredBids.length > 0" class="mb-3">
        <v-col v-for="bid in filteredBids" :key="`preview-${bid.id}`" cols="12" md="6" lg="4">
          <v-card
            rounded="xl"
            elevation="0"
            class="pa-4 h-100 proposal-preview"
            :class="{ 'proposal-preview--active': selectedBidId === bid.id }"
            @click="openBidDetails(bid.id)"
          >
            <div class="d-flex align-start justify-space-between mb-2">
              <div>
                <div class="text-subtitle-1 font-weight-bold">{{ bid.contractor_name || 'קבלן ללא שם' }}</div>
                <div class="text-caption text-medium-emphasis">{{ bid.contractor_email || 'ללא אימייל' }}</div>
              </div>
              <v-chip size="x-small" :color="bid.status === 'accepted' ? 'success' : 'info'" variant="tonal">
                {{ bid.status === 'accepted' ? 'מאושרת' : 'הוגשה' }}
              </v-chip>
            </div>

            <div class="text-h6 font-weight-bold mb-1">{{ currency(bidAmountForActiveModule(bid)) }}</div>
            <div class="text-body-2 text-medium-emphasis text-truncate">{{ bid.notes || 'ללא הערות' }}</div>

            <div class="d-flex flex-wrap ga-1 mt-2">
              <v-chip
                v-for="moduleName in bidCoveredModules(bid)"
                :key="`${bid.id}-${moduleName}`"
                size="x-small"
                variant="outlined"
              >
                {{ moduleName }}
              </v-chip>
            </div>

            <div class="d-flex justify-end mt-3">
              <v-btn variant="text" size="small" prepend-icon="mdi-eye-outline" @click.stop="openBidDetails(bid.id)">
                צפייה מלאה
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

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

const lineItems = ref([]);
const bids = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedBidId = ref(null);
const activeModule = ref('__all__');

const projectId = computed(() => route.params.id);

const extractModuleName = (description) => {
  const text = String(description || '').trim();

  const markerMatch = text.match(/\[\[MODULE:(.+?)\]\]\s*(.*)$/);
  if (markerMatch) {
    return String(markerMatch[1] || '').trim() || 'ללא מודול';
  }

  const prefixMatch = text.match(/^מודול:\s*([^|]+)\|\s*(.*)$/);
  if (prefixMatch) {
    return String(prefixMatch[1] || '').trim() || 'ללא מודול';
  }

  return 'ללא מודול';
};

const lineItemByIdMap = computed(() => {
  const map = new Map();
  lineItems.value.forEach((item) => {
    map.set(Number(item.id), item);
  });
  return map;
});

const moduleFilterOptions = computed(() => {
  const moduleSet = new Set();

  bids.value.forEach((bid) => {
    bidLineItemsOf(bid).forEach((bidLineItem) => {
      const sourceLineItem = lineItemByIdMap.value.get(Number(bidLineItem.project_line_item_id));
      if (sourceLineItem) {
        moduleSet.add(extractModuleName(sourceLineItem.description));
      }
    });
  });

  const modules = Array.from(moduleSet).sort((a, b) => a.localeCompare(b, 'he'));

  return [
    { title: 'כל המודולים', value: '__all__' },
    ...modules.map((moduleName) => ({ title: moduleName, value: moduleName })),
  ];
});

const moduleComparisonIdMap = computed(() => {
  const map = new Map();
  map.set('__all__', `CMP-${projectId.value || 'NA'}-ALL`);

  moduleFilterOptions.value
    .filter((option) => option.value !== '__all__')
    .forEach((option, index) => {
      map.set(option.value, `CMP-${projectId.value || 'NA'}-M${index + 1}`);
    });

  return map;
});

const activeComparisonId = computed(() => moduleComparisonIdMap.value.get(activeModule.value) || 'CMP-NA');

const activeModuleLabel = computed(() => {
  const found = moduleFilterOptions.value.find((option) => option.value === activeModule.value);
  return found?.title || 'כל המודולים';
});

const bidLineItemsOf = (bid) => {
  if (Array.isArray(bid?.bid_line_items)) {
    return bid.bid_line_items;
  }

  if (Array.isArray(bid?.bidLineItems)) {
    return bid.bidLineItems;
  }

  return [];
};

const bidCoveredModules = (bid) => {
  const modules = new Set();

  bidLineItemsOf(bid).forEach((bidLineItem) => {
    const sourceLineItem = lineItemByIdMap.value.get(Number(bidLineItem.project_line_item_id));
    if (sourceLineItem) {
      modules.add(extractModuleName(sourceLineItem.description));
    }
  });

  return Array.from(modules).sort((a, b) => a.localeCompare(b, 'he'));
};

const bidMatchesActiveModule = (bid) => {
  if (activeModule.value === '__all__') {
    return true;
  }

  return bidCoveredModules(bid).includes(activeModule.value);
};

const filteredBids = computed(() => bids.value.filter((bid) => bidMatchesActiveModule(bid)));

const bidAmountForActiveModule = (bid) => {
  if (activeModule.value === '__all__') {
    return Number(bid.total_amount || 0);
  }

  return bidLineItemsOf(bid).reduce((sum, bidLineItem) => {
    const sourceLineItem = lineItemByIdMap.value.get(Number(bidLineItem.project_line_item_id));
    if (!sourceLineItem) {
      return sum;
    }

    if (extractModuleName(sourceLineItem.description) !== activeModule.value) {
      return sum;
    }

    return sum + Number(bidLineItem.total || 0);
  }, 0);
};

const bestBid = computed(() => {
  if (filteredBids.value.length === 0) {
    return null;
  }

  const sorted = [...filteredBids.value].sort((a, b) => bidAmountForActiveModule(a) - bidAmountForActiveModule(b));
  return sorted[0] || null;
});

const bestBidLabel = computed(() => {
  if (!bestBid.value) {
    return 'אין נתונים';
  }

  return `${bestBid.value.contractor_name || 'קבלן'} • ${currency(bidAmountForActiveModule(bestBid.value))}`;
});

const lineItemEndpoints = (id) => [
  `/projects/${id}/line-items?per_page=500`,
  `/projects/${id}/project-line-items?per_page=500`,
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

const parseTitle = (description) => {
  const text = String(description || '').trim();
  const markerMatch = text.match(/\[\[MODULE:(.+?)\]\]\s*(.*)$/);
  if (markerMatch) {
    return markerMatch[2] || 'סעיף ללא שם';
  }

  const prefixMatch = text.match(/^מודול:\s*([^|]+)\|\s*(.*)$/);
  if (prefixMatch) {
    return prefixMatch[2] || 'סעיף ללא שם';
  }

  return text || 'סעיף ללא שם';
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const findBidUnitPrice = (bid, projectLineItemId) => {
  const bidLineItems = bidLineItemsOf(bid);

  const matched = bidLineItems.find(
    (item) => Number(item.project_line_item_id) === Number(projectLineItemId)
  );

  return Number(matched?.unit_price || 0);
};

const loadLineItems = async () => {
  if (!projectId.value) {
    lineItems.value = [];
    return;
  }

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

const loadBids = async () => {
  if (!projectId.value) {
    bids.value = [];
    return;
  }

  const response = await makeRequest(`/projects/${projectId.value}/bids`);
  bids.value = toItems(response);

  const activeExists = moduleFilterOptions.value.some((option) => option.value === activeModule.value);
  if (!activeExists) {
    activeModule.value = '__all__';
  }

  if (!selectedBidId.value && bids.value.length > 0) {
    selectedBidId.value = filteredBids.value[0]?.id || bids.value[0].id;
  }

  if (selectedBidId.value && !filteredBids.value.some((bid) => bid.id === selectedBidId.value)) {
    selectedBidId.value = filteredBids.value[0]?.id || null;
  }
};

const loadData = async () => {
  if (!projectId.value) {
    lineItems.value = [];
    bids.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await Promise.all([loadLineItems(), loadBids()]);
  } catch {
    errorMessage.value = 'טעינת נתוני ההשוואה נכשלה. נסו שוב.';
    lineItems.value = [];
    bids.value = [];
  } finally {
    isLoading.value = false;
  }
};

const goToBoq = () => {
  if (!projectId.value) {
    return;
  }

  router.push({ name: 'project-boq', params: { id: projectId.value } });
};

const openBidDetails = (bidId) => {
  if (!bidId) {
    return;
  }

  selectedBidId.value = bidId;
  router.push({
    name: 'project-bid-details',
    params: { id: projectId.value, bidId },
  });
};

watch(
  () => route.params.id,
  () => {
    loadData();
  },
  { immediate: true },
);
</script>

<style scoped>
.proposal-preview {
  border: 1px solid rgba(var(--v-theme-outline), 0.25);
  cursor: pointer;
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.proposal-preview:hover {
  border-color: rgba(var(--v-theme-primary), 0.55);
}

.proposal-preview--active {
  border-color: rgba(var(--v-theme-primary), 0.9);
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.comparison-hero {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-secondary), 0.08));
  border: 1px solid rgba(var(--v-theme-outline), 0.25);
}

.stat-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  background: rgba(var(--v-theme-surface), 0.7);
}
</style>
