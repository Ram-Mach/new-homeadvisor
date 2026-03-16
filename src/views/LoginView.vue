<template>
  <v-row justify="center" class="mt-8">
    <v-col cols="12" sm="10" md="6" lg="4">
      <v-card rounded="xl" elevation="2" class="pa-6">
        <v-card-title class="text-h5 text-center mb-2">התחברות</v-card-title>
        <v-card-subtitle class="text-center mb-6">כניסה למערכת HomeAdvisor</v-card-subtitle>

        <v-form @submit.prevent="onSubmit">
          <v-text-field
            v-model="form.email"
            type="email"
            label="אימייל"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
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

          <v-checkbox
            v-model="form.remember"
            label="זכור אותי"
            density="compact"
            hide-details
            class="mb-4"
          />

          <v-btn type="submit" color="primary" block size="large" rounded="lg">
            <v-progress-circular
              v-if="isSubmitting"
              indeterminate
              size="18"
              width="2"
              class="me-2"
            />
            התחבר
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
          אין לך חשבון?
          <RouterLink :to="{ name: 'register' }">הרשמה</RouterLink>
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

const form = reactive({
  email: 'admin@b-1.co.il',
  password: '123123123',
  remember: true,
});

const onSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember,
    });

    await router.push({ name: 'org-dashboard' });
  } catch (error) {
    const serverMessage = error?.response?.data?.message;
    errorMessage.value = serverMessage || 'ההתחברות נכשלה. בדקו אימייל וסיסמה ונסו שוב.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
