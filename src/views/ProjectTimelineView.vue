<template>
  <div>
    <div class="text-h5 font-weight-bold mb-2">ניהול לוחות זמנים</div>
    <div class="text-body-2 text-medium-emphasis mb-6">
      תצוגת אבני דרך ושלבי ביצוע לפרויקט
    </div>

    <v-row>
      <v-col cols="12" md="4">
        <v-card elevation="1" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">אבני דרך קרובות</div>
          <v-timeline density="compact" side="end">
            <v-timeline-item
              v-for="milestone in milestones"
              :key="milestone.id"
              :dot-color="milestone.color"
              size="x-small"
            >
              <div class="text-body-2 font-weight-medium">{{ milestone.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ milestone.date }}</div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card elevation="1" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-4">התקדמות שלבים (תצוגת גאנט פשוטה)</div>
          <v-table>
            <thead>
              <tr>
                <th class="text-right">שלב</th>
                <th class="text-right">טווח תאריכים</th>
                <th class="text-right">ביצוע</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="phase in phases" :key="phase.id">
                <td>
                  <div class="font-weight-medium">{{ phase.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ phase.owner }}</div>
                </td>
                <td>{{ phase.range }}</td>
                <td style="min-width: 220px;">
                  <v-progress-linear
                    :model-value="phase.progress"
                    color="primary"
                    height="10"
                    rounded
                  />
                  <div class="text-caption text-medium-emphasis mt-1">{{ phase.progress }}%</div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const phases = [
  { id: 1, title: 'תכנון והיתרים', owner: 'אדריכלית הפרויקט', range: '01/04 - 18/04', progress: 90 },
  { id: 2, title: 'פירוק והכנות', owner: 'מנהל פרויקט', range: '20/04 - 30/04', progress: 55 },
  { id: 3, title: 'עבודות שלד ותשתיות', owner: 'קבלן ביצוע', range: '01/05 - 20/05', progress: 18 },
  { id: 4, title: 'גמרים והתקנות', owner: 'מנהל פרויקט', range: '22/05 - 25/06', progress: 0 },
];

const milestones = [
  { id: 1, title: 'אישור תוכניות עבודה', date: '16/04/2026', color: 'success' },
  { id: 2, title: 'סיום פירוק מטבח קיים', date: '28/04/2026', color: 'primary' },
  { id: 3, title: 'בדיקת איכות תשתיות מים', date: '12/05/2026', color: 'warning' },
  { id: 4, title: 'מסירת שלב גמר', date: '25/06/2026', color: 'info' },
];
</script>
