<template>
  <div class="d-flex flex-column" style="height: calc(100vh - 140px)">
    <div class="text-h5 font-weight-bold mb-4">צ'אט פרויקט</div>

    <!-- Messages -->
    <v-card rounded="xl" elevation="0" class="flex-grow-1 pa-4 mb-4 overflow-y-auto">
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
        hide-details
        class="flex-grow-1"
        @keyup.enter="onSend"
      />
      <v-btn icon color="primary" size="large" @click="onSend">
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const newMessage = ref('');

const messages = ref([
  { id: 1, sender: 'Mia Shapiro', initials: 'MS', color: 'info', mine: false, text: 'שלום! סיימנו את שלב האינסטלציה היום.', time: '09:10' },
  { id: 2, sender: 'Alex Morgan', initials: 'AM', color: 'primary', mine: true, text: 'מצוין! מתי מתחילים שלב הטיח?', time: '09:14' },
  { id: 3, sender: 'Yossi Levi', initials: 'YL', color: 'warning', mine: false, text: 'אנחנו מתכננים להתחיל ביום ראשון של שבוע הבא. צבעי שלום מאשרים צבע בשתי שעות.', time: '09:20' },
  { id: 4, sender: 'Dana Cohen', initials: 'DC', color: 'secondary', mine: false, text: 'שלחתי את תוכנית המעדכנת לקובץ קבצים. אנא עיינו בה.', time: '10:05' },
]);

const onSend = () => {
  if (!newMessage.value.trim()) return;
  messages.value.push({
    id: Date.now(),
    sender: 'Alex Morgan',
    initials: 'AM',
    color: 'primary',
    mine: true,
    text: newMessage.value.trim(),
    time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
  });
  newMessage.value = '';
};
</script>
