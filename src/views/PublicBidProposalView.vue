<template>
  <v-row justify="center" class="mt-2">
    <v-col cols="12" lg="10" xl="9">
      <v-card elevation="1" class="pa-4 pa-md-6">
        <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-2">
          <div>
            <div class="text-h5 font-weight-bold">הגשת הצעת מחיר לקבלן</div>
            <div class="text-body-2 text-medium-emphasis">
              מזהה הזמנה: {{ bidToken }}
            </div>
          </div>
          <v-chip color="primary" variant="tonal">קישור ציבורי</v-chip>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.contractorName" label="שם הקבלן" prepend-inner-icon="mdi-account-hard-hat" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.phone" label="טלפון" prepend-inner-icon="mdi-phone-outline" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.email" label="אימייל" prepend-inner-icon="mdi-email-outline" type="email" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.validUntil" label="תוקף הצעה עד" type="date" prepend-inner-icon="mdi-calendar-range" />
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <div class="text-subtitle-1 font-weight-bold mb-3">כתב כמויות להצעת מחיר</div>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th class="text-right">סעיף</th>
              <th class="text-right">כמות</th>
              <th class="text-right">יחידה</th>
              <th class="text-right">מחיר יחידה מוצע</th>
              <th class="text-right">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in boqItems" :key="item.id">
              <td>{{ item.title }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unit }}</td>
              <td style="min-width: 200px;">
                <v-text-field
                  v-model.number="item.unitPrice"
                  type="number"
                  min="0"
                  hide-details
                  density="compact"
                  suffix="₪"
                />
              </td>
              <td class="font-weight-medium">{{ currency(item.quantity * item.unitPrice) }}</td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex justify-space-between align-center mt-5 flex-wrap ga-2">
          <div class="text-subtitle-1 font-weight-bold">
            סכום הצעה כולל: {{ currency(totalBid) }}
          </div>
          <v-btn color="primary" prepend-icon="mdi-send-outline" @click="onSubmitBid">
            שליחת הצעה
          </v-btn>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const bidToken = computed(() => route.params.token);

const form = reactive({
  contractorName: '',
  phone: '',
  email: '',
  validUntil: '',
});

const boqItems = reactive([
  { id: 1, title: 'פירוק ופינוי', quantity: 1, unit: 'יחידה', unitPrice: 2800 },
  { id: 2, title: 'עבודות אינסטלציה', quantity: 1, unit: 'סט', unitPrice: 7900 },
  { id: 3, title: 'ריצוף וחיפוי', quantity: 55, unit: 'מ"ר', unitPrice: 240 },
  { id: 4, title: 'צביעה כללית', quantity: 180, unit: 'מ"ר', unitPrice: 42 },
]);

const totalBid = computed(() => boqItems
  .reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0));

const onSubmitBid = () => {
  // TODO: לחבר שליחת הצעת מחיר ל-API ציבורי לפי טוקן.
  console.log('Public bid submitted', {
    token: bidToken.value,
    contractor: { ...form },
    boqItems,
    totalBid: totalBid.value,
  });
};

const currency = (value) => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
}).format(value);
</script>
