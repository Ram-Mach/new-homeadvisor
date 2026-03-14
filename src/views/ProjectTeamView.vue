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
      <v-table density="comfortable" hover>
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
            <td>{{ member.role }}</td>
            <td>
              <v-chip :color="member.active ? 'success' : 'warning'" variant="tonal" size="x-small">
                {{ member.active ? 'פעיל' : 'ממתין לאישור' }}
              </v-chip>
            </td>
            <td>
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="startEdit(member)" />
              <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="removeMember(member.id)" />
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
          <v-btn color="primary" rounded="lg" @click="saveMember">שמירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const search = ref('');
const roleFilter = ref(null);
const inviteDialog = ref(false);
const editingId = ref(null);

const roleOptions = ['ProjectManager', 'Designer', 'Architect', 'Contractor', 'Homeowner'];

const draft = reactive({
  name: '',
  email: '',
  role: 'Contractor',
});

const members = ref([
  { id: 1, name: 'Mia Shapiro', email: 'mia@example.com', role: 'ProjectManager', active: true, color: 'info', initials: 'MS' },
  { id: 2, name: 'Alex Morgan', email: 'alex@example.com', role: 'Designer', active: true, color: 'primary', initials: 'AM' },
  { id: 3, name: 'Dana Cohen', email: 'dana@example.com', role: 'Architect', active: true, color: 'secondary', initials: 'DC' },
  { id: 4, name: 'Yossi Levi', email: 'yossi@example.com', role: 'Contractor', active: false, color: 'warning', initials: 'YL' },
]);

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
  if (!draft.name || !draft.email || !draft.role) return;

  const initials = draft.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (editingId.value) {
    const index = members.value.findIndex((item) => item.id === editingId.value);
    if (index >= 0) {
      members.value[index] = {
        ...members.value[index],
        name: draft.name,
        email: draft.email,
        role: draft.role,
        initials,
      };
    }
  } else {
    members.value.unshift({
      id: Date.now(),
      name: draft.name,
      email: draft.email,
      role: draft.role,
      active: false,
      color: 'primary',
      initials,
    });
  }

  editingId.value = null;
  draft.name = '';
  draft.email = '';
  draft.role = 'Contractor';
  inviteDialog.value = false;
};

const removeMember = (id) => {
  members.value = members.value.filter((member) => member.id !== id);
};
</script>
