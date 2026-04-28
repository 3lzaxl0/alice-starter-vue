export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('./views/UnauthorizedView.vue'),
    meta: { requiresAuth: true },
  },
]
