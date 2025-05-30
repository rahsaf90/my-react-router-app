import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'
import stylistic from '@stylistic/eslint-plugin'


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
      //...stylistic.configs['recommended'].rules,
      ...stylistic.configs.customize({
        indent: 2,
        quotes: 'single',
        semi: true,
        jsx: true,
        // ...
      }).rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
       "@typescript-eslint/no-unsafe-assignment": "off",
       "react-refresh/only-export-components": "off"
      
    },
  },
)
