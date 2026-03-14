<template>
  <div>
    <div class="text-h5 font-weight-bold mb-6">דשבורד פרויקט</div>

    <!-- Summary stat cards -->
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.label" cols="6" lg="3">
        <v-card rounded="xl" elevation="0"  class="pa-4">
          <v-icon :icon="stat.icon" :color="stat.color" size="24" class="mb-2" />
          <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
          <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Progress -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" class="pa-5 mb-4">
          <div class="text-subtitle-1 font-weight-semibold mb-4">התקדמות לפי שלב</div>
          <div v-for="phase in phases" :key="phase.name" class="mb-4">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-body-2">{{ phase.name }}</span>
              <span class="text-body-2 font-weight-medium">{{ phase.pct }}%</span>
            </div>
            <v-progress-linear
              :model-value="phase.pct"
              :color="phase.color"
              rounded
              height="8"
             
            />
          </div>
        </v-card>
      </v-col>

      <!-- Team members -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" class="pa-5 mb-4">
          <div class="text-subtitle-1 font-weight-semibold mb-4">חברי צוות</div>
          <v-list class="pa-0">
            <v-list-item
              v-for="member in team"
              :key="member.name"
              :title="member.name"
              :subtitle="member.role"
              class="px-0 mb-1"
            >
              <template #prepend>
                <v-avatar :color="member.color" variant="tonal" size="36" class="me-3">
                  <span class="text-caption font-weight-bold">{{ member.initials }}</span>
                </v-avatar>
              </template>
              <template #append>
                <v-chip :color="member.statusColor" size="x-small" variant="tonal">
                  {{ member.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upcoming tasks -->
    <v-card rounded="xl" elevation="0" class="pa-5">
      <div class="text-subtitle-1 font-weight-semibold mb-4">משימות קרובות</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-right">משימה</th>
            <th class="text-right">אחראי</th>
            <th class="text-right">תאריך יעד</th>
            <th class="text-right">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.name }}</td>
            <td>{{ task.owner }}</td>
            <td>{{ task.due }}</td>
            <td>
              <v-chip :color="task.statusColor" size="x-small" variant="tonal">{{ task.status }}</v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
const stats = [
  { label: 'ימים לסיום', value: 74, icon: 'mdi-calendar-clock', color: 'primary' },
  { label: 'התקדמות', value: '68%', icon: 'mdi-chart-line', color: 'success' },
  { label: 'תקציב נוצל', value: '₪218K', icon: 'mdi-cash-multiple', color: 'warning' },
  { label: 'פריטים פתוחים', value: 9, icon: 'mdi-clipboard-check-outline', color: 'info' },
];

const phases = [
  { name: 'תכנון ואדריכלות', pct: 100, color: 'success' },
  { name: 'הריסה ושלד', pct: 90, color: 'primary' },
  { name: 'חשמל ואינסטלציה', pct: 70, color: 'primary' },
  { name: 'טיח וצבע', pct: 40, color: 'warning' },
  { name: 'גימור ורהיטים', pct: 10, color: 'error' },
];

const team = [
  { name: 'Alex Morgan', role: 'מעצב פנים', initials: 'AM', color: 'primary', status: 'פעיל', statusColor: 'success' },
  { name: 'Dana Cohen', role: 'אדריכלית', initials: 'DC', color: 'secondary', status: 'פעיל', statusColor: 'success' },
  { name: 'Yossi Levi', role: 'קבלן ראשי', initials: 'YL', color: 'warning', status: 'ממתין', statusColor: 'warning' },
  { name: 'Mia Shapiro', role: 'מנהלת פרויקט', initials: 'MS', color: 'info', status: 'פעיל', statusColor: 'success' },
];

const tasks = [
  { id: 1, name: 'אישור תוכנית גבס', owner: 'Alex Morgan', due: '17/03/2026', status: 'בתהליך', statusColor: 'warning' },
  { id: 2, name: 'הזמנת אריחי רצפה', owner: 'Yossi Levi', due: '20/03/2026', status: 'ממתין', statusColor: 'info' },
  { id: 3, name: 'בדיקת תשתיות חשמל', owner: 'Yossi Levi', due: '22/03/2026', status: 'ממתין', statusColor: 'info' },
  { id: 4, name: 'הגשת היתר שינוי', owner: 'Dana Cohen', due: '25/03/2026', status: 'הושלם', statusColor: 'success' },
];
</script>

