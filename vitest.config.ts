import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        benchmark: {
            reporters: ['default', 'json'],
            outputFile: {
                'json': './test-results/benchmark.json',
            },
        },
        coverage: {
            provider: 'istanbul',
            reportsDirectory: './coverage/',
            reporter: [
                ['text'],
                ['json', { file: 'cov.json' }],
                ['html', { subdir: 'html', file: 'cov.html' }],
                ['cobertura', { file: 'cov-cobertura.xml' }],
            ],
            reportOnFailure: true,
        },
        reporters: [
            ['default'],
            ['html', { outputFile: './test-results/html/cov.html' }],
        ],

    },
});
