<template>
  <div class="d-flex flex-column" style="height: calc(100vh - 140px)">
    <div class="text-h5 font-weight-bold mb-4">צ'אט פרויקט</div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">
      {{ errorMessage }}
    </v-alert>

    <!-- Messages -->
    <v-card rounded="xl" elevation="0" class="flex-grow-1 pa-4 mb-4 overflow-y-auto">
      <div v-if="isLoading" class="py-8 d-flex justify-center">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-for="msg in messages" :key="msg.id" class="mb-4">
        <div class="d-flex align-start ga-3" :class="msg.mine ? 'flex-row-reverse' : ''">
          <v-avatar :color="msg.color" variant="tonal" size="34">
            <span class="text-caption font-weight-bold">{{ msg.initials }}</span>
          </v-avatar>
          <div :class="msg.mine ? 'text-left' : ''" style="max-width: 70%">
            <div class="text-caption text-medium-emphasis mb-1">{{ msg.sender }} ‪שעה {{ msg.time }}</div>
            <v-card
              :color="msg.mine ? 'primary' : 'surface-variant'"
              :variant="msg.mine ? 'flat' : 'flat'"
              rounded="xl"
              class="pa-3"
            >
              <span :class="msg.mine ? 'text-white' : ''">{{ msg.text }}</span>
            </v-card>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Input -->
    <div class="d-flex ga-3 align-center">
      <v-text-field
        v-model="newMessage"
        placeholder="כתוב הודעה..."
        variant="outlined"
        rounded="xl"
        density="comfortable"
        :disabled="isSending"
        hide-details
        class="flex-grow-1"
        @keyup.enter="onSend"
      />
      <v-btn icon color="primary" size="large" :loading="isSending" @click="onSend">
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { makeRequest } from '../plugins/api';

const route = useRoute();
const authStore = useAuthStore();

const newMessage = ref('');
const messages = ref([]);
const isLoading = ref(false);
const isSending = ref(false);
const errorMessage = ref('');

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

const colorByMine = (mine) => (mine ? 'primary' : 'info');

const messageEndpoints = (projectId) => [
  `/projects/${projectId}/messages`,
  `/projects/${projectId}/project-messages`,
];

const mapMessage = (item) => {
  const senderName = item.user?.name || item.sender_name || 'משתמש';
  const mine = Number(item.user_id) === Number(authStore.user?.id);
  return {
    id: item.id,
    sender: senderName,
    initials: initialsFromName(senderName),
    color: colorByMine(mine),
    mine,
    text: item.content || '',
    time: item.created_at
      ? new Date(item.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
  };
};

const loadMessages = async () => {
  const projectId = route.params.id;
  if (!projectId) {
    messages.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    let loaded = false;
    for (const endpoint of messageEndpoints(projectId)) {
      try {
        const response = await makeRequest(endpoint);
        messages.value = toItems(response).map(mapMessage);
        loaded = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!loaded) {
      messages.value = [];
    }
  } catch {
    errorMessage.value = 'טעינת ההודעות נכשלה.';
    messages.value = [];
  } finally {
    isLoading.value = false;
  }
};

const onSend = async () => {
  const projectId = route.params.id;
  const content = newMessage.value.trim();
  if (!projectId || !content) {
    return;
  }

  isSending.value = true;
  errorMessage.value = '';

  try {
    let sent = false;
    for (const endpoint of messageEndpoints(projectId)) {
      try {
        await makeRequest(endpoint, { content }, 'POST');
        sent = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!sent) {
      throw new Error('Message route not found');
    }

    newMessage.value = '';
    await loadMessages();
  } catch {
    errorMessage.value = 'שליחת ההודעה נכשלה. נסו שוב.';
  } finally {
    isSending.value = false;
  }
};

watch(
  () => route.params.id,
  () => {
    loadMessages();
  },
  { immediate: true },
);
</script>
