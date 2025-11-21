import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    root: 'examples',
    resolve: {
        alias: {
            'sport-gauge': path.resolve(__dirname, 'src/Gauge.vue')
        }
    },
    server: {
        open: true,
        port: 8564
    }
})
