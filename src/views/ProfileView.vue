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

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="profile.name" label="שם מלא" variant="outlined" :disabled="isLoadingProfile || isSaving" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="profile.email" label="אימייל" variant="outlined" type="email" :disabled="isLoadingProfile || isSaving" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field :model-value="profile.role" label="תפקיד" variant="outlined" readonly />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field :model-value="profile.projectName" label="פרויקט פעיל" variant="outlined" readonly />
      </v-col>
    </v-row>

    <v-btn color="primary" rounded="lg" :loading="isSaving" :disabled="isLoadingProfile" @click="onSave">
      שמירת שינויים
    </v-btn>
  </v-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { makeRequest } from '../plugins/api';

const authStore = useAuthStore();
const isLoadingProfile = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const profile = reactive({
  name: '',
  email: '',
  role: '',
  projectName: 'ללא פרויקט פעיל',
});

const normalizeUser = (response) => response?.user || response?.data || response;

const roleLabel = (role) => {
  const map = {
    Homeowner: 'בעל בית',
    Contractor: 'קבלן',
    Designer: 'מעצב',
    Architect: 'אדריכל',
    ProjectManager: 'מנהל פרויקט',
    super_admin: 'סופר אדמין',
    admin: 'מנהל מערכת',
    manager: 'מנהל/ת פרויקט',
    contractor: 'קבלן',
    architect: 'אדריכל/ית',
    designer: 'מעצב/ת',
    member: 'חבר צוות',
    owner: 'בעלים',
  };

  return map[role] || role || 'ללא תפקיד';
};

const toProjectList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

const loadProfile = async () => {
  isLoadingProfile.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const [meResponse, projectsResponse] = await Promise.all([
      makeRequest('/auth/me'),
      makeRequest('/projects', { per_page: 1 }),
    ]);

    const user = normalizeUser(meResponse);
    const projects = toProjectList(projectsResponse);

    profile.name = user?.name || '';
    profile.email = user?.email || '';
    profile.role = roleLabel(user?.role);
    profile.projectName = projects[0]?.name || 'ללא פרויקט פעיל';
  } catch {
    errorMessage.value = 'טעינת הפרופיל נכשלה. נסו לרענן את העמוד.';
  } finally {
    isLoadingProfile.value = false;
  }
};

const onSave = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  if (!profile.name.trim() || !profile.email.trim()) {
    errorMessage.value = 'יש למלא שם ואימייל.';
    return;
  }

  isSaving.value = true;

  try {
    const response = await makeRequest('/auth/me', {
      name: profile.name.trim(),
      email: profile.email.trim(),
    }, 'PATCH');

    const updatedUser = normalizeUser(response);

    authStore.setAuthSession({
      user: updatedUser,
      token: authStore.token,
    });

    profile.name = updatedUser?.name || profile.name;
    profile.email = updatedUser?.email || profile.email;
    profile.role = roleLabel(updatedUser?.role);
    successMessage.value = 'הפרופיל נשמר בהצלחה.';
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'שמירת הפרופיל נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadProfile);
</script>
