import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { makeRequest } from '../plugins/api';

const ROOM_ICON_KEYWORDS = [
  { keyword: 'מטבח', icon: 'mdi-countertop-outline' },
  { keyword: 'רחצה', icon: 'mdi-shower' },
  { keyword: 'שירותים', icon: 'mdi-shower' },
  { keyword: 'סלון', icon: 'mdi-sofa-outline' },
  { keyword: 'שינה', icon: 'mdi-bed-outline' },
  { keyword: 'מרפסת', icon: 'mdi-balcony' },
  { keyword: 'גינה', icon: 'mdi-flower-outline' },
  { keyword: 'מחסן', icon: 'mdi-warehouse' },
  { keyword: 'חניה', icon: 'mdi-car-outline' },
  { keyword: 'ממ"ד', icon: 'mdi-shield-home-outline' },
  { keyword: 'משרד', icon: 'mdi-desk' },
  { keyword: 'ארונות', icon: 'mdi-wardrobe-outline' },
];

const MAX_ROOM_COUNT = 10;

const estimateQuantity = (unit, sizeMultiplier) => {
  const normalizedUnit = String(unit || '').toLowerCase();

  if (normalizedUnit.includes('מ"ר') || normalizedUnit.includes('מר')) {
    return Math.max(4, Math.round(12 * sizeMultiplier));
  }

  if (normalizedUnit.includes('מטר')) {
    return Math.max(2, Math.round(5 * sizeMultiplier));
  }

  if (normalizedUnit.includes('נקודה')) {
    return Math.max(1, Math.round(3 * sizeMultiplier));
  }

  return 1;
};

const normalizePlannerArea = (area) => {
  const modules = area?.planner_modules || area?.plannerModules || [];

  return {
    id: String(area.id),
    name: area.name,
    description: area.description,
    modules: Array.isArray(modules)
      ? modules.map((module) => ({
        id: String(module.id),
        name: module.name,
        description: module.description,
        profession: module.profession,
        tasks: Array.isArray(module?.planner_tasks || module?.plannerTasks)
          ? (module.planner_tasks || module.plannerTasks).map((task) => ({
            id: String(task.id),
            description: task.description,
            unit_of_measurement: task.unit_of_measurement,
          }))
          : [],
      }))
      : [],
  };
};

const roomIconFromName = (name) => {
  const hit = ROOM_ICON_KEYWORDS.find((item) => String(name || '').includes(item.keyword));
  return hit?.icon || 'mdi-home-outline';
};

