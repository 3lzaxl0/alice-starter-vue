<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { AliceWelcome } from '@shared/alice-ui'
import { NAVIGATION_ITEMS } from '@features/main/constants/navigation'

const authStore = useAuthStore()

// Extract first name for a friendlier welcome (e.g., "ALBERTO" from "AGUIRRE ALEJO ALBERTO ALEXANDER")
const firstName = computed(() => {
  const name = (authStore.user?.nombre as string) || 'Usuario'
  return name.split(' ')[2] || 'Usuario'
})

const items = computed(() => NAVIGATION_ITEMS.filter((item) => authStore.canAccessRoute(item.to)))

onMounted(async () => {
  await authStore.fetchRolesIfMissing()
})
</script>

<template>
  <div class="p-0 md:p-4">
    <AliceWelcome :user-name="firstName" :items="items" />
  </div>
</template>
