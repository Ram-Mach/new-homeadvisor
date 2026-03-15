<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">ניהול קבצי פרויקט</div>
      <div class="d-flex ga-2">
        <v-btn color="primary" prepend-icon="mdi-folder-plus-outline" rounded="lg" variant="tonal" :disabled="isSaving" @click="folderDialog = true">
          תיקיה חדשה
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-upload" rounded="lg" :disabled="isSaving" @click="uploadDialog = true">
          העלאת קובץ
        </v-btn>
      </div>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
      {{ successMessage }}
    </v-alert>

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

    <div v-if="isLoading" class="py-8 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

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
            <v-btn
              icon="mdi-download"
              size="x-small"
              variant="text"
              :loading="downloadingId === file.id"
              :disabled="file.type === 'Folder'"
              @click="downloadFile(file)"
            />
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              :loading="deletingId === file.id"
              :disabled="isSaving"
              @click="removeFile(file.id)"
            />
          </div>
        </v-card>
      </v-col>

      <v-col v-if="!isLoading && filteredFiles.length === 0" cols="12">
        <v-card rounded="xl" elevation="0" class="pa-8 text-center text-medium-emphasis">
          אין קבצים להצגה
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="uploadDialog" max-width="520">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">העלאת קובץ חדש</v-card-title>
        <v-text-field v-model="uploadDraft.name" label="שם קובץ" variant="outlined" class="mb-3" :disabled="isSaving" />
        <v-select v-model="uploadDraft.type" :items="typeOptions.filter((type) => type !== 'Folder')" label="סוג קובץ" variant="outlined" class="mb-3" :disabled="isSaving" />
        <v-file-input
          v-model="fileToUpload"
          label="בחירת קובץ"
          variant="outlined"
          class="mb-4"
          :disabled="isSaving"
          show-size
        />
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" :disabled="isSaving" @click="uploadDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" :loading="isSaving" @click="addFile">הוספה</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="folderDialog" max-width="460">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">יצירת תיקיה</v-card-title>
        <v-text-field v-model="folderName" label="שם תיקיה" variant="outlined" class="mb-4" :disabled="isSaving" />
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" :disabled="isSaving" @click="folderDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" :loading="isSaving" @click="addFolder">יצירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { makeRequest } from '../plugins/api';

const route = useRoute();
const projectId = computed(() => route.params.id);

const search = ref('');
const typeFilter = ref(null);
const uploadDialog = ref(false);
const folderDialog = ref(false);
const folderName = ref('');
const fileToUpload = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const deletingId = ref(null);
const downloadingId = ref(null);
const errorMessage = ref('');
const successMessage = ref('');

const typeOptions = ['PDF', 'DWG', 'DOCX', 'JPG', 'PNG', 'XLSX', 'Folder'];

const uploadDraft = reactive({
  name: '',
  type: 'PDF',
});

const files = ref([]);

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

const formatBytes = (value) => {
  const bytes = Number(value || 0);
  if (bytes <= 0) {
    return '-';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const toItems = (response) => {
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

const mapFile = (item) => {
  const type = item.file_type === 'FOLDER' ? 'Folder' : (item.file_type || 'FILE').toUpperCase();

  return {
    id: item.id,
    name: item.name || 'קובץ ללא שם',
    size: item.is_folder ? '-' : formatBytes(item.size_bytes),
    type,
    icon: iconByType[type] || 'mdi-file-outline',
    color: colorByType[type] || 'primary',
    date: item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : '-',
    url: item.url || null,
  };
};

const filesEndpoint = (id) => `/projects/${id}/files`;

const loadFiles = async () => {
  if (!projectId.value) {
    files.value = [];
    errorMessage.value = 'לא נמצא מזהה פרויקט.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await makeRequest(filesEndpoint(projectId.value), { per_page: 200 });
    files.value = toItems(response).map(mapFile);
  } catch {
    errorMessage.value = 'טעינת הקבצים נכשלה. נסו לרענן את העמוד.';
    files.value = [];
  } finally {
    isLoading.value = false;
  }
};

const resetUploadDraft = () => {
  uploadDraft.name = '';
  uploadDraft.type = 'PDF';
  fileToUpload.value = null;
};

const selectedUploadFile = () => {
  if (Array.isArray(fileToUpload.value)) {
    return fileToUpload.value[0] || null;
  }

  return fileToUpload.value || null;
};

const addFile = async () => {
  const file = selectedUploadFile();

  if (!projectId.value || !uploadDraft.name || !uploadDraft.type || !file) {
    errorMessage.value = 'יש לבחור קובץ ולמלא שם וסוג.';
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const form = new FormData();
    form.append('name', uploadDraft.name);
    form.append('file_type', uploadDraft.type.toUpperCase());
    form.append('is_folder', '0');
    form.append('file', file);

    await makeRequest(filesEndpoint(projectId.value), form, 'POST');
    await loadFiles();
    resetUploadDraft();
    uploadDialog.value = false;
    successMessage.value = 'הקובץ הועלה בהצלחה.';
  } catch {
    errorMessage.value = 'העלאת הקובץ נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

const addFolder = async () => {
  if (!projectId.value || !folderName.value) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await makeRequest(filesEndpoint(projectId.value), {
      name: folderName.value,
      file_type: 'FOLDER',
      is_folder: true,
    }, 'POST');

    await loadFiles();
    folderName.value = '';
    folderDialog.value = false;
    successMessage.value = 'התיקיה נוצרה בהצלחה.';
  } catch {
    errorMessage.value = 'יצירת התיקיה נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

const removeFile = async (id) => {
  if (!projectId.value) {
    return;
  }

  deletingId.value = id;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await makeRequest(`${filesEndpoint(projectId.value)}/${id}`, {}, 'DELETE');
    files.value = files.value.filter((file) => file.id !== id);
    successMessage.value = 'הפריט נמחק בהצלחה.';
  } catch {
    errorMessage.value = 'מחיקת הפריט נכשלה. נסו שוב.';
  } finally {
    deletingId.value = null;
  }
};

const downloadFile = async (file) => {
  if (!projectId.value || file.type === 'Folder') {
    return;
  }

  downloadingId.value = file.id;
  errorMessage.value = '';

  try {
    const response = await makeRequest(`${filesEndpoint(projectId.value)}/${file.id}/download`);
    const url = response?.url || response?.data?.url;

    if (!url) {
      throw new Error('No download URL returned');
    }

    const popup = window.open(url, '_blank', 'noopener,noreferrer');

    if (!popup) {
      errorMessage.value = 'הדפדפן חסם פתיחת חלון חדש. יש לאפשר חלונות קופצים ולנסות שוב.';
    }
  } catch {
    errorMessage.value = 'הורדת הקובץ נכשלה. נסו שוב.';
  } finally {
    downloadingId.value = null;
  }
};

onMounted(loadFiles);
</script>
