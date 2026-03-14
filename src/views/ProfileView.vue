<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <div class="d-flex align-center ga-4 mb-6">
      <v-avatar size="64" color="primary" variant="tonal">
        <v-icon size="36">mdi-account-circle</v-icon>
      </v-avatar>
      <div>
        <div class="text-h6">פרופיל משתמש</div>
        <div class="text-body-2 text-medium-emphasis">עדכון פרטים אישיים ותצוגת תפקיד</div>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="profile.name" label="שם מלא" variant="outlined" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="profile.email" label="אימייל" variant="outlined" type="email" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field :model-value="profile.role" label="תפקיד" variant="outlined" readonly />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field :model-value="profile.projectName" label="פרויקט פעיל" variant="outlined" readonly />
      </v-col>
    </v-row>

    <v-btn color="primary" rounded="lg" @click="onSave">שמירת שינויים</v-btn>
  </v-card>
</template>

<script setup>
import { reactive } from 'vue';

const profile = reactive({
  name: 'Alex Morgan',
  email: 'alex@example.com',
  role: 'Designer',
  projectName: 'Downtown Loft Renovation',
});

const onSave = () => {
  // Placeholder save handler until profile API is connected.
  console.log('Profile update submitted', { ...profile });
};
</script>
