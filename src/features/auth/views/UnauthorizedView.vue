<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AliceUnauthorized } from '@shared/alice-ui'
import { useAuthStore } from '../stores/auth.store'
import bgImage from '@/assets/background.webp'

const router = useRouter()
const authStore = useAuthStore()

// Watch for roles to redirect automatically if they appear later (async sync)
watch(
  () => authStore.roles,
  (newRoles) => {
    if (newRoles.length > 0) {
      router.push('/')
    }
  },
  { deep: true },
)

// Also check on mount just in case they loaded exactly when arriving
onMounted(() => {
  if (authStore.roles.length > 0 && !authStore.isInitialSyncing) {
    router.push('/')
  }
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function handleGoHome() {
  router.push('/')
}
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
    <!-- Background -->
    <div class="fixed inset-0 z-0 text-white">
      <div
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-100"
        :style="{ backgroundImage: `url(${bgImage})` }"
      ></div>
      <div
        class="absolute inset-0 bg-linear-to-b from-slate-900/60 via-slate-900/40 to-slate-950/80"
      ></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-2xl px-4">
      <div v-if="authStore.isInitialSyncing" class="flex flex-col items-center justify-center text-white space-y-4">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-lg font-medium animate-pulse">Verificando credenciales...</p>
      </div>
      <AliceUnauthorized
        v-else
        :show-home="authStore.roles.length > 0"
        @logout="handleLogout"
        @go-home="handleGoHome"
      />
    </div>
  </div>
</template>

<style scoped>
.bg-cover {
  animation: slow-zoom 20s infinite alternate ease-in-out;
}

@keyframes slow-zoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
}
</style>
