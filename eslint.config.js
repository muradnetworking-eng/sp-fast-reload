import js from '@eslint/js'
import globals from 'globals'
import hooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'test-results/**'] },
  { ...js.configs.recommended, files: ['**/*.js', '**/*.mjs'], languageOptions: { globals: globals.node } },
  ...tseslint.configs.recommended,
  { files: ['tests/browser.mjs'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.tsx'], plugins: { 'react-hooks': hooks }, rules: hooks.configs.recommended.rules },
)
