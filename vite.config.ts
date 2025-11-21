import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
    plugins: [
        vue(),
        dts({
            insertTypesEntry: true,
            tsConfigFilePath: path.resolve(__dirname, 'tsconfig.json'),
        })
    ],
    root: 'examples',
    resolve: {
        alias: {
            'sport-gauge': path.resolve(__dirname, 'src/Gauge.vue')
        }
    },
    server: {
        open: true,
        port: 8564
    },
    build: {
        outDir: '../dist',
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'SportGauge',
            fileName: 'sport-gauge'
        },
        rollupOptions: {
            external: ['vue', 'animejs'],
            output: {
                globals: {
                    vue: 'Vue',
                    animejs: 'anime'
                }
            }
        }
    }
})
