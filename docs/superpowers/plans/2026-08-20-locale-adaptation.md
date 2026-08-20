# Locale Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Russian locale support and deterministic browser/domain locale detection to the storefront.

**Architecture:** Keep locale selection in the frontend. Centralize supported locales, browser normalization, hostname fallback, and persisted preference in `frontend/user/src/i18n/index.ts`; reuse the same locale list in UI menus and localized data helpers.

**Tech Stack:** Vue 3, vue-i18n, TypeScript, Node test runner, Vite.

## Global Constraints

- Supported locales are `zh-CN`, `zh-TW`, `en-US`, and `ru-RU`.
- Explicit `localStorage.locale` has highest priority.
- Browser language is checked before hostname defaults.
- `cn.huangwenxuangod.xyz` defaults to `zh-CN`; `huangwenxuangod.xyz` defaults to `en-US`.
- Existing locale data without `ru-RU` remains valid through fallback.

### Task 1: Central locale detection

**Files:**
- Modify: `frontend/user/src/i18n/index.ts`
- Test: `frontend/user/tests/localeDetection.test.ts`

- [ ] Add tests for persisted locale, browser language mappings, hostname defaults, and unknown-language fallback.
- [ ] Export a pure `detectLocale` function with injectable `{ savedLocale, languages, hostname }` inputs while retaining browser defaults for app use.
- [ ] Add `ru-RU` lazy loading and locale validation.
- [ ] Run the focused locale test.

### Task 2: Russian UI and menus

**Files:**
- Create: `frontend/user/src/i18n/locales/ru-RU.json`
- Modify: `frontend/user/src/components/Navbar.vue`
- Modify: `frontend/user/src/templates/vault/layout/VaultLayout.vue`
- Modify: `frontend/user/src/views/personal/ProfilePanel.vue`
- Modify: `frontend/user/src/components/reseller-console/ResellerConsoleTopbar.vue`

- [ ] Add a key-complete Russian message bundle based on the current English keys.
- [ ] Add `ru-RU` to every user-facing language menu and compact locale label.
- [ ] Preserve lazy loading and manual selection behavior.

### Task 3: Localized data fallback

**Files:**
- Modify: `frontend/user/src/utils/sku.ts`
- Modify: `frontend/user/src/utils/resellerSiteConfig.ts`
- Modify: related locale shape tests.

- [ ] Add `ru-RU` to localized value types and form normalization.
- [ ] Use `ru-RU -> en-US -> zh-CN -> zh-TW` fallback for Russian values.
- [ ] Verify old three-language objects remain supported.

### Task 4: Verification

- [ ] Run focused locale and localized-data tests.
- [ ] Run `pnpm run test`.
- [ ] Run `pnpm run build`.
- [ ] Run `git diff --check`.
