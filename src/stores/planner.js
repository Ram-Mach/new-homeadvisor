import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const AREA_MODULES = {
  kitchen: {
    label: 'מטבח',
    modules: [
      { title: 'פירוק ופינוי', unit: 'יחידה', quantity: 1, estimatedUnitPrice: 3200 },
      { title: 'ארונות מטבח', unit: 'מטר רץ', quantity: 8, estimatedUnitPrice: 2100 },
      { title: 'משטח עבודה', unit: 'מטר רץ', quantity: 4, estimatedUnitPrice: 1400 },
    ],
  },
  bathroom: {
    label: 'חדר רחצה',
    modules: [
      { title: 'איטום', unit: 'מ"ר', quantity: 12, estimatedUnitPrice: 180 },
      { title: 'ריצוף וחיפוי', unit: 'מ"ר', quantity: 24, estimatedUnitPrice: 260 },
      { title: 'כלים סניטריים', unit: 'סט', quantity: 1, estimatedUnitPrice: 5300 },
    ],
  },
  livingRoom: {
    label: 'סלון',
    modules: [
      { title: 'שדרוג תאורה', unit: 'נקודה', quantity: 10, estimatedUnitPrice: 320 },
      { title: 'צביעה', unit: 'מ"ר', quantity: 45, estimatedUnitPrice: 45 },
      { title: 'הנמכת גבס', unit: 'מ"ר', quantity: 14, estimatedUnitPrice: 180 },
    ],
  },
  masterBedroom: {
    label: 'חדר שינה הורים',
    modules: [
      { title: 'ארון קיר', unit: 'מטר רץ', quantity: 3, estimatedUnitPrice: 1700 },
      { title: 'פרקט', unit: 'מ"ר', quantity: 18, estimatedUnitPrice: 220 },
      { title: 'נקודות חשמל', unit: 'נקודה', quantity: 6, estimatedUnitPrice: 280 },
    ],
  },
};

export const usePlannerStore = defineStore('planner', () => {
  const step = ref(1);
  const projectName = ref('');
  const propertyType = ref('דירה');
  const selectedAreas = ref([]);
  const generatedLineItems = ref([]);

  const areaOptions = computed(() => [
    { value: 'kitchen', label: 'מטבח' },
    { value: 'bathroom', label: 'חדר רחצה' },
    { value: 'livingRoom', label: 'סלון' },
    { value: 'masterBedroom', label: 'חדר שינה הורים' },
  ]);

  const summaryTotal = computed(() => generatedLineItems.value.reduce(
    (acc, item) => acc + (item.quantity * item.estimatedUnitPrice),
    0,
  ));

  const toggleArea = (areaKey) => {
    if (selectedAreas.value.includes(areaKey)) {
      selectedAreas.value = selectedAreas.value.filter((key) => key !== areaKey);
      return;
    }

    selectedAreas.value = [...selectedAreas.value, areaKey];
  };

  const generateLineItems = () => {
    const nextItems = [];

    selectedAreas.value.forEach((areaKey) => {
      const areaConfig = AREA_MODULES[areaKey];
      if (!areaConfig) {
        return;
      }

      areaConfig.modules.forEach((module, index) => {
        nextItems.push({
          id: `${areaKey}-${index + 1}`,
          areaKey,
          areaLabel: areaConfig.label,
          ...module,
        });
      });
    });

    generatedLineItems.value = nextItems;
  };

  const goToStep = (nextStep) => {
    step.value = nextStep;
  };

  const resetPlanner = () => {
    step.value = 1;
    projectName.value = '';
    propertyType.value = 'דירה';
    selectedAreas.value = [];
    generatedLineItems.value = [];
  };

  const payload = computed(() => ({
    projectName: projectName.value,
    propertyType: propertyType.value,
    selectedAreas: selectedAreas.value,
    lineItems: generatedLineItems.value,
    totalEstimate: summaryTotal.value,
  }));

  return {
    step,
    projectName,
    propertyType,
    selectedAreas,
    generatedLineItems,
    areaOptions,
    summaryTotal,
    payload,
    toggleArea,
    generateLineItems,
    goToStep,
    resetPlanner,
  };
});
