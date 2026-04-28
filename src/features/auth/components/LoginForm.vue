<script setup lang="ts">
import { ref } from 'vue'
import { User, Key, LogIn } from 'lucide-vue-next'
import { AliceButton, AliceInput } from '@shared/alice-ui'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: { user: string; pass: string }): void
}>()

const user = ref('')
const pass = ref('')

function submit() {
  if (!user.value || !pass.value || props.loading) return
  emit('submit', { user: user.value, pass: pass.value })
}
</script>

<template>
  <form @submit.prevent="submit" class="flex flex-col gap-2 w-full">
    <!-- Usuario -->
    <AliceInput
      id="user"
      v-model="user"
      label="Usuario o email"
      placeholder="0199999999"
      :icon="User"
      required
      autocomplete="username"
    />

    <!-- Password -->
    <AliceInput
      id="pass"
      v-model="pass"
      label="Contraseña"
      type="password"
      placeholder="••••••••"
      :icon="Key"
      required
      autocomplete="current-password"
    />

    <!-- Acciones -->
    <AliceButton
      type="submit"
      :loading="loading"
      :icon="LogIn"
      variant="primary"
      class="mt-4 w-full"
    >
      {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
    </AliceButton>
  </form>
</template>
