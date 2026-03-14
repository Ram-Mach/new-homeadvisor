# GitHub Copilot Instructions — HomeAdvisor

## Project overview
Hebrew RTL renovation management platform. Vue 3 + Vuetify 4 frontend scaffold. All UI text must be in Hebrew.

## Stack
- **Vue 3** — Composition API only. Always use `<script setup>`. Never use Options API.
- **Vuetify 4** — Use Vuetify components exclusively for UI. Do not introduce other UI libraries.
- **Vue Router 5** — `createWebHistory`. Routes carry `meta.layout` for layout selection.
- **Axios** — via `src/plugins/api.js` wrapper. Never import axios directly in components.
- **Vite 8** — build tool. No webpack config.

## Code conventions

### Components
- All components use `<script setup>` + Composition API
- `ref()` for primitives, `reactive()` for form objects, `computed()` for derived state
- Props defined with `defineProps()`, emits with `defineEmits()`
- No `this`, no `data()`, no `methods:`

### Vuetify usage
- Use Vuetify theme tokens (`color="primary"`, `bg-surface-variant`) — never hardcode hex colors in templates
- Global component defaults are set in `src/plugins/vuetify.js` — do not repeat `rounded`, `variant`, `density` props on every instance
- Icons: MDI only, prefixed `mdi-`. Example: `mdi-home-city-outline`
- All custom colors live in `src/plugins/vuetify.js` under `theme.themes.light.colors` and `theme.themes.dark.colors`

### Theme
- Two named themes: `light` and `dark`
- Persisted to `localStorage` key `ha-theme`
- Switch via `useTheme()` from `vuetify` — never toggle classes manually
- Both themes define `on-primary`, `on-surface`, `on-background` explicitly

### Routing & layouts
- Three layouts: `MainLayout` (auth pages), `AuthLayout` (login/register), `PublicLayout` (landing)
- select layout via `meta.layout: 'auth' | 'public'` on the route — omit for main layout
- Current project ID is derived from `route.params.id` — never hardcode a project ID

### RTL / Hebrew
- All user-facing strings must be in Hebrew
- Hebrew strings containing apostrophes (e.g. צ'אט) must use double-quote delimiters in JS: `"צ'אט"`
- Never set `dir="ltr"` anywhere
- Never use `margin-left`/`margin-right` — use Vuetify RTL-aware spacing: `ms-*`, `me-*`

### File upload / API
- All form submissions are placeholders (`console.log`). Add a TODO comment when stubbing
- File upload is mock only in `ProjectFilesView`. Real upload needs `FormData` + multipart via `api.js`

## What NOT to do
- Do not add Options API components
- Do not import `axios` directly — use `src/plugins/api.js`
- Do not add new npm packages without checking if Vuetify already provides the feature
- Do not hardcode colors — use theme tokens
- Do not use `margin-left`/`margin-right` — breaks RTL
- Do not add English UI text in templates