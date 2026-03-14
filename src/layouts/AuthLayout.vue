<template>
  <v-app dir="rtl">
    <v-main class="bg-background">
      <v-container class="fill-height" fluid>
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12">
            <!-- Branding -->
            <div class="text-center mb-6">
              <v-icon size="48" color="primary">mdi-home-city-outline</v-icon>
              <div class="text-h6 font-weight-bold mt-2">HomeAdvisor</div>
            </div>
            <slot />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
