# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

## Setup — download and run locally

Below are the minimum steps and recommended environment to run this project locally. Commands assume Windows PowerShell (the repo author tested on Windows).

Requirements
- Node.js 18+ (LTS recommended)
- npm (comes with Node.js) or a compatible package manager

Quick start (PowerShell)

```powershell
# clone the repo
git clone https://github.com/Jesc06/DotnetDailyCode.git
cd DotnetDailyCode

# install dependencies
npm install

# start dev server (Vite)
npm run dev

# build for production
npm run build

# preview production build locally
npm run preview
```

Notes
- Default dev server URL: http://localhost:5173
- If you see type errors related to `vite/client` or CSS imports, run `npm install` (this project includes the required dev dependencies in `package.json`).
- Tailwind CSS is used for styling; no additional global setup is required beyond `npm install`.
- Recommended Node version manager: nvm-windows if you need to switch Node versions.

Environment/config files
- This project does not require any special .env files by default. If you add environment variables, create a `.env` file at the repo root and restart the dev server.

Troubleshooting
- If `npm run dev` exits with errors, run `npm install` again and check that `node_modules` was created.
- If the TypeScript server complains about missing types, ensure `@types/node` and `vite` are installed from devDependencies (they are listed in `package.json`).
- For any CSS import issues, there is a declaration file at `src/vite-env.d.ts` which declares `*.css` modules for TypeScript.

If you want, I can add a short script to the repo that checks Node version and prints quick diagnostics—tell me if you'd like that.
```
