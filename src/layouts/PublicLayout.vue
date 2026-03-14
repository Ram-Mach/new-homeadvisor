<template>
  <v-app dir="rtl">
    <v-app-bar elevation="0" border="b">
      <v-icon color="primary" class="ms-4" size="24">mdi-home-city-outline</v-icon>
      <v-toolbar-title class="font-weight-bold ms-2">HomeAdvisor</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" :to="{ name: 'login' }" class="me-1">התחברות</v-btn>
      <v-btn color="primary" variant="tonal" rounded="lg" :to="{ name: 'register' }" class="me-3">
        הרשמה
      </v-btn>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
