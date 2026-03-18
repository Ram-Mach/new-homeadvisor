<template>
  <v-row justify="center" class="mt-2">
    <v-col cols="12" lg="10" xl="9">
      <v-card elevation="1" class="pa-4 pa-md-6">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
          <div>
            <div class="text-h5 font-weight-bold">הגשת הצעת מחיר פומבית</div>
            <div class="text-body-2 text-medium-emphasis">מכרז פתוח לקבלנים לפרויקט</div>
          </div>
          <v-chip color="secondary" variant="elevated" prepend-icon="mdi-earth">קישור ציבורי</v-chip>
        </div>

        <v-alert v-if="submitSuccess" type="success" variant="tonal" class="mb-4">
          הצעת המחיר נשלחה בהצלחה! יצרנו עבורך אזור אישי, פרטים נוספים יישלחו למייל.
        </v-alert>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <div v-if="isLoading" class="py-8 d-flex justify-center">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="project">
          <v-card rounded="xl" elevation="0" class="pa-4 mb-5" color="surface-variant">
            <div class="text-subtitle-2 text-medium-emphasis mb-1">שם הפרויקט</div>
            <div class="text-h6 font-weight-bold mb-2">{{ project.name || 'פרויקט ללא שם' }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ project.description || 'נא להזין מחירי יחידה לכל סעיף ולהגיש הצעה.' }}</div>
            <v-chip v-if="scopeModuleName" size="small" color="secondary" variant="tonal" class="mt-3">
              מכרז לפי מודול: {{ scopeModuleName }}
            </v-chip>
          </v-card>

          <template v-if="!submitSuccess">
            <div class="text-subtitle-1 font-weight-bold mb-3">כתב כמויות</div>
            <v-alert v-if="lineItems.length === 0" type="warning" variant="tonal" class="mb-4">
              לא נמצאו סעיפים להצגה עבור הבחירה הנוכחית.
            </v-alert>
            <v-table density="comfortable" hover class="mb-5">
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
                <template v-for="group in groupedLineItems" :key="group.moduleName">
                  <tr>
                    <td colspan="5" class="text-right py-2 px-3 font-weight-bold">
                      {{ group.moduleName }}
                      <v-chip size="x-small" variant="tonal" class="ms-2">{{ group.items.length }} סעיפים</v-chip>
                    </td>
                  </tr>
                  <tr v-for="item in group.items" :key="item.id">
                    <td>{{ item.parsedDescription }}</td>
                    <td>{{ Number(item.quantity || 0) }}</td>
                    <td>{{ item.unit_of_measurement || 'יחידה' }}</td>
                    <td style="min-width: 220px;">
                      <v-text-field
                        v-model.number="prices[item.id]"
                        type="number"
                        min="0"
                        variant="outlined"
                        density="compact"
                        hide-details
                        prefix="₪"
                      />
                    </td>
                    <td class="font-weight-bold">{{ currency(lineTotal(item)) }}</td>
                  </tr>
                </template>
              </tbody>
            </v-table>

            <div class="text-subtitle-1 font-weight-bold mb-5">
              סה"כ הצעת מחיר: {{ currency(totalBidAmount) }}
            </div>

            <v-card rounded="xl" elevation="0" class="pa-4 mb-4"  >
            <div class="text-h6 mb-3">פרטי קשר</div>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="contractorDetails.name"
                  label="שם מלא"
                  prepend-inner-icon="mdi-account-outline"
                  :disabled="isSubmitting"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="contractorDetails.email"
                  label="אימייל"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  :disabled="isSubmitting"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="contractorDetails.phone"
                  label="טלפון"
                  prepend-inner-icon="mdi-phone-outline"
                  :disabled="isSubmitting"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="contractorDetails.notes"
                  label="הערות להצעה"
                  placeholder="לדוגמה: תנאי תשלום, אחריות, זמני אספקה"
                  prepend-inner-icon="mdi-note-text-outline"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  :disabled="isSubmitting"
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-2">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-send-outline"
                :loading="isSubmitting"
                :disabled="!canSubmitBid"
                @click="onSubmitBid"
              >
                שלח הצעת מחיר
              </v-btn>
            </div>
            </v-card>
          </template>
        </template>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const project = ref(null);
const prices = reactive({});
const contractorDetails = reactive({
  name: '',
  email: '',
  phone: '',
  notes: '',
});

