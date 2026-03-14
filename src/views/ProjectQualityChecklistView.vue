<template>
  <div>
    <div class="text-h5 font-weight-bold mb-2">בקרת איכות</div>
    <div class="text-body-2 text-medium-emphasis mb-6">
      אישור שלבים לפי רשימות בדיקה לפני מעבר לשלב הבא
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            v-for="phase in checklistPhases"
            :key="phase.id"
            :title="phase.title"
            :text="`אחראי: ${phase.owner}`"
          >
            <v-expansion-panel-text>
              <v-checkbox
                v-for="item in phase.items"
                :key="item.id"
                v-model="item.done"
                :label="item.label"
                hide-details
                class="mb-2"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="1" class="pa-4 mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">מצב בקרת איכות</div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-medium-emphasis">בדיקות שהושלמו</span>
            <span class="font-weight-bold">{{ completedChecks }}/{{ totalChecks }}</span>
          </div>
          <v-progress-linear
            :model-value="completionRate"
            color="primary"
            height="10"
            rounded
          />
          <div class="text-caption mt-2 text-medium-emphasis">{{ completionRate }}% הושלמו</div>
        </v-card>

        <v-card elevation="1" class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">פעולה הבאה</div>
          <v-alert type="info" variant="tonal">
            מומלץ לסיים את כל בדיקות שלב התשתיות לפני הזמנת בדיקת מהנדס.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';

const checklistPhases = reactive([
  {
    id: 1,
    title: 'שלב תשתיות',
    owner: 'מנהל פרויקט',
    items: [
      { id: 'infra-1', label: 'בדיקת לחץ מים בוצעה ותועדה', done: true },
      { id: 'infra-2', label: 'בדיקת לוח חשמל ואבטחה בוצעה', done: false },
      { id: 'infra-3', label: 'צילום צנרת לפני סגירה נשמר בתיק פרויקט', done: false },
    ],
  },
  {
    id: 2,
    title: 'שלב ריצוף וחיפוי',
    owner: 'מפקח איכות',
    items: [
      { id: 'tile-1', label: 'בדיקת מפלסים והתאמה לתוכנית', done: true },
      { id: 'tile-2', label: 'בדיקת רובה ואחידות מרווחים', done: false },
      { id: 'tile-3', label: 'אישור בעל הבית על דוגמת החיפוי', done: true },
    ],
  },
  {
    id: 3,
    title: 'שלב גמר ומסירה',
    owner: 'בעל הבית',
    items: [
      { id: 'finish-1', label: 'בדיקת פתיחה/סגירה של דלתות וארונות', done: false },
      { id: 'finish-2', label: 'בדיקת גופי תאורה ושקעים', done: false },
      { id: 'finish-3', label: 'תיעוד ליקויים ותוכנית תיקון', done: false },
    ],
  },
]);

const totalChecks = computed(() => checklistPhases
  .reduce((acc, phase) => acc + phase.items.length, 0));

const completedChecks = computed(() => checklistPhases
  .reduce((acc, phase) => acc + phase.items.filter((item) => item.done).length, 0));

const completionRate = computed(() => {
  if (!totalChecks.value) {
    return 0;
  }

  return Math.round((completedChecks.value / totalChecks.value) * 100);
});
</script>
