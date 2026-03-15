<template>
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

          <v-btn type="submit" color="primary" block size="large" rounded="lg">
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
</template>

<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();

const roles = [
  'Homeowner',
  'Designer',
  'Architect',
  'ProjectManager',
];

const form = reactive({
  fullName: '',
  email: '',
  role: 'Homeowner',
  password: '',
});

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
