import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginImport from 'eslint-plugin-import';
// If you were using eslint-import-resolver-typescript,
// its functionality is often covered by typescript-eslint's own resolution
// or by configuring project paths directly in typescript-eslint.
// For path aliases with '@/*', ensure your tsconfig.json is set up
// and typescript-eslint can pick it up.

export default tseslint.config(
  // Config 1: Global Ignores
  {
    ignores: ['node_modules/', 'dist/', '.husky/'],
  },
  
  // Config 2 & onwards: Base ESLint/TypeScript recommended configurations (spread)
  ...tseslint.configs.recommended,
  // Consider uncommenting for type-aware linting (can be slower)
  // ...tseslint.configs.recommendedTypeChecked, 
  // ...tseslint.configs.stylisticTypeChecked,

  // Config X: TypeScript specific refinements
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname, 
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // React Plugin Configurations (spread at top level)
  ...(pluginReact.configs && pluginReact.configs.flat && pluginReact.configs.flat.recommended ? [pluginReact.configs.flat.recommended] : []),
  ...(pluginJsxA11y.configs && pluginJsxA11y.configs.flat && pluginJsxA11y.configs.flat.recommended ? [pluginJsxA11y.configs.flat.recommended] : []),

  // Config Y: React specific overrides, rules, and settings
  {
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/anchor-is-valid': [
            'warn', {
                components: ['Link'],
                specialLink: ['to'],
                aspects: ['noHref', 'invalidHref', 'preferButton']
            }
        ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
        globals: {
            ...globals.browser,
        },
    },
  },

  // Config Z: Import plugin configuration
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      import: pluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: true
      },
    },
    rules: {
      'import/no-unresolved': 'error',
    },
  },
); 