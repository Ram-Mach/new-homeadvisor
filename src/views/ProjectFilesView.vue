<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">ניהול קבצי פרויקט</div>
      <div class="d-flex ga-2">
        <v-btn color="primary" prepend-icon="mdi-folder-plus-outline" rounded="lg" variant="tonal" @click="folderDialog = true">
          תיקיה חדשה
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-upload" rounded="lg" @click="uploadDialog = true">
          העלאת קובץ
        </v-btn>
      </div>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" sm="5">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="חיפוש קובץ"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="typeFilter"
          :items="typeOptions"
          label="סינון לפי סוג"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="file in filteredFiles"
        :key="file.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card rounded="xl" elevation="0"   class="pa-4" hover>
          <div class="d-flex align-center ga-3 mb-3">
            <v-icon :icon="file.icon" :color="file.color" size="32" />
            <div style="min-width:0">
              <div class="text-body-2 font-weight-medium text-truncate">{{ file.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ file.size }}</div>
            </div>
          </div>
          <div class="d-flex align-center justify-space-between">
            <v-chip size="x-small" :color="file.color" variant="tonal">{{ file.type }}</v-chip>
            <span class="text-caption text-medium-emphasis">{{ file.date }}</span>
          </div>
          <div class="d-flex justify-end mt-3 ga-1">
            <v-btn icon="mdi-download" size="x-small" variant="text" />
            <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removeFile(file.id)" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="uploadDialog" max-width="520">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">העלאת קובץ חדש</v-card-title>
        <v-text-field v-model="uploadDraft.name" label="שם קובץ" variant="outlined" class="mb-3" />
        <v-select v-model="uploadDraft.type" :items="typeOptions" label="סוג קובץ" variant="outlined" class="mb-3" />
        <v-text-field v-model="uploadDraft.size" label="גודל (למשל 1.4 MB)" variant="outlined" class="mb-4" />
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="uploadDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" @click="addFile">הוספה</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="folderDialog" max-width="460">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">יצירת תיקיה</v-card-title>
        <v-text-field v-model="folderName" label="שם תיקיה" variant="outlined" class="mb-4" />
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="folderDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" @click="addFolder">יצירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const search = ref('');
const typeFilter = ref(null);
const uploadDialog = ref(false);
const folderDialog = ref(false);
const folderName = ref('');

const typeOptions = ['PDF', 'DWG', 'DOCX', 'JPG', 'PNG', 'XLSX', 'Folder'];

const uploadDraft = reactive({
  name: '',
  type: 'PDF',
  size: '',
});

const files = ref([
  { id: 1, name: 'תוכנית-קומה-א-v3.pdf', size: '4.2 MB', type: 'PDF', icon: 'mdi-file-pdf-box', color: 'error', date: '10/03/2026' },
  { id: 2, name: 'עיצוב-סלון-גרסה-2.dwg', size: '1.8 MB', type: 'DWG', icon: 'mdi-vector-square', color: 'primary', date: '08/03/2026' },
  { id: 3, name: 'חוזה-קבלן.docx', size: '512 KB', type: 'DOCX', icon: 'mdi-file-word-box', color: 'info', date: '05/03/2026' },
  { id: 4, name: 'תמונות-לפני-שיפוץ.jpg', size: '2.1 MB', type: 'JPG', icon: 'mdi-image-outline', color: 'warning', date: '01/03/2026' },
  { id: 5, name: 'תמונות-אחרי-שיפוץ.jpg', size: '3.4 MB', type: 'JPG', icon: 'mdi-image-outline', color: 'warning', date: '12/03/2026' },
  { id: 6, name: 'אישור-היתר.pdf', size: '890 KB', type: 'PDF', icon: 'mdi-file-pdf-box', color: 'error', date: '03/03/2026' },
  { id: 7, name: 'הצעת-מחיר-פרחים.xlsx', size: '220 KB', type: 'XLSX', icon: 'mdi-file-excel-box', color: 'success', date: '07/03/2026' },
  { id: 8, name: 'סקיצה-רעיון-דנה.png', size: '1.2 MB', type: 'PNG', icon: 'mdi-image-outline', color: 'warning', date: '11/03/2026' },
]);

const filteredFiles = computed(() =>
  files.value.filter((file) => {
    const textMatch = !search.value || file.name.includes(search.value) || file.type.includes(search.value);
    const typeMatch = !typeFilter.value || file.type === typeFilter.value;
    return textMatch && typeMatch;
  })
);

const iconByType = {
  PDF: 'mdi-file-pdf-box',
  DWG: 'mdi-vector-square',
  DOCX: 'mdi-file-word-box',
  JPG: 'mdi-image-outline',
  PNG: 'mdi-image-outline',
  XLSX: 'mdi-file-excel-box',
  Folder: 'mdi-folder-outline',
};

const colorByType = {
  PDF: 'error',
  DWG: 'primary',
  DOCX: 'info',
  JPG: 'warning',
  PNG: 'warning',
  XLSX: 'success',
  Folder: 'secondary',
};

const addFile = () => {
  if (!uploadDraft.name || !uploadDraft.type) return;

  files.value.unshift({
    id: Date.now(),
    name: uploadDraft.name,
    size: uploadDraft.size || '-',
    type: uploadDraft.type,
    icon: iconByType[uploadDraft.type] || 'mdi-file-outline',
    color: colorByType[uploadDraft.type] || 'primary',
    date: new Date().toLocaleDateString('he-IL'),
  });

  uploadDraft.name = '';
  uploadDraft.type = 'PDF';
  uploadDraft.size = '';
  uploadDialog.value = false;
};

const addFolder = () => {
  if (!folderName.value) return;

  files.value.unshift({
    id: Date.now(),
    name: folderName.value,
    size: '-',
    type: 'Folder',
    icon: 'mdi-folder-outline',
    color: 'secondary',
    date: new Date().toLocaleDateString('he-IL'),
  });

  folderName.value = '';
  folderDialog.value = false;
};

const removeFile = (id) => {
  files.value = files.value.filter((file) => file.id !== id);
};
</script>
