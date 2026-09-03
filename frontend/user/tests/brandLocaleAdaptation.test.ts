import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('storefront brand labels use the active locale instead of hardcoded Chinese text', () => {
  const navbar = read('../src/components/Navbar.vue')
  const footer = read('../src/components/Footer.vue')
  const vaultLayout = read('../src/templates/vault/layout/VaultLayout.vue')

  assert.match(navbar, /return t\('common\.siteName'\)/)
  assert.match(footer, /return t\('common\.siteName'\)/)
  assert.match(vaultLayout, /return t\('common\.siteName'\)/)

  for (const source of [navbar, footer, vaultLayout]) {
    assert.doesNotMatch(source, /<span>五条悟AI源头站<\/span>/)
  }
})

test('all storefront locales define a localized site name', () => {
  const names = ['zh-CN', 'zh-TW', 'en-US', 'ru-RU'].map((locale) => {
    const source = readFileSync(new URL(`../src/i18n/locales/${locale}.json`, import.meta.url), 'utf8')
    return JSON.parse(source).common.siteName
  })

  assert.deepEqual(names, [
    '五条悟AI源头站',
    '五條悟AI源頭站',
    'Satoru Gojo AI Source Station',
    'Источник AI Сатору Годзё',
  ])
})
