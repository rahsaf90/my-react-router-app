import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import stylistic from '@stylistic/eslint-plugin'
import reactDom from 'eslint-plugin-react-dom'
import reactX from 'eslint-plugin-react-x'


export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked,  ...tseslint.configs.stylisticTypeChecked,],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-x': reactX,
      'react-dom': reactDom,
      '@stylistic': stylistic,
    },
    rules: {
      ...reactX.configs['recommended-typescript'].rules,
      ...reactDom.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.recommended.rules,
      ...stylistic.configs['recommended'].rules,
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/max-len': ['error', { code: 100 }],
      
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
       "@typescript-eslint/no-unsafe-assignment": "off",
       "react-refresh/only-export-components": "off"
      
    },
  },
)
