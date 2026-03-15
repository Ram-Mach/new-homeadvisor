<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <v-card-title class="text-h5">הגדרות מערכת</v-card-title>
    <v-card-subtitle class="mb-6">ניהול הגדרות כלליות ברמת הארגון</v-card-subtitle>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="settings.organizationName"
          label="שם הארגון"
          variant="outlined"
          :disabled="isLoading || isSaving"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="settings.timezone"
          label="אזור זמן"
          variant="outlined"
          :disabled="isLoading || isSaving"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-switch
          v-model="settings.emailNotifications"
          label="התראות אימייל"
          color="primary"
          inset
          :disabled="isLoading || isSaving"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-switch
          v-model="settings.twoFactorAuth"
          label="אימות דו-שלבי"
          color="primary"
          inset
          :disabled="isLoading || isSaving"
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
        <v-chip :color="darkMode ? 'primary' : 'warning'" variant="tonal" size="small">
          {{ darkMode ? 'מצב כהה פעיל' : 'מצב בהיר פעיל' }}
        </v-chip>
      </v-col>
    </v-row>

    <v-btn color="primary" rounded="lg" :loading="isSaving" :disabled="isLoading" @click="onSave">
      שמירת הגדרות
    </v-btn>
  </v-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useTheme } from 'vuetify';
import { makeRequest } from '../plugins/api';

const theme = useTheme();
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const settings = reactive({
  organizationName: '',
  timezone: 'Asia/Jerusalem',
  emailNotifications: true,
  twoFactorAuth: false,
});

const normalizeSettings = (response) => response?.data || response;

const darkMode = computed({
  get: () => theme.global.name.value === 'dark',
  set: (isDark) => {
    const nextTheme = isDark ? 'dark' : 'light';
    theme.global.name.value = nextTheme;
    localStorage.setItem('ha-theme', nextTheme);
  },
});

const loadSettings = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await makeRequest('/organization-settings');
    const data = normalizeSettings(response);

    settings.organizationName = data?.organization_name || '';
    settings.timezone = data?.timezone || 'Asia/Jerusalem';
    settings.emailNotifications = Boolean(data?.email_notifications);
    settings.twoFactorAuth = Boolean(data?.two_factor_auth);
  } catch {
    errorMessage.value = 'טעינת הגדרות הארגון נכשלה. נסו לרענן את העמוד.';
  } finally {
    isLoading.value = false;
  }
};

const onSave = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  if (!settings.organizationName.trim() || !settings.timezone.trim()) {
    errorMessage.value = 'יש למלא שם ארגון ואזור זמן.';
    return;
  }

  isSaving.value = true;

  try {
    const response = await makeRequest('/organization-settings', {
      organization_name: settings.organizationName.trim(),
      timezone: settings.timezone.trim(),
      email_notifications: Boolean(settings.emailNotifications),
      two_factor_auth: Boolean(settings.twoFactorAuth),
    }, 'PATCH');

    const data = normalizeSettings(response);
    settings.organizationName = data?.organization_name || settings.organizationName;
    settings.timezone = data?.timezone || settings.timezone;
    settings.emailNotifications = Boolean(data?.email_notifications);
    settings.twoFactorAuth = Boolean(data?.two_factor_auth);
    successMessage.value = 'הגדרות הארגון נשמרו בהצלחה.';
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'שמירת ההגדרות נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadSettings);
</script>
