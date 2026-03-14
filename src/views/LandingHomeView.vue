<template>
  <v-row justify="center" class="mt-8">
    <v-col cols="12" md="8" lg="6" class="text-center">

      <!-- Logo / Icon -->
      <v-icon size="72" color="primary" class="mb-4">mdi-home-city-outline</v-icon>

      <!-- Headline -->
      <h1 class="text-h3 font-weight-bold mb-3">
        ברוכים הבאים להום אדוויזור
      </h1>
      <p class="text-subtitle-1 text-medium-emphasis mb-8">
        הפלטפורמה הפרטית לניהול שיפוץ הבית במקום אחד -
        מתקציב והצעות מחיר ועד שיתוף פעולה עם הצוות וניהול קבצים.
      </p>

      <!-- CTA buttons -->
      <v-btn
        color="primary"
        size="large"
        rounded="xl"
        class="me-3"
        :to="{ name: 'org-dashboard' }"
      >
        מעבר לדשבורד
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn
        variant="outlined"
        size="large"
        rounded="xl"
        color="primary"
        class="me-3"
        :to="{ name: 'login' }"
      >
        התחברות
      </v-btn>
      <v-btn
        variant="text"
        size="large"
        rounded="xl"
        color="primary"
        :to="{ name: 'register' }"
      >
        הרשמה
      </v-btn>

      <v-divider class="my-10" />

      <!-- Feature highlights -->
      <v-row>
        <v-col
          v-for="feature in features"
          :key="feature.title"
          cols="12"
          sm="4"
        >
          <v-card rounded="xl" elevation="0" color="surface-variant" class="pa-5 text-right">
            <v-icon :icon="feature.icon" color="primary" size="36" class="mb-3" />
            <div class="text-subtitle-1 font-weight-semibold mb-1">{{ feature.title }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ feature.description }}</div>
          </v-card>
        </v-col>
      </v-row>

    </v-col>
  </v-row>
</template>

<script setup>
const features = [
  {
    icon: 'mdi-cash-multiple',
    title: 'תקציב והוצאות',
    description: 'מעקב אחרי כל שקל לפי קטגוריות עם דוחות תקציב בזמן אמת.',
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'שיתוף פעולה בצוות',
    description: 'הזמנת אדריכל, מעצב וקבלן למרחב עבודה משותף אחד.',
  },
  {
    icon: 'mdi-gavel',
    title: 'ניהול הצעות מחיר',
    description: 'איסוף והשוואת הצעות מספקים ללא התכתבויות מייל אינסופיות.',
  },
];
</script>
