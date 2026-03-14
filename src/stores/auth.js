import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const user = ref({
    id: 'u-1001',
    name: 'Alex Morgan',
    role: 'Homeowner',
  });

  const isAuthenticated = computed(() => !!user.value?.id);

  const setUser = (nextUser) => {
    user.value = nextUser;
  };

  const updateRole = (role) => {
    user.value = {
      ...user.value,
      role,
    };
  };

  const logout = () => {
    user.value = {
      id: null,
      name: '',
      role: null,
    };
  };

  return {
    user,
    isAuthenticated,
    setUser,
    updateRole,
    logout,
  };
});
