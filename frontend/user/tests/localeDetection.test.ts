import test from 'node:test'
import assert from 'node:assert/strict'
import { detectLocale } from '../src/i18n/localeDetection.ts'

test('explicit locale preference wins over browser and hostname', () => {
  assert.equal(detectLocale({ savedLocale: 'ru-RU', languages: ['en-US'], hostname: 'cn.huangwenxuangod.xyz' }), 'ru-RU')
})

test('browser languages map supported language families', () => {
  assert.equal(detectLocale({ languages: ['ru-RU'], hostname: 'huangwenxuangod.xyz' }), 'ru-RU')
  assert.equal(detectLocale({ languages: ['en-GB'], hostname: 'cn.huangwenxuangod.xyz' }), 'en-US')
  assert.equal(detectLocale({ languages: ['zh-Hant-TW'], hostname: 'huangwenxuangod.xyz' }), 'zh-TW')
  assert.equal(detectLocale({ languages: ['zh-SG'], hostname: 'huangwenxuangod.xyz' }), 'zh-CN')
})

test('unsupported browser language falls back by hostname', () => {
  assert.equal(detectLocale({ languages: ['ja-JP'], hostname: 'cn.huangwenxuangod.xyz' }), 'zh-CN')
  assert.equal(detectLocale({ languages: ['ja-JP'], hostname: 'huangwenxuangod.xyz' }), 'en-US')
})
