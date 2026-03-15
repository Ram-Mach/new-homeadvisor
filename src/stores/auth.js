import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { makeRequest, setAuthToken } from '../plugins/api';

const TOKEN_STORAGE_KEY = 'ha-token';
const USER_STORAGE_KEY = 'ha-user';

const defaultUser = {
  id: null,
  name: '',
  role: null,
  email: '',
};

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_STORAGE_KEY));
  const user = ref({ ...defaultUser });

  const hydrateFromStorage = () => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch {
        user.value = { ...defaultUser };
      }
    }

    token.value = localStorage.getItem(TOKEN_STORAGE_KEY);
    setAuthToken(token.value);
  };

  hydrateFromStorage();

  const isAuthenticated = computed(() => !!token.value && !!user.value?.id);

  const setAuthSession = ({ user: nextUser, token: nextToken }) => {
    user.value = {
      ...defaultUser,
      ...nextUser,
    };
    token.value = nextToken ?? null;

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user.value));

    if (token.value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token.value);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    setAuthToken(token.value);
  };

  const clearSession = () => {
    user.value = { ...defaultUser };
    token.value = null;

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setAuthToken(null);
  };

  const login = async (payload) => {
    const response = await makeRequest('/auth/login', payload, 'POST');
    const sessionToken = response?.token || response?.access_token || null;
    const sessionUser = response?.user || null;

    if (!sessionToken || !sessionUser) {
      throw new Error('תגובת התחברות לא תקינה מהשרת');
    }

    setAuthSession({
      user: sessionUser,
      token: sessionToken,
    });

    return response;
  };

  const register = async (payload) => {
    const response = await makeRequest('/auth/register', payload, 'POST');

    const sessionToken = response?.token || response?.access_token || null;
    const sessionUser = response?.user || null;

    if (sessionToken && sessionUser) {
      setAuthSession({ user: sessionUser, token: sessionToken });
    }

    return response;
  };

  const fetchMe = async () => {
    if (!token.value) {
      clearSession();
      return null;
    }

    try {
      const response = await makeRequest('/auth/me');
      const nextUser = response?.data || response?.user || response;

      if (!nextUser?.id) {
        throw new Error('No user returned from /auth/me');
      }

      setAuthSession({ user: nextUser, token: token.value });
      return nextUser;
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token.value) {
        await makeRequest('/auth/logout', {}, 'POST');
      }
    } catch {
      // Ignore logout API failures and clear local session anyway.
    } finally {
      clearSession();
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    hydrateFromStorage,
    setAuthSession,
    clearSession,
    login,
    register,
    fetchMe,
    logout,
  };
});
