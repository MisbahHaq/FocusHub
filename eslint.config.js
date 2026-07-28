import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                clearTimeout: 'readonly',
                requestAnimationFrame: 'readonly',
                URL: 'readonly',
                Blob: 'readonly',
                Audio: 'readonly',
                Notification: 'readonly',
                navigator: 'readonly',
                matchMedia: 'readonly',
                Date: 'readonly',
                Math: 'readonly',
                JSON: 'readonly',
                HTMLDivElement: 'readonly',
                HTMLInputElement: 'readonly',
                HTMLSelectElement: 'readonly',
                HTMLButtonElement: 'readonly',
                HTMLElement: 'readonly',
                KeyboardEvent: 'readonly',
                Event: 'readonly',
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'eqeqeq': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-undef': 'off',
        }
    },
    {
        ignores: ['node_modules/', 'src-tauri/', 'scripts/', 'frontend/env.js']
    }
];
