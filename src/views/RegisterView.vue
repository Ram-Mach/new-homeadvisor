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
            צור חשבון
          </v-btn>
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
import { RouterLink } from 'vue-router';

const showPassword = ref(false);

const roles = [
  'Homeowner',
  'Designer',
  'Architect',
  'ProjectManager',
  'Contractor',
];

const form = reactive({
  fullName: '',
  email: '',
  role: 'Homeowner',
  password: '',
});

const onSubmit = () => {
  // Placeholder submit handler until registration API is connected.
  console.log('Register form submitted', { ...form });
};
</script>
