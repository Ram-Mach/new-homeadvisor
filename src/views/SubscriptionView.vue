<template>
  <div>
    <div class="text-h5 font-weight-bold mb-6">מנוי</div>

    <!-- Active plan card -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" color="primary" class="pa-6 text-white">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="text-h6 font-weight-bold">תוכנית Pro</div>
            <v-chip color="white" text-color="primary" size="small">פעיל</v-chip>
          </div>
          <div class="text-h4 font-weight-bold mb-1">₪299 <span class="text-subtitle-1">/חודש</span></div>
          <div class="text-body-2 opacity-75 mb-6">חידוש אוטומטי: 14/04/2026</div>
          <v-divider color="white" opacity="0.3" class="mb-4" />
          <div class="d-flex flex-column ga-2">
            <div v-for="benefit in proBenefits" :key="benefit" class="d-flex align-center ga-2">
              <v-icon size="18">mdi-check-circle-outline</v-icon>
              <span class="text-body-2">{{ benefit }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" class="pa-6 h-100">
          <div class="text-subtitle-1 font-weight-semibold mb-4">פרטי חיוב</div>
          <v-list-item prepend-icon="mdi-credit-card-outline" title="Visa **** 4582" subtitle="תוקף עד 12/2027" class="px-0 mb-2" />
          <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-pencil-outline" size="small">עדכון פרטי תשלום</v-btn>

          <v-divider class="my-5" />

          <div class="text-subtitle-1 font-weight-semibold mb-4">שימוש כולל</div>
          <div v-for="usage in usageStats" :key="usage.label" class="mb-3">
            <div class="d-flex justify-space-between mb-1 text-body-2">
              <span>{{ usage.label }}</span>
              <span>{{ usage.current }} / {{ usage.limit }}</span>
            </div>
            <v-progress-linear :model-value="usage.pct" :color="usage.pct > 85 ? 'error' : 'primary'" height="6" rounded   />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Plan comparison -->
    <v-card rounded="xl" elevation="0" class="pa-6">
      <div class="text-subtitle-1 font-weight-semibold mb-4">השוואת תוכניות</div>
      <v-table density="comfortable">
        <thead>
          <tr>
            <th class="text-right">תכונה</th>
            <th class="text-center">Basic ₪99</th>
            <th class="text-center">Pro ₪299</th>
            <th class="text-center">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in planRows" :key="row.feature">
            <td>{{ row.feature }}</td>
            <td class="text-center"><v-icon :color="row.basic ? 'success' : 'error'" size="20">{{ row.basic ? 'mdi-check' : 'mdi-close' }}</v-icon></td>
            <td class="text-center"><v-icon :color="row.pro ? 'success' : 'error'" size="20">{{ row.pro ? 'mdi-check' : 'mdi-close' }}</v-icon></td>
            <td class="text-center"><v-icon color="success" size="20">mdi-check</v-icon></td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
const proBenefits = [
  'עד 15 פרויקטים בונזמנית',
  'עד 20 חברי צוות',
  'ניהול בקשות והצעות מחיר מלא',
  '25GB ניהול קבצים',
  'תמיכה עד 48 שעות',
];

const usageStats = [
  { label: 'פרויקטים', current: 4, limit: 15, pct: 27 },
  { label: 'חברי צוות', current: 12, limit: 20, pct: 60 },
  { label: 'ניהול קבצים', current: '18.2GB', limit: '25GB', pct: 73 },
];

const planRows = [
  { feature: 'פרויקטים פעילים', basic: true, pro: true },
  { feature: 'ניהול הצעות מחיר', basic: false, pro: true },
  { feature: "צ'אט פרויקט", basic: true, pro: true },
  { feature: 'דוחות תקציב מתקדמים', basic: false, pro: true },
  { feature: 'אינטגרציות API', basic: false, pro: false },
  { feature: 'תמיכה ייעודתית', basic: false, pro: false },
];
</script>
