# HomeAdvisor — פלטפורמת ניהול שיפוץ

פלטפורמה פרטית לניהול פרויקטי שיפוץ ובנייה — מתקציב והצעות מחיר ועד שיתוף פעולה עם הצוות וניהול קבצים.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| UI Library | Vuetify 4 |
| Router | Vue Router 5 |
| HTTP Client | Axios (`src/plugins/api.js`) |
| Build Tool | Vite 8 |
| Icons | Material Design Icons (`@mdi/font`) |
| Font | Heebo (Google Fonts) |
| Runtime | Node 22 / npm 10 |

---

## Getting started

```bash
npm install
npm run dev       # https://localhost:5175  (self-signed TLS)
npm run build     # production build → dist/
npm run preview   # preview production build
```

The dev server also binds to your LAN IP (`host: true`) so it's reachable from other devices on the same network over HTTPS.

---

## Project structure

```
src/
├── main.js                  # App bootstrap (createApp → plugins → mount)
├── App.vue                  # Root component — layout switching
├── plugins/
│   ├── vuetify.js           # Vuetify plugin: theme, locale, RTL, defaults
│   └── api.js               # Axios plugin with base URL + error handling
├── router/
│   └── index.js             # All routes + auth guard placeholder
├── layouts/
│   ├── MainLayout.vue       # Authenticated shell: sidebar + app bar
│   ├── AuthLayout.vue       # Clean centered layout (login / register)
│   └── PublicLayout.vue     # Public top-nav layout (landing page)
├── components/
│   └── SidebarMenu.vue      # Role-based navigation sidebar
├── views/                   # One file per route (17 views + NotFoundView)
└── styles/
    └── main.css             # Heebo font + theme bridge for html/body
```

---

## Routing & layouts

Routes carry a `meta.layout` field that controls which shell wraps them:

| `meta.layout` | Layout | Pages |
|---|---|---|
| `'public'` | `PublicLayout` | Landing (`/`) |
| `'auth'` | `AuthLayout` | Login, Register |
| _(unset)_ | `MainLayout` | All authenticated pages |

`/project/:id` redirects automatically to `/project/:id/dashboard`.

---

## Theme system

Configured in `src/plugins/vuetify.js` with two named themes: `light` and `dark`.

- Active theme persisted to `localStorage` key `ha-theme`
- Boot reads the key to restore the last-used theme
- Users switch via **הגדרות מערכת** (`/settings`) using `useTheme()`
- Both themes define full `on-*` color sets to prevent Vuetify auto-inferring wrong contrast values

### Brand colors (both themes share amber primary)

| Token | Light | Dark |
|---|---|---|
| `primary` | `#f9b83e` | `#f9b83e` |
| `background` | `#fafafa` | `#2a2a2a` |
| `surface` | `#ffffff` | `#353535` |
| `on-background` | `#414141` | `#E0E0E0` |

---

## RTL / Hebrew

- Vuetify locale: `he` with `rtl: { he: true }`
- All layouts have `<v-app dir="rtl">`
- Navigation drawer uses `location="right"`
- All visible text is Hebrew

---

## Role-based access

`SidebarMenu.vue` filters links by `userRole`. Supported roles:

`super_admin` · `Homeowner` · `Designer` · `Architect` · `ProjectManager` · `Contractor`

The router guard (`router/index.js → beforeEach`) uses a placeholder `isAuthenticated = true`. Replace with real session/token validation when the backend is connected.

---

## Pending

- Real authentication — replace the `isAuthenticated = true` placeholder
- Backend API integration — forms `console.log` submissions; wire up `src/plugins/api.js`
- Pinia store — migrate `user`/`currentProjectId` from `App.vue` refs to a proper store
- Real file upload — `ProjectFilesView` upload dialog is mock metadata only
- `.env` — create with `VITE_API_BASE_URL=<your backend URL>`