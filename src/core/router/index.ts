import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@features/auth/stores/auth.store'

// Modules Routes
import authRoutes from '@features/auth/auth.routes'
import mainRoutes from '@features/main/main.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      redirect: { name: 'Login' },
    },
    ...authRoutes,
    ...mainRoutes,
    // Add other module routes here
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'Welcome' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  // 1. Guard for public pages (Login) -> Redirect to home (Welcome) if already logged in
  if (requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'Welcome' })
  }

  // 2. Guard for private pages -> Redirect to login if not logged in
  if (requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' })
  }

  // 3. Guard for unauthorized users (Authenticated but no roles)
  if (
    requiresAuth &&
    authStore.isAuthenticated &&
    authStore.roles.length === 0 &&
    !authStore.isInitialSyncing
  ) {
    if (to.name !== 'Unauthorized') {
      return next({ name: 'Unauthorized' })
    }
  }

  // 4. Guard for role-based access -> Redirect to home if the active role cannot access the route
  if (requiresAuth && authStore.isAuthenticated && authStore.activeRole) {
    // If user has roles and is on Unauthorized page, send them home
    if (to.name === 'Unauthorized') {
      return next({ name: 'Welcome' })
    }

    if (!authStore.canAccessRoute(to.path)) {
      return next({ name: 'Welcome' })
    }
  }

  next()
})

export default router
