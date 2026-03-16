<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-2">
      <div>
        <div class="text-h5 font-weight-bold">מנוי ותוכניות</div>
        <div class="text-body-2 text-medium-emphasis mt-1">ניהול המנוי, שימוש וחיוב</div>
      </div>
      <v-chip v-if="currentSubscription && !isLoading" :color="statusColor" variant="tonal" size="small" prepend-icon="mdi-circle-small">
        {{ subscriptionStatusLabel }}
      </v-chip>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4 mt-4">
      {{ errorMessage }}
    </v-alert>

    <div v-if="isLoading" class="py-16 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <template v-if="!isLoading">
      <!-- Active subscription banner -->
      <v-card v-if="currentSubscription" rounded="xl" elevation="0" color="primary" class="pa-5 mt-5 mb-7">
        <div class="d-flex align-center justify-space-between flex-wrap ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="white" size="46" rounded="lg">
              <v-icon color="primary" size="24">mdi-crown-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-white" style="opacity: 0.75">תוכנית פעילה</div>
              <div class="text-subtitle-1 font-weight-bold text-white">{{ activePlanTitle }}</div>
              <div v-if="activePlan?.description" class="text-caption text-white" style="opacity: 0.75">{{ activePlan.description }}</div>
            </div>
          </div>
          <div class="d-flex align-center ga-5 flex-wrap">
            <div class="text-center">
              <div class="text-caption text-white mb-1" style="opacity: 0.75">מחיר</div>
              <div class="text-subtitle-1 font-weight-bold text-white">{{ activePlanPrice }}{{ activePlanPeriodLabel }}</div>
            </div>
            <div class="text-center">
              <div class="text-caption text-white mb-1" style="opacity: 0.75">חידוש הבא</div>
              <div class="text-body-2 text-white">{{ renewalDate }}</div>
            </div>
            <div class="text-center">
              <div class="text-caption text-white mb-1" style="opacity: 0.75">תשלום אחרון</div>
              <div class="text-body-2 text-white">{{ lastPaymentDisplay }}</div>
            </div>
          </div>
        </div>
      </v-card>

      <!-- No subscription empty state -->
      <v-card v-if="!currentSubscription" rounded="xl" elevation="0" class="pa-10 text-center mt-5 mb-7">
        <v-icon size="56" color="primary" class="mb-4">mdi-package-variant-closed</v-icon>
        <div class="text-h6 font-weight-semibold mb-2">אין מנוי פעיל</div>
        <div class="text-body-2 text-medium-emphasis mb-5">בחרו תוכנית להתחיל לעבוד עם HomeAdvisor</div>
        <v-btn color="primary" variant="flat" rounded="lg" prepend-icon="mdi-arrow-down" @click="scrollToPlans">לבחירת תוכנית</v-btn>
      </v-card>

      <!-- Usage stat cards -->
      <template v-if="currentSubscription && usageStats.length > 0">
        <div class="text-subtitle-1 font-weight-semibold mb-3">שימוש במנוי</div>
        <div v-if="usagePeriodText" class="text-caption text-medium-emphasis mb-3">{{ usagePeriodText }}</div>
        <v-row class="mb-7">
          <v-col v-for="usage in usageStats" :key="usage.label" cols="12" sm="6" md="3">
            <v-card rounded="xl" elevation="0" class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2 text-medium-emphasis">{{ usage.label }}</span>
                <v-icon size="20" :color="usage.pct > 85 ? 'error' : 'primary'">{{ usage.icon }}</v-icon>
              </div>
              <div class="text-h5 font-weight-bold mb-1">{{ usage.current }}</div>
              <div class="text-caption text-medium-emphasis mb-3">מתוך {{ usage.limit }}</div>
              <v-progress-linear :model-value="usage.pct" :color="usage.pct > 85 ? 'error' : 'primary'" height="4" rounded />
              <div class="text-caption text-medium-emphasis mt-2">{{ usage.pct }}%</div>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Plan cards -->
      <div id="plans-comparison" class="mb-4">
        <div class="text-subtitle-1 font-weight-semibold mb-1">תוכניות זמינות</div>
        <div class="text-body-2 text-medium-emphasis">בחרו את התוכנית המתאימה לכם</div>
      </div>

      <v-row align="stretch" class="mb-7">
        <v-col v-for="plan in comparisonPlans" :key="plan.id" cols="12" sm="6" md="4" lg="3">
          <v-card
            rounded="xl"
            elevation="0"
            class="pa-6 d-flex flex-column h-100 plan-card"
            :class="{ 'plan-card--active': isCurrentPlan(plan) }"
          >
            <!-- Plan name + badge -->
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="text-subtitle-1 font-weight-bold">{{ plan.name }}</div>
              <v-chip v-if="isCurrentPlan(plan)" color="primary" size="x-small" variant="flat">פעיל</v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mb-4">{{ targetTypeLabel(plan.target_type) }}</div>

            <!-- Price -->
            <div class="mb-5">
              <div class="d-flex align-baseline ga-1">
                <span class="text-h3 font-weight-bold">{{ formatPrice(plan) }}</span>
                <span v-if="plan.billing_period && plan.billing_period !== 'one_time'" class="text-body-2 text-medium-emphasis">
                  {{ billingLabelMap[plan.billing_period] }}
                </span>
                <span v-else-if="plan.billing_period === 'one_time'" class="text-body-2 text-medium-emphasis">חד-פעמי</span>
              </div>
              <div v-if="plan.description" class="text-caption text-medium-emphasis mt-2">{{ plan.description }}</div>
            </div>

            <v-divider class="mb-4" />

            <!-- Features -->
            <div class="d-flex flex-column ga-2 flex-grow-1 mb-5">
              <div v-for="benefit in getPlanBenefits(plan)" :key="benefit" class="d-flex align-center ga-2">
                <v-icon size="16" color="success">mdi-check-circle-outline</v-icon>
                <span class="text-body-2">{{ benefit }}</span>
              </div>
              <div v-if="plan.trial_days > 0" class="d-flex align-center ga-2">
                <v-icon size="16" color="info">mdi-flask-outline</v-icon>
                <span class="text-body-2">{{ plan.trial_days }} ימי ניסיון חינם</span>
              </div>
            </div>

            <!-- CTA -->
            <v-btn
              :variant="isCurrentPlan(plan) ? 'tonal' : 'flat'"
              color="primary"
              rounded="lg"
              block
              :disabled="isCurrentPlan(plan)"
            >
              {{ isCurrentPlan(plan) ? 'תוכנית פעילה' : (currentSubscription ? 'עבור לתוכנית' : 'בחר תוכנית') }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col v-if="comparisonPlans.length === 0" cols="12">
          <v-card rounded="xl" elevation="0" class="pa-10 text-center">
            <v-icon size="48" class="mb-3" color="medium-emphasis">mdi-package-variant</v-icon>
            <div class="text-body-1 text-medium-emphasis">אין תוכניות זמינות כרגע</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Billing details -->
      <v-card v-if="currentSubscription" rounded="xl" elevation="0" class="pa-6">
        <div class="text-subtitle-1 font-weight-semibold mb-5">פרטי חיוב ומחזור</div>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-body-2 font-weight-medium text-medium-emphasis mb-3">אמצעי תשלום</div>
            <v-list density="compact" class="pa-0">
              <v-list-item class="px-0" prepend-icon="mdi-credit-card-outline" :title="paymentMethodTitle" :subtitle="paymentMethodSubtitle" />
              <v-list-item class="px-0" prepend-icon="mdi-currency-ils" :title="lastPaymentAmountTitle" />
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-body-2 font-weight-medium text-medium-emphasis mb-3">מחזור מנוי</div>
            <v-list density="compact" class="pa-0">
              <v-list-item class="px-0" prepend-icon="mdi-calendar-start" :title="periodStartText" />
              <v-list-item class="px-0" prepend-icon="mdi-calendar-end" :title="periodEndText" />
              <v-list-item v-if="currentSubscription.trial_ends_at" class="px-0" prepend-icon="mdi-flask-outline" :title="trialEndsText" />
              <v-list-item v-if="currentSubscription.cancelled_at" class="px-0" prepend-icon="mdi-cancel" :title="cancelledAtText" />
              <v-list-item v-if="cancellationReasonText" class="px-0" prepend-icon="mdi-text-box-outline" :title="cancellationReasonText" />
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { makeRequest } from '../plugins/api';

const isLoading = ref(false);
const errorMessage = ref('');

const plans = ref([]);
const currentSubscription = ref(null);
const currentUsage = ref(null);

const billingLabelMap = {
  monthly: '/חודש',
  yearly: '/שנה',
  one_time: 'חד-פעמי',
};

const statusLabelMap = {
  trial: 'ניסיון',
  active: 'פעיל',
  cancelled: 'בוטל',
  expired: 'פג תוקף',
  suspended: 'מושהה',
};

const statusColorMap = {
  trial: 'info',
  active: 'success',
  cancelled: 'error',
  expired: 'warning',
  suspended: 'warning',
};

const activePlan = computed(() => currentSubscription.value?.plan || null);
const comparisonPlans = computed(() => plans.value);
const activePlanTitle = computed(() => activePlan.value?.name || 'ללא מנוי פעיל');

const activePlanPrice = computed(() => {
  if (!activePlan.value) return '₪0';
  const currencySymbol = activePlan.value.currency === 'ILS' ? '₪' : (activePlan.value.currency || '');
  const price = Number(activePlan.value.price || 0);
  return `${currencySymbol}${price.toLocaleString('he-IL')}`;
});

const activePlanPeriodLabel = computed(() => billingLabelMap[activePlan.value?.billing_period] || '');

const subscriptionStatusLabel = computed(() => statusLabelMap[currentSubscription.value?.status] || 'לא זמין');

const statusColor = computed(() => statusColorMap[currentSubscription.value?.status] || 'default');

const renewalDate = computed(() => {
  const date = currentSubscription.value?.next_billing_date || currentSubscription.value?.current_period_end;
  if (!date) return 'אין תאריך';
  return new Date(date).toLocaleDateString('he-IL');
});

const lastPaymentDisplay = computed(() => {
  const amount = currentSubscription.value?.last_payment_amount;
  const date = currentSubscription.value?.last_payment_date;
  if (!amount && !date) return 'אין נתון';
  const parts = [];
  if (amount) parts.push(`₪${Number(amount).toLocaleString('he-IL')}`);
  if (date) parts.push(new Date(date).toLocaleDateString('he-IL'));
  return parts.join(' · ');
});

const paymentMethodTitle = computed(() => {
  return currentSubscription.value?.payment_method_id
    ? `אמצעי תשלום: ${currentSubscription.value.payment_method_id}`
    : 'לא הוגדר אמצעי תשלום';
});

const paymentMethodSubtitle = computed(() => {
  const date = currentSubscription.value?.last_payment_date;
  return date ? `תשלום אחרון: ${new Date(date).toLocaleDateString('he-IL')}` : 'אין נתון על תשלום אחרון';
});

const lastPaymentAmountTitle = computed(() => {
  const amount = currentSubscription.value?.last_payment_amount;
  if (amount === null || amount === undefined) return 'סכום תשלום אחרון: אין נתון';
  return `סכום תשלום אחרון: ₪${Number(amount).toLocaleString('he-IL')}`;
});

const periodStartText = computed(() => {
  const value = currentSubscription.value?.current_period_start;
  return value ? `תחילת מחזור: ${new Date(value).toLocaleDateString('he-IL')}` : 'תחילת מחזור: אין נתון';
});

const periodEndText = computed(() => {
  const value = currentSubscription.value?.current_period_end;
  return value ? `סיום מחזור: ${new Date(value).toLocaleDateString('he-IL')}` : 'סיום מחזור: אין נתון';
});

const trialEndsText = computed(() => {
  const value = currentSubscription.value?.trial_ends_at;
  return value ? `סיום תקופת ניסיון: ${new Date(value).toLocaleDateString('he-IL')}` : 'סיום תקופת ניסיון: לא רלוונטי';
});

const cancelledAtText = computed(() => {
  const value = currentSubscription.value?.cancelled_at;
  return value ? `בוטל בתאריך: ${new Date(value).toLocaleDateString('he-IL')}` : 'בוטל בתאריך: לא בוטל';
});

const cancellationReasonText = computed(() => {
  const value = currentSubscription.value?.cancellation_reason;
  return value ? `סיבת ביטול: ${value}` : '';
});

const usagePeriodText = computed(() => {
  const start = currentUsage.value?.billing_period_start;
  const end = currentUsage.value?.billing_period_end;
  if (!start || !end) return '';
  return `חלון שימוש: ${new Date(start).toLocaleDateString('he-IL')} – ${new Date(end).toLocaleDateString('he-IL')}`;
});

const usageStats = computed(() => {
  if (!currentUsage.value || !activePlan.value) return [];

  const toPct = (current, limit) => {
    if (!limit || limit <= 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  const storageLimitMb = Number(activePlan.value.storage_limit_mb || 0);
  const storageUsedMb = Number(currentUsage.value.storage_used_mb || 0);

  return [
    {
      label: 'פרויקטים פעילים',
      icon: 'mdi-folder-multiple-outline',
      current: Number(currentUsage.value.active_projects_count || 0),
      limit: Number(activePlan.value.projects_limit || 0),
      pct: toPct(Number(currentUsage.value.active_projects_count || 0), Number(activePlan.value.projects_limit || 0)),
    },
    {
      label: 'פרויקטים במחזור',
      icon: 'mdi-folder-plus-outline',
      current: Number(currentUsage.value.projects_created || 0),
      limit: Number(activePlan.value.projects_limit || 0),
      pct: toPct(Number(currentUsage.value.projects_created || 0), Number(activePlan.value.projects_limit || 0)),
    },
    {
      label: 'חברי צוות',
      icon: 'mdi-account-group-outline',
      current: Number(currentUsage.value.active_members_count || 0),
      limit: Number(activePlan.value.team_members_limit || 0),
      pct: toPct(Number(currentUsage.value.active_members_count || 0), Number(activePlan.value.team_members_limit || 0)),
    },
    {
      label: 'אחסון',
      icon: 'mdi-database-outline',
      current: `${(storageUsedMb / 1024).toFixed(1)} GB`,
      limit: `${(storageLimitMb / 1024).toFixed(1)} GB`,
      pct: toPct(storageUsedMb, storageLimitMb),
    },
  ];
});

const isCurrentPlan = (plan) => currentSubscription.value?.plan?.id === plan.id;

const formatPrice = (plan) => {
  const price = Number(plan?.price || 0);
  if (price === 0) return 'חינם';
  const currencySymbol = plan.currency === 'ILS' ? '₪' : (plan.currency || '');
  return `${currencySymbol}${price.toLocaleString('he-IL')}`;
};

const getPlanBenefits = (plan) => {
  const benefits = [];
  if (plan.projects_limit) benefits.push(`עד ${plan.projects_limit} פרויקטים`);
  else benefits.push('פרויקטים ללא הגבלה');
  if (plan.team_members_limit) benefits.push(`עד ${plan.team_members_limit} חברי צוות`);
  else benefits.push('חברי צוות ללא הגבלה');
  if (plan.expenses_per_project_limit) benefits.push(`עד ${plan.expenses_per_project_limit} הוצאות לפרויקט`);
  if (plan.storage_limit_mb) benefits.push(`${plan.storage_limit_mb >= 1024 ? `${(plan.storage_limit_mb / 1024).toFixed(0)} GB` : `${plan.storage_limit_mb} MB`} אחסון`);
  return benefits;
};

const targetTypeLabel = (targetType) => {
  if (targetType === 'organization') return 'ארגוני';
  if (targetType === 'project') return 'פרויקט בודד';
  return 'לא מוגדר';
};

const scrollToPlans = () => {
  const target = document.getElementById('plans-comparison');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const loadSubscription = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await makeRequest('/subscriptions');
    const data = response?.data || {};
    plans.value = Array.isArray(data.plans) ? data.plans : [];
    currentSubscription.value = data.current_subscription || null;
    currentUsage.value = data.current_usage || null;
  } catch {
    errorMessage.value = 'טעינת נתוני המנוי נכשלה. נסו שוב.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadSubscription);
</script>

<style scoped>
.plan-card--active {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
</style>
