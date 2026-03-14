<template>
  <div>
    <!-- Page header -->
    <div class="text-h5 font-weight-bold mb-6">דשבורד ארגוני</div>

    <!-- Stat cards -->
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card rounded="xl" elevation="0"   class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon :icon="stat.icon" :color="stat.color" size="28" />
            <v-chip :color="stat.color" variant="tonal" size="x-small">{{ stat.trend }}</v-chip>
          </div>
          <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Active projects -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">פרויקטים פעילים</div>
          <v-list lines="two" class="pa-0">
            <v-list-item
              v-for="project in projects"
              :key="project.id"
              :title="project.name"
              :subtitle="project.status"
              rounded="lg"
              class="mb-2 px-3"
              :to="`/project/${project.id}/dashboard`"
            >
              <template #prepend>
                <v-avatar :color="project.color" variant="tonal" rounded="lg" size="40">
                  <v-icon :icon="project.icon" size="20" />
                </v-avatar>
              </template>
              <template #append>
                <div class="text-caption text-medium-emphasis">{{ project.budget }}</div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Recent activity -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" class="pa-5">
          <div class="text-subtitle-1 font-weight-semibold mb-4">פעילות אחרונה</div>
          <v-timeline density="compact" side="end" class="activity-timeline">
            <v-timeline-item
              v-for="event in activity"
              :key="event.id"
              :dot-color="event.color"
              size="x-small"
            >
              <div class="text-body-2 font-weight-medium">{{ event.text }}</div>
              <div class="text-caption text-medium-emphasis">{{ event.time }}</div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const stats = [
  { label: 'פרויקטים פעילים', value: 4, icon: 'mdi-home-city-outline', color: 'primary', trend: '+2 החודש' },
  { label: 'חברי צוות', value: 12, icon: 'mdi-account-group-outline', color: 'success', trend: '+1 החודש' },
  { label: 'תקציב כולל', value: '₪820K', icon: 'mdi-cash-multiple', color: 'warning', trend: '68% נוצל' },
  { label: 'הצעות פתוחות', value: 7, icon: 'mdi-gavel', color: 'info', trend: '3 ממתינות' },
];

const projects = [
  { id: 'p-2048', name: 'שיפוץ לופט במרכז העיר', status: 'בביצוע • 68% הושלם', budget: '₪320K', color: 'primary', icon: 'mdi-home-city-outline' },
  { id: 'p-2049', name: 'בית פרטי ברמת השרון', status: 'בתכנון • 20% הושלם', budget: '₪210K', color: 'success', icon: 'mdi-home-outline' },
  { id: 'p-2050', name: 'משרד קומה 5', status: 'ממתין לאישורים', budget: '₪180K', color: 'warning', icon: 'mdi-office-building-outline' },
  { id: 'p-2051', name: 'וילה בהרצליה', status: 'בדיקת הצעות מחיר', budget: '₪110K', color: 'info', icon: 'mdi-home-variant-outline' },
];

const activity = [
  { id: 1, text: 'הצעת מחיר חדשה התקבלה מ-ABC Building', time: 'לפני 20 דקות', color: 'primary' },
  { id: 2, text: 'Alex Morgan עדכן תקציב לפרויקט 2048', time: 'לפני שעה', color: 'success' },
  { id: 3, text: 'קובץ תוכנית קומה הועלה', time: 'לפני 3 שעות', color: 'info' },
  { id: 4, text: 'נוסף חבר צוות: Dana Cohen – מעצבת', time: 'אתמול 14:30', color: 'warning' },
  { id: 5, text: 'פרויקט 2049 עבר לשלב ביצוע', time: 'אתמול 09:10', color: 'success' },
];
</script>

