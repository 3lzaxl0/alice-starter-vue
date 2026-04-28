import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@core/router'
import './assets/main.css'

import { configureApi } from '@core/infrastructure/http/axios.instance'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { useTheme } from '@shared/alice-ui'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme globally (Dark mode & Primary Color)
useTheme().initTheme()

// Configure API Provider AFTER pinia is created so we can use the store safely
const authStore = useAuthStore(pinia)
configureApi({
  getToken: () => authStore.token,
  getUserId: () => authStore.user?.codUser,
  onUnauthorized: () => {
    authStore.logout()
    router.push({ name: 'Login' })
  },
})

app.mount('#app')
