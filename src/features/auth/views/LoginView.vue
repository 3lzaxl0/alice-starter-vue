<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { AliceCard } from '@shared/alice-ui'
import LoginForm from '../components/LoginForm.vue'
import bgImage from '@/assets/background.webp'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

async function handleSubmit({ user, pass }: { user: string; pass: string }) {
  if (loading.value) return
  loading.value = true

  try {
    const success = await authStore.login({ username: user, password: pass })
    if (success) {
      router.replace('/')
    }
  } catch (err) {
    console.error(err)
    alert('Credenciales inválidas')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
    <!-- Background -->
    <div class="fixed inset-0 z-0">
      <div
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-100"
        :style="{ backgroundImage: `url(${bgImage})` }"
      ></div>
      <div
        class="absolute inset-0 bg-linear-to-b from-slate-900/40 via-slate-900/20 to-slate-950/60"
      ></div>
    </div>

    <!-- Content Card -->
    <div class="relative z-10 w-full max-w-sm px-4">
      <AliceCard radius="3xl" shadow="2xl" align-title="center">
        <template #header>
          <div class="w-full flex justify-center py-2">
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Portal Agua</h1>
          </div>
        </template>

        <!-- Form -->
        <LoginForm :loading="loading" @submit="handleSubmit" />

        <!-- Footer -->
        <template #footer>
          <div class="w-full flex justify-center py-2">
            <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
              AGROINDUSTRIAL PARAMONGA S.A.
            </p>
          </div>
        </template>
      </AliceCard>
    </div>
  </div>
</template>

<style scoped>
/* Transición suave para el fondo */
.bg-cover {
  animation: slow-zoom 10s infinite alternate ease-in-out;
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
