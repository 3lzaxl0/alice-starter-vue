<script setup lang="ts">
import { ref, computed } from 'vue'
import { Home } from 'lucide-vue-next'
import { AliceSidebarItem, AliceSidebarGroup, AliceDashboardLayout } from '@shared/alice-ui'
import { NAVIGATION_ITEMS, NAVIGATION_GROUPS } from '@features/main/constants/navigation'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@features/auth/stores/auth.store'

const navigationPersistence = ref(true)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// --- User Info for Sidebar ---
const userName = computed(() => {
  if (!authStore.user?.nombre) return ''
  // Capitalize first letter of each word for cleaner display
  return authStore.user.nombre
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
})

const userRolesForSidebar = computed(() => {
  return authStore.roles.map((r) => ({
    domainCode: r.domainCode,
    roleName: r.roleName,
  }))
})

// --- Role-Filtered Navigation ---
const filteredGroups = computed(() => {
  return NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => authStore.canAccessRoute(item.to)),
  })).filter((group) => group.items.length > 0)
})

// Dynamically match the current route with navigation.ts
const currentPageInfo = computed(() => {
  return NAVIGATION_ITEMS.find((item) => route.path.startsWith(item.to))
})

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}

function handleSwitchRole(domainCode: string) {
  authStore.setActiveRole(domainCode)
  // Navigate to home when switching roles to avoid landing on a restricted page
  router.push('/')
}
</script>

<template>
  <AliceDashboardLayout
    title="Portal Agua"
    :user-name="userName"
    :user-roles="userRolesForSidebar"
    :active-role-code="authStore.activeRoleDomainCode"
    :header-title="currentPageInfo?.label"
    :header-description="currentPageInfo?.description"
    :header-icon="currentPageInfo?.icon"
    :persistence="navigationPersistence"
    @logout="handleLogout"
    @switch-role="handleSwitchRole"
  >
    <template #sidebar>
      <AliceSidebarItem label="Inicio" to="/" :icon="Home" :active="$route.path === '/'" />

      <template v-for="group in filteredGroups" :key="group.title">
        <AliceSidebarGroup :title="group.title" />
        <AliceSidebarItem
          v-for="item in group.items"
          :key="item.to"
          :label="item.label"
          :to="item.to"
          :icon="item.icon"
          :active="$route.path.startsWith(item.to)"
        />
      </template>
    </template>
  </AliceDashboardLayout>
</template>

