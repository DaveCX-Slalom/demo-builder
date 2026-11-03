import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'start', component: () => import('@/views/StartView.vue') },
    { path: '/studio', name: 'studio', component: () => import('@/views/StudioView.vue') },
    { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/deals/:id', name: 'deal', component: () => import('@/views/DealView.vue'), props: true },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})
