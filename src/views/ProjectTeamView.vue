<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">ניהול צוות פרויקט</div>
      <v-btn color="primary" rounded="lg" prepend-icon="mdi-account-plus-outline" @click="inviteDialog = true">
        הזמנת חבר צוות
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" sm="5">
        <v-text-field
          v-model="search"
          label="חיפוש לפי שם/אימייל"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="roleFilter"
          :items="roleOptions"
          label="סינון לפי תפקיד"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="pa-4">
      <AppStateError v-if="errorMessage" :message="errorMessage" @retry="loadMembers" />
      <AppStateLoading v-if="isLoading" message="טוען חברי צוות..." />
      <AppStateEmpty
        v-else-if="filteredMembers.length === 0"
        icon="mdi-account-group-outline"
        title="אין חברי צוות להצגה"
        description="אפשר להזמין חבר צוות חדש או לשנות את תנאי הסינון."
      />
      <v-table v-else density="comfortable" hover>
        <thead>
          <tr>
            <th class="text-right">חבר צוות</th>
            <th class="text-right">תפקיד</th>
            <th class="text-right">סטטוס</th>
            <th class="text-right">פעולות</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredMembers" :key="member.id">
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar :color="member.color" variant="tonal" size="34">
                  <span class="text-caption font-weight-bold">{{ member.initials }}</span>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium">{{ member.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ member.email }}</div>
                </div>
              </div>
            </td>
            <td>{{ member.roleLabel }}</td>
            <td>
              <v-chip :color="member.active ? 'success' : 'warning'" variant="tonal" size="x-small">
                {{ member.active ? 'פעיל' : 'ממתין לאישור' }}
              </v-chip>
            </td>
            <td>
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" :disabled="isSaving" @click="startEdit(member)" />
              <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" :loading="isSaving" @click="removeMember(member.id)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="inviteDialog" max-width="520">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">הזמנת חבר צוות</v-card-title>
        <v-text-field v-model="draft.name" label="שם מלא" variant="outlined" class="mb-3" />
        <v-text-field v-model="draft.email" label="אימייל" variant="outlined" class="mb-3" type="email" />
        <v-select v-model="draft.role" :items="roleOptions" label="תפקיד" variant="outlined" class="mb-4" />
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="inviteDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" :loading="isSaving" @click="saveMember">שמירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppStateEmpty from '../components/state/AppStateEmpty.vue';
import AppStateError from '../components/state/AppStateError.vue';
import AppStateLoading from '../components/state/AppStateLoading.vue';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const search = ref('');
const roleFilter = ref(null);
const inviteDialog = ref(false);
const editingId = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');

const roleOptions = [
  { title: 'מנהל פרויקט', value: 'ProjectManager' },
  { title: 'מעצב', value: 'Designer' },
  { title: 'אדריכל', value: 'Architect' },
  { title: 'קבלן', value: 'Contractor' },
  { title: 'בעל בית', value: 'Homeowner' },
];

const draft = reactive({
  name: '',
  email: '',
  role: 'Contractor',
});

const members = ref([]);

const projectId = computed(() => route.params.id);

const membersEndpoint = (id) => `/projects/${id}/members`;
const memberItemEndpoint = (id, memberId) => `/projects/${id}/members/${memberId}`;

const toItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const initialsFromName = (name) => {
  const parts = String(name || '').trim().split(' ').filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0][0];
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`;
};

const colorByRole = (role) => {
  const map = {
    ProjectManager: 'info',
    Designer: 'primary',
    Architect: 'secondary',
    Contractor: 'warning',
    Homeowner: 'success',
  };
  return map[role] || 'primary';
};

const roleLabel = (role) => {
  const map = {
    ProjectManager: 'מנהל פרויקט',
    Designer: 'מעצב',
    Architect: 'אדריכל',
    Contractor: 'קבלן',
    Homeowner: 'בעל בית',
  };

  return map[role] || role || 'ללא תפקיד';
};

const mapMember = (member) => {
  const name = member.user?.name || member.name || `משתמש #${member.user_id}`;
  const role = member.role || 'Contractor';
  return {
    id: member.id,
    userId: member.user_id,
    name,
    email: member.user?.email || member.email || '-',
    role,
    roleLabel: roleLabel(role),
    active: member.is_active !== 0,
    color: colorByRole(role),
    initials: initialsFromName(name),
  };
};

const loadMembers = async () => {
  if (!projectId.value) {
    members.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await makeRequest(membersEndpoint(projectId.value));
    members.value = toItems(response).map(mapMember);
  } catch {
    errorMessage.value = 'טעינת חברי הצוות נכשלה.';
    members.value = [];
  } finally {
    isLoading.value = false;
  }
};

const filteredMembers = computed(() =>
  members.value.filter((member) => {
    const textMatch = !search.value || member.name.includes(search.value) || member.email.includes(search.value);
    const roleMatch = !roleFilter.value || member.role === roleFilter.value;
    return textMatch && roleMatch;
  })
);

const startEdit = (member) => {
  editingId.value = member.id;
  draft.name = member.name;
  draft.email = member.email;
  draft.role = member.role;
  inviteDialog.value = true;
};

const saveMember = () => {
  return onSaveMember();
};

const resetDraft = () => {
  editingId.value = null;
  draft.name = '';
  draft.email = '';
  draft.role = 'Contractor';
};

const onSaveMember = async () => {
  if (!projectId.value || !draft.name || !draft.email || !draft.role) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    if (editingId.value) {
      await makeRequest(memberItemEndpoint(projectId.value, editingId.value), {
        name: draft.name,
        email: draft.email,
        role: draft.role,
      }, 'PUT');
    } else {
      await makeRequest(membersEndpoint(projectId.value), {
        name: draft.name,
        email: draft.email,
        role: draft.role,
      }, 'POST');
    }

    resetDraft();
    inviteDialog.value = false;
    await loadMembers();
  } catch {
    errorMessage.value = 'שמירת חבר צוות נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

const removeMember = async (id) => {
  if (!projectId.value) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    await makeRequest(memberItemEndpoint(projectId.value, id), {}, 'DELETE');

    await loadMembers();
  } catch {
    errorMessage.value = 'מחיקת חבר צוות נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => route.params.id,
  () => {
    loadMembers();
  },
  { immediate: true },
);
</script>
