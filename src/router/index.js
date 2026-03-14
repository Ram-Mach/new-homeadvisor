import { createRouter, createWebHistory } from 'vue-router';

const LandingHomeView = () => import('../views/LandingHomeView.vue');
const LoginView = () => import('../views/LoginView.vue');
const RegisterView = () => import('../views/RegisterView.vue');
const OrgDashboardView = () => import('../views/OrgDashboardView.vue');
const TeamView = () => import('../views/TeamView.vue');
const SubscriptionView = () => import('../views/SubscriptionView.vue');
const ProfileView = () => import('../views/ProfileView.vue');
const OrganizationSettingsView = () => import('../views/OrganizationSettingsView.vue');
const ProjectPlannerView = () => import('../views/ProjectPlannerView.vue');
const NotFoundView = () => import('../views/NotFoundView.vue');

const ProjectDashboardView = () => import('../views/ProjectDashboardView.vue');
const ProjectTimelineView = () => import('../views/ProjectTimelineView.vue');
const ProjectShoppingListView = () => import('../views/ProjectShoppingListView.vue');
const ProjectQualityChecklistView = () => import('../views/ProjectQualityChecklistView.vue');
const ProjectBudgetView = () => import('../views/ProjectBudgetView.vue');
const ProjectExpensesView = () => import('../views/ProjectExpensesView.vue');
const ProjectTeamView = () => import('../views/ProjectTeamView.vue');
const ProjectChatView = () => import('../views/ProjectChatView.vue');
const ProjectFilesView = () => import('../views/ProjectFilesView.vue');
const ProjectBoqView = () => import('../views/ProjectBoqView.vue');
const ProjectBidsView = () => import('../views/ProjectBidsView.vue');
const ProjectSettingsView = () => import('../views/ProjectSettingsView.vue');
const PublicBidProposalView = () => import('../views/PublicBidProposalView.vue');

const routes = [
  {
    path: '/',
    name: 'landing-home',
    component: LandingHomeView,
    meta: { requiresAuth: false, layout: 'public' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false, layout: 'auth' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false, layout: 'auth' },
  },
  {
    path: '/dashboard',
    name: 'org-dashboard',
    component: OrgDashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/team',
    name: 'team',
    component: TeamView,
    meta: { requiresAuth: true },
  },
  {
    path: '/subscription',
    name: 'subscription',
    component: SubscriptionView,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'organization-settings',
    component: OrganizationSettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/plan-new-project',
    name: 'project-planner',
    component: ProjectPlannerView,
    meta: { requiresAuth: true },
  },
  {
    path: '/public/bid/:token',
    name: 'public-bid-proposal',
    component: PublicBidProposalView,
    meta: { requiresAuth: false, layout: 'public' },
  },
  {
    path: '/project/:id',
    meta: { requiresAuth: true },
    redirect: to => ({ name: 'project-dashboard', params: { id: to.params.id } }),
    children: [
      {
        path: 'dashboard',
        name: 'project-dashboard',
        component: ProjectDashboardView,
      },
      {
        path: 'timeline',
        name: 'project-timeline',
        component: ProjectTimelineView,
      },
      {
        path: 'shopping-list',
        name: 'project-shopping-list',
        component: ProjectShoppingListView,
      },
      {
        path: 'quality',
        name: 'project-quality-checklist',
        component: ProjectQualityChecklistView,
      },
      {
        path: 'budget',
        name: 'project-budget',
        component: ProjectBudgetView,
      },
      {
        path: 'expenses',
        name: 'project-expenses',
        component: ProjectExpensesView,
      },
      {
        path: 'team',
        name: 'project-team',
        component: ProjectTeamView,
      },
      {
        path: 'chat',
        name: 'project-chat',
        component: ProjectChatView,
      },
      {
        path: 'files',
        name: 'project-files',
        component: ProjectFilesView,
      },
      {
        path: 'boq',
        name: 'project-boq',
        component: ProjectBoqView,
      },
      {
        path: 'bids',
        name: 'project-bids',
        component: ProjectBidsView,
      },
      {
        path: 'settings',
        name: 'project-settings',
        component: ProjectSettingsView,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // Placeholder authentication guard.
  // Replace this with token validation or session store checks.
  const isAuthenticated = true;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'landing-home' });
    return;
  }

  next();
});

export default router;
