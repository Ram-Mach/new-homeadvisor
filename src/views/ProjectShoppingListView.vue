<template>
  <div>
    <div class="text-h5 font-weight-bold mb-2">רשימת קניות</div>
    <div class="text-body-2 text-medium-emphasis mb-6">
      ניהול פריטים לרכישה לפי חומר לבן ושאר פריטי ביצוע
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
                <v-chip size="small" :color="item.statusColor" variant="tonal">{{ item.status }}</v-chip>
              </template>
            </v-list-item>
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
  </div>
</template>

<script setup>
import { computed } from 'vue';

const whiteMaterials = [
  { id: 1, name: 'תנור בילט-אין', brand: 'Bosch', qty: 1, price: 4200, status: 'ממתין לרכישה', statusColor: 'warning' },
  { id: 2, name: 'כיריים אינדוקציה', brand: 'Electrolux', qty: 1, price: 3600, status: 'נרכש', statusColor: 'success' },
  { id: 3, name: 'מדיח כלים אינטגרלי', brand: 'Siemens', qty: 1, price: 5200, status: 'בהצעת מחיר', statusColor: 'info' },
  { id: 4, name: 'אסלה תלויה', brand: 'Grohe', qty: 2, price: 1400, status: 'ממתין לרכישה', statusColor: 'warning' },
];

const otherMaterials = [
  { id: 1, name: 'פרקט אלון טבעי', vendor: 'רצף העיר', qty: '55 מ"ר', price: 8800, status: 'נרכש', statusColor: 'success' },
  { id: 2, name: 'צבע לקירות פנים', vendor: 'ספק הצבע', qty: '12 דליים', price: 2600, status: 'בהצעת מחיר', statusColor: 'info' },
  { id: 3, name: 'גופי תאורה שקועים', vendor: 'אור פלוס', qty: '20 יחידות', price: 3400, status: 'ממתין לרכישה', statusColor: 'warning' },
];

const whiteTotal = computed(() => whiteMaterials.reduce((acc, item) => acc + (item.price * item.qty), 0));
const otherTotal = computed(() => otherMaterials.reduce((acc, item) => acc + item.price, 0));

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(value);
</script>