const isLoading = ref(false);
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const errorMessage = ref('');
const scopeModuleName = ref('');

const slug = computed(() => String(route.params.slug || route.params.token || '').trim());
const scopeToken = computed(() => String(route.query.scope || '').trim());

const lineItems = computed(() => {
  const rows = project.value?.project_line_items || project.value?.projectLineItems || [];
  return Array.isArray(rows) ? rows : [];
});

const parseModuleFromDescription = (rawDescription) => {
  const text = String(rawDescription || '').trim();

  if (!text) {
    return {
      moduleName: 'ללא מודול',
      parsedDescription: 'סעיף ללא תיאור',
    };
  }

  const markerMatch = text.match(/\[\[MODULE:(.+?)\]\]\s*(.*)$/);
  if (markerMatch) {
    return {
      moduleName: markerMatch[1] || 'ללא מודול',
      parsedDescription: markerMatch[2] || 'סעיף ללא תיאור',
    };
  }

  const hebrewPrefixMatch = text.match(/^מודול:\s*([^|]+)\|\s*(.*)$/);
  if (hebrewPrefixMatch) {
    return {
      moduleName: hebrewPrefixMatch[1] || 'ללא מודול',
      parsedDescription: hebrewPrefixMatch[2] || 'סעיף ללא תיאור',
    };
  }

  return {
    moduleName: 'ללא מודול',
    parsedDescription: text,
  };
};

const groupedLineItems = computed(() => {
  const groups = [];
  const groupMap = new Map();

  lineItems.value.forEach((item) => {
    const parsed = parseModuleFromDescription(item.description);
    const moduleName = String(parsed.moduleName || 'ללא מודול').trim() || 'ללא מודול';

    if (!groupMap.has(moduleName)) {
      const nextGroup = {
        moduleName,
        items: [],
      };

      groupMap.set(moduleName, nextGroup);
      groups.push(nextGroup);
    }

    groupMap.get(moduleName).items.push({
      ...item,
      parsedDescription: parsed.parsedDescription,
    });
  });

  return groups;
});

const lineTotal = (item) => Number(item.quantity || 0) * Number(prices[item.id] || 0);

const totalBidAmount = computed(() =>
  lineItems.value.reduce((sum, item) => sum + lineTotal(item), 0)
);

const hasValidContractorDetails = computed(() =>
  contractorDetails.name.trim().length > 0
  && contractorDetails.email.trim().length > 0
  && contractorDetails.phone.trim().length > 0
);

const canSubmitBid = computed(() =>
  !isSubmitting.value
  && !submitSuccess.value
  && hasValidContractorDetails.value
  && lineItems.value.length > 0
);

const loadPublicBidProject = async () => {
  if (!slug.value) {
    errorMessage.value = 'קישור המכרז אינו תקין.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await makeRequest(`/public-bids/${slug.value}`, {
      ...(scopeToken.value ? { scope: scopeToken.value } : {}),
    });
    project.value = response?.data || null;
    scopeModuleName.value = String(response?.meta?.scope_module_name || '').trim();

    lineItems.value.forEach((item) => {
      prices[item.id] = Number(prices[item.id] || 0);
    });
  } catch {
    errorMessage.value = 'טעינת המכרז נכשלה. בדקו את הקישור ונסו שוב.';
    project.value = null;
  } finally {
    isLoading.value = false;
  }
};

const onSubmitBid = async () => {
  if (!canSubmitBid.value || !slug.value) {
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      contractor_name: contractorDetails.name.trim(),
      contractor_email: contractorDetails.email.trim(),
      contractor_phone: contractorDetails.phone.trim(),
      notes: contractorDetails.notes.trim() || null,
      items: lineItems.value.map((item) => ({
        line_item_id: item.id,
        unit_price: Number(prices[item.id] || 0),
      })),
      ...(scopeToken.value ? { scope: scopeToken.value } : {}),
    };

    await makeRequest(`/public-bids/${slug.value}`, payload, 'POST');
    submitSuccess.value = true;
  } catch {
    errorMessage.value = 'שליחת ההצעה נכשלה. בדקו את הנתונים ונסו שוב.';
  } finally {
    isSubmitting.value = false;
  }
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

onMounted(() => {
  loadPublicBidProject();
});
</script>
