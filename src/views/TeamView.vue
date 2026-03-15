<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">ניהול צוות</div>
      <v-btn color="primary" prepend-icon="mdi-account-plus-outline" rounded="lg" @click="openInviteDialog">
        הזמנת חבר
      </v-btn>
    </div>

    <v-alert v-if="membersError" type="error" variant="tonal" class="mb-4">
      {{ membersError }}
    </v-alert>
    <v-alert v-if="inviteSuccess" type="success" variant="tonal" class="mb-4">
      {{ inviteSuccess }}
    </v-alert>

    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="חיפוש חבר צוות"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-5"
      style="max-width:360px"
    />

    <div v-if="isLoading" class="py-6 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-row>
      <v-col
        v-for="member in filteredMembers"
        :key="member.id"
        cols="12" sm="6" lg="4"
      >
        <v-card rounded="xl" elevation="0" class="pa-5">
          <div class="d-flex align-center ga-4 mb-4">
            <v-avatar :color="member.color" size="52" variant="tonal">
              <span class="text-h6 font-weight-bold">{{ member.initials }}</span>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ member.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ member.email }}</div>
            </div>
          </div>

          <div class="d-flex align-center justify-space-between">
            <v-chip size="small" :color="member.color" variant="tonal">{{ member.role }}</v-chip>
            <v-chip size="x-small" :color="member.activeColor" variant="flat">{{ member.status }}</v-chip>
          </div>
        </v-card>
      </v-col>

      <v-col v-if="!isLoading && filteredMembers.length === 0" cols="12">
        <v-card rounded="xl" elevation="0" class="pa-5 text-body-2 text-medium-emphasis text-center">
          לא נמצאו חברי צוות להצגה.
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isInviteDialogOpen" max-width="520">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">הזמנת חבר צוות</v-card-title>

        <v-alert v-if="inviteError" type="error" variant="tonal" class="mb-4">
          {{ inviteError }}
        </v-alert>

        <v-text-field
          v-model="inviteForm.email"
          label="אימייל"
          type="email"
          variant="outlined"
          prepend-inner-icon="mdi-email-outline"
          class="mb-3"
        />

        <v-select
          v-model="inviteForm.role"
          :items="inviteRoleOptions"
          label="תפקיד"
          variant="outlined"
        />

        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="isInviteDialogOpen = false">ביטול</v-btn>
          <v-btn color="primary" :loading="isInviting" @click="submitInvite">שליחת הזמנה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { makeRequest } from '../plugins/api';

const search = ref('');
const isLoading = ref(false);
const isInviting = ref(false);
const isInviteDialogOpen = ref(false);
const membersError = ref('');
const inviteError = ref('');
const inviteSuccess = ref('');

const colorByIndex = ['primary', 'secondary', 'info', 'warning', 'success', 'error'];

const roleLabel = (role) => {
  const map = {
    owner: 'בעלים',
    admin: 'מנהל מערכת',
    manager: 'מנהל/ת פרויקט',
    contractor: 'קבלן',
    architect: 'אדריכל/ית',
    designer: 'מעצב/ת',
    member: 'חבר צוות',
  };

  return map[role] || role || 'חבר צוות';
};

const statusLabel = (isActive) => (isActive ? 'פעיל' : 'לא פעיל');
const statusColor = (isActive) => (isActive ? 'success' : 'error');

const inviteRoleOptions = [
  { title: 'מנהל מערכת', value: 'admin' },
  { title: 'מנהל/ת פרויקט', value: 'manager' },
  { title: 'קבלן', value: 'contractor' },
  { title: 'אדריכל/ית', value: 'architect' },
  { title: 'מעצב/ת', value: 'designer' },
  { title: 'חבר צוות', value: 'member' },
];

const inviteForm = reactive({
  email: '',
  role: 'member',
});

const initialsFromName = (name) => {
  const text = String(name || '').trim();
  if (!text) {
    return '??';
  }

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const toMember = (member, index) => ({
  id: member.id,
  name: member.name || 'ללא שם',
  email: member.email || 'ללא אימייל',
  role: roleLabel(member.role),
  initials: initialsFromName(member.name),
  color: colorByIndex[index % colorByIndex.length],
  status: member.status === 'pending' ? 'ממתין' : statusLabel(Boolean(member.is_active)),
  activeColor: member.status === 'pending' ? 'warning' : statusColor(Boolean(member.is_active)),
});

const toMemberList = (response) => {
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

const members = ref([]);

const loadMembers = async () => {
  isLoading.value = true;
  membersError.value = '';

  try {
    const response = await makeRequest('/team-members');
    members.value = toMemberList(response).map(toMember);
  } catch {
    membersError.value = 'טעינת חברי הצוות נכשלה. נסו לרענן את העמוד.';
    members.value = [];
  } finally {
    isLoading.value = false;
  }
};

const openInviteDialog = () => {
  inviteError.value = '';
  inviteSuccess.value = '';
  inviteForm.email = '';
  inviteForm.role = 'member';
  isInviteDialogOpen.value = true;
};

const submitInvite = async () => {
  inviteError.value = '';
  inviteSuccess.value = '';

  if (!inviteForm.email.trim() || !inviteForm.role) {
    inviteError.value = 'יש להזין אימייל ותפקיד.';
    return;
  }

  isInviting.value = true;

  try {
    await makeRequest('/team-members/invite', {
      email: inviteForm.email.trim(),
      role: inviteForm.role,
    }, 'POST');

    inviteSuccess.value = 'ההזמנה נשלחה והחבר נוסף במצב ממתין.';
    isInviteDialogOpen.value = false;
    await loadMembers();
  } catch (error) {
    inviteError.value = error?.response?.data?.message || 'שליחת ההזמנה נכשלה. נסו שוב.';
  } finally {
    isInviting.value = false;
  }
};

const filteredMembers = computed(() =>
  !search.value
    ? members.value
    : members.value.filter((m) =>
        m.name.includes(search.value) ||
        m.role.includes(search.value) ||
        m.email.includes(search.value)
      )
);

onMounted(loadMembers);
</script>
