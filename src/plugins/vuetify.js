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
            background: "#fafafa",
            surface: "#FFFFFF",
            primary: "#f9b83e",
            secondary: "#414141",
            accent: "#e0a435",
            error: "#d32f2f",
            info: "#0288D1",
            success: "#388E3C",
            warning: "#f9b83e",
            text: "#414141",
            border: "#e0e4e7",
            card: "#FFFFFF",
            input: "#f8f9fa",
            menu: "#FFFFFF",
            rows_color: "#f8f9fa",
            "on-surface": "#414141",
            "surface-variant": "#434343",
            "on-background": "#414141",
            "primary-lighten-1": "#fac660",
            "primary-lighten-2": "#fff5e6",
            "text-medium-emphasis": "rgba(65, 65, 65, 0.7)",
            "form-bg": "#f8f9fa",
            "divider": "#e0e4e7",
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
