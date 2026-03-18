<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h5 font-weight-bold">BOQ - כתב כמויות</div>
      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="itemDialog = true">
        הוספת סעיף
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" sm="5">
        <v-text-field
          v-model="search"
          label="חיפוש סעיף"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="pa-4 mb-5">
      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-3">
        {{ errorMessage }}
      </v-alert>
      <div v-if="isLoading" class="py-6 d-flex justify-center">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <v-table density="comfortable" hover>
        <thead>
          <tr>
            <th class="text-right">סעיף</th>
            <th class="text-right">יחידה</th>
            <th class="text-right">כמות</th>
            <th class="text-right">מחיר יחידה</th>
            <th class="text-right">סה"כ</th>
            <th class="text-right">פעולות</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in groupedFilteredItems" :key="group.moduleName">
            <tr>
              <td colspan="6" class="text-right py-2 px-3 font-weight-bold">
                {{ group.moduleName }}
                <v-chip size="x-small" variant="tonal" class="ms-2">{{ group.items.length }} סעיפים</v-chip>
              </td>
            </tr>
            <tr v-for="item in group.items" :key="item.id">
              <td>{{ item.title }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ currency(item.unitPrice) }}</td>
              <td class="font-weight-bold">{{ currency(item.quantity * item.unitPrice) }}</td>
              <td>
                <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="startEdit(item)" />
                <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeItem(item.id)" :loading="isSaving" />
              </td>
            </tr>
          </template>
          <tr v-if="!isLoading && groupedFilteredItems.length === 0">
            <td colspan="6" class="text-center text-medium-emphasis py-6">אין סעיפים להצגה</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-row>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis">סה"כ פריטים</div>
          <div class="text-h5 font-weight-bold">{{ items.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis">עלות כוללת</div>
          <div class="text-h5 font-weight-bold">{{ currency(totalCost) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" class="pa-4">
          <div class="text-caption text-medium-emphasis">מחיר ממוצע לסעיף</div>
          <div class="text-h5 font-weight-bold">{{ currency(avgCost) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="itemDialog" max-width="540">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="text-h6 mb-4">{{ editingId ? 'עריכת סעיף BOQ' : 'הוספת סעיף BOQ' }}</v-card-title>
        <v-select
          v-model="draft.moduleName"
          :items="moduleOptions"
          label="מודול / קטגוריה"
          variant="outlined"
          prepend-inner-icon="mdi-shape-outline"
          class="mb-3"
          required
        />
        <v-text-field v-model="draft.title" label="שם סעיף" variant="outlined" class="mb-3" />
        <v-row>
          <v-col cols="4">
            <v-select
              v-model="draft.unit"
              :items="unitOptionsForSelectedModule"
              label="סוג יחידה"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model.number="draft.quantity" label="כמות" type="number" variant="outlined" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model.number="draft.unitPrice" label="מחיר יחידה" type="number" variant="outlined" />
          </v-col>
        </v-row>
        <div class="text-body-2 mb-4">סה"כ מחושב: <strong>{{ currency((draft.quantity || 0) * (draft.unitPrice || 0)) }}</strong></div>
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="itemDialog = false">ביטול</v-btn>
          <v-btn color="primary" rounded="lg" @click="saveItem" :loading="isSaving">שמירה</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { makeRequest } from '../plugins/api';

const route = useRoute();

const search = ref('');
const itemDialog = ref(false);
const editingId = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');

const draft = reactive({
  moduleName: '',
  title: '',
  unit: 'מ"ר',
  quantity: 1,
  unitPrice: 0,
});

const items = ref([]);
const taskToModuleMap = ref(new Map());
const moduleOptions = ref([]);
const unitOptions = ref([]);
const moduleToUnitsMap = ref(new Map());

const projectId = computed(() => route.params.id);

const listEndpoints = (id) => [
  `/projects/${id}/line-items`,
  `/projects/${id}/project-line-items`,
];

const itemEndpoints = (id, lineItemId) => [
  `/projects/${id}/line-items/${lineItemId}`,
  `/projects/${id}/project-line-items/${lineItemId}`,
];

const toItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const normalizeDescriptionForLookup = (rawDescription) => {
  const text = String(rawDescription || '').trim();

  if (!text) {
    return '';
  }

  const markerPattern = /\[\[MODULE:(.+?)\]\]\s*(.*)$/;
  const markerMatch = text.match(markerPattern);
  if (markerMatch) {
    return (markerMatch[2] || '').trim();
  }

  const hebrewPrefixPattern = /^מודול:\s*([^|]+)\|\s*(.*)$/;
  const hebrewMatch = text.match(hebrewPrefixPattern);
  if (hebrewMatch) {
    return (hebrewMatch[2] || '').trim();
  }

  const areaSplit = text.split(' - ');
  if (areaSplit.length >= 2) {
    return areaSplit.slice(1).join(' - ').trim();
  }

  return text;
};

const inferModuleFromTask = (rawDescription) => {
  const normalized = normalizeDescriptionForLookup(rawDescription);
  return taskToModuleMap.value.get(normalized) || '';
};

const parseModuleDescription = (rawDescription) => {
  const text = String(rawDescription || '').trim();
  const tokenAnywhereMatch = text.match(/\[\[MODULE:(.+?)\]\]\s*(.*)$/);

  if (tokenAnywhereMatch) {
    return {
      moduleName: tokenAnywhereMatch[1] || 'ללא מודול',
      title: tokenAnywhereMatch[2] || 'סעיף ללא שם',
      rawTitle: text,
    };
  }

  const hebrewPrefixMatch = text.match(/^מודול:\s*([^|]+)\|\s*(.*)$/);
  if (hebrewPrefixMatch) {
    return {
      moduleName: hebrewPrefixMatch[1] || 'ללא מודול',
      title: hebrewPrefixMatch[2] || 'סעיף ללא שם',
      rawTitle: text,
    };
  }

  const inferredModuleName = inferModuleFromTask(text);

  if (inferredModuleName) {
    return {
      moduleName: inferredModuleName,
      title: normalizeDescriptionForLookup(text) || 'סעיף ללא שם',
      rawTitle: text,
    };
  }

  return {
    moduleName: 'ללא מודול',
    title: text || 'סעיף ללא שם',
    rawTitle: text,
  };
};

const mapLineItem = (item) => {
  const parsed = parseModuleDescription(item.description);

  return {
    id: item.id,
    title: parsed.title,
    rawTitle: parsed.rawTitle,
    moduleName: parsed.moduleName,
    unit: item.unit_of_measurement || 'יחידה',
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.estimated_price || 0),
  };
};

const encodeManualDescription = () => {
  const moduleName = String(draft.moduleName || '').trim();
  const title = String(draft.title || '').trim();

  if (!moduleName) {
    return title;
  }

  return `[[MODULE:${moduleName}]] מודול: ${moduleName} | ${title}`;
};

const lineItemPayload = () => ({
  description: encodeManualDescription(),
  unit_of_measurement: draft.unit,
  quantity: Number(draft.quantity || 0),
  estimated_price: Number(draft.unitPrice || 0),
  status: 'pending',
  type: 'boq_line',
});

const defaultUnitOptions = [
  { title: 'יחידה', value: 'יחידה' },
  { title: 'נקודה', value: 'נקודה' },
  { title: 'מטר אורך', value: 'מטר אורך' },
  { title: 'מטר רץ', value: 'מטר רץ' },
  { title: 'מ"ר', value: 'מ"ר' },
  { title: 'קומפלט', value: 'קומפלט' },
  { title: 'סט', value: 'סט' },
];

const unitOptionsForSelectedModule = computed(() => {
  const moduleName = String(draft.moduleName || '').trim();

  if (!moduleName) {
    return unitOptions.value.length > 0 ? unitOptions.value : defaultUnitOptions;
  }

  const moduleUnits = moduleToUnitsMap.value.get(moduleName) || [];

  if (moduleUnits.length === 0) {
    return unitOptions.value.length > 0 ? unitOptions.value : defaultUnitOptions;
  }

  return moduleUnits.map((unit) => ({ title: unit, value: unit }));
});

const loadPlannerTaskModuleMap = async () => {
  try {
    const response = await makeRequest('/planner-data');
    const areas = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
    const nextMap = new Map();
    const moduleSet = new Set();
    const unitSet = new Set();
    const nextModuleToUnitsMap = new Map();

    areas.forEach((area) => {
      const modules = area?.planner_modules || area?.plannerModules || [];

      modules.forEach((module) => {
        const moduleName = String(module?.name || '').trim();
        if (moduleName) {
          moduleSet.add(moduleName);
          if (!nextModuleToUnitsMap.has(moduleName)) {
            nextModuleToUnitsMap.set(moduleName, new Set());
          }
        }

        const tasks = module?.planner_tasks || module?.plannerTasks || [];
        tasks.forEach((task) => {
          const taskDescription = String(task?.description || '').trim();
          const unit = String(task?.unit_of_measurement || '').trim();

          if (taskDescription) {
            nextMap.set(taskDescription, moduleName);
          }

          if (unit) {
            unitSet.add(unit);
            if (moduleName && nextModuleToUnitsMap.has(moduleName)) {
              nextModuleToUnitsMap.get(moduleName).add(unit);
            }
          }
        });
      });
    });

    taskToModuleMap.value = nextMap;
    moduleOptions.value = Array.from(moduleSet).map((name) => ({
      title: name,
      value: name,
    }));
    unitOptions.value = Array.from(unitSet).map((unit) => ({
      title: unit,
      value: unit,
    }));
    moduleToUnitsMap.value = new Map(
      Array.from(nextModuleToUnitsMap.entries()).map(([moduleName, units]) => [
        moduleName,
        Array.from(units),
      ])
    );

    if (unitOptions.value.length === 0) {
      unitOptions.value = defaultUnitOptions;
    }
  } catch {
    taskToModuleMap.value = new Map();
    moduleOptions.value = [];
    moduleToUnitsMap.value = new Map();
    unitOptions.value = defaultUnitOptions;
  }
};

const loadLineItems = async () => {
  if (!projectId.value) {
    items.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    let loaded = false;

    for (const endpoint of listEndpoints(projectId.value)) {
      try {
        const response = await makeRequest(endpoint);
        items.value = toItems(response).map(mapLineItem);
        loaded = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!loaded) {
      items.value = [];
    }
  } catch {
    errorMessage.value = 'טעינת כתב הכמויות נכשלה.';
    items.value = [];
  } finally {
    isLoading.value = false;
  }
};

const filteredItems = computed(() =>
  items.value.filter((item) =>
    !search.value || item.title.includes(search.value) || item.moduleName.includes(search.value)
  )
);

const groupedFilteredItems = computed(() => {
  const groups = [];
  const groupMap = new Map();

  filteredItems.value.forEach((item) => {
    if (!groupMap.has(item.moduleName)) {
      const nextGroup = {
        moduleName: item.moduleName || 'ללא מודול',
        items: [],
      };
      groupMap.set(item.moduleName, nextGroup);
      groups.push(nextGroup);
    }

    groupMap.get(item.moduleName).items.push(item);
  });

  return groups;
});

const totalCost = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
);

const avgCost = computed(() => (items.value.length ? totalCost.value / items.value.length : 0));

const currency = (value) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value || 0);

const startEdit = (item) => {
  editingId.value = item.id;
  draft.moduleName = item.moduleName === 'ללא מודול' ? '' : item.moduleName;
  draft.title = item.title;
  draft.unit = item.unit;
  draft.quantity = item.quantity;
  draft.unitPrice = item.unitPrice;
  itemDialog.value = true;
};

const saveItem = () => {
  return onSaveItem();
};

const resetDraft = () => {
  editingId.value = null;
  draft.moduleName = '';
  draft.title = '';
  draft.unit = 'יחידה';
  draft.quantity = 1;
  draft.unitPrice = 0;
};

const onSaveItem = async () => {
  if (!draft.moduleName || !draft.title || !draft.unit || !draft.quantity || !projectId.value) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    if (editingId.value) {
      let updated = false;
      for (const endpoint of itemEndpoints(projectId.value, editingId.value)) {
        try {
          await makeRequest(endpoint, lineItemPayload(), 'PUT');
          updated = true;
          break;
        } catch (error) {
          if (error?.response?.status !== 404) {
            throw error;
          }
        }
      }

      if (!updated) {
        throw new Error('Line item update route not found');
      }
    } else {
      let created = false;
      for (const endpoint of listEndpoints(projectId.value)) {
        try {
          await makeRequest(endpoint, lineItemPayload(), 'POST');
          created = true;
          break;
        } catch (error) {
          if (error?.response?.status !== 404) {
            throw error;
          }
        }
      }

      if (!created) {
        throw new Error('Line item create route not found');
      }
    }

    await loadLineItems();
    resetDraft();
    itemDialog.value = false;
  } catch {
    errorMessage.value = 'שמירת הסעיף נכשלה. בדקו את הנתונים ונסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async (id) => {
  if (!projectId.value) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    let deleted = false;
    for (const endpoint of itemEndpoints(projectId.value, id)) {
      try {
        await makeRequest(endpoint, {}, 'DELETE');
        deleted = true;
        break;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    if (!deleted) {
      throw new Error('Line item delete route not found');
    }

    await loadLineItems();
  } catch {
    errorMessage.value = 'מחיקת הסעיף נכשלה. נסו שוב.';
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  await loadPlannerTaskModuleMap();
  await loadLineItems();
});
</script>
