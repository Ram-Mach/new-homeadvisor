<template>
  <div>
    <div class="text-h5 font-weight-bold mb-6">הגדרות פרויקט</div>

    <v-row>
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" class="pa-6 mb-4">
          <div class="text-subtitle-1 font-weight-semibold mb-4">פרטי פרויקט</div>
          <v-text-field v-model="form.name" label="שם הפרויקט" variant="outlined" class="mb-3" />
          <v-textarea v-model="form.description" label="תיאור" variant="outlined" rows="3" class="mb-3" />
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="form.startDate" label="תאריך פתיחה" variant="outlined" type="date" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.endDate" label="תאריך סיום מתוכנן" variant="outlined" type="date" />
            </v-col>
          </v-row>
          <v-text-field v-model="form.budget" label="תקציב כולל (₪)" variant="outlined" type="number" class="mb-3" />
          <v-select
            v-model="form.status"
            :items="statusOptions"
            label="סטאטוס פרויקט"
            variant="outlined"
          />
        </v-card>

        <v-card rounded="xl" elevation="0" class="pa-6">
          <div class="text-subtitle-1 font-weight-semibold mb-4">הגדרות התראות</div>
          <v-switch v-model="form.emailAlerts" label="התראות אימייל" color="primary" inset />
          <v-switch v-model="form.budgetWarning" label="אזהרה בחריגה מתקציב" color="warning" inset />
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" class="pa-6 mb-4">
          <div class="text-subtitle-1 font-weight-semibold mb-4">גישת צוות</div>
          <v-list class="pa-0">
            <v-list-item
              v-for="member in team"
              :key="member.email"
              :title="member.name"
              :subtitle="member.role"
              class="px-0 mb-1"
            >
              <template #prepend>
                <v-avatar :color="member.color" variant="tonal" size="32" class="me-3">
                  <span class="text-caption">{{ member.initials }}</span>
                </v-avatar>
              </template>
              <template #append>
                <v-btn icon="mdi-close" variant="text" size="x-small" color="error" density="compact" />
              </template>
            </v-list-item>
          </v-list>
          <v-btn class="mt-3" prepend-icon="mdi-account-plus-outline" variant="outlined" rounded="lg" block>
            הזמנת חבר צוות
          </v-btn>
        </v-card>

        <v-card rounded="xl" elevation="0" color="error-lighten-5" class="pa-6">
          <div class="text-subtitle-1 font-weight-semibold text-error mb-2">זון סכנה</div>
          <div class="text-body-2 text-medium-emphasis mb-4">הפעולות הבאות הן בלתי הפיכות:</div>
          <v-btn color="error" variant="outlined" rounded="lg" prepend-icon="mdi-delete-outline">מחיקת הפרויקט</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <div class="mt-6">
      <v-btn color="primary" size="large" rounded="lg" @click="onSave">שמור שינויים</v-btn>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const statusOptions = ['בתכנון', 'בביצוע', 'בהקפאה', 'הושלם'];

const form = reactive({
  name: 'שיפוץ לופט במרכז העיר',
  description: 'שיפוץ מלא של דירת 4 חדרים לופט במרךז תל אביב.',
  startDate: '2026-01-15',
  endDate: '2026-07-30',
  budget: 320000,
  status: 'בביצוע',
  emailAlerts: true,
  budgetWarning: true,
});

const team = [
  { name: 'Alex Morgan', role: 'מעצב/ת', email: 'alex@example.com', initials: 'AM', color: 'primary' },
  { name: 'Dana Cohen', role: 'אדריכל/ית', email: 'dana@example.com', initials: 'DC', color: 'secondary' },
  { name: 'Yossi Levi', role: 'קבלן', email: 'yossi@example.com', initials: 'YL', color: 'warning' },
];

const onSave = () => {
  console.log('Project settings saved', { ...form });
};
</script>
