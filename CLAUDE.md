# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (version pinned in `package.json`); CI / CD uses Node 24.

- `pnpm dev` — dev server. Runs on `https://local.stavi.tw` (HTTPS, custom host set in `nuxt.config.ts`), so that hostname must resolve locally (e.g. `/etc/hosts`) for auth cookies to work against the API.
- `pnpm build` — production build to `.output/` (the Dockerfile copies `.output` and runs `node /app/server/index.mjs`).
- `pnpm lint` / `pnpm lint --fix` — ESLint (Nuxt config + Prettier via `eslint-plugin-prettier`). This is the only CI check.
- `pnpm dlx nuxi typecheck` — type checking (`typescript.typeCheck: true` also runs vue-tsc during dev/build).
- There is no test suite.

## Architecture

- Nuxt 4 app (source in `app/`) built with Nuxt UI v4 + Tailwind v4, with zod used for form validation.
- Frontend / backend separation: this repository contains only the Nuxt frontend app, which communicates with a separate backend service via API; authentication and data are handled by the backend.
- UI text is Traditional Chinese: `app.vue` wraps the app in `<UApp :locale="zh_tw">`, and `plugins/zod.ts` sets zod's zh-TW locale.
- Theme colors are defined in `app/app.config.ts`.

### Layouts & errors

- `layouts/default.vue` — header(nav)/main/footer;
- `layouts/minimal.vue` — used by the simplest pages (e.g. login, signup...)
- `app/error.vue` renders custom 404 (interactive draggable/bouncing cat) and 403 (toast + auto-redirect home after 5s) pages, with a generic fallback for other statuses.
