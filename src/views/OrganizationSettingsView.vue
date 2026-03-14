<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <v-card-title class="text-h5">הגדרות מערכת</v-card-title>
    <v-card-subtitle class="mb-6">ניהול הגדרות כלליות ברמת הארגון</v-card-subtitle>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="settings.organizationName"
          label="שם הארגון"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="settings.timezone"
          label="אזור זמן"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-switch
          v-model="settings.emailNotifications"
          label="התראות אימייל"
          color="primary"
          inset
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-switch
          v-model="settings.twoFactorAuth"
          label="אימות דו-שלבי"
          color="primary"
          inset
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-switch
          v-model="darkMode"
          :label="darkMode ? 'ערכת נושא כהה' : 'ערכת נושא בהירה'"
          color="primary"
          inset
        />
      </v-col>

      <v-col cols="12" md="6" class="d-flex align-center">
        <v-chip :color="darkMode ? 'deep-purple' : 'amber'" variant="tonal" size="small">
          {{ darkMode ? 'Dark Mode פעיל' : 'Light Mode פעיל' }}
        </v-chip>
      </v-col>
    </v-row>

    <v-btn color="primary" rounded="lg" @click="onSave">שמירת הגדרות</v-btn>
  </v-card>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

const settings = reactive({
  organizationName: 'HomeAdvisor',
  timezone: 'Asia/Jerusalem',
  emailNotifications: true,
  twoFactorAuth: false,
});

const darkMode = computed({
  get: () => theme.global.name.value === 'dark',
  set: (isDark) => {
    const nextTheme = isDark ? 'dark' : 'light';
    theme.global.name.value = nextTheme;
    localStorage.setItem('ha-theme', nextTheme);
  },
});

const onSave = () => {
  // Placeholder save handler until settings API is connected.
  console.log('Organization settings submitted', {
    ...settings,
    theme: theme.global.name.value,
  });
};
</script>
