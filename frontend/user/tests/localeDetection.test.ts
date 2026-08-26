import test from 'node:test'
import assert from 'node:assert/strict'
import { detectLocale } from '../src/i18n/localeDetection.ts'

test('explicit locale preference wins over browser and hostname', () => {
  assert.equal(detectLocale({ savedLocale: 'ru-RU', languages: ['en-US'], hostname: 'cn.huangwenxuangod.xyz' }), 'ru-RU')
})

test('domain default wins over browser language', () => {
  assert.equal(detectLocale({ languages: ['ru-RU'], hostname: 'huangwenxuangod.xyz' }), 'en-US')
  assert.equal(detectLocale({ languages: ['en-GB'], hostname: 'cn.huangwenxuangod.xyz' }), 'zh-CN')
})

test('browser languages remain the fallback for unknown hosts', () => {
  assert.equal(detectLocale({ languages: ['ru-RU'], hostname: 'localhost' }), 'ru-RU')
  assert.equal(detectLocale({ languages: ['zh-Hant-TW'], hostname: 'localhost' }), 'zh-TW')
  assert.equal(detectLocale({ languages: ['zh-SG'], hostname: 'localhost' }), 'zh-CN')
})

test('unsupported browser language falls back by hostname', () => {
  assert.equal(detectLocale({ languages: ['ja-JP'], hostname: 'cn.huangwenxuangod.xyz' }), 'zh-CN')
  assert.equal(detectLocale({ languages: ['ja-JP'], hostname: 'huangwenxuangod.xyz' }), 'en-US')
})
