import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { en, he } from 'vuetify/locale';

const savedTheme = localStorage.getItem('ha-theme') || 'light';

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: savedTheme,
    themes: {
      light: {
        dark: false,
        colors: {
            admin_menu_bg: "#ffffff",
            background: "#f4f7fb",
            surface: "#FFFFFF",
            primary: "#2563eb",
            secondary: "#1f2937",
            accent: "#f59e0b",
            error: "#dc2626",
            info: "#0ea5e9",
            success: "#16a34a",
            warning: "#f59e0b",
            text: "#111827",
            border: "#dbe3ec",
            card: "#FFFFFF",
            input: "#f8fafc",
            menu: "#FFFFFF",
            rows_color: "#f8fafc",
            "on-surface": "#111827",
            "surface-variant": "#e8eef5",
            "on-background": "#111827",
            "primary-lighten-1": "#60a5fa",
            "primary-lighten-2": "#dbeafe",
            "text-medium-emphasis": "rgba(17, 24, 39, 0.68)",
            "form-bg": "#f8fafc",
            "divider": "#dbe3ec",
        },
      },
      dark: {
        dark: true,
        colors: {
            admin_menu_bg: "#414141",
            background: "#2a2a2a",
            surface: "#353535",
            primary: "#f9b83e",
            secondary: "#e0a435",
            accent: "#414141",
            error: "#d32f2f",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#f9b83e",
            text: "#E0E0E0",
            border: "#4a4a4a",
            card: "#353535",
            input: "#414141",
            menu: "#2a2a2a",
            rows_color: "#303030",
            "on-surface": "#E0E0E0",
            "surface-variant": "#434343",
            "on-background": "#E0E0E0",
            "primary-lighten-1": "#fac660",
            "primary-lighten-2": "#fbd482",
            "text-medium-emphasis": "rgba(255, 255, 255, 0.7)",
            "form-bg": "#414141",
            "divider": "#4a4a4a",
        },
      },
    },
  },
  locale: {
    locale: 'he',
    fallback: 'en',
    messages: {
      en,
      he: {
        ...he,
        $vuetify: {
          ...he.$vuetify,
          input: {
            ...(he.$vuetify?.input || {}),
            clear: 'נקה',
          },
          noDataText: 'אין נתונים',
          loading: 'טוען...',
          open: 'פתח',
          close: 'סגור',
          dataIterator: {
            ...(he.$vuetify?.dataIterator || {}),
            noResultsText: 'לא נמצאו תוצאות',
            noDataText: 'אין נתונים להצגה',
          },
          dataTable: {
            ...(he.$vuetify?.dataTable || {}),
            sortBy: 'מיון לפי',
          },
          pagination: {
            ...(he.$vuetify?.pagination || {}),
            ariaLabel: {
              ...(he.$vuetify?.pagination?.ariaLabel || {}),
              root: 'ניווט עמודים',
              previous: 'עמוד קודם',
              next: 'עמוד הבא',
              currentPage: 'עמוד נוכחי',
              page: 'עמוד',
            },
          },
        },
      },
    },
    rtl: {
      he: true,
      en: false,
    },
  },
  defaults: {
    VCard: { rounded: 'xl' },
    VBtn: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VAutocomplete: { variant: 'outlined', density: 'comfortable' },
  },
});
