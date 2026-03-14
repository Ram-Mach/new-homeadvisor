<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">הצעות מחיר לפרויקט</div>
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg">בקשת הצעה</v-btn>
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
            <v-btn color="primary" size="small" rounded="lg" variant="tonal">אשר הצעה</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const bids = [
  {
    id: 1, vendor: 'יוסי לוי עבודות', category: 'קבלנות ראשית',
    amount: '₪85,000', note: 'כולל חומרים ועבודה, אחריות 12 חודש',
    status: 'התקבל', statusColor: 'warning', recommended: true,
    tags: ['10 שנות ניסיון', 'מבוטח', 'פנוי'],
  },
  {
    id: 2, vendor: 'שיפוץים כהן בע"מ', category: 'קבלנות ראשית',
    amount: '₪91,000', note: 'כולל חומרים, אחריות 6 חודש',
    status: 'בבדיקה', statusColor: 'info', recommended: false,
    tags: ['7 שנות ניסיון', 'פנוי'],
  },
  {
    id: 3, vendor: 'אלפא שיפוץ ובנייה', category: 'קבלנות ראשית',
    amount: '₪78,500', note: 'ללא חומרים, אחריות 3 חודש',
    status: 'בדיקה', statusColor: 'info', recommended: false,
    tags: ['5 שנות ניסיון'],
  },
];
</script>
