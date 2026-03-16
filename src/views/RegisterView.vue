<template>
  <div>
    <v-row justify="center" class="mt-8">
      <v-col cols="12" sm="10" md="7" lg="5">
        <v-card rounded="xl" elevation="2" class="pa-6">
          <v-card-title class="text-h5 text-center mb-2">יצירת חשבון</v-card-title>
          <v-card-subtitle class="text-center mb-6">הרשמה למערכת HomeAdvisor</v-card-subtitle>

          <v-form @submit.prevent="onSubmit">
            <v-text-field
              v-model="form.fullName"
              label="שם מלא"
              variant="outlined"
              prepend-inner-icon="mdi-account-outline"
              class="mb-3"
              required
            />

            <v-text-field
              v-model="form.email"
              type="email"
              label="אימייל"
              variant="outlined"
              prepend-inner-icon="mdi-email-outline"
              class="mb-3"
              required
            />

            <v-select
              v-model="form.role"
              :items="roles"
              label="תפקיד"
              variant="outlined"
              prepend-inner-icon="mdi-badge-account-outline"
              class="mb-3"
              required
            />

            <v-text-field
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="סיסמה"
              variant="outlined"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              class="mb-2"
              required
            />

            <v-btn type="submit" color="primary" block size="large" rounded="lg" :disabled="isSubmitting || isOnboardingSubmitting">
              <v-progress-circular
                v-if="isSubmitting"
                indeterminate
                size="18"
                width="2"
                class="me-2"
              />
              צור חשבון
            </v-btn>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              {{ errorMessage }}
            </v-alert>
          </v-form>

          <div class="text-center mt-5 text-body-2">
            כבר יש לך חשבון?
            <RouterLink :to="{ name: 'login' }">התחברות</RouterLink>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showOnboardingDialog" persistent max-width="560">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-1">השלמת פתיחת ארגון</v-card-title>
        <v-card-subtitle class="mb-5">כדי להתחיל, צריך להגדיר שם ארגון. אפשר גם להוסיף לוגו.</v-card-subtitle>

        <v-alert v-if="onboardingErrorMessage" type="error" variant="tonal" class="mb-4">
          {{ onboardingErrorMessage }}
        </v-alert>

        <v-text-field
          v-model="organizationForm.name"
          label="שם הארגון"
          variant="outlined"
          prepend-inner-icon="mdi-office-building-outline"
          class="mb-3"
          :disabled="isOnboardingSubmitting"
          required
        />

        <v-file-input
          v-model="organizationForm.logo"
          label="לוגו (אופציונלי)"
          variant="outlined"
          prepend-icon="mdi-image-outline"
          accept="image/*"
          clearable
          show-size
          :disabled="isOnboardingSubmitting"
        />

        <div class="d-flex justify-end mt-4">
          <v-btn color="primary" rounded="lg" :loading="isOnboardingSubmitting" @click="completeOrganizationOnboarding">
            שמירה והמשך
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { makeRequest } from '../plugins/api';
import { useAuthStore } from '../stores/auth';

const showPassword = ref(false);
const isSubmitting = ref(false);
const isOnboardingSubmitting = ref(false);
const errorMessage = ref('');
const onboardingErrorMessage = ref('');
const showOnboardingDialog = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const roles = [
  { title: 'בעל בית', value: 'Homeowner' },
  { title: 'קבלן', value: 'Contractor' },
  { title: 'מעצב', value: 'Designer' },
  { title: 'אדריכל', value: 'Architect' },
  { title: 'מנהל פרויקט', value: 'ProjectManager' },
];

const form = reactive({
  fullName: '',
  email: '',
  role: 'Homeowner',
  password: '',
});

const organizationForm = reactive({
  name: '',
  logo: null,
});

const selectedLogoFile = computed(() => {
  if (Array.isArray(organizationForm.logo)) {
    return organizationForm.logo[0] || null;
  }

  return organizationForm.logo;
});

const completeOrganizationOnboarding = async () => {
  onboardingErrorMessage.value = '';

  if (!organizationForm.name.trim()) {
    onboardingErrorMessage.value = 'יש להזין שם ארגון.';
    return;
  }

  isOnboardingSubmitting.value = true;

  try {
    const payload = new FormData();
    payload.append('organization_name', organizationForm.name.trim());

    if (selectedLogoFile.value) {
      payload.append('logo', selectedLogoFile.value);
    }

    const response = await makeRequest('/auth/onboarding/organization', payload, 'POST');

    if (response?.user) {
      authStore.setAuthSession({
        user: response.user,
        token: authStore.token,
      });
    }

    showOnboardingDialog.value = false;
    await router.push({ name: 'org-dashboard' });
  } catch (error) {
    const validationErrors = error?.response?.data?.errors;
    if (validationErrors) {
      const firstField = Object.keys(validationErrors)[0];
      onboardingErrorMessage.value = validationErrors[firstField]?.[0] || 'שמירת הארגון נכשלה. נסו שוב.';
    } else {
      onboardingErrorMessage.value = error?.response?.data?.message || 'שמירת הארגון נכשלה. נסו שוב.';
    }
  } finally {
    isOnboardingSubmitting.value = false;
  }
};

const onSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await authStore.register({
      name: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
    });

    if (authStore.isAuthenticated) {
      if (form.role !== 'Homeowner') {
        organizationForm.name = `${form.fullName.trim()} סטודיו`;
        organizationForm.logo = null;
        onboardingErrorMessage.value = '';
        showOnboardingDialog.value = true;
        return;
      }

      await router.push({ name: 'org-dashboard' });
      return;
    }

    await router.push({ name: 'login' });
  } catch (error) {
    const validationErrors = error?.response?.data?.errors;
    if (validationErrors) {
      const firstField = Object.keys(validationErrors)[0];
      errorMessage.value = validationErrors[firstField]?.[0] || 'ההרשמה נכשלה. נסו שוב.';
    } else {
      errorMessage.value = error?.response?.data?.message || 'ההרשמה נכשלה. נסו שוב.';
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