export const usePlannerStore = defineStore('planner', () => {
  const setupChoice = ref('');
  const step = ref(1);
  const projectName = ref('');

  const propertyDetails = ref({
    type: 'apartment',
    size_sqm: null,
  });

  const roomCounts = ref({});
  const roomScopes = ref({});
  const generatedLineItems = ref([]);

  const plannerAreas = ref([]);
  const isCatalogLoading = ref(false);
  const catalogError = ref('');

  const roomOptions = computed(() =>
    plannerAreas.value.map((area) => ({
      value: area.id,
      label: area.name,
      icon: roomIconFromName(area.name),
    }))
  );

  const scopeOptionsByRoom = computed(() => {
    const map = {};

    plannerAreas.value.forEach((area) => {
      map[area.id] = area.modules.map((module) => ({
        value: module.id,
        label: module.name,
        description: module.description,
      }));
    });

    return map;
  });

  const summaryTotal = computed(() =>
    generatedLineItems.value.reduce((acc, item) => acc + item.quantity * item.estimatedUnitPrice, 0)
  );

  const sizeFactor = computed(() => {
    const size = Number(propertyDetails.value.size_sqm || 0);

    if (!size) return 1;
    if (size <= 80) return 1;
    if (size <= 140) return 1.2;

    return 1.5;
  });

  const setSetupChoice = (choice) => {
    setupChoice.value = choice;
  };

  const loadPlannerCatalog = async () => {
    isCatalogLoading.value = true;
    catalogError.value = '';

    try {
      const response = await makeRequest('/planner-data');
      const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      plannerAreas.value = rows.map(normalizePlannerArea);
    } catch {
      plannerAreas.value = [];
      catalogError.value = 'טעינת נתוני האשף נכשלה. נסו שוב בעוד רגע.';
    } finally {
      isCatalogLoading.value = false;
    }
  };

  const toggleRoom = (roomKey) => {
    const normalizedRoomKey = String(roomKey);

    if (roomCounts.value[normalizedRoomKey]) {
      delete roomCounts.value[normalizedRoomKey];
      delete roomScopes.value[normalizedRoomKey];
      return;
    }

    roomCounts.value[normalizedRoomKey] = 1;

    if (!Array.isArray(roomScopes.value[normalizedRoomKey])) {
      roomScopes.value[normalizedRoomKey] = [];
    }
  };

  const incrementRoomCount = (roomKey) => {
    const normalizedRoomKey = String(roomKey);
    const currentCount = Number(roomCounts.value[normalizedRoomKey] || 0);

    if (currentCount <= 0) {
      roomCounts.value[normalizedRoomKey] = 1;
      return;
    }

    roomCounts.value[normalizedRoomKey] = Math.min(MAX_ROOM_COUNT, currentCount + 1);
  };

  const decrementRoomCount = (roomKey) => {
    const normalizedRoomKey = String(roomKey);
    const currentCount = Number(roomCounts.value[normalizedRoomKey] || 0);

    if (currentCount <= 1) {
      delete roomCounts.value[normalizedRoomKey];
      delete roomScopes.value[normalizedRoomKey];
      return;
    }

    roomCounts.value[normalizedRoomKey] = currentCount - 1;
  };

  const setRoomScopes = (roomKey, scopes) => {
    roomScopes.value[String(roomKey)] = Array.isArray(scopes) ? scopes.map((scope) => String(scope)) : [];
  };

  const generateBoq = () => {
    const nextItems = [];
    let serial = 1;

    Object.keys(roomCounts.value).forEach((roomKey) => {
      const area = plannerAreas.value.find((row) => row.id === String(roomKey));
      if (!area) return;

      const roomMultiplier = Math.max(1, Math.min(MAX_ROOM_COUNT, Number(roomCounts.value[roomKey] || 1)));

      const selectedScopeIds = roomScopes.value[roomKey] || [];
      const chosenModules = selectedScopeIds.length > 0
        ? area.modules.filter((module) => selectedScopeIds.includes(module.id))
        : area.modules;

      chosenModules.forEach((module) => {
        if (!Array.isArray(module.tasks) || module.tasks.length === 0) {
          nextItems.push({
            id: `wizard-${area.id}-${module.id}-${serial}`,
            areaKey: area.id,
            areaLabel: area.name,
            moduleId: module.id,
            moduleName: module.name,
            profession: module.profession || null,
            title: module.name,
            description: `${module.name} - עבודה כללית`,
            unit: 'קומפלט',
            quantity: roomMultiplier,
            estimatedUnitPrice: 0,
          });
          serial += 1;
          return;
        }

        module.tasks.forEach((task) => {
          const unit = task.unit_of_measurement || 'יחידה';

          nextItems.push({
            id: `wizard-${area.id}-${module.id}-${task.id}-${serial}`,
            areaKey: area.id,
            areaLabel: area.name,
            moduleId: module.id,
            moduleName: module.name,
            taskId: task.id,
            profession: module.profession || null,
            title: task.description,
            description: task.description,
            unit,
            quantity: estimateQuantity(unit, sizeFactor.value) * roomMultiplier,
            estimatedUnitPrice: 0,
          });

          serial += 1;
        });
      });
    });

    generatedLineItems.value = nextItems;
    return nextItems;
  };

  const goToStep = (nextStep) => {
    step.value = nextStep;
  };

  const resetPlanner = () => {
    setupChoice.value = '';
    step.value = 1;
    projectName.value = '';
    propertyDetails.value = {
      type: 'apartment',
      size_sqm: null,
    };
    roomCounts.value = {};
    roomScopes.value = {};
    generatedLineItems.value = [];
    catalogError.value = '';
  };

  const payload = computed(() => ({
    setupChoice: setupChoice.value,
    projectName: projectName.value,
    propertyDetails: propertyDetails.value,
    roomCounts: roomCounts.value,
    roomScopes: roomScopes.value,
    plannerAreas: plannerAreas.value,
    lineItems: generatedLineItems.value,
    totalEstimate: summaryTotal.value,
  }));

  return {
    setupChoice,
    step,
    projectName,
    propertyDetails,
    roomCounts,
    roomScopes,
    generatedLineItems,
    plannerAreas,
    isCatalogLoading,
    catalogError,
    roomOptions,
    scopeOptionsByRoom,
    summaryTotal,
    payload,
    setSetupChoice,
    loadPlannerCatalog,
    toggleRoom,
    incrementRoomCount,
    decrementRoomCount,
    MAX_ROOM_COUNT,
    setRoomScopes,
    generateBoq,
    goToStep,
    resetPlanner,
  };
});
