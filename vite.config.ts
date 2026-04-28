import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import obfuscator from 'vite-plugin-bundle-obfuscator'

export default defineConfig(({ command, mode }) => {
  const isProd = command === 'build'
  const env = loadEnv(mode, process.cwd(), '')
  const appName = env.VITE_APP_NAME

  return {
    base: `/${appName}/`,
    plugins: [
      vue(),
      // Evita inyectar DevTools en producción por seguridad y rendimiento
      ...(!isProd ? [vueDevTools()] : []),
      tailwindcss(),
      ...(isProd
        ? [
            obfuscator({
              autoExcludeNodeModules: true,
              options: {
                compact: true, // Elimina espacios y saltos de línea
                controlFlowFlattening: false, // Crucial: No alterar la lógica matemática/condicional
                deadCodeInjection: false, // Crucial: No inyectar código basura
                identifierNamesGenerator: 'mangled', // Reduce variables largas a 'a', 'b', 'c' (pesa menos y es rápido)
                renameGlobals: false,
                selfDefending: false, // Crucial: Apagado para evitar consumo extremo de CPU
                stringArray: false, // Crucial: Apagado para evitar desencriptación de texto en tiempo real
                unicodeEscapeSequence: false // Evita inflar el tamaño final
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      },
    },
    build: {
      target: 'es2018',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // Never upload maps to prod
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 1. Ecosistema base: Vue y Vue Router (Rara vez cambia, caché a largo plazo)
            if (
              id.includes('node_modules/vue') ||
              id.includes('node_modules/@vue') ||
              id.includes('node_modules/vue-router')
            ) {
              return 'framework-core'
            }

            // 2. Librería visual centralizada: Separamos Alice UI para evitar
            // recompilar la lógica de negocio si solo cambias estilos o componentes base.
            if (id.includes('src/shared/alice-ui')) {
              return 'alice-ui'
            }

            // El resto de node_modules (axios, date-fns, etc.) y lógicas de vistas
            // se dividirán automáticamente por Vite de forma asíncrona según se necesiten.
          },
        },
      },
    },
  }
})
