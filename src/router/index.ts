import { createRouter, createWebHistory } from 'vue-router'

// "/" redirects to Studio until the Start screen (Phase 3) exists.
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/studio' },
    { path: '/studio', name: 'studio', component: () => import('@/views/StudioView.vue') },
    { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/deals/:id', name: 'deal', component: () => import('@/views/DealView.vue'), props: true },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})
