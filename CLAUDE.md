# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm install` — install dependencies
- `npm start` (or `npx expo start`) — start the dev server; press `w`/`a`/`i` in the terminal to open web/Android/iOS
- `npm run android` / `npm run ios` / `npm run web` — start the dev server targeting one platform directly
- `npm run lint` — run ESLint (`expo lint`)
- `npm run format` — format the whole project with Prettier
- `npx tsc --noEmit` — type-check (no dedicated script exists for this yet)
- `npx expo-doctor` — verify installed deps are compatible with the Expo SDK
- `npx expo install --check` — list installed packages whose version doesn't match what the SDK expects
- `npm run reset-project` — wipes the starter screens: moves `src/` and `scripts/` into `example/` (or deletes them) and regenerates a blank `src/app/index.tsx` + `_layout.tsx`. Only run this when intentionally discarding the current starter code, not as a general "clean" command.

There is no test runner configured in this project.

## Architecture

- **Routing**: Expo Router (file-based), rooted at `src/app/` rather than the top-level `app/`. Expo Router picks `src/app` automatically because there is no root `app/` directory and no `metro.config.js` overriding it. Entry point is `expo-router/entry` (`package.json` `main`).
- **Path aliases**: `@/*` → `src/*`, `@/assets/*` → `assets/*` (defined in `tsconfig.json`).
- **Platform-specific files**: components/hooks are split with the `.web.tsx`/`.web.ts` suffix convention; Metro resolves the right file per platform automatically. Current pairs:
  - `components/app-tabs.tsx` (native tab bar via `expo-router/unstable-native-tabs`) vs `components/app-tabs.web.tsx` (custom floating tab bar built on `expo-router/ui` primitives)
  - `components/animated-icon.tsx` (native splash overlay, drives `expo-splash-screen`) vs `components/animated-icon.web.tsx` (CSS-module-based version, paired with `animated-icon.module.css`)
  - `hooks/use-color-scheme.ts` vs `hooks/use-color-scheme.web.ts` (the web version adds a hydration guard so static export doesn't mismatch the client's real color scheme)
- **Theming**: design tokens (`Colors` for light/dark, `Fonts`, `Spacing` scale, layout constants) live in `src/constants/theme.ts`. Screens/components read them through `useTheme()` (`src/hooks/use-theme.ts`) and the `ThemedText`/`ThemedView` wrappers (`src/components/themed-*.tsx`) instead of using raw RN `Text`/`View` with inline colors.
- **Animation**: `react-native-reanimated` v4 + `react-native-worklets` (New Architecture) drive the splash/icon entrance animations in `animated-icon.tsx`/`animated-icon.web.tsx`.
- **App config** (`app.json`): `experiments.typedRoutes` and `experiments.reactCompiler` are both enabled — route params are typed, and the compiler handles memoization automatically (avoid hand-rolled `useMemo`/`useCallback` for that purpose).
