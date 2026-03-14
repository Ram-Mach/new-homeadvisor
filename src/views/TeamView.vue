<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">ניהול צוות</div>
      <v-btn color="primary" prepend-icon="mdi-account-plus-outline" rounded="lg">הזמנת חבר</v-btn>
    </div>

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
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const search = ref('');

const members = [
  { id: 1, name: 'Alex Morgan', email: 'alex@example.com', role: 'מעצב/ת פנים', initials: 'AM', color: 'primary', status: 'פעיל', activeColor: 'success' },
  { id: 2, name: 'Dana Cohen', email: 'dana@example.com', role: 'אדריכל/ית', initials: 'DC', color: 'secondary', status: 'פעיל', activeColor: 'success' },
  { id: 3, name: 'Yossi Levi', email: 'yossi@example.com', role: 'קבלן', initials: 'YL', color: 'warning', status: 'ממתין', activeColor: 'warning' },
  { id: 4, name: 'Mia Shapiro', email: 'mia@example.com', role: 'מנהל/ת פרויקט', initials: 'MS', color: 'info', status: 'פעיל', activeColor: 'success' },
  { id: 5, name: 'Rami Nachloof', email: 'rami@example.com', role: 'בעל בית', initials: 'RN', color: 'success', status: 'פעיל', activeColor: 'success' },
  { id: 6, name: 'Tali Bar', email: 'tali@example.com', role: 'מעצב/ת', initials: 'TB', color: 'error', status: 'לא פעיל', activeColor: 'error' },
];

const filteredMembers = computed(() =>
  !search.value
    ? members
    : members.filter(m =>
        m.name.includes(search.value) ||
        m.role.includes(search.value) ||
        m.email.includes(search.value)
      )
);
</script>
