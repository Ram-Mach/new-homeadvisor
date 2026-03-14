<template>
  <v-row justify="center" class="mt-16">
    <v-col cols="12" class="text-center">
      <v-icon size="80" color="medium-emphasis">mdi-map-search-outline</v-icon>
      <div class="text-h4 font-weight-bold mt-4 mb-2">404 – דף לא נמצא</div>
      <div class="text-body-1 text-medium-emphasis mb-8">
        הדף שחיפשת אינו קיים או שהוסר.
      </div>
      <v-btn color="primary" rounded="lg" size="large" :to="{ name: 'landing-home' }">
        <v-icon start>mdi-home-outline</v-icon>
        חזרה לדף הבית
      </v-btn>
    </v-col>
  </v-row>
</template>
